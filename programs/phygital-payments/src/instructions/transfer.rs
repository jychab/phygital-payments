use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_lang::solana_program::program_option::COption;
use anchor_spl::token_2022::spl_token_2022::instruction::transfer_checked;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use phygital_token_client::{Asset, AssetType, VerifyAssetCpiBuilder};
use solana_sdk_ids::sysvar::instructions::ID as INSTRUCTIONS_SYSVAR_ID;
use solana_sdk_ids::sysvar::slot_hashes::ID as SLOT_HASHES_SYSVAR_ID;
use solana_sha256_hasher::hash;

use crate::constants::{
    CONFIG_SEED, OWNER_VERIFIER_SEED, PROGRAM_AUTHORITY_SEED, PHYGITAL_TOKEN_PROGRAM_ID,
    WHITELISTED_ORIGIN, WHITELISTED_RPID,
};
use crate::error::PhygitalError;
use crate::state::{Config, OwnerVerifier, Secp256r1VerifyArgs};

/// WebAuthn challenge / `verify_asset.message_hash`:
/// `sha256("phygital_payments:transfer" || mint || recipient || amount_le || slot_hash)`.
pub fn build_transfer_challenge(
    mint: &Pubkey,
    recipient: &Pubkey,
    amount: u64,
    slot_hash: [u8; 32],
) -> [u8; 32] {
    let mut preimage = Vec::with_capacity(26 + 32 + 32 + 8 + 32);
    preimage.extend_from_slice(b"phygital_payments:transfer");
    preimage.extend_from_slice(mint.as_ref());
    preimage.extend_from_slice(recipient.as_ref());
    preimage.extend_from_slice(&amount.to_le_bytes());
    preimage.extend_from_slice(&slot_hash);
    hash(&preimage).to_bytes()
}

#[event]
pub struct TransferEvent {
    pub recipient: Pubkey,
    pub owner: Pubkey,
    pub public_key: [u8; 33],
    pub mint: Pubkey,
    pub amount: u64,
    pub time: i64,
}

#[derive(Accounts)]
#[instruction(amount: u64, secp256r1_verify_args: Secp256r1VerifyArgs, slot_number: u64)]
pub struct ExecuteTransfer<'info> {
    /// Verifier co-signer. Must match owner override or config set.
    pub verifier: Signer<'info>,

    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump,
    )]
    pub config: Account<'info, Config>,

    /// Optional per-owner verifier override PDA.
    /// Uninitialized (system-owned / empty) → use `config.verifiers`.
    /// Initialized → ONLY `owner_verifier.verifier` is accepted.
    /// CHECK: validated in handler when data is present.
    #[account(
        seeds = [OWNER_VERIFIER_SEED, asset.owner.key().as_ref()],
        bump,
    )]
    pub owner_verifier: UncheckedAccount<'info>,

    #[account(mut)]
    pub asset: Account<'info, Asset>,

    pub mint: Box<InterfaceAccount<'info, Mint>>,

    /// CHECK: recipient wallet receiving the payment
    pub recipient: UncheckedAccount<'info>,

    /// CHECK: PDA that signs as the SPL delegate for the sender token account
    #[account(
        seeds = [PROGRAM_AUTHORITY_SEED, asset.owner.key().as_ref()],
        bump,
    )]
    pub program_authority: UncheckedAccount<'info>,

    #[account(
        mut,
        constraint = sender_token_account.amount >= amount,
        constraint = sender_token_account.owner == asset.owner.key(),
        constraint = sender_token_account.mint == mint.key(),
        constraint = sender_token_account.delegate == COption::Some(program_authority.key()),
        constraint = sender_token_account.delegated_amount >= amount,
    )]
    pub sender_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = recipient_token_account.owner == recipient.key(),
        constraint = recipient_token_account.mint == mint.key(),
    )]
    pub recipient_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: validated as the SlotHashes sysvar address
    #[account(address = SLOT_HASHES_SYSVAR_ID)]
    pub slot_hashes: UncheckedAccount<'info>,

    /// CHECK: validated as the instructions sysvar address
    #[account(address = INSTRUCTIONS_SYSVAR_ID)]
    pub instructions_sysvar: UncheckedAccount<'info>,

    /// CHECK: phygital-token program for verify_asset CPI
    #[account(address = PHYGITAL_TOKEN_PROGRAM_ID)]
    pub phygital_token_program: UncheckedAccount<'info>,

    pub token_program: Interface<'info, TokenInterface>,
}

