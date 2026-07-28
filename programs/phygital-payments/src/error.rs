use anchor_lang::prelude::*;

#[error_code]
pub enum PhygitalError {
    #[msg("Asset must be lockable and currently locked")]
    AssetIsCurrentlyUnLocked,
}
