use anchor_lang::prelude::*;

#[error_code]
pub enum PhygitalError {
    #[msg("Token must be lockable and currently locked")]
    TokenIsCurrentlyUnLocked,
    #[msg("Verifier is not authorized for this execute")]
    UnauthorizedVerifier,
    #[msg("Token has a custom verifier configured; that key must sign")]
    TokenVerifierRequired,
    #[msg("Verifier is already in the config set")]
    VerifierAlreadyExists,
    #[msg("Verifier was not found in the config set")]
    VerifierNotFound,
    #[msg("Config verifier set is full")]
    TooManyVerifiers,
    #[msg("Only the config admin may perform this action")]
    UnauthorizedAdmin,
    #[msg("Token verifier account does not match the phygital token")]
    TokenVerifierMismatch,
    #[msg("Verifier endpoint URL is empty or invalid")]
    InvalidEndpoint,
    #[msg("Verifier endpoint URL exceeds max length")]
    EndpointTooLong,
    #[msg("Slot not found in SlotHashes sysvar — signature has expired or is being replayed")]
    InvalidSlotHash,
    #[msg("Invalid SlotHashes sysvar data format")]
    InvalidSysvarDataFormat,
    #[msg("Account data is missing or malformed")]
    InvalidAccountData,
    #[msg("Compact instruction account index out of bounds")]
    InvalidAccountIndex,
    #[msg("Self-reentrancy via CPI into this program is not allowed")]
    SelfReentrancyNotAllowed,
    #[msg("CPI into the phygital-token program is not allowed")]
    PhygitalTokenCpiNotAllowed,
    #[msg("Rent receiver must match the token verifier account creator")]
    TokenVerifierPayerMismatch,
    #[msg("Wallet PDA must equal phygital_token.owner")]
    WalletOwnerMismatch,
    #[msg("Execute must be a top-level instruction (CPI into execute is not allowed)")]
    ExecuteViaCpiNotAllowed,
    #[msg("Wallet PDA owner or data length changed during inner CPI")]
    WalletInvariantViolated,
    #[msg("Protected account may not be a signer or writable in inner instructions")]
    ProtectedAccountPrivilege,
    #[msg("Token verifier pubkey must be a non-default key")]
    InvalidTokenVerifier,
    #[msg("Recovery wallet account does not match the phygital token")]
    RecoveryWalletMismatch,
    #[msg("Rent receiver must match the recovery wallet account creator")]
    RecoveryWalletPayerMismatch,
    #[msg("Recovery wallet pubkey must be a non-default key")]
    InvalidRecoveryWallet,
    #[msg("Recovery wallet signer does not match the configured recovery key")]
    UnauthorizedRecoveryWallet,
}
