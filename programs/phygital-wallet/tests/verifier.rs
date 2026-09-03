mod common;

use common::{assert_tx_err, setup_locked_execute, TestContext};
use solana_keypair::Keypair;
use solana_signer::Signer;
use anchor_lang::prelude::Pubkey;

#[test]
fn execute_uses_config_verifier_when_no_override() {
    let mut ctx = TestContext::new();
    let amount = 1_000_000u64;
    let (mut passkey, _owner, _recipient, asset, mint, sender, recipient_token) =
        setup_locked_execute(&mut ctx, amount);

    ctx.send_execute_spl_transfer(
        asset,
        mint,
        sender,
        recipient_token,
        amount,
        &mut passkey,
        true,
    )
    .expect("admin verifier should succeed");

    assert_eq!(ctx.token_balance(sender), 0);
    assert_eq!(ctx.token_balance(recipient_token), amount);
}

#[test]
fn execute_rejects_unauthorized_verifier() {
    let mut ctx = TestContext::new();
    let amount = 1_000u64;
    let (mut passkey, _owner, _recipient, asset, mint, sender, recipient_token) =
        setup_locked_execute(&mut ctx, amount);

    let rogue = Keypair::new();
    let err = ctx
        .send_execute_spl_transfer_with_verifier(
            asset,
            mint,
            sender,
            recipient_token,
            amount,
            &mut passkey,
            true,
            common::TEST_RP_ID,
            &rogue,
            None,
        )
        .expect_err("rogue verifier should fail");

    assert_tx_err(&err, &["UnauthorizedVerifier", "6001"]);
}

#[test]
fn execute_requires_token_verifier_when_set() {
    let mut ctx = TestContext::new();
    let amount = 1_000u64;
    let (mut passkey, _owner, _recipient, asset, mint, sender, recipient_token) =
        setup_locked_execute(&mut ctx, amount);

    let custom_verifier = Keypair::new();
    ctx.set_token_verifier(
        &mut passkey,
        asset,
        custom_verifier.pubkey(),
        "https://verifier.example.com/submit",
    )
    .expect("set token verifier");

    let err = ctx
        .send_execute_spl_transfer(
            asset,
            mint,
            sender,
            recipient_token,
            amount,
            &mut passkey,
            true,
        )
        .expect_err("admin verifier must fail when token override is set");

    assert_tx_err(&err, &["TokenVerifierRequired", "6002"]);

    ctx.send_execute_spl_transfer_with_verifier(
        asset,
        mint,
        sender,
        recipient_token,
        amount,
        &mut passkey,
        true,
        common::TEST_RP_ID,
        &custom_verifier,
        None,
    )
    .expect("token verifier should succeed");

    assert_eq!(ctx.token_balance(sender), 0);
    assert_eq!(ctx.token_balance(recipient_token), amount);
}

#[test]
fn execute_rejects_wrong_token_verifier() {
    let mut ctx = TestContext::new();
    let amount = 1_000u64;
    let (mut passkey, _owner, _recipient, asset, mint, sender, recipient_token) =
        setup_locked_execute(&mut ctx, amount);

    let custom_verifier = Keypair::new();
    let other = Keypair::new();
    ctx.set_token_verifier(
        &mut passkey,
        asset,
        custom_verifier.pubkey(),
        "https://verifier.example.com/submit",
    )
    .expect("set token verifier");

    let err = ctx
        .send_execute_spl_transfer_with_verifier(
            asset,
            mint,
            sender,
            recipient_token,
            amount,
            &mut passkey,
            true,
            common::TEST_RP_ID,
            &other,
            None,
        )
        .expect_err("wrong token verifier should fail");

    assert_tx_err(&err, &["TokenVerifierRequired", "6002"]);
}

#[test]
fn clear_token_verifier_restores_admin_fallback() {
    let mut ctx = TestContext::new();
    let amount = 1_000u64;
    let (mut passkey, _owner, _recipient, asset, mint, sender, recipient_token) =
        setup_locked_execute(&mut ctx, amount);

    let custom_verifier = Keypair::new();
    ctx.set_token_verifier(
        &mut passkey,
        asset,
        custom_verifier.pubkey(),
        "https://verifier.example.com/submit",
    )
    .expect("set token verifier");
    ctx.clear_token_verifier_with_signer(&mut passkey, asset, &custom_verifier)
        .expect("clear token verifier");

    ctx.send_execute_spl_transfer(
        asset,
        mint,
        sender,
        recipient_token,
        amount,
        &mut passkey,
        true,
    )
    .expect("admin verifier should work after clear");

    assert_eq!(ctx.token_balance(sender), 0);
    assert_eq!(ctx.token_balance(recipient_token), amount);
}