pub fn handler(
    ctx: Context<ExecuteTransfer>,
    amount: u64,
    secp256r1_verify_args: Secp256r1VerifyArgs,
    slot_number: u64,
) -> Result<()> {
    resolve_verifier(
        &ctx.accounts.verifier,
        &ctx.accounts.config,
        &ctx.accounts.owner_verifier,
        &ctx.accounts.asset.owner.key(),
    )?;

    let program_authority_bump = ctx.bumps.program_authority;
    let owner = ctx.accounts.asset.owner.key();
    let bump_seed = [program_authority_bump];
    let authority_seeds = [
        PROGRAM_AUTHORITY_SEED,
        owner.as_ref(),
        bump_seed.as_ref(),
    ];
    let signer_seeds: &[&[&[u8]]] = &[&authority_seeds];

    require!(
        ctx.accounts.asset.asset_type == AssetType::Lockable && ctx.accounts.asset.is_locked,
        PhygitalError::AssetIsCurrentlyUnLocked
    );

    let slot_hash = fetch_slot_hash(&ctx.accounts.slot_hashes, slot_number)?;
    // verify_asset (token ≥0.9) takes message_hash as the WebAuthn challenge.
    let message_hash = build_transfer_challenge(
        &ctx.accounts.mint.key(),
        &ctx.accounts.recipient.key(),
        amount,
        slot_hash,
    );

    let asset_info = ctx.accounts.asset.to_account_info();
    let instructions_sysvar_info = ctx.accounts.instructions_sysvar.to_account_info();
    let phygital_token_program_info = ctx.accounts.phygital_token_program.to_account_info();

    VerifyAssetCpiBuilder::new(&phygital_token_program_info)
        .asset(&asset_info)
        .instructions_sysvar(&instructions_sysvar_info)
        .secp256r1_verify_args(secp256r1_verify_args.into())
        .message_hash(message_hash)
        .expected_rp_id(WHITELISTED_RPID.to_string())
        .expected_origin(WHITELISTED_ORIGIN.to_string())
        .invoke()?;

    ctx.accounts.asset.reload()?;

    let transfer_ix = transfer_checked(
        &ctx.accounts.token_program.key(),
        &ctx.accounts.sender_token_account.key(),
        &ctx.accounts.mint.key(),
        &ctx.accounts.recipient_token_account.key(),
        &ctx.accounts.program_authority.key(),
        &[],
        amount,
        ctx.accounts.mint.decimals,
    )?;

    invoke_signed(
        &transfer_ix,
        &[
            ctx.accounts.sender_token_account.to_account_info(),
            ctx.accounts.mint.to_account_info(),
            ctx.accounts.recipient_token_account.to_account_info(),
            ctx.accounts.program_authority.to_account_info(),
        ],
        signer_seeds,
    )?;

    emit!(TransferEvent {
        owner: ctx.accounts.asset.owner.key(),
        recipient: ctx.accounts.recipient.key(),
        mint: ctx.accounts.mint.key(),
        public_key: ctx.accounts.asset.public_key,
        amount,
        time: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

/// Binary-search `slot_number` in the SlotHashes sysvar (same layout as SPL/token).
fn fetch_slot_hash(
    slot_hashes_account: &UncheckedAccount,
    slot_number: u64,
) -> Result<[u8; 32]> {
    let data = slot_hashes_account
        .try_borrow_data()
        .map_err(|_| error!(PhygitalError::InvalidSysvarDataFormat))?;

    require!(data.len() >= 8, PhygitalError::InvalidSysvarDataFormat);

    let num_slot_hashes = u64::from_le_bytes(
        data[..8]
            .try_into()
            .map_err(|_| error!(PhygitalError::InvalidSysvarDataFormat))?,
    ) as usize;

    if num_slot_hashes == 0 {
        return err!(PhygitalError::InvalidSysvarDataFormat);
    }

    let mut left = 0usize;
    let mut right = num_slot_hashes;

    while left < right {
        let mid = left + (right - left) / 2;
        let pos = 8usize
            .checked_add(
                mid.checked_mul(40)
                    .ok_or(error!(PhygitalError::InvalidSysvarDataFormat))?,
            )
            .ok_or(error!(PhygitalError::InvalidSysvarDataFormat))?;

        require!(
            pos.checked_add(40)
                .ok_or(error!(PhygitalError::InvalidSysvarDataFormat))?
                <= data.len(),
            PhygitalError::InvalidSysvarDataFormat
        );

        let slot = u64::from_le_bytes(
            data[pos..pos + 8]
                .try_into()
                .map_err(|_| error!(PhygitalError::InvalidSysvarDataFormat))?,
        );

        if slot == slot_number {
            let hash_bytes = &data[pos + 8..pos + 40];
            return Ok(hash_bytes
                .try_into()
                .map_err(|_| error!(PhygitalError::InvalidSysvarDataFormat))?);
        } else if slot > slot_number {
            left = mid + 1;
        } else {
            right = mid;
        }
    }

    err!(PhygitalError::InvalidSlotHash)
}

fn resolve_verifier(
    verifier: &Signer,
    config: &Account<Config>,
    owner_verifier_info: &UncheckedAccount,
    asset_owner: &Pubkey,
) -> Result<()> {
    let data = owner_verifier_info.try_borrow_data()?;
    let initialized = !data.is_empty() && owner_verifier_info.owner != &System::id();

    if initialized {
        let ov = OwnerVerifier::try_deserialize(&mut &data[..])?;
        require_keys_eq!(ov.owner, *asset_owner, PhygitalError::OwnerVerifierMismatch);
        require_keys_eq!(
            verifier.key(),
            ov.verifier,
            PhygitalError::OwnerVerifierRequired
        );
        return Ok(());
    }

    require!(
        config.contains_verifier(&verifier.key()),
        PhygitalError::UnauthorizedVerifier
    );
    Ok(())
}
