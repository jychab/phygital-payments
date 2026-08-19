mod common;

use common::TestContext;
use solana_keypair::Keypair;
use solana_signer::Signer;
use anchor_lang::prelude::Pubkey;

fn setup_delegated_payment(
    ctx: &mut TestContext,
    owner: &Keypair,
    asset: Pubkey,
    recipient: Pubkey,
    amount: u64,
) -> (Pubkey, Pubkey, Pubkey) {
    ctx.fund_program_authority(asset);
    let payment_mint = ctx.create_payment_mint();
    let sender_token = ctx.create_token_account(owner.pubkey(), payment_mint);
    let recipient_token = ctx.create_token_account(recipient, payment_mint);
    ctx.mint_tokens(payment_mint, sender_token, amount);
    ctx.approve_delegate(owner, asset, payment_mint, sender_token, amount, 6);
    (payment_mint, sender_token, recipient_token)
}

fn setup_locked_transfer(
    ctx: &mut TestContext,
    amount: u64,
) -> (
    common::TestPasskey,
    Keypair,
    Pubkey,
    Pubkey,
    Pubkey,
    Pubkey,
    Pubkey,
) {
    let passkey = common::TestPasskey::generate();
    let identifier = TestContext::unique_identifier();
    let owner = Keypair::new();
    let recipient = Keypair::new().pubkey();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);

    ctx.write_locked_asset(
        asset,
        owner.pubkey(),
        identifier,
        passkey.compressed_pubkey,
        0,
    );
    let (payment_mint, sender_token, recipient_token) =
        setup_delegated_payment(ctx, &owner, asset, recipient, amount);

    (
        passkey,
        owner,
        recipient,
        asset,
        payment_mint,
        sender_token,
        recipient_token,
    )
}

#[test]
fn transfer_accepts_admin_config_verifier() {
    let mut ctx = TestContext::new();
    let amount = 1_000_000u64;
    let (passkey, owner, recipient, asset, mint, sender, recipient_token) =
        setup_locked_transfer(&mut ctx, amount);

    ctx.send_transfer(
        asset,
        mint,
        recipient,
        sender,
        recipient_token,
        owner.pubkey(),
        amount,
        &passkey,
        true,
    )
    .expect("admin verifier should succeed");

    assert_eq!(ctx.token_balance(sender), 0);
    assert_eq!(ctx.token_balance(recipient_token), amount);
}

#[test]
fn transfer_rejects_unauthorized_verifier() {
    let mut ctx = TestContext::new();
    let amount = 1_000u64;
    let (passkey, owner, recipient, asset, mint, sender, recipient_token) =
        setup_locked_transfer(&mut ctx, amount);

    let rogue = Keypair::new();
    let err = ctx
        .send_transfer_with_verifier(
            asset,
            mint,
            recipient,
            sender,
            recipient_token,
            owner.pubkey(),
            amount,
            &passkey,
            true,
            common::TEST_RP_ID,
            &rogue,
        )
        .expect_err("rogue verifier should fail");

    let err_str = format!("{err:?}");
    assert!(
        err_str.contains("UnauthorizedVerifier") || err_str.contains("6001"),
        "unexpected error: {err:?}"
    );
}

#[test]
fn owner_verifier_override_is_exclusive() {
    let mut ctx = TestContext::new();
    let amount = 1_000u64;
    let (passkey, owner, recipient, asset, mint, sender, recipient_token) =
        setup_locked_transfer(&mut ctx, amount);

    let custom_verifier = Keypair::new();
    ctx.set_owner_verifier(
        &owner,
        custom_verifier.pubkey(),
        "https://verifier.example.com/submit",
    )
        .expect("set owner verifier");

    // Admin/config verifier must be rejected when override exists.
    let err = ctx
        .send_transfer(
            asset,
            mint,
            recipient,
            sender,
            recipient_token,
            owner.pubkey(),
            amount,
            &passkey,
            true,
        )
        .expect_err("admin verifier must fail when owner override is set");

    let err_str = format!("{err:?}");
    assert!(
        err_str.contains("OwnerVerifierRequired") || err_str.contains("6002"),
        "unexpected error: {err:?}"
    );

    // Custom owner verifier succeeds.
    ctx.send_transfer_with_verifier(
        asset,
        mint,
        recipient,
        sender,
        recipient_token,
        owner.pubkey(),
        amount,
        &passkey,
        true,
        common::TEST_RP_ID,
        &custom_verifier,
    )
    .expect("owner verifier should succeed");

    assert_eq!(ctx.token_balance(sender), 0);
    assert_eq!(ctx.token_balance(recipient_token), amount);
}

