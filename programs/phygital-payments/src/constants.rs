use anchor_lang::prelude::*;

#[constant]
pub const PROGRAM_AUTHORITY_SEED: &[u8] = b"program_authority";

#[constant]
pub const CONFIG_SEED: &[u8] = b"config";

#[constant]
pub const OWNER_VERIFIER_SEED: &[u8] = b"owner_verifier";

/// Maximum number of admin-authorized default verifiers.
pub const MAX_VERIFIERS: usize = 8;

/// Max length of the owner-verifier submit endpoint URL.
pub const MAX_ENDPOINT_LEN: usize = 128;

pub const PHYGITAL_TOKEN_PROGRAM_ID: Pubkey =
    pubkey!("DuPpckdjjgVAnYok2aTMAt264ZPBXqq3JSazJjCUzTJQ");

/// The WebAuthn `rpId` allowed to authorize transfers.
/// Passed to `verify_asset` as `expected_rp_id` (no scheme).
pub const WHITELISTED_RPID: &str = "app.revibase.com";

pub const WHITELISTED_ORIGIN: &str = "https://app.revibase.com";
