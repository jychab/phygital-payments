use anchor_lang::prelude::*;

pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;
pub(crate) mod utils;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("Fjbi9JrRAmSBdxQxbkcxYDp6JUwnLbFhU2GsieWQBLSg");

#[program]
pub mod phygital_wallet {
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

    pub fn set_token_verifier(
        ctx: Context<SetTokenVerifier>,
        new_verifier: Pubkey,
        endpoint: String,
        secp256r1_verify_args: Secp256r1VerifyArgs,
        slot_number: u64,
    ) -> Result<()> {
        instructions::token_verifier::set_token_verifier_handler(
            ctx,
            new_verifier,
            endpoint,
            secp256r1_verify_args,
            slot_number,
        )
    }

    pub fn clear_token_verifier(
        ctx: Context<ClearTokenVerifier>,
        secp256r1_verify_args: Secp256r1VerifyArgs,
        slot_number: u64,
    ) -> Result<()> {
        instructions::token_verifier::clear_token_verifier_handler(
            ctx,
            secp256r1_verify_args,
            slot_number,
        )
    }

    /// Passkey-gated execute of compact inner instructions.
    pub fn execute<'info>(
        ctx: Context<'info, Execute<'info>>,
        compact_instructions: Vec<CompactInstruction>,
        secp256r1_verify_args: Secp256r1VerifyArgs,
        slot_number: u64,
    ) -> Result<()> {
        instructions::execute::handler(
            ctx,
            compact_instructions,
            secp256r1_verify_args,
            slot_number,
        )
    }
}
