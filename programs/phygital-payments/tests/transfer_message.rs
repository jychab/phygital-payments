use anchor_lang::prelude::Pubkey;
use phygital_payments::instructions::transfer::build_transfer_message;
use solana_keypair::Keypair;
use solana_signer::Signer;

#[test]
fn transfer_message_is_deterministic() {
    let mint = Keypair::new().pubkey();
    let recipient = Keypair::new().pubkey();
    let amount = 1_000_000u64;

    let a = build_transfer_message(&mint, &recipient, amount);
    let b = build_transfer_message(&mint, &recipient, amount);
    assert_eq!(a, b);
}

#[test]
fn transfer_message_changes_with_inputs() {
    let mint_a = Keypair::new().pubkey();
    let mint_b = Keypair::new().pubkey();
    let recipient = Keypair::new().pubkey();

    assert_ne!(
        build_transfer_message(&mint_a, &recipient, 1),
        build_transfer_message(&mint_b, &recipient, 1)
    );
    assert_ne!(
        build_transfer_message(&mint_a, &recipient, 1),
        build_transfer_message(&mint_a, &Keypair::new().pubkey(), 1)
    );
    assert_ne!(
        build_transfer_message(&mint_a, &recipient, 1),
        build_transfer_message(&mint_a, &recipient, 2)
    );
}

#[test]
fn transfer_message_golden_vector() {
    let mint = Pubkey::new_from_array([1u8; 32]);
    let recipient = Pubkey::new_from_array([2u8; 32]);
    let amount = 42u64;

    let mut expected = Vec::new();
    expected.extend_from_slice(b"phygital_payments:transfer");
    expected.extend_from_slice(mint.as_ref());
    expected.extend_from_slice(recipient.as_ref());
    expected.extend_from_slice(&amount.to_le_bytes());

    assert_eq!(build_transfer_message(&mint, &recipient, amount), expected);
}
