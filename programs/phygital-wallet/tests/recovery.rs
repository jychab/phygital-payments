mod common;

use anchor_lang::prelude::Pubkey;
use common::{assert_tx_err, setup_locked_asset, TestContext};
use solana_keypair::Keypair;
use solana_signer::Signer;

#[test]
fn set_recovery_wallet_stores_key() {
    let mut ctx = TestContext::new();
    let (mut passkey, asset) = setup_locked_asset(&mut ctx);
    let recovery = Keypair::new();

    ctx.set_recovery_wallet(&mut passkey, asset, recovery.pubkey())
        .expect("set recovery wallet");

    let pda = ctx.recovery_wallet_pda(asset);
    let account = ctx.svm.get_account(&pda).expect("recovery pda");
    assert_eq!(account.owner, ctx.program_id);
    // discriminator(8) + phygital_token(32) + recovery_wallet(32)
    let stored = &account.data[8 + 32..8 + 64];
    assert_eq!(stored, recovery.pubkey().as_ref());
}

#[test]
fn set_recovery_wallet_rejects_default_pubkey() {
    let mut ctx = TestContext::new();
    let (mut passkey, asset) = setup_locked_asset(&mut ctx);

    let err = ctx
        .set_recovery_wallet(&mut passkey, asset, Pubkey::default())
        .expect_err("default recovery key should fail");
    assert_tx_err(&err, &["InvalidRecoveryWallet"]);
}

#[test]
fn set_recovery_wallet_rejects_wrong_passkey() {
    let mut ctx = TestContext::new();
    let (mut passkey, asset) = setup_locked_asset(&mut ctx);
    let mut other = common::TestPasskey::generate();
    let recovery = Keypair::new();

    let err = ctx
        .set_recovery_wallet(&mut other, asset, recovery.pubkey())
        .expect_err("wrong passkey should fail");
    assert_tx_err(
        &err,
        &["InvalidSecp256r1Instruction", "Secp256r1", "6000", "Verify"],
    );

    // Original passkey still works.
    ctx.set_recovery_wallet(&mut passkey, asset, recovery.pubkey())
        .expect("set with correct passkey");
}

#[test]
fn clear_recovery_wallet_closes_account() {
    let mut ctx = TestContext::new();
    let (mut passkey, asset) = setup_locked_asset(&mut ctx);
    let recovery = Keypair::new();

    ctx.set_recovery_wallet(&mut passkey, asset, recovery.pubkey())
        .expect("set");
    ctx.clear_recovery_wallet(&mut passkey, asset)
        .expect("clear");

    let pda = ctx.recovery_wallet_pda(asset);
    let account = ctx.svm.get_account(&pda);
    assert!(
        account.is_none() || account.as_ref().is_some_and(|a| a.lamports == 0),
        "recovery pda should be closed"
    );
}

#[test]
fn recovery_wallet_execute_moves_lamports() {
    let mut ctx = TestContext::new();
    let (mut passkey, asset) = setup_locked_asset(&mut ctx);
    let recovery = Keypair::new();
    let recipient = Keypair::new().pubkey();
    let amount = 40_000_000u64;

    ctx.set_recovery_wallet(&mut passkey, asset, recovery.pubkey())
        .expect("set recovery");
    ctx.fund_wallet(asset);

    let wallet = ctx.wallet(asset);
    let wallet_before = ctx.lamports(wallet);
    let recipient_before = ctx.lamports(recipient);

    ctx.send_recovery_lamport_transfer(asset, &recovery, recipient, amount)
        .expect("recovery execute");

    assert_eq!(ctx.lamports(recipient), recipient_before + amount);
    assert_eq!(ctx.lamports(wallet), wallet_before - amount);
}

#[test]
fn recovery_wallet_execute_rejects_wrong_signer() {
    let mut ctx = TestContext::new();
    let (mut passkey, asset) = setup_locked_asset(&mut ctx);
    let recovery = Keypair::new();
    let impostor = Keypair::new();
    let recipient = Keypair::new().pubkey();

    ctx.set_recovery_wallet(&mut passkey, asset, recovery.pubkey())
        .expect("set recovery");
    ctx.fund_wallet(asset);

    let err = ctx
        .send_recovery_lamport_transfer(asset, &impostor, recipient, 1_000)
        .expect_err("wrong recovery signer");
    assert_tx_err(&err, &["UnauthorizedRecoveryWallet", "Constraint"]);
}

#[test]
fn recovery_wallet_execute_requires_configured_account() {
    let mut ctx = TestContext::new();
    let (_passkey, asset) = setup_locked_asset(&mut ctx);
    let recovery = Keypair::new();
    let recipient = Keypair::new().pubkey();
    ctx.fund_wallet(asset);

    let err = ctx
        .send_recovery_lamport_transfer(asset, &recovery, recipient, 1_000)
        .expect_err("missing recovery account");
    assert_tx_err(&err, &["AccountNotInitialized", "AccountDiscriminator", "3012"]);
}
