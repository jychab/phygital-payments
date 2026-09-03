mod common;

use anchor_lang::prelude::Pubkey;
use common::{
    build_execute_challenge, hash_compact_instructions, hash_execute_challenge,
    hash_referenced_accounts, pack_compact_instructions,
};
use phygital_wallet::instructions::token_verifier::{
    build_clear_token_verifier_challenge, build_set_token_verifier_challenge,
};
use phygital_wallet::CompactInstruction;
use sha2::{Digest, Sha256};
use solana_keypair::Keypair;
use solana_signer::Signer;

#[test]
fn execute_challenge_changes_with_slot_hash() {
    let compact = vec![];
    let keys: [Pubkey; 0] = [];
    assert_ne!(
        build_execute_challenge([7u8; 32], &compact, &keys),
        build_execute_challenge([8u8; 32], &compact, &keys)
    );
}

#[test]
fn execute_challenge_binds_compact_instructions() {
    let slot_hash = [3u8; 32];
    let program = Keypair::new().pubkey();
    let keys = [program];
    let a = vec![CompactInstruction {
        program_id_index: 0,
        account_indexes: vec![],
        data: vec![1, 2, 3],
    }];
    let b = vec![CompactInstruction {
        program_id_index: 0,
        account_indexes: vec![],
        data: vec![1, 2, 4],
    }];
    assert_ne!(
        build_execute_challenge(slot_hash, &a, &keys),
        build_execute_challenge(slot_hash, &b, &keys)
    );
}

#[test]
fn execute_challenge_binds_referenced_account_order() {
    let slot_hash = [5u8; 32];
    let program = Keypair::new().pubkey();
    let alice = Keypair::new().pubkey();
    let bob = Keypair::new().pubkey();
    let compact = vec![CompactInstruction {
        program_id_index: 0,
        account_indexes: vec![1, 2],
        data: vec![9],
    }];
    let keys_ab = [program, alice, bob];
    let keys_ba = [program, bob, alice];
    assert_ne!(
        build_execute_challenge(slot_hash, &compact, &keys_ab),
        build_execute_challenge(slot_hash, &compact, &keys_ba)
    );
}

#[test]
fn execute_challenge_golden_vector() {
    let slot_hash = [3u8; 32];
    let program = Pubkey::new_from_array([1u8; 32]);
    let recipient = Pubkey::new_from_array([2u8; 32]);
    let compact = vec![CompactInstruction {
        program_id_index: 0,
        account_indexes: vec![1],
        data: vec![0xAB, 0xCD],
    }];
    let keys = [program, recipient];

    let instructions_hash = hash_compact_instructions(&compact);
    let accounts_hash = hash_referenced_accounts(&keys, &compact);

    let mut preimage = Vec::new();
    preimage.extend_from_slice(b"phygital_wallet:execute:v2");
    preimage.extend_from_slice(&slot_hash);
    preimage.extend_from_slice(&instructions_hash);
    preimage.extend_from_slice(&accounts_hash);
    let expected: [u8; 32] = Sha256::digest(&preimage).into();
    assert_eq!(
        hash_execute_challenge(&slot_hash, &instructions_hash, &accounts_hash),
        expected
    );
    assert_eq!(
        build_execute_challenge(slot_hash, &compact, &keys),
        expected
    );
}

#[test]
fn pack_compact_matches_expected_layout() {
    let compact = [CompactInstruction {
        program_id_index: 0,
        account_indexes: vec![1, 2],
        data: vec![0xDE, 0xAD],
    }];
    let packed = pack_compact_instructions(&compact);
    // [num=1][prog=0][nacc=2][1][2][len=2 LE][DE][AD]
    assert_eq!(packed, vec![1, 0, 2, 1, 2, 2, 0, 0xDE, 0xAD]);
}

#[test]
fn set_token_verifier_challenge_binds_verifier_and_endpoint() {
    let slot_hash = [4u8; 32];
    let phygital_token = Pubkey::default();
    let verifier = Keypair::new().pubkey();
    let endpoint = "https://verifier.example.com/submit";
    let mut preimage = Vec::new();
    preimage.extend_from_slice(b"phygital_wallet:set_tv:v1");
    preimage.extend_from_slice(&slot_hash);
    preimage.extend_from_slice(phygital_token.as_ref());
    preimage.extend_from_slice(verifier.as_ref());
    preimage.extend_from_slice(endpoint.as_bytes());
    let expected: [u8; 32] = Sha256::digest(&preimage).into();
    assert_eq!(
        build_set_token_verifier_challenge(slot_hash, &phygital_token, &verifier, endpoint),
        expected
    );
    assert_ne!(
        build_set_token_verifier_challenge(slot_hash, &phygital_token, &verifier, endpoint),
        build_set_token_verifier_challenge(
            slot_hash,
            &phygital_token,
            &Keypair::new().pubkey(),
            endpoint
        )
    );
}

#[test]
fn clear_token_verifier_challenge_golden_vector() {
    let slot_hash = [6u8; 32];
    let phygital_token = Pubkey::default();
    let mut preimage = Vec::new();
    preimage.extend_from_slice(b"phygital_wallet:clear_tv:v1");
    preimage.extend_from_slice(&slot_hash);
    preimage.extend_from_slice(&phygital_token.as_ref());
    let expected: [u8; 32] = Sha256::digest(&preimage).into();
    assert_eq!(
        build_clear_token_verifier_challenge(slot_hash, &phygital_token),
        expected
    );
}
