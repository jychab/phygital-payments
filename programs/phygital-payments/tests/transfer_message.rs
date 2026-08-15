use anchor_lang::prelude::Pubkey;
use phygital_payments::instructions::transfer::build_transfer_challenge;
use sha2::{Digest, Sha256};
use solana_keypair::Keypair;
use solana_signer::Signer;

#[test]
fn transfer_challenge_is_deterministic() {
    let mint = Keypair::new().pubkey();
    let recipient = Keypair::new().pubkey();
    let amount = 1_000_000u64;
    let slot_hash = [7u8; 32];

    let a = build_transfer_challenge(&mint, &recipient, amount, slot_hash);
    let b = build_transfer_challenge(&mint, &recipient, amount, slot_hash);
    assert_eq!(a, b);
}

#[test]
fn transfer_challenge_changes_with_inputs() {
    let mint_a = Keypair::new().pubkey();
    let mint_b = Keypair::new().pubkey();
    let recipient = Keypair::new().pubkey();
    let slot_hash = [7u8; 32];

    assert_ne!(
        build_transfer_challenge(&mint_a, &recipient, 1, slot_hash),
        build_transfer_challenge(&mint_b, &recipient, 1, slot_hash)
    );
    assert_ne!(
        build_transfer_challenge(&mint_a, &recipient, 1, slot_hash),
        build_transfer_challenge(&mint_a, &Keypair::new().pubkey(), 1, slot_hash)
    );
    assert_ne!(
        build_transfer_challenge(&mint_a, &recipient, 1, slot_hash),
        build_transfer_challenge(&mint_a, &recipient, 2, slot_hash)
    );
    assert_ne!(
        build_transfer_challenge(&mint_a, &recipient, 1, slot_hash),
        build_transfer_challenge(&mint_a, &recipient, 1, [8u8; 32])
    );
}

#[test]
fn transfer_challenge_golden_vector() {
    let mint = Pubkey::new_from_array([1u8; 32]);
    let recipient = Pubkey::new_from_array([2u8; 32]);
    let amount = 42u64;
    let slot_hash = [3u8; 32];

    let mut preimage = Vec::new();
    preimage.extend_from_slice(b"phygital_payments:transfer");
    preimage.extend_from_slice(mint.as_ref());
    preimage.extend_from_slice(recipient.as_ref());
    preimage.extend_from_slice(&amount.to_le_bytes());
    preimage.extend_from_slice(&slot_hash);

    let expected: [u8; 32] = Sha256::digest(&preimage).into();
    assert_eq!(
        build_transfer_challenge(&mint, &recipient, amount, slot_hash),
        expected
    );
}
