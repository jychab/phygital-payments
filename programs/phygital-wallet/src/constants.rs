use anchor_lang::prelude::*;

#[constant]
pub const PROGRAM_WALLET_SEED: &[u8] = b"program_wallet";

#[constant]
pub const CONFIG_SEED: &[u8] = b"config";

#[constant]
pub const TOKEN_VERIFIER_SEED: &[u8] = b"token_verifier";

/// Maximum number of admin-authorized default verifiers.
pub const MAX_VERIFIERS: usize = 8;

/// Max length of the token-verifier submit endpoint URL.
pub const MAX_ENDPOINT_LEN: usize = 128;

/// Execute challenge: `SHA256(prefix || slot_hash || instructions_hash || accounts_hash)`.
pub const EXECUTE_CHALLENGE_PREFIX: &[u8] = b"phygital_wallet:execute:v2";

/// Set token verifier challenge prefix (plus slot_hash || verifier || endpoint).
pub const SET_TOKEN_VERIFIER_CHALLENGE_PREFIX: &[u8] = b"phygital_wallet:set_tv:v1";

/// Clear token verifier challenge: `SHA256(prefix || slot_hash)`.
pub const CLEAR_TOKEN_VERIFIER_CHALLENGE_PREFIX: &[u8] = b"phygital_wallet:clear_tv:v1";

pub const ADMIN: Pubkey = pubkey!("G6kBnedts6uAivtY72ToaFHBs1UVbT9udiXmQZgMEjoF");
