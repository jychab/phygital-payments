use anchor_lang::prelude::*;

use crate::ADMIN;
use crate::constants::{CONFIG_SEED, MAX_VERIFIERS};
use crate::error::PhygitalError;
use crate::state::Config;

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(
        mut,
        address = ADMIN
    )]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = Config::LEN,
        seeds = [CONFIG_SEED],
        bump,
    )]
    pub config: AccountLoader<'info, Config>,

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

    let config = &mut ctx.accounts.config.load_init()?;
    config.admin = ctx.accounts.admin.key();
    config.verifiers = [Pubkey::default(); MAX_VERIFIERS];
    config.verifier_count = initial_verifiers.len() as u8;
    for (i, verifier) in initial_verifiers.iter().enumerate() {
        for other in initial_verifiers.iter().take(i) {
            require_keys_neq!(*verifier, *other, PhygitalError::VerifierAlreadyExists);
        }
        config.verifiers[i] = *verifier;
    }
    config.bump = ctx.bumps.config;
    Ok(())
}

#[derive(Accounts)]
pub struct AddVerifier<'info> {
    #[account(
        address = ADMIN
    )]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = config.load()?.bump,
        constraint = config.load()?.admin == admin.key() @ PhygitalError::UnauthorizedAdmin,
    )]
    pub config: AccountLoader<'info, Config>,
}

pub fn add_verifier_handler(ctx: Context<AddVerifier>, verifier: Pubkey) -> Result<()> {
    let mut config = ctx.accounts.config.load_mut()?;
    require!(
        !config.contains_verifier(&verifier),
        PhygitalError::VerifierAlreadyExists
    );
    require!(
        (config.verifier_count as usize) < MAX_VERIFIERS,
        PhygitalError::TooManyVerifiers
    );
    let idx = config.verifier_count as usize;
    config.verifiers[idx] = verifier;
    config.verifier_count += 1;
    Ok(())
}

#[derive(Accounts)]
pub struct RemoveVerifier<'info> {
    #[account(
        address = ADMIN
    )]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [CONFIG_SEED],
        bump = config.load()?.bump,
        constraint = config.load()?.admin == admin.key() @ PhygitalError::UnauthorizedAdmin,
    )]
    pub config: AccountLoader<'info, Config>,
}

pub fn remove_verifier_handler(ctx: Context<RemoveVerifier>, verifier: Pubkey) -> Result<()> {
    let mut config = ctx.accounts.config.load_mut()?;
    let count = config.verifier_count as usize;
    let pos = config.verifiers[..count]
        .iter()
        .position(|v| v == &verifier)
        .ok_or_else(|| error!(PhygitalError::VerifierNotFound))?;
    let last = count - 1;
    config.verifiers[pos] = config.verifiers[last];
    config.verifiers[last] = Pubkey::default();
    config.verifier_count = last as u8;
    Ok(())
}
