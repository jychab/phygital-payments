use anchor_lang::prelude::*;

use crate::constants::{MAX_ENDPOINT_LEN, MAX_VERIFIERS};

/// Instruction-arg mirror of `phygital_token_client::Secp256r1VerifyArgs`.
///
/// The crates.io client only derives Borsh for this type, which breaks Anchor's
/// `idl-build` (`IdlBuild` methods). Keep a same-layout Anchor type here for the
/// program interface and convert at the CPI boundary.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, Eq, PartialEq)]
pub struct Secp256r1VerifyArgs {
    pub verify_args_relative_index: i64,
    pub signed_message_index: u8,
    pub client_data_json: Vec<u8>,
}

impl From<Secp256r1VerifyArgs> for phygital_token_client::Secp256r1VerifyArgs {
    fn from(value: Secp256r1VerifyArgs) -> Self {
        Self {
            verify_args_relative_index: value.verify_args_relative_index,
            signed_message_index: value.signed_message_index,
            client_data_json: value.client_data_json,
        }
    }
}

/// Index-based inner instruction for execute.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, Eq, PartialEq)]
pub struct CompactInstruction {
    /// Index into `remaining_accounts` for the target program id.
    pub program_id_index: u8,
    /// Indexes into `remaining_accounts` for the instruction's accounts.
    pub account_indexes: Vec<u8>,
    pub data: Vec<u8>,
}

/// Global program config: admin + default verifier set (fee-payer/verifiers).
///
/// Fixed-size so execute can `AccountLoader` (zero-copy) instead of
/// Borsh-decoding a `Vec`.
#[account(zero_copy)]
#[repr(C)]
pub struct Config {
    pub admin: Pubkey,
    pub verifiers: [Pubkey; MAX_VERIFIERS],
    pub verifier_count: u8,
    pub bump: u8,
    pub _padding: [u8; 6],
}

const _: () = assert!(core::mem::size_of::<Config>() == 296);

impl Config {
    pub const LEN: usize = 8 + core::mem::size_of::<Self>();

    pub fn contains_verifier(&self, key: &Pubkey) -> bool {
        let n = self.verifier_count as usize;
        self.verifiers[..n.min(MAX_VERIFIERS)]
            .iter()
            .any(|v| v == key)
    }
}

/// Optional per-phygital-token verifier override. When present, ONLY this
/// verifier may authorize executes for that token (config set is not accepted).
/// `endpoint` is the HTTPS URL of that verifier's build/sign/send service.
///
/// Not on the execute hot path (read by offset in `resolve_verifier`); keep
/// Borsh so the endpoint stays a human-readable `String` in the IDL.
#[account]
#[derive(InitSpace)]
pub struct TokenVerifier {
    pub phygital_token: Pubkey,
    pub verifier: Pubkey,
    #[max_len(MAX_ENDPOINT_LEN)]
    pub endpoint: String,
    /// Account that paid init rent; close refunds this pubkey.
    pub payer: Pubkey,
    pub bump: u8,
}
