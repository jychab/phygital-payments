use anchor_lang::prelude::*;
use phygital_token_client::Secp256r1VerifyArgs;
use solana_instructions_sysvar::get_instruction_relative;
use solana_sdk_ids::sysvar::instructions::ID as INSTRUCTIONS_SYSVAR_ID;

use crate::error::PhygitalError;

/// The secp256r1 signature-verification precompile.
pub const SECP256R1_PROGRAM_ID: Pubkey = pubkey!("Secp256r1SigVerify1111111111111111111111111");

// secp256r1 instruction data layout: a 1-byte signature count, 1 byte of padding,
// then one offsets entry per signature.
const SIGNATURE_OFFSETS_START: usize = 2;
const SIGNATURE_OFFSETS_SERIALIZED_SIZE: usize = 14;

/// Minimum WebAuthn authenticator data: rpIdHash (32) + flags (1) + signCount (4).
const AUTH_DATA_MIN_LEN: usize = 37;
const CLIENT_DATA_HASH_LEN: usize = 32;
/// The signed message is `authenticatorData || SHA256(clientDataJSON)`.
const MIN_SIGNED_MESSAGE_LEN: usize = AUTH_DATA_MIN_LEN + CLIENT_DATA_HASH_LEN;
/// rpIdHash = SHA256(rpId), the first 32 bytes of authenticatorData.
pub const RP_ID_HASH_LEN: usize = 32;

// `#[repr(C)]` pins field order to match the secp256r1 program's on-wire offset
// layout, which is read via an unaligned pointer cast below. Without it, Rust may
// reorder the fields and the cast would map them incorrectly.
#[repr(C)]
#[allow(dead_code)]
struct Secp256r1SignatureOffsets {
    signature_offset: u16,
    signature_instruction_index: u16,
    public_key_offset: u16,
    public_key_instruction_index: u16,
    message_data_offset: u16,
    message_data_size: u16,
    message_instruction_index: u16,
}

fn read_signature_offsets(
    data: &[u8],
    signed_message_index: u8,
) -> Result<Secp256r1SignatureOffsets> {
    let start = (signed_message_index as usize)
        .checked_mul(SIGNATURE_OFFSETS_SERIALIZED_SIZE)
        .and_then(|offset| offset.checked_add(SIGNATURE_OFFSETS_START))
        .ok_or(PhygitalError::InvalidSignatureOffsets)?;
    let end = start
        .checked_add(SIGNATURE_OFFSETS_SERIALIZED_SIZE)
        .ok_or(PhygitalError::InvalidSignatureOffsets)?;

    require!(end <= data.len(), PhygitalError::InvalidSignatureOffsets);

    const EXPECTED_STRUCT_SIZE: usize = core::mem::size_of::<Secp256r1SignatureOffsets>();
    require!(
        EXPECTED_STRUCT_SIZE == SIGNATURE_OFFSETS_SERIALIZED_SIZE,
        PhygitalError::InvalidSignatureOffsets
    );

    let offsets = unsafe {
        core::ptr::read_unaligned(data.as_ptr().add(start) as *const Secp256r1SignatureOffsets)
    };

    Ok(offsets)
}

fn extract_message_data<'a>(
    data: &'a [u8],
    offsets: &Secp256r1SignatureOffsets,
) -> Result<&'a [u8]> {
    let message_offset = offsets.message_data_offset as usize;
    let message_size = offsets.message_data_size as usize;
    let message_end = message_offset
        .checked_add(message_size)
        .ok_or(PhygitalError::InvalidSignatureOffsets)?;

    require!(
        message_end <= data.len(),
        PhygitalError::InvalidSignatureOffsets
    );
    require!(
        message_size >= MIN_SIGNED_MESSAGE_LEN,
        PhygitalError::InvalidSignatureOffsets
    );

    Ok(data
        .get(message_offset..message_end)
        .ok_or(PhygitalError::InvalidSignatureOffsets)?)
}

/// Extracts the rpIdHash from the authenticatorData carried by the secp256r1 verify
/// instruction referenced by `args`. This is the same signed message the `VerifyAsset`
/// CPI cryptographically checks — located via `verify_args_relative_index` /
/// `signed_message_index` — so the bytes read here are exactly the bytes that get
/// verified, and a caller cannot point this at a decoy without failing signature
/// verification downstream.
pub fn extract_rp_id_hash(
    instructions_sysvar: &UncheckedAccount,
    args: &Secp256r1VerifyArgs,
) -> Result<[u8; RP_ID_HASH_LEN]> {
    require!(
        instructions_sysvar.key() == INSTRUCTIONS_SYSVAR_ID,
        PhygitalError::MissingInstructionsSysvar
    );

    let account_info = instructions_sysvar.to_account_info();
    let instruction = get_instruction_relative(args.verify_args_relative_index, &account_info)?;

    require!(
        instruction.program_id.as_ref() == SECP256R1_PROGRAM_ID.as_ref(),
        PhygitalError::InvalidSecp256r1Instruction
    );

    let data = instruction.data.as_slice();
    let num_signatures = *data
        .first()
        .ok_or(PhygitalError::InvalidSecp256r1Instruction)?;

    require!(
        args.signed_message_index < num_signatures,
        PhygitalError::SignatureIndexOutOfBounds
    );

    let offsets = read_signature_offsets(data, args.signed_message_index)?;
    let message = extract_message_data(data, &offsets)?;

    // authenticatorData leads the signed message; its first 32 bytes are the rpIdHash.
    Ok(message[..RP_ID_HASH_LEN]
        .try_into()
        .map_err(|_| PhygitalError::InvalidAuthenticatorData)?)
}
