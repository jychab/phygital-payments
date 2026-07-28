use anchor_lang::prelude::*;

#[constant]
pub const PROGRAM_AUTHORITY_SEED: &[u8] = b"program_authority";

pub const PHYGITAL_TOKEN_PROGRAM_ID: Pubkey =
    pubkey!("DdwhetyqgSB56XVcR33ySG5dFmvwbjSc5aSMHRg5Bk6A");

/// The exact WebAuthn `origin` (scheme included) allowed to authorize transfers.
/// Must match the `origin` field the browser embeds in clientDataJSON.
pub const WHITELISTED_RPID: &[u8] = b"payments.revibase.com";
