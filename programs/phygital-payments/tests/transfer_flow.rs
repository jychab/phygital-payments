mod common;

use common::{TestContext, TestPasskey};
use solana_keypair::Keypair;
use solana_signer::Signer;
use anchor_lang::prelude::Pubkey;

fn setup_delegated_payment(
    ctx: &mut TestContext,
    owner: &Keypair,
    recipient: Pubkey,
    amount: u64,
) -> (Pubkey, Pubkey, Pubkey) {
    ctx.fund_program_authority(owner.pubkey());
    let payment_mint = ctx.create_payment_mint();
    let sender_token = ctx.create_token_account(owner.pubkey(), payment_mint);
    let recipient_token = ctx.create_token_account(recipient, payment_mint);
    ctx.mint_tokens(payment_mint, sender_token, amount);
    ctx.approve_delegate(owner, payment_mint, sender_token, amount, 6);
    (payment_mint, sender_token, recipient_token)
}

#[test]
fn transfer_succeeds_and_moves_tokens() {
    let mut ctx = TestContext::new();
    let passkey = TestPasskey::generate();
    let owner = Keypair::new();
    let recipient = Keypair::new().pubkey();
    let design_mint = Keypair::new().pubkey();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);
    let amount = 1_000_000u64;

    ctx.write_locked_asset(
        asset,
        owner.pubkey(),
        design_mint,
        passkey.compressed_pubkey,
        u64::MAX,
    );
    let (payment_mint, sender_token, recipient_token) =
        setup_delegated_payment(&mut ctx, &owner, recipient, amount);

    ctx.send_transfer(
        asset,
        payment_mint,
        recipient,
        sender_token,
        recipient_token,
        owner.pubkey(),
        amount,
        &passkey,
        true,
    )
    .expect("transfer should succeed");

    assert_eq!(ctx.token_balance(sender_token), 0);
    assert_eq!(ctx.token_balance(recipient_token), amount);
    assert_ne!(ctx.last_transfer_slot(asset), u64::MAX);
}

#[test]
fn transfer_rejects_wrong_rp_id() {
    let mut ctx = TestContext::new();
    let passkey = TestPasskey::generate();
    let owner = Keypair::new();
    let recipient = Keypair::new().pubkey();
    let design_mint = Keypair::new().pubkey();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);
    let amount = 1_000_000u64;

    ctx.write_locked_asset(
        asset,
        owner.pubkey(),
        design_mint,
        passkey.compressed_pubkey,
        u64::MAX,
    );
    let (payment_mint, sender_token, recipient_token) =
        setup_delegated_payment(&mut ctx, &owner, recipient, amount);

    let err = ctx
        .send_transfer_with_rp_id(
            asset,
            payment_mint,
            recipient,
            sender_token,
            recipient_token,
            owner.pubkey(),
            amount,
            &passkey,
            true,
            "evil.com",
        )
        .expect_err("non-whitelisted rpId should fail");

    let err_str = format!("{err:?}");
    assert!(
        err_str.contains("InvalidRpId") || err_str.contains("6001"),
        "unexpected error: {err:?}"
    );

    // Nothing moved.
    assert_eq!(ctx.token_balance(sender_token), amount);
    assert_eq!(ctx.token_balance(recipient_token), 0);
}

#[test]
fn transfer_rejects_unlocked_asset() {
    let mut ctx = TestContext::new();
    let passkey = TestPasskey::generate();
    let owner = Keypair::new();
    let recipient = Keypair::new().pubkey();
    let design_mint = Keypair::new().pubkey();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);
    let amount = 1_000u64;

    ctx.write_unlocked_asset(asset, owner.pubkey(), design_mint, passkey.compressed_pubkey);
    let (payment_mint, sender_token, recipient_token) =
        setup_delegated_payment(&mut ctx, &owner, recipient, amount);

    let err = ctx
        .send_transfer(
            asset,
            payment_mint,
            recipient,
            sender_token,
            recipient_token,
            owner.pubkey(),
            amount,
            &passkey,
            true,
        )
        .expect_err("unlocked asset should fail");

    let err_str = format!("{err:?}");
    assert!(
        err_str.contains("AssetIsCurrentlyUnLocked") || err_str.contains("6000"),
        "unexpected error: {err:?}"
    );
}

#[test]
fn transfer_requires_preceding_secp256r1_instruction() {
    let mut ctx = TestContext::new();
    let passkey = TestPasskey::generate();
    let owner = Keypair::new();
    let recipient = Keypair::new().pubkey();
    let design_mint = Keypair::new().pubkey();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);
    let amount = 1_000u64;

    ctx.write_locked_asset(
        asset,
        owner.pubkey(),
        design_mint,
        passkey.compressed_pubkey,
        u64::MAX,
    );
    let (payment_mint, sender_token, recipient_token) =
        setup_delegated_payment(&mut ctx, &owner, recipient, amount);

    let err = ctx
        .send_transfer(
            asset,
            payment_mint,
            recipient,
            sender_token,
            recipient_token,
            owner.pubkey(),
            amount,
            &passkey,
            false,
        )
        .expect_err("missing secp256r1 ix should fail");

    let err_str = format!("{err:?}");
    assert!(
        err_str.contains("InvalidSecp256r1Instruction")
            || err_str.contains("MissingSecp256r1Instruction")
            || err_str.contains("6002")
            || err_str.contains("Custom")
            || err_str.contains("Failed"),
        "unexpected error: {err:?}"
    );
}

#[test]
fn transfer_rejects_wrong_passkey() {
    let mut ctx = TestContext::new();
    let passkey_a = TestPasskey::generate();
    let passkey_b = TestPasskey::generate();
    let owner = Keypair::new();
    let recipient = Keypair::new().pubkey();
    let design_mint = Keypair::new().pubkey();
    let asset = ctx.asset_pda(&passkey_a.compressed_pubkey);
    let amount = 1_000u64;

    ctx.write_locked_asset(
        asset,
        owner.pubkey(),
        design_mint,
        passkey_a.compressed_pubkey,
        u64::MAX,
    );
    let (payment_mint, sender_token, recipient_token) =
        setup_delegated_payment(&mut ctx, &owner, recipient, amount);

    let err = ctx
        .send_transfer(
            asset,
            payment_mint,
            recipient,
            sender_token,
            recipient_token,
            owner.pubkey(),
            amount,
            &passkey_b,
            true,
        )
        .expect_err("wrong passkey should fail");

    let err_str = format!("{err:?}");
    assert!(
        err_str.contains("Secp256r1PubkeyMismatch")
            || err_str.contains("6004")
            || err_str.contains("6005")
            || err_str.contains("Custom"),
        "unexpected error: {err:?}"
    );
}
