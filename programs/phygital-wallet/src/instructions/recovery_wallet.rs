use crate::constants::{
    CLEAR_RECOVERY_WALLET_CHALLENGE_PREFIX, CONFIG_SEED, PROGRAM_WALLET_SEED,
    RECOVERY_WALLET_SEED, SET_RECOVERY_WALLET_CHALLENGE_PREFIX,
};
use crate::error::PhygitalError;
use crate::state::{CompactInstruction, Config, RecoveryWallet, Secp256r1VerifyArgs};
use crate::utils::compact::execute_compact_instructions;
use crate::utils::phygital_token::{locked_controlled, wallet_matches_owner};
use crate::utils::slot_hash::fetch_slot_hash;
use crate::utils::verifier::resolve_verifier;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::instruction::{
    get_stack_height, TRANSACTION_LEVEL_STACK_HEIGHT,
};
use phygital_token_client::VerifyCpiBuilder;
use solana_sdk_ids::sysvar::instructions::ID as INSTRUCTIONS_SYSVAR_ID;
use solana_sdk_ids::sysvar::slot_hashes::ID as SLOT_HASHES_SYSVAR_ID;
use solana_sha256_hasher::hashv;

/// `SHA256("phygital_wallet:set_rw:v1" || slot_hash || phygital_token || recovery_wallet)`.
pub fn build_set_recovery_wallet_challenge(
    slot_hash: [u8; 32],
    phygital_token: &Pubkey,
    recovery_wallet: &Pubkey,
) -> [u8; 32] {
    hashv(&[
        SET_RECOVERY_WALLET_CHALLENGE_PREFIX,
        &slot_hash,
        phygital_token.as_ref(),
        recovery_wallet.as_ref(),
    ])
    .to_bytes()
}

/// `SHA256("phygital_wallet:clear_rw:v1" || slot_hash || phygital_token)`.
pub fn build_clear_recovery_wallet_challenge(
    slot_hash: [u8; 32],
    phygital_token: &Pubkey,
) -> [u8; 32] {
    hashv(&[
        CLEAR_RECOVERY_WALLET_CHALLENGE_PREFIX,
        &slot_hash,
        phygital_token.as_ref(),
    ])
    .to_bytes()
}

#[derive(Accounts)]
pub struct SetRecoveryWallet<'info> {
    /// Fee payer for rent; not an authorization authority.
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Verifier co-signer. Token override (exclusive) or config default set.
    pub verifier: Signer<'info>,

    #[account(
        seeds = [CONFIG_SEED],
        bump = config.load()?.bump,
    )]
    pub config: AccountLoader<'info, Config>,

    /// CHECK: owned by phygital-token; locked Controlled validated via verify CPI path.
    #[account(mut, owner = phygital_token_client::PHYGITAL_TOKEN_ID)]
    pub phygital_token: UncheckedAccount<'info>,

    /// Optional per-token verifier override PDA (may be uninitialized).
    /// CHECK: address constrained by seeds.
    #[account(
        seeds = [crate::constants::TOKEN_VERIFIER_SEED, phygital_token.key().as_ref()],
        bump,
    )]
    pub token_verifier: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + RecoveryWallet::INIT_SPACE,
        seeds = [RECOVERY_WALLET_SEED, phygital_token.key().as_ref()],
        bump,
    )]
    pub recovery_wallet_account: Account<'info, RecoveryWallet>,

    /// CHECK: SlotHashes sysvar
    #[account(address = SLOT_HASHES_SYSVAR_ID)]
    pub slot_hashes: UncheckedAccount<'info>,

    /// CHECK: instructions sysvar
    #[account(address = INSTRUCTIONS_SYSVAR_ID)]
    pub instructions_sysvar: UncheckedAccount<'info>,

    /// CHECK: phygital-token program for verify CPI
    #[account(address = phygital_token_client::PHYGITAL_TOKEN_ID)]
    pub phygital_token_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn set_recovery_wallet_handler(
    ctx: Context<SetRecoveryWallet>,
    recovery_wallet: Pubkey,
    secp256r1_verify_args: Secp256r1VerifyArgs,
    slot_number: u64,
) -> Result<()> {
    let token_key = ctx.accounts.phygital_token.key();

    resolve_verifier(
        &ctx.accounts.verifier,
        &*ctx.accounts.config.load()?,
        ctx.accounts.token_verifier.as_ref(),
        &token_key,
    )?;

    require!(
        locked_controlled(&ctx.accounts.phygital_token),
        PhygitalError::TokenIsCurrentlyUnLocked
    );
    require!(
        recovery_wallet != Pubkey::default(),
        PhygitalError::InvalidRecoveryWallet
    );

    let slot_hash = fetch_slot_hash(&ctx.accounts.slot_hashes, slot_number)?;
    let message_hash =
        build_set_recovery_wallet_challenge(slot_hash, &token_key, &recovery_wallet);

    VerifyCpiBuilder::new(&ctx.accounts.phygital_token_program.to_account_info())
        .phygital_token(&ctx.accounts.phygital_token.to_account_info())
        .instructions_sysvar(&ctx.accounts.instructions_sysvar.to_account_info())
        .secp256r1_verify_args(secp256r1_verify_args.into())
        .message_hash(message_hash)
        .invoke()?;

    let account = &mut ctx.accounts.recovery_wallet_account;
    if account.payer == Pubkey::default() {
        account.payer = ctx.accounts.payer.key();
    }
    account.phygital_token = token_key;
    account.recovery_wallet = recovery_wallet;
    account.bump = ctx.bumps.recovery_wallet_account;
    Ok(())
}

