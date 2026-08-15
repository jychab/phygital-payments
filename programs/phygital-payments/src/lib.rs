use anchor_lang::prelude::*;

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("DQJiqvPmzfsrd2UnAfG5msSvgo1X8QXvm1q4axUsdvok");

#[program]
pub mod phygital_payments {
    use super::*;

    pub fn initialize_config(
        ctx: Context<InitializeConfig>,
        initial_verifiers: Vec<Pubkey>,
    ) -> Result<()> {
        instructions::config::initialize_config_handler(ctx, initial_verifiers)
    }

    pub fn add_verifier(ctx: Context<AddVerifier>, verifier: Pubkey) -> Result<()> {
        instructions::config::add_verifier_handler(ctx, verifier)
    }

    pub fn remove_verifier(ctx: Context<RemoveVerifier>, verifier: Pubkey) -> Result<()> {
        instructions::config::remove_verifier_handler(ctx, verifier)
    }

    pub fn set_owner_verifier(
        ctx: Context<SetOwnerVerifier>,
        verifier: Pubkey,
        endpoint: String,
    ) -> Result<()> {
        instructions::owner_verifier::set_owner_verifier_handler(ctx, verifier, endpoint)
    }

    pub fn clear_owner_verifier(ctx: Context<ClearOwnerVerifier>) -> Result<()> {
        instructions::owner_verifier::clear_owner_verifier_handler(ctx)
    }

    pub fn transfer(
        ctx: Context<ExecuteTransfer>,
        amount: u64,
        secp256r1_verify_args: Secp256r1VerifyArgs,
        slot_number: u64,
    ) -> Result<()> {
        instructions::transfer::handler(ctx, amount, secp256r1_verify_args, slot_number)
    }
}
