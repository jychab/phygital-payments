use anchor_lang::prelude::*;
use anchor_lang::solana_program::program::invoke_signed;
use anchor_lang::solana_program::program_option::COption;
use anchor_spl::token_2022::spl_token_2022::instruction::transfer_checked;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};
use phygital_token_client::{Asset, AssetType, Secp256r1VerifyArgs, VerifyAssetCpiBuilder};
use solana_sdk_ids::sysvar::instructions::ID as INSTRUCTIONS_SYSVAR_ID;
use solana_sdk_ids::sysvar::slot_hashes::ID as SLOT_HASHES_SYSVAR_ID;
use solana_sha256_hasher::hash as sha256_hash;

use crate::error::PhygitalError;
use crate::utils::secp256r1::extract_rp_id_hash;
use crate::{PHYGITAL_TOKEN_PROGRAM_ID, PROGRAM_AUTHORITY_SEED, WHITELISTED_RPID};

pub fn build_transfer_message(mint: &Pubkey, recipient: &Pubkey, amount: u64) -> Vec<u8> {
    let mut message = Vec::with_capacity(26 + 32 + 32 + 8);
    message.extend_from_slice(b"phygital_payments:transfer");
    message.extend_from_slice(mint.as_ref());
    message.extend_from_slice(recipient.as_ref());
    message.extend_from_slice(&amount.to_le_bytes());
    message
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
#[instruction(amount: u64, secp256r1_verify_args: Secp256r1VerifyArgs)]
pub struct ExecuteTransfer<'info> {
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
) -> Result<()> {
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

    let rp_id_hash = extract_rp_id_hash(&ctx.accounts.instructions_sysvar, &secp256r1_verify_args)?;
    require!(
        rp_id_hash == sha256_hash(WHITELISTED_RPID).to_bytes(),
        PhygitalError::InvalidRpId,
    );

    let message = build_transfer_message(
        &ctx.accounts.mint.key(),
        &ctx.accounts.recipient.key(),
        amount,
    );

    let asset_info = ctx.accounts.asset.to_account_info();
    let slot_hashes_info = ctx.accounts.slot_hashes.to_account_info();
    let instructions_sysvar_info = ctx.accounts.instructions_sysvar.to_account_info();
    let phygital_token_program_info = ctx.accounts.phygital_token_program.to_account_info();

    VerifyAssetCpiBuilder::new(&phygital_token_program_info)
        .asset(&asset_info)
        .slot_hashes(&slot_hashes_info)
        .instructions_sysvar(&instructions_sysvar_info)
        .secp256r1_verify_args(secp256r1_verify_args)
        .message(message)
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
