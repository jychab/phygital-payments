use anchor_lang::prelude::*;
use anchor_lang::solana_program::instruction::{
    get_stack_height, TRANSACTION_LEVEL_STACK_HEIGHT,
};
use solana_sdk_ids::sysvar::instructions::ID as INSTRUCTIONS_SYSVAR_ID;
use solana_sdk_ids::sysvar::slot_hashes::ID as SLOT_HASHES_SYSVAR_ID;
use phygital_token_client::VerifyCpiBuilder;

use crate::constants::{CONFIG_SEED, PROGRAM_WALLET_SEED, TOKEN_VERIFIER_SEED};
use crate::error::PhygitalError;
use crate::utils::compact::{
    execute_compact_instructions, hash_compact_instructions, hash_execute_challenge,
    hash_referenced_accounts_infos,
};
use crate::utils::phygital_token::{locked_controlled, wallet_matches_owner};
use crate::utils::slot_hash::fetch_slot_hash;
use crate::utils::verifier::resolve_verifier;
use crate::state::{CompactInstruction, Config, Secp256r1VerifyArgs};

fn build_execute_challenge<'info>(
    slot_hash: [u8; 32],
    compact_instructions: &[CompactInstruction],
    remaining: &[AccountInfo<'info>],
) -> Result<[u8; 32]> {
    let instructions_hash = hash_compact_instructions(compact_instructions)?;
    let accounts_hash = hash_referenced_accounts_infos(remaining, compact_instructions)?;
    Ok(hash_execute_challenge(
        &slot_hash,
        &instructions_hash,
        &accounts_hash,
    ))
}

#[derive(Accounts)]
pub struct Execute<'info> {
    /// Verifier co-signer. Must match token override or config set.
    pub verifier: Signer<'info>,

    #[account(
        seeds = [CONFIG_SEED],
        bump = config.load()?.bump,
    )]
    pub config: AccountLoader<'info, Config>,

    /// CHECK: owned by phygital-token; fields read by offset (no Borsh round-trip).
    #[account(
        mut,
        owner = phygital_token_client::PHYGITAL_TOKEN_ID,
        constraint = locked_controlled(&phygital_token) @ PhygitalError::TokenIsCurrentlyUnLocked,
    )]
    pub phygital_token: UncheckedAccount<'info>,

    /// Optional per-token verifier override PDA.
    /// Uninitialized (system-owned / empty) → use `config.verifiers`.
    /// Initialized → ONLY `token_verifier.verifier` is accepted (exclusive).
    /// CHECK: address constrained by seeds (may be empty / system-owned).
    #[account(
        seeds = [TOKEN_VERIFIER_SEED, phygital_token.key().as_ref()],
        bump,
    )]
    pub token_verifier: UncheckedAccount<'info>,

    /// CHECK: wallet PDA that signs inner CPIs. No account data — bump from
    /// `seeds`/`bump` lands in `ctx.bumps.wallet`.
    #[account(
        seeds = [PROGRAM_WALLET_SEED, phygital_token.key().as_ref()],
        bump,
        constraint = wallet_matches_owner(&wallet, &phygital_token) @ PhygitalError::WalletOwnerMismatch,
    )]
    pub wallet: UncheckedAccount<'info>,

    /// CHECK: validated as the SlotHashes sysvar address
    #[account(address = SLOT_HASHES_SYSVAR_ID)]
    pub slot_hashes: UncheckedAccount<'info>,

    /// CHECK: validated as the instructions sysvar address
    #[account(address = INSTRUCTIONS_SYSVAR_ID)]
    pub instructions_sysvar: UncheckedAccount<'info>,

    /// CHECK: phygital-token program for verify CPI
    #[account(address = phygital_token_client::PHYGITAL_TOKEN_ID)]
    pub phygital_token_program: UncheckedAccount<'info>,
}

pub fn handler<'info>(
    ctx: Context<'info, Execute<'info>>,
    mut compact_instructions: Vec<CompactInstruction>,
    secp256r1_verify_args: Secp256r1VerifyArgs,
    slot_number: u64,
) -> Result<()> {
    // Top-level only — reject auth via CPI wrappers.
    require!(
        get_stack_height() == TRANSACTION_LEVEL_STACK_HEIGHT,
        PhygitalError::ExecuteViaCpiNotAllowed
    );

    resolve_verifier(
        &ctx.accounts.verifier,
        &*ctx.accounts.config.load()?,
        ctx.accounts.token_verifier.as_ref(),
        ctx.accounts.phygital_token.key,
    )?;

    let slot_hash = fetch_slot_hash(&ctx.accounts.slot_hashes, slot_number)?;
    let message_hash = build_execute_challenge(
        slot_hash,
        &compact_instructions,
        ctx.remaining_accounts,
    )?;

    VerifyCpiBuilder::new(ctx.accounts.phygital_token_program.as_ref())
        .phygital_token(ctx.accounts.phygital_token.as_ref())
        .instructions_sysvar(ctx.accounts.instructions_sysvar.as_ref())
        .secp256r1_verify_args(secp256r1_verify_args.into())
        .message_hash(message_hash)
        .invoke()?;

    execute_compact_instructions(
        ctx.program_id,
        ctx.accounts.wallet.as_ref(),
        ctx.bumps.wallet,
        ctx.accounts.phygital_token.key,
        &[
            ctx.accounts.verifier.key,
            ctx.accounts.config.as_ref().key,
            ctx.accounts.token_verifier.key,
            ctx.accounts.phygital_token.key,
        ],
        ctx.remaining_accounts,
        &mut compact_instructions,
    )?;

    Ok(())
}
