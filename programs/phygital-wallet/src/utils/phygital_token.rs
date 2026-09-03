use anchor_lang::prelude::*;
use phygital_token_client::{PhygitalTokenType, PHYGITAL_TOKEN_DISCRIMINATOR};

const PHY_OWNER_OFFSET: usize = 8;
const PHY_TOKEN_TYPE_OFFSET: usize = 76;
const PHY_IS_LOCKED_OFFSET: usize = 77;

/// Cheap lock/type check used on execute (does not copy owner / pubkey).
pub(crate) fn locked_controlled(info: &UncheckedAccount) -> bool {
    let data = match info.try_borrow_data() {
        Ok(d) => d,
        Err(_) => return false,
    };
    if data.len() < PHY_IS_LOCKED_OFFSET + 1 {
        return false;
    }
    if data[..8] != PHYGITAL_TOKEN_DISCRIMINATOR {
        return false;
    }
    data[PHY_TOKEN_TYPE_OFFSET] == PhygitalTokenType::Controlled as u8
        && data[PHY_IS_LOCKED_OFFSET] == 1
}

/// Anchor `constraint =` helper (surfaces in IDL account validation).
pub(crate) fn wallet_matches_owner(
    wallet: &UncheckedAccount,
    phygital_token: &UncheckedAccount,
) -> bool {
    let Ok(data) = phygital_token.try_borrow_data() else {
        return false;
    };
    if data.len() < PHY_OWNER_OFFSET + 32 || data[..8] != PHYGITAL_TOKEN_DISCRIMINATOR {
        return false;
    }
    wallet.key.as_ref() == &data[PHY_OWNER_OFFSET..PHY_OWNER_OFFSET + 32]
}
