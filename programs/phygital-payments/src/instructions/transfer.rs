use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_spl::token_2022::spl_token_2022::instruction::transfer_checked;
use anchor_spl::token_interface::TokenInterface;
use solana_sdk_ids::sysvar::instructions::ID as INSTRUCTIONS_SYSVAR_ID;
use solana_sdk_ids::sysvar::slot_hashes::ID as SLOT_HASHES_SYSVAR_ID;
use solana_sha256_hasher::hash;
use phygital_token_client::{
    PhygitalTokenType, VerifyCpiBuilder, PHYGITAL_TOKEN_DISCRIMINATOR,
};

use crate::constants::{
    CONFIG_SEED, OWNER_VERIFIER_SEED, PROGRAM_AUTHORITY_SEED, PHYGITAL_TOKEN_PROGRAM_ID,
    WHITELISTED_ORIGIN, WHITELISTED_RPID,
};
use crate::error::PhygitalError;
use crate::state::{Config, OwnerVerifier, Secp256r1VerifyArgs};

const TRANSFER_CHALLENGE_PREFIX: &[u8] = b"phygital_payments:transfer";
const TRANSFER_CHALLENGE_LEN: usize = 26 + 32 + 32 + 8 + 32;

const TOKEN_ACCOUNT_LEN: usize = 165;
const MINT_DECIMALS_OFFSET: usize = 44;
const TOKEN_MINT_OFFSET: usize = 0;
const TOKEN_OWNER_OFFSET: usize = 32;
const TOKEN_AMOUNT_OFFSET: usize = 64;
const TOKEN_DELEGATE_OFFSET: usize = 72;
const TOKEN_DELEGATED_AMOUNT_OFFSET: usize = 121;

const PHY_OWNER_OFFSET: usize = 8;
const PHY_TOKEN_TYPE_OFFSET: usize = 76;
const PHY_IS_LOCKED_OFFSET: usize = 77;
const PHY_PUBLIC_KEY_OFFSET: usize = 78;
const PHY_PUBLIC_KEY_END: usize = 111;

