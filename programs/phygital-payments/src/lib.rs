pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;
use phygital_token_client::Secp256r1VerifyArgs;

pub use constants::*;
pub use instructions::*;

declare_id!("DQJiqvPmzfsrd2UnAfG5msSvgo1X8QXvm1q4axUsdvok");

#[program]
pub mod phygital_payments {
    use super::*;

    pub fn transfer(
        ctx: Context<ExecuteTransfer>,
        amount: u64,
        secp256r1_verify_args: Secp256r1VerifyArgs,
    ) -> Result<()> {
        instructions::transfer::handler(ctx, amount, secp256r1_verify_args)
    }
}