#[test]
fn clear_owner_verifier_restores_admin_fallback() {
    let mut ctx = TestContext::new();
    let amount = 1_000u64;
    let (passkey, owner, recipient, asset, mint, sender, recipient_token) =
        setup_locked_transfer(&mut ctx, amount);

    let custom_verifier = Keypair::new();
    ctx.set_owner_verifier(
        &owner,
        custom_verifier.pubkey(),
        "https://verifier.example.com/submit",
    )
        .expect("set owner verifier");
    ctx.clear_owner_verifier(&owner)
        .expect("clear owner verifier");

    ctx.send_transfer(
        asset,
        mint,
        recipient,
        sender,
        recipient_token,
        owner.pubkey(),
        amount,
        &passkey,
        true,
    )
    .expect("admin verifier should work after clear");

    assert_eq!(ctx.token_balance(sender), 0);
    assert_eq!(ctx.token_balance(recipient_token), amount);
}

#[test]
fn set_owner_verifier_stores_endpoint() {
    let mut ctx = TestContext::new();
    let owner = Keypair::new();
    let verifier = Keypair::new().pubkey();
    let endpoint = "https://verifier.example.com/submit";

    ctx.set_owner_verifier(&owner, verifier, endpoint)
        .expect("set owner verifier");

    let pda = ctx.owner_verifier_pda(owner.pubkey());
    let account = ctx.svm.get_account(&pda).expect("owner verifier account");
    use anchor_lang::AccountDeserialize;
    let decoded =
        phygital_payments::OwnerVerifier::try_deserialize(&mut &account.data[..])
            .expect("deserialize owner verifier");

    assert_eq!(decoded.owner, owner.pubkey());
    assert_eq!(decoded.verifier, verifier);
    assert_eq!(decoded.endpoint, endpoint);
}

#[test]
fn set_owner_verifier_rejects_empty_or_http_endpoint() {
    let mut ctx = TestContext::new();
    let owner = Keypair::new();
    let verifier = Keypair::new().pubkey();

    let err = ctx
        .set_owner_verifier(&owner, verifier, "")
        .expect_err("empty endpoint should fail");
    let err_str = format!("{err:?}");
    assert!(
        err_str.contains("InvalidEndpoint") || err_str.contains("6008"),
        "unexpected error: {err:?}"
    );

    let err = ctx
        .set_owner_verifier(&owner, verifier, "http://insecure.example.com")
        .expect_err("http endpoint should fail");
    let err_str = format!("{err:?}");
    assert!(
        err_str.contains("InvalidEndpoint") || err_str.contains("6008"),
        "unexpected error: {err:?}"
    );
}

#[test]
fn set_owner_verifier_rejects_oversized_endpoint() {
    let mut ctx = TestContext::new();
    let owner = Keypair::new();
    let verifier = Keypair::new().pubkey();
    let endpoint = format!("https://{}/x", "a".repeat(200));

    let err = ctx
        .set_owner_verifier(&owner, verifier, &endpoint)
        .expect_err("oversized endpoint should fail");
    let err_str = format!("{err:?}");
    assert!(
        err_str.contains("EndpointTooLong")
            || err_str.contains("InvalidEndpoint")
            || err_str.contains("6008")
            || err_str.contains("6009"),
        "unexpected error: {err:?}"
    );
}