#[derive(Accounts)]
pub struct ClearRecoveryWallet<'info> {
    /// Verifier co-signer. Token override (exclusive) or config default set.
    pub verifier: Signer<'info>,

    #[account(
        seeds = [CONFIG_SEED],
        bump = config.load()?.bump,
    )]
    pub config: AccountLoader<'info, Config>,

    /// CHECK: owned by phygital-token; locked Controlled validated in handler.
    #[account(mut, owner = phygital_token_client::PHYGITAL_TOKEN_ID)]
    pub phygital_token: UncheckedAccount<'info>,

    /// Optional per-token verifier override PDA (may be uninitialized).
    /// CHECK: address constrained by seeds.
    #[account(
        seeds = [crate::constants::TOKEN_VERIFIER_SEED, phygital_token.key().as_ref()],
        bump,
    )]
    pub token_verifier: UncheckedAccount<'info>,

    /// CHECK: rent refund destination; must match stored `recovery_wallet_account.payer`.
    #[account(
        mut,
        constraint = rent_receiver.key() == recovery_wallet_account.payer
            @ PhygitalError::RecoveryWalletPayerMismatch,
    )]
    pub rent_receiver: UncheckedAccount<'info>,

    #[account(
        mut,
        close = rent_receiver,
        seeds = [RECOVERY_WALLET_SEED, phygital_token.key().as_ref()],
        bump = recovery_wallet_account.bump,
        has_one = phygital_token @ PhygitalError::RecoveryWalletMismatch,
    )]
    pub recovery_wallet_account: Account<'info, RecoveryWallet>,

    /// CHECK: SlotHashes sysvar
    #[account(address = SLOT_HASHES_SYSVAR_ID)]
    pub slot_hashes: UncheckedAccount<'info>,

    /// CHECK: instructions sysvar
    #[account(address = INSTRUCTIONS_SYSVAR_ID)]
    pub instructions_sysvar: UncheckedAccount<'info>,

    /// CHECK: phygital-token program for verify CPI
    #[account(address = phygital_token_client::PHYGITAL_TOKEN_ID)]
    pub phygital_token_program: UncheckedAccount<'info>,
}

pub fn clear_recovery_wallet_handler(
    ctx: Context<ClearRecoveryWallet>,
    secp256r1_verify_args: Secp256r1VerifyArgs,
    slot_number: u64,
) -> Result<()> {
    let token_key = ctx.accounts.phygital_token.key();

    resolve_verifier(
        &ctx.accounts.verifier,
        &*ctx.accounts.config.load()?,
        ctx.accounts.token_verifier.as_ref(),
        &token_key,
    )?;

    require!(
        locked_controlled(&ctx.accounts.phygital_token),
        PhygitalError::TokenIsCurrentlyUnLocked
    );

    let slot_hash = fetch_slot_hash(&ctx.accounts.slot_hashes, slot_number)?;
    let message_hash = build_clear_recovery_wallet_challenge(slot_hash, &token_key);

    VerifyCpiBuilder::new(&ctx.accounts.phygital_token_program.to_account_info())
        .phygital_token(&ctx.accounts.phygital_token.to_account_info())
        .instructions_sysvar(&ctx.accounts.instructions_sysvar.to_account_info())
        .secp256r1_verify_args(secp256r1_verify_args.into())
        .message_hash(message_hash)
        .invoke()?;

    Ok(())
}

/// Lost-accessory recovery: configured ed25519 key drives the program wallet
/// without a passkey verify CPI.
#[derive(Accounts)]
pub struct RecoveryWalletExecute<'info> {
    /// Must match `recovery_wallet_account.recovery_wallet`.
    pub recovery_wallet: Signer<'info>,

    /// CHECK: owned by phygital-token; must be locked Controlled.
    #[account(
        mut,
        owner = phygital_token_client::PHYGITAL_TOKEN_ID,
        constraint = locked_controlled(&phygital_token) @ PhygitalError::TokenIsCurrentlyUnLocked,
    )]
    pub phygital_token: UncheckedAccount<'info>,

    #[account(
        seeds = [RECOVERY_WALLET_SEED, phygital_token.key().as_ref()],
        bump = recovery_wallet_account.bump,
        has_one = phygital_token @ PhygitalError::RecoveryWalletMismatch,
        constraint = recovery_wallet_account.recovery_wallet == recovery_wallet.key()
            @ PhygitalError::UnauthorizedRecoveryWallet,
    )]
    pub recovery_wallet_account: Account<'info, RecoveryWallet>,

    /// CHECK: wallet PDA that signs inner CPIs.
    #[account(
        seeds = [PROGRAM_WALLET_SEED, phygital_token.key().as_ref()],
        bump,
        constraint = wallet_matches_owner(&wallet, &phygital_token) @ PhygitalError::WalletOwnerMismatch,
    )]
    pub wallet: UncheckedAccount<'info>,
}

pub fn recovery_wallet_execute_handler<'info>(
    ctx: Context<'info, RecoveryWalletExecute<'info>>,
    mut compact_instructions: Vec<CompactInstruction>,
) -> Result<()> {
    require!(
        get_stack_height() == TRANSACTION_LEVEL_STACK_HEIGHT,
        PhygitalError::ExecuteViaCpiNotAllowed
    );

    let recovery_signer = ctx.accounts.recovery_wallet.key();
    let recovery_account = ctx.accounts.recovery_wallet_account.key();
    let phygital_token = ctx.accounts.phygital_token.key();

    execute_compact_instructions(
        ctx.program_id,
        ctx.accounts.wallet.as_ref(),
        ctx.bumps.wallet,
        &phygital_token,
        &[&recovery_signer, &recovery_account, &phygital_token],
        ctx.remaining_accounts,
        &mut compact_instructions,
    )?;

    Ok(())
}
