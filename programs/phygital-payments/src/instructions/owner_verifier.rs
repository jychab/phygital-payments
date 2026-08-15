use anchor_lang::prelude::*;

use crate::constants::{MAX_ENDPOINT_LEN, OWNER_VERIFIER_SEED};
use crate::error::PhygitalError;
use crate::state::OwnerVerifier;

#[derive(Accounts)]
pub struct SetOwnerVerifier<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init_if_needed,
        payer = owner,
        space = 8 + OwnerVerifier::INIT_SPACE,
        seeds = [OWNER_VERIFIER_SEED, owner.key().as_ref()],
        bump,
    )]
    pub owner_verifier: Account<'info, OwnerVerifier>,

    pub system_program: Program<'info, System>,
}

pub fn set_owner_verifier_handler(
    ctx: Context<SetOwnerVerifier>,
    verifier: Pubkey,
    endpoint: String,
) -> Result<()> {
    require!(!endpoint.is_empty(), PhygitalError::InvalidEndpoint);
    require!(
        endpoint.len() <= MAX_ENDPOINT_LEN,
        PhygitalError::EndpointTooLong
    );
    require!(
        endpoint.starts_with("https://"),
        PhygitalError::InvalidEndpoint
    );

    let account = &mut ctx.accounts.owner_verifier;
    account.owner = ctx.accounts.owner.key();
    account.verifier = verifier;
    account.endpoint = endpoint;
    account.bump = ctx.bumps.owner_verifier;
    Ok(())
}

#[derive(Accounts)]
pub struct ClearOwnerVerifier<'info> {
    pub owner: Signer<'info>,

    #[account(
        mut,
        close = owner,
        seeds = [OWNER_VERIFIER_SEED, owner.key().as_ref()],
        bump = owner_verifier.bump,
        has_one = owner @ PhygitalError::OwnerVerifierMismatch,
    )]
    pub owner_verifier: Account<'info, OwnerVerifier>,
}

pub fn clear_owner_verifier_handler(_ctx: Context<ClearOwnerVerifier>) -> Result<()> {
    Ok(())
}