pub fn build_transfer_challenge(
    mint: &Pubkey,
    recipient: &Pubkey,
    amount: u64,
    slot_hash: [u8; 32],
) -> [u8; 32] {
    let mut preimage = [0u8; TRANSFER_CHALLENGE_LEN];
    preimage[..26].copy_from_slice(TRANSFER_CHALLENGE_PREFIX);
    preimage[26..58].copy_from_slice(mint.as_ref());
    preimage[58..90].copy_from_slice(recipient.as_ref());
    preimage[90..98].copy_from_slice(&amount.to_le_bytes());
    preimage[98..130].copy_from_slice(&slot_hash);
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
    /// CHECK: PDA is derived in the handler from the token owner.
    pub owner_verifier: UncheckedAccount<'info>,

    /// CHECK: owned by phygital-token; fields read by offset (no Borsh round-trip).
    #[account(mut, owner = PHYGITAL_TOKEN_PROGRAM_ID)]
    pub phygital_token: UncheckedAccount<'info>,

    /// CHECK: SPL mint; decimals read from the base mint layout.
    pub mint: UncheckedAccount<'info>,

    /// CHECK: recipient wallet receiving the payment
    pub recipient: UncheckedAccount<'info>,

    /// CHECK: PDA that signs as the SPL delegate for the sender token account
    #[account(
        seeds = [PROGRAM_AUTHORITY_SEED, phygital_token.key().as_ref()],
        bump,
    )]
    pub program_authority: UncheckedAccount<'info>,

    /// CHECK: sender token account; fields validated in the handler.
    #[account(mut)]
    pub sender_token_account: UncheckedAccount<'info>,

    /// CHECK: recipient token account; fields validated in the handler.
    #[account(mut)]
    pub recipient_token_account: UncheckedAccount<'info>,

    /// CHECK: validated as the SlotHashes sysvar address
    #[account(address = SLOT_HASHES_SYSVAR_ID)]
    pub slot_hashes: UncheckedAccount<'info>,

    /// CHECK: validated as the instructions sysvar address
    #[account(address = INSTRUCTIONS_SYSVAR_ID)]
    pub instructions_sysvar: UncheckedAccount<'info>,

    /// CHECK: phygital-token program for verify CPI
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
    let (owner, public_key) = read_phygital_token(&ctx.accounts.phygital_token)?;

    let (expected_ov, _) = Pubkey::find_program_address(
        &[OWNER_VERIFIER_SEED, owner.as_ref()],
        ctx.program_id,
    );
    require_keys_eq!(
        ctx.accounts.owner_verifier.key(),
        expected_ov,
        PhygitalError::OwnerVerifierMismatch
    );

    resolve_verifier(
        &ctx.accounts.verifier,
        &ctx.accounts.config,
        &ctx.accounts.owner_verifier,
        &owner,
    )?;

    let mint_key = ctx.accounts.mint.key();
    let recipient_key = ctx.accounts.recipient.key();
    let program_authority_key = ctx.accounts.program_authority.key();
    let token_program_key = ctx.accounts.token_program.key();

    require_keys_eq!(
        *ctx.accounts.mint.owner,
        token_program_key,
        PhygitalError::InvalidAccountData
    );
    let mint_decimals = read_mint_decimals(&ctx.accounts.mint)?;

    validate_sender_token(
        &ctx.accounts.sender_token_account,
        &token_program_key,
        amount,
        &owner,
        &mint_key,
        &program_authority_key,
    )?;
    validate_recipient_token(
        &ctx.accounts.recipient_token_account,
        &token_program_key,
        &recipient_key,
        &mint_key,
    )?;

    let program_authority_bump = ctx.bumps.program_authority;
    let token_key = ctx.accounts.phygital_token.key();
    let bump_seed = [program_authority_bump];
    let authority_seeds = [
        PROGRAM_AUTHORITY_SEED,
        token_key.as_ref(),
        bump_seed.as_ref(),
    ];
    let signer_seeds: &[&[&[u8]]] = &[&authority_seeds];

    let slot_hash = fetch_slot_hash(&ctx.accounts.slot_hashes, slot_number)?;
    let message_hash = build_transfer_challenge(&mint_key, &recipient_key, amount, slot_hash);

    let token_info = ctx.accounts.phygital_token.to_account_info();
    let instructions_sysvar_info = ctx.accounts.instructions_sysvar.to_account_info();
    let phygital_token_program_info = ctx.accounts.phygital_token_program.to_account_info();

    VerifyCpiBuilder::new(&phygital_token_program_info)
        .phygital_token(&token_info)
        .instructions_sysvar(&instructions_sysvar_info)
        .secp256r1_verify_args(secp256r1_verify_args.into())
        .message_hash(message_hash)
        .expected_rp_id(WHITELISTED_RPID.to_string())
        .expected_origins([WHITELISTED_ORIGIN.to_string()].to_vec())
        .invoke()?;

    let transfer_ix = transfer_checked(
        &token_program_key,
        &ctx.accounts.sender_token_account.key(),
        &mint_key,
        &ctx.accounts.recipient_token_account.key(),
        &program_authority_key,
        &[],
        amount,
        mint_decimals,
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
        owner,
        recipient: recipient_key,
        mint: mint_key,
        public_key,
        amount,
        time: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

fn read_phygital_token(info: &UncheckedAccount) -> Result<(Pubkey, [u8; 33])> {
    let data = info.try_borrow_data()?;
    require!(
        data.len() >= PHY_PUBLIC_KEY_END,
        PhygitalError::InvalidAccountData
    );
    require!(
        data[..8] == PHYGITAL_TOKEN_DISCRIMINATOR,
        PhygitalError::InvalidAccountData
    );
    require!(
        data[PHY_TOKEN_TYPE_OFFSET] == PhygitalTokenType::Controlled as u8
            && data[PHY_IS_LOCKED_OFFSET] == 1,
        PhygitalError::TokenIsCurrentlyUnLocked
    );
    let owner = read_pubkey(&data, PHY_OWNER_OFFSET)?;
    let public_key: [u8; 33] = data[PHY_PUBLIC_KEY_OFFSET..PHY_PUBLIC_KEY_END]
        .try_into()
        .map_err(|_| error!(PhygitalError::InvalidAccountData))?;
    Ok((owner, public_key))
}

fn read_mint_decimals(info: &UncheckedAccount) -> Result<u8> {
    let data = info.try_borrow_data()?;
    require!(
        data.len() > MINT_DECIMALS_OFFSET,
        PhygitalError::InvalidAccountData
    );
    Ok(data[MINT_DECIMALS_OFFSET])
}

fn validate_sender_token(
    info: &UncheckedAccount,
    token_program: &Pubkey,
    amount: u64,
    owner: &Pubkey,
    mint: &Pubkey,
    program_authority: &Pubkey,
) -> Result<()> {
    require_keys_eq!(
        *info.owner,
        *token_program,
        PhygitalError::InvalidAccountData
    );
    let data = info.try_borrow_data()?;
    require!(data.len() >= TOKEN_ACCOUNT_LEN, PhygitalError::InvalidAccountData);
    require_keys_eq!(
        read_pubkey(&data, TOKEN_MINT_OFFSET)?,
        *mint,
        PhygitalError::InvalidAccountData
    );
    require_keys_eq!(
        read_pubkey(&data, TOKEN_OWNER_OFFSET)?,
        *owner,
        PhygitalError::InvalidAccountData
    );
    let token_amount = read_u64(&data, TOKEN_AMOUNT_OFFSET)?;
    require!(token_amount >= amount, PhygitalError::InvalidAccountData);
    let delegate = read_coption_pubkey(&data, TOKEN_DELEGATE_OFFSET)?;
    require!(
        delegate.as_ref() == Some(program_authority),
        PhygitalError::InvalidAccountData
    );
    let delegated_amount = read_u64(&data, TOKEN_DELEGATED_AMOUNT_OFFSET)?;
    require!(delegated_amount >= amount, PhygitalError::InvalidAccountData);
    Ok(())
}

fn validate_recipient_token(
    info: &UncheckedAccount,
    token_program: &Pubkey,
    recipient: &Pubkey,
    mint: &Pubkey,
) -> Result<()> {
    require_keys_eq!(
        *info.owner,
        *token_program,
        PhygitalError::InvalidAccountData
    );
    let data = info.try_borrow_data()?;
    require!(data.len() >= TOKEN_ACCOUNT_LEN, PhygitalError::InvalidAccountData);
    require_keys_eq!(
        read_pubkey(&data, TOKEN_MINT_OFFSET)?,
        *mint,
        PhygitalError::InvalidAccountData
    );
    require_keys_eq!(
        read_pubkey(&data, TOKEN_OWNER_OFFSET)?,
        *recipient,
        PhygitalError::InvalidAccountData
    );
    Ok(())
}

fn read_pubkey(data: &[u8], offset: usize) -> Result<Pubkey> {
    let bytes: [u8; 32] = data
        .get(offset..offset + 32)
        .and_then(|s| s.try_into().ok())
        .ok_or_else(|| error!(PhygitalError::InvalidAccountData))?;
    Ok(Pubkey::new_from_array(bytes))
}

fn read_u64(data: &[u8], offset: usize) -> Result<u64> {
    let bytes: [u8; 8] = data
        .get(offset..offset + 8)
        .and_then(|s| s.try_into().ok())
        .ok_or_else(|| error!(PhygitalError::InvalidAccountData))?;
    Ok(u64::from_le_bytes(bytes))
}

fn read_coption_pubkey(data: &[u8], offset: usize) -> Result<Option<Pubkey>> {
    let tag_bytes: [u8; 4] = data
        .get(offset..offset + 4)
        .and_then(|s| s.try_into().ok())
        .ok_or_else(|| error!(PhygitalError::InvalidAccountData))?;
    match u32::from_le_bytes(tag_bytes) {
        0 => Ok(None),
        1 => Ok(Some(read_pubkey(data, offset + 4)?)),
        _ => err!(PhygitalError::InvalidAccountData),
    }
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
    owner: &Pubkey,
) -> Result<()> {
    let data = owner_verifier_info.try_borrow_data()?;
    let initialized = !data.is_empty() && owner_verifier_info.owner != &System::id();

    if initialized {
        let ov = OwnerVerifier::try_deserialize(&mut &data[..])?;
        require_keys_eq!(ov.owner, *owner, PhygitalError::OwnerVerifierMismatch);
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
