use anchor_lang::prelude::*;

#[error_code]
pub enum PhygitalError {
    #[msg("Token must be lockable and currently locked")]
    TokenIsCurrentlyUnLocked,
    #[msg("Verifier is not authorized for this transfer")]
    UnauthorizedVerifier,
    #[msg("Owner has configured a custom verifier; that key must sign")]
    OwnerVerifierRequired,
    #[msg("Verifier is already in the config set")]
    VerifierAlreadyExists,
    #[msg("Verifier was not found in the config set")]
    VerifierNotFound,
    #[msg("Config verifier set is full")]
    TooManyVerifiers,
    #[msg("Only the config admin may perform this action")]
    UnauthorizedAdmin,
    #[msg("Owner verifier account does not match the token owner")]
    OwnerVerifierMismatch,
    #[msg("Verifier endpoint URL is empty or invalid")]
    InvalidEndpoint,
    #[msg("Verifier endpoint URL exceeds max length")]
    EndpointTooLong,
    #[msg("Slot not found in SlotHashes sysvar — signature has expired or is being replayed")]
    InvalidSlotHash,
    #[msg("Invalid SlotHashes sysvar data format")]
    InvalidSysvarDataFormat,
}