#[test]
fn set_token_verifier_stores_endpoint() {
    let mut ctx = TestContext::new();
    let mut passkey = common::TestPasskey::generate();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);
    ctx.write_locked_asset(
        asset,
        TestContext::unique_identifier(),
        passkey.compressed_pubkey,
        0,
    );

    let verifier = Keypair::new().pubkey();
    let endpoint = "https://verifier.example.com/submit";

    ctx.set_token_verifier(&mut passkey, asset, verifier, endpoint)
        .expect("set token verifier");

    let pda = ctx.token_verifier_pda(asset);
    let account = ctx.svm.get_account(&pda).expect("token verifier account");
    use anchor_lang::AccountDeserialize;
    let decoded = phygital_wallet::TokenVerifier::try_deserialize(&mut &account.data[..])
        .expect("deserialize token verifier");

    assert_eq!(decoded.phygital_token, asset);
    assert_eq!(decoded.verifier, verifier);
    assert_eq!(decoded.endpoint, endpoint);
    assert_eq!(decoded.payer, ctx.payer.pubkey());
}

#[test]
fn set_token_verifier_rejects_wrong_passkey() {
    let mut ctx = TestContext::new();
    let passkey_a = common::TestPasskey::generate();
    let mut passkey_b = common::TestPasskey::generate();
    let asset = ctx.asset_pda(&passkey_a.compressed_pubkey);
    ctx.write_locked_asset(
        asset,
        TestContext::unique_identifier(),
        passkey_a.compressed_pubkey,
        0,
    );

    let err = ctx
        .set_token_verifier(
            &mut passkey_b,
            asset,
            Keypair::new().pubkey(),
            "https://verifier.example.com/submit",
        )
        .expect_err("wrong passkey should fail");

    assert_tx_err(&err, &["Secp256r1PubkeyMismatch"]);
}

#[test]
fn set_token_verifier_rejects_empty_or_http_endpoint() {
    let mut ctx = TestContext::new();
    let mut passkey = common::TestPasskey::generate();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);
    ctx.write_locked_asset(
        asset,
        TestContext::unique_identifier(),
        passkey.compressed_pubkey,
        0,
    );
    let verifier = Keypair::new().pubkey();

    let err = ctx
        .set_token_verifier(&mut passkey, asset, verifier, "")
        .expect_err("empty endpoint should fail");
    assert_tx_err(&err, &["InvalidEndpoint", "6008", "6009"]);

    let err = ctx
        .set_token_verifier(&mut passkey, asset, verifier, "http://insecure.example.com")
        .expect_err("http endpoint should fail");
    assert_tx_err(&err, &["InvalidEndpoint", "6008", "6009"]);
}

#[test]
fn set_token_verifier_rejects_default_pubkey() {
    let mut ctx = TestContext::new();
    let mut passkey = common::TestPasskey::generate();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);
    ctx.write_locked_asset(
        asset,
        TestContext::unique_identifier(),
        passkey.compressed_pubkey,
        0,
    );

    let err = ctx
        .set_token_verifier(
            &mut passkey,
            asset,
            Pubkey::default(),
            "https://verifier.example.com/submit",
        )
        .expect_err("default verifier pubkey should fail");

    assert_tx_err(&err, &["InvalidTokenVerifier"]);
}

#[test]
fn set_token_verifier_rejects_oversized_endpoint() {
    let mut ctx = TestContext::new();
    let mut passkey = common::TestPasskey::generate();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);
    ctx.write_locked_asset(
        asset,
        TestContext::unique_identifier(),
        passkey.compressed_pubkey,
        0,
    );
    let verifier = Keypair::new().pubkey();
    let endpoint = format!("https://{}/x", "a".repeat(200));

    let err = ctx
        .set_token_verifier(&mut passkey, asset, verifier, &endpoint)
        .expect_err("oversized endpoint should fail");
    assert_tx_err(&err, &["EndpointTooLong", "InvalidEndpoint"]);
}

#[test]
fn clear_token_verifier_rejects_config_verifier_when_override_set() {
    let mut ctx = TestContext::new();
    let mut passkey = common::TestPasskey::generate();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);
    ctx.write_locked_asset(
        asset,
        TestContext::unique_identifier(),
        passkey.compressed_pubkey,
        0,
    );

    let custom_verifier = Keypair::new();
    ctx.set_token_verifier(
        &mut passkey,
        asset,
        custom_verifier.pubkey(),
        "https://verifier.example.com/submit",
    )
    .expect("set token verifier");

    let err = ctx
        .clear_token_verifier(&mut passkey, asset)
        .expect_err("config verifier must not clear token override");

    assert_tx_err(&err, &["TokenVerifierRequired", "6002"]);
}

#[test]
fn set_token_verifier_rejects_unauthorized_config_verifier() {
    let mut ctx = TestContext::new();
    let mut passkey = common::TestPasskey::generate();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);
    ctx.write_locked_asset(
        asset,
        TestContext::unique_identifier(),
        passkey.compressed_pubkey,
        0,
    );

    let rogue = Keypair::new();
    let err = ctx
        .set_token_verifier_with_signer(
            &mut passkey,
            asset,
            Keypair::new().pubkey(),
            "https://verifier.example.com/submit",
            &rogue,
        )
        .expect_err("rogue config verifier should fail");

    assert_tx_err(&err, &["UnauthorizedVerifier", "6001"]);
}
