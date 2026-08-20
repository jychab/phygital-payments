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

/// Global program config: admin + default verifier set (fee-payer/verifiers).
#[account]
#[derive(InitSpace)]
pub struct Config {
    pub admin: Pubkey,
    #[max_len(MAX_VERIFIERS)]
    pub verifiers: Vec<Pubkey>,
    pub bump: u8,
}

impl Config {
    pub fn contains_verifier(&self, key: &Pubkey) -> bool {
        self.verifiers.iter().any(|v| v == key)
    }
}

/// Optional per-owner verifier override. When present, ONLY this verifier may
/// authorize transfers for tokens owned by `owner` (admin set is not accepted).
/// `endpoint` is the HTTPS URL of that verifier's build/sign/send service.
#[account]
#[derive(InitSpace)]
pub struct OwnerVerifier {
    pub owner: Pubkey,
    pub verifier: Pubkey,
    #[max_len(MAX_ENDPOINT_LEN)]
    pub endpoint: String,
    pub bump: u8,
}
