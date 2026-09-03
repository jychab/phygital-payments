use crate::constants::{
    CLEAR_TOKEN_VERIFIER_CHALLENGE_PREFIX, CONFIG_SEED, MAX_ENDPOINT_LEN,
    SET_TOKEN_VERIFIER_CHALLENGE_PREFIX, TOKEN_VERIFIER_SEED,
};
use crate::error::PhygitalError;
use crate::state::{Config, Secp256r1VerifyArgs, TokenVerifier};
use crate::utils::phygital_token::locked_controlled;
use crate::utils::slot_hash::fetch_slot_hash;
use crate::utils::verifier::resolve_verifier;
use anchor_lang::prelude::*;
use phygital_token_client::VerifyCpiBuilder;
use solana_sdk_ids::sysvar::instructions::ID as INSTRUCTIONS_SYSVAR_ID;
use solana_sdk_ids::sysvar::slot_hashes::ID as SLOT_HASHES_SYSVAR_ID;
use solana_sha256_hasher::hashv;

/// `SHA256("phygital_wallet:set_tv:v1" || slot_hash || phygital_token || verifier || endpoint)`.
pub fn build_set_token_verifier_challenge(
    slot_hash: [u8; 32],
    phygital_token: &Pubkey,
    new_verifier: &Pubkey,
    endpoint: &str,
) -> [u8; 32] {
    hashv(&[
        SET_TOKEN_VERIFIER_CHALLENGE_PREFIX,
        &slot_hash,
        phygital_token.as_ref(),
        new_verifier.as_ref(),
        endpoint.as_bytes(),
    ])
    .to_bytes()
}

/// `SHA256("phygital_wallet:clear_tv:v1" || slot_hash || phygital_token)`.
pub fn build_clear_token_verifier_challenge(
    slot_hash: [u8; 32],
    phygital_token: &Pubkey,
) -> [u8; 32] {
    hashv(&[
        CLEAR_TOKEN_VERIFIER_CHALLENGE_PREFIX,
        &slot_hash,
        phygital_token.as_ref(),
    ])
    .to_bytes()
}

#[derive(Accounts)]
pub struct SetTokenVerifier<'info> {
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

    #[account(
        init_if_needed,
        payer = payer,
        space = 8 + TokenVerifier::INIT_SPACE,
        seeds = [TOKEN_VERIFIER_SEED, phygital_token.key().as_ref()],
        bump,
    )]
    pub token_verifier: Account<'info, TokenVerifier>,

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

pub fn set_token_verifier_handler(
    ctx: Context<SetTokenVerifier>,
    new_verifier: Pubkey,
    endpoint: String,
    secp256r1_verify_args: Secp256r1VerifyArgs,
    slot_number: u64,
) -> Result<()> {
    let token_key = ctx.accounts.phygital_token.key();

    resolve_verifier(
        &ctx.accounts.verifier,
        &*ctx.accounts.config.load()?,
        &ctx.accounts.token_verifier.to_account_info(),
        &token_key,
    )?;

    require!(
        locked_controlled(&ctx.accounts.phygital_token),
        PhygitalError::TokenIsCurrentlyUnLocked
    );

    require!(
        new_verifier != Pubkey::default(),
        PhygitalError::InvalidTokenVerifier
    );
    require!(!endpoint.is_empty(), PhygitalError::InvalidEndpoint);
    require!(
        endpoint.len() <= MAX_ENDPOINT_LEN,
        PhygitalError::EndpointTooLong
    );
    require!(
        endpoint.starts_with("https://"),
        PhygitalError::InvalidEndpoint
    );

    let slot_hash = fetch_slot_hash(&ctx.accounts.slot_hashes, slot_number)?;
    let message_hash =
        build_set_token_verifier_challenge(slot_hash, &token_key, &new_verifier, &endpoint);

    VerifyCpiBuilder::new(&ctx.accounts.phygital_token_program.to_account_info())
        .phygital_token(&ctx.accounts.phygital_token.to_account_info())
        .instructions_sysvar(&ctx.accounts.instructions_sysvar.to_account_info())
        .secp256r1_verify_args(secp256r1_verify_args.into())
        .message_hash(message_hash)
        .invoke()?;

    let account = &mut ctx.accounts.token_verifier;
    if account.payer == Pubkey::default() {
        account.payer = ctx.accounts.payer.key();
    }
    account.phygital_token = ctx.accounts.phygital_token.key();
    account.verifier = new_verifier;
    account.endpoint = endpoint;
    account.bump = ctx.bumps.token_verifier;
    Ok(())
}

#[derive(Accounts)]
pub struct ClearTokenVerifier<'info> {
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

    /// CHECK: rent refund destination; must match stored `token_verifier.payer`.
    #[account(
        mut,
        constraint = rent_receiver.key() == token_verifier.payer
            @ PhygitalError::TokenVerifierPayerMismatch,
    )]
    pub rent_receiver: UncheckedAccount<'info>,

    #[account(
        mut,
        close = rent_receiver,
        seeds = [TOKEN_VERIFIER_SEED, phygital_token.key().as_ref()],
        bump = token_verifier.bump,
        has_one = phygital_token @ PhygitalError::TokenVerifierMismatch,
    )]
    pub token_verifier: Account<'info, TokenVerifier>,

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

pub fn clear_token_verifier_handler(
    ctx: Context<ClearTokenVerifier>,
    secp256r1_verify_args: Secp256r1VerifyArgs,
    slot_number: u64,
) -> Result<()> {
    let token_key = ctx.accounts.phygital_token.key();

    resolve_verifier(
        &ctx.accounts.verifier,
        &*ctx.accounts.config.load()?,
        &ctx.accounts.token_verifier.to_account_info(),
        &token_key,
    )?;

    require!(
        locked_controlled(&ctx.accounts.phygital_token),
        PhygitalError::TokenIsCurrentlyUnLocked
    );

    let slot_hash = fetch_slot_hash(&ctx.accounts.slot_hashes, slot_number)?;
    let message_hash = build_clear_token_verifier_challenge(slot_hash, &token_key);

    VerifyCpiBuilder::new(&ctx.accounts.phygital_token_program.to_account_info())
        .phygital_token(&ctx.accounts.phygital_token.to_account_info())
        .instructions_sysvar(&ctx.accounts.instructions_sysvar.to_account_info())
        .secp256r1_verify_args(secp256r1_verify_args.into())
        .message_hash(message_hash)
        .invoke()?;

    Ok(())
}
