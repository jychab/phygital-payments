use anchor_lang::prelude::*;
use anchor_lang::Discriminator;

use crate::error::PhygitalError;
use crate::state::{Config, TokenVerifier};

/// Borsh `TokenVerifier` layout after the 8-byte discriminator.
const TV_PHYGITAL_TOKEN_OFFSET: usize = 8;
const TV_VERIFIER_OFFSET: usize = 40;
const TV_HEADER_END: usize = 72;

/// Resolve verifier: token override (exclusive) or config default set.
///
/// When the token-verifier PDA is initialized, ONLY its stored verifier is
/// accepted — there is no fallthrough to `config.verifiers`.
///
/// Reads only the two pubkeys from a live override account (no Borsh decode of
/// the endpoint `String`) — this sits on the execute / authorize hot path.
pub(crate) fn resolve_verifier<'info>(
    verifier: &Signer,
    config: &Config,
    token_verifier_info: &AccountInfo<'info>,
    phygital_token: &Pubkey,
) -> Result<()> {
    let data = token_verifier_info.try_borrow_data()?;
    let initialized = !data.is_empty()
        && token_verifier_info.owner != &System::id()
        && data.len() >= TV_HEADER_END
        && &data[..8] == TokenVerifier::DISCRIMINATOR;

    if initialized {
        let tv_token = data
            .get(TV_PHYGITAL_TOKEN_OFFSET..TV_PHYGITAL_TOKEN_OFFSET + 32)
            .ok_or_else(|| error!(PhygitalError::InvalidAccountData))?;
        require!(
            tv_token == phygital_token.as_ref(),
            PhygitalError::TokenVerifierMismatch
        );

        let tv_verifier = data
            .get(TV_VERIFIER_OFFSET..TV_VERIFIER_OFFSET + 32)
            .ok_or_else(|| error!(PhygitalError::InvalidAccountData))?;
        // Initialized override is exclusive.
        require!(
            verifier.key.as_ref() == tv_verifier,
            PhygitalError::TokenVerifierRequired
        );
        return Ok(());
    }

    require!(
        config.contains_verifier(verifier.key),
        PhygitalError::UnauthorizedVerifier
    );
    Ok(())
}
