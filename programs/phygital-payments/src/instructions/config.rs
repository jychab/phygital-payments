use anchor_lang::prelude::*;

use crate::constants::{CONFIG_SEED, MAX_VERIFIERS};
use crate::error::PhygitalError;
use crate::state::Config;

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = 8 + Config::INIT_SPACE,
        seeds = [CONFIG_SEED],
        bump,
    )]
    pub config: Account<'info, Config>,

    pub system_program: Program<'info, System>,
}

pub fn initialize_config_handler(
    ctx: Context<InitializeConfig>,
    initial_verifiers: Vec<Pubkey>,
) -> Result<()> {
    require!(
        initial_verifiers.len() <= MAX_VERIFIERS,
        PhygitalError::TooManyVerifiers
    );

    let config = &mut ctx.accounts.config;
    config.admin = ctx.accounts.admin.key();
    config.verifiers = initial_verifiers;
    config.bump = ctx.bumps.config;
    Ok(())
}

#[derive(Accounts)]
pub struct AddVerifier<'info> {
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = config.bump,
        has_one = admin @ PhygitalError::UnauthorizedAdmin,
    )]
    pub config: Account<'info, Config>,
}

pub fn add_verifier_handler(ctx: Context<AddVerifier>, verifier: Pubkey) -> Result<()> {
    let config = &mut ctx.accounts.config;
    require!(
        !config.contains_verifier(&verifier),
        PhygitalError::VerifierAlreadyExists
    );
    require!(
        config.verifiers.len() < MAX_VERIFIERS,
        PhygitalError::TooManyVerifiers
    );
    config.verifiers.push(verifier);
    Ok(())
}

#[derive(Accounts)]
pub struct RemoveVerifier<'info> {
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = config.bump,
        has_one = admin @ PhygitalError::UnauthorizedAdmin,
    )]
    pub config: Account<'info, Config>,
}

pub fn remove_verifier_handler(ctx: Context<RemoveVerifier>, verifier: Pubkey) -> Result<()> {
    let config = &mut ctx.accounts.config;
    let before = config.verifiers.len();
    config.verifiers.retain(|v| v != &verifier);
    require!(
        config.verifiers.len() < before,
        PhygitalError::VerifierNotFound
    );
    Ok(())
}
