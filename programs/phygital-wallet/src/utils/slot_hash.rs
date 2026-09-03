use anchor_lang::prelude::*;

use crate::error::PhygitalError;

/// Binary-search `slot_number` in the SlotHashes sysvar (same layout as SPL/token).
pub(crate) fn fetch_slot_hash(
    slot_hashes_account: &UncheckedAccount,
    slot_number: u64,
) -> Result<[u8; 32]> {
    let data = slot_hashes_account
        .try_borrow_data()
        .map_err(|_| error!(PhygitalError::InvalidSysvarDataFormat))?;

    require!(data.len() >= 8, PhygitalError::InvalidSysvarDataFormat);

    let num_slot_hashes = u64::from_le_bytes(
        data[..8]
            .try_into()
            .map_err(|_| error!(PhygitalError::InvalidSysvarDataFormat))?,
    ) as usize;

    if num_slot_hashes == 0 {
        return err!(PhygitalError::InvalidSysvarDataFormat);
    }

    let mut left = 0usize;
    let mut right = num_slot_hashes;

    while left < right {
        let mid = left + (right - left) / 2;
        let pos = 8usize
            .checked_add(
                mid.checked_mul(40)
                    .ok_or(error!(PhygitalError::InvalidSysvarDataFormat))?,
            )
            .ok_or(error!(PhygitalError::InvalidSysvarDataFormat))?;

        require!(
            pos.checked_add(40)
                .ok_or(error!(PhygitalError::InvalidSysvarDataFormat))?
                <= data.len(),
            PhygitalError::InvalidSysvarDataFormat
        );

        let slot = u64::from_le_bytes(
            data[pos..pos + 8]
                .try_into()
                .map_err(|_| error!(PhygitalError::InvalidSysvarDataFormat))?,
        );

        if slot == slot_number {
            let hash_bytes = &data[pos + 8..pos + 40];
            return Ok(hash_bytes
                .try_into()
                .map_err(|_| error!(PhygitalError::InvalidSysvarDataFormat))?);
        } else if slot > slot_number {
            left = mid + 1;
        } else {
            right = mid;
        }
    }

    err!(PhygitalError::InvalidSlotHash)
}
