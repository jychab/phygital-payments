use anchor_lang::prelude::*;

#[error_code]
pub enum PhygitalError {
    #[msg("Asset must be lockable and currently locked")]
    AssetIsCurrentlyUnLocked,
    #[msg("Instructions sysvar account is missing or invalid")]
    MissingInstructionsSysvar,
    #[msg("Referenced instruction is not the secp256r1 verify instruction")]
    InvalidSecp256r1Instruction,
    #[msg("Signature index is out of bounds")]
    SignatureIndexOutOfBounds,
    #[msg("secp256r1 signature offsets are malformed")]
    InvalidSignatureOffsets,
    #[msg("WebAuthn authenticator data is malformed")]
    InvalidAuthenticatorData,
    #[msg("WebAuthn rpId is not whitelisted")]
    InvalidRpId,
}
