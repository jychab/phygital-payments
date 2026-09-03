mod common;

use anchor_lang::prelude::Pubkey;
use anchor_lang::solana_program::program_pack::Pack;
use anchor_lang::solana_program::rent::Rent;
use anchor_lang::solana_program::system_instruction;
use anchor_spl::token_2022::spl_token_2022::state::Mint;
use anchor_spl::token_2022::ID as TOKEN_2022_ID;
use common::{
    assert_tx_err, setup_delegated_payment, setup_locked_asset, setup_locked_execute, TestContext,
};
use solana_keypair::Keypair;
use solana_signer::Signer;

#[test]
fn execute_spl_transfer_moves_tokens() {
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
    .expect("execute should succeed");

    assert_eq!(ctx.token_balance(sender), 0);
    assert_eq!(ctx.token_balance(recipient_token), amount);
    assert!(ctx.last_sign_count(asset) > 0);
}


#[test]
fn execute_lamport_transfer_moves_sol() {
    let mut ctx = TestContext::new();
    let (mut passkey, asset) = setup_locked_asset(&mut ctx);
    let recipient = Keypair::new().pubkey();
    let amount = 50_000_000u64;
    ctx.fund_wallet(asset);

    let wallet = ctx.wallet(asset);
    let wallet_before = ctx.lamports(wallet);
    let recipient_before = ctx.lamports(recipient);

    ctx.send_execute_lamport_transfer(asset, recipient, amount, &mut passkey)
        .expect("execute lamport transfer should succeed");

    assert_eq!(ctx.lamports(recipient), recipient_before + amount);
    assert_eq!(ctx.lamports(wallet), wallet_before - amount);
    assert!(ctx.last_sign_count(asset) > 0);
}


#[test]
fn execute_create_spl_token_2022_mint() {
    let mut ctx = TestContext::new();
    let (mut passkey, asset) = setup_locked_asset(&mut ctx);
    let decimals = 6u8;
    ctx.fund_wallet(asset);

    let wallet = ctx.wallet(asset);
    let wallet_before = ctx.lamports(wallet);

    let (result, mint) = ctx.send_execute_create_mint(asset, &mut passkey, decimals);
    result.expect("execute create mint should succeed");

    let mint_account = ctx.svm.get_account(&mint).expect("mint account");
    assert_eq!(mint_account.owner, TOKEN_2022_ID);
    let mint_state = Mint::unpack_from_slice(&mint_account.data).expect("unpack mint");
    assert_eq!(mint_state.decimals, decimals);
    assert_eq!(mint_state.mint_authority, Some(wallet).into());
    assert_eq!(mint_state.supply, 0);
    assert!(ctx.lamports(wallet) < wallet_before);
    assert!(ctx.last_sign_count(asset) > 0);
}



#[test]
fn execute_rejects_unlocked_token() {
    let mut ctx = TestContext::new();
    let mut passkey = common::TestPasskey::generate();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);
    ctx.write_unlocked_asset(
        asset,
        TestContext::unique_identifier(),
        passkey.compressed_pubkey,
    );

    let err = ctx
        .send_execute(asset, vec![], vec![], &mut passkey, &[])
        .expect_err("unlocked asset should fail");
    assert_tx_err(&err, &["TokenIsCurrentlyUnLocked", "6000"]);
}


#[test]
fn execute_rejects_wallet_owner_mismatch() {
    let mut ctx = TestContext::new();
    let mut passkey = common::TestPasskey::generate();
    let owner = Keypair::new();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);
    ctx.write_locked_asset_with_owner(
        asset,
        owner.pubkey(),
        TestContext::unique_identifier(),
        passkey.compressed_pubkey,
        0,
    );

    let err = ctx
        .send_execute(asset, vec![], vec![], &mut passkey, &[])
        .expect_err("owner != wallet PDA should fail");
    assert_tx_err(&err, &["WalletOwnerMismatch"]);
}


#[test]
fn execute_requires_preceding_secp256r1_instruction() {
    let mut ctx = TestContext::new();
    let (mut passkey, asset) = setup_locked_asset(&mut ctx);

    let err = ctx
        .send_execute_with_options(
            asset,
            vec![],
            vec![],
            &mut passkey,
            &[],
            false,
            None,
            None,
        )
        .expect_err("missing secp256r1 ix should fail");
    assert_tx_err(
        &err,
        &["InvalidSecp256r1Instruction", "MissingSecp256r1Instruction"],
    );
}


#[test]
fn execute_rejects_wrong_passkey() {
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
        .send_execute(asset, vec![], vec![], &mut passkey_b, &[])
        .expect_err("wrong passkey should fail");
    assert_tx_err(&err, &["Secp256r1PubkeyMismatch"]);
}


#[test]
fn execute_rejects_stale_slot() {
    let mut ctx = TestContext::new();
    let (mut passkey, asset) = setup_locked_asset(&mut ctx);

    let err = ctx
        .send_execute_with_options(
            asset,
            vec![],
            vec![],
            &mut passkey,
            &[],
            true,
            None,
            Some((u64::MAX, [9u8; 32])),
        )
        .expect_err("stale/missing slot should fail");
    assert_tx_err(&err, &["InvalidSlotHash"]);
}


#[test]
fn execute_rejects_self_reentrancy() {
    let mut ctx = TestContext::new();
    let (mut passkey, asset) = setup_locked_asset(&mut ctx);

    let remaining = vec![
        anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
            ctx.program_id,
            false,
        ),
    ];
    let compact = vec![phygital_wallet::CompactInstruction {
        program_id_index: 0,
        account_indexes: vec![],
        data: vec![0u8; 8],
    }];
    let err = ctx
        .send_execute(asset, compact, remaining, &mut passkey, &[])
        .expect_err("self CPI should fail");
    assert_tx_err(&err, &["SelfReentrancyNotAllowed"]);
}


#[test]
fn execute_rejects_phygital_token_cpi() {
    let mut ctx = TestContext::new();
    let (mut passkey, asset) = setup_locked_asset(&mut ctx);

    let remaining = vec![
        anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
            phygital_token_client::PHYGITAL_TOKEN_ID,
            false,
        ),
    ];
    let compact = vec![phygital_wallet::CompactInstruction {
        program_id_index: 0,
        account_indexes: vec![],
        data: vec![0u8; 8],
    }];
    let err = ctx
        .send_execute(asset, compact, remaining, &mut passkey, &[])
        .expect_err("phygital-token CPI should fail");
    assert_tx_err(&err, &["PhygitalTokenCpiNotAllowed"]);
}

#[test]
fn execute_rejects_writable_verifier_in_inner_accounts() {
    let mut ctx = TestContext::new();
    let (mut passkey, asset) = setup_locked_asset(&mut ctx);
    let recipient = Keypair::new().pubkey();

    let transfer_ix = system_instruction::transfer(&ctx.verifier.pubkey(), &recipient, 1_000);
    let remaining = vec![
        anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
            anchor_lang::system_program::ID,
            false,
        ),
        anchor_lang::solana_program::instruction::AccountMeta::new(ctx.verifier.pubkey(), true),
        anchor_lang::solana_program::instruction::AccountMeta::new(recipient, false),
    ];
    let compact = vec![phygital_wallet::CompactInstruction {
        program_id_index: 0,
        account_indexes: vec![1, 2],
        data: transfer_ix.data,
    }];
    let err = ctx
        .send_execute(asset, compact, remaining, &mut passkey, &[])
        .expect_err("writable verifier in inner accounts must fail");
    assert_tx_err(&err, &["ProtectedAccountPrivilege"]);
}

#[test]
fn execute_rejects_protected_account_writable() {
    let mut ctx = TestContext::new();
    let (mut passkey, asset) = setup_locked_asset(&mut ctx);
    let recipient = Keypair::new().pubkey();
    let wallet = ctx.wallet(asset);
    let config = ctx.config_pda();

    let transfer_ix = system_instruction::transfer(&wallet, &recipient, 1_000);
    let remaining = vec![
        anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
            anchor_lang::system_program::ID,
            false,
        ),
        anchor_lang::solana_program::instruction::AccountMeta::new(wallet, false),
        anchor_lang::solana_program::instruction::AccountMeta::new(recipient, false),
        anchor_lang::solana_program::instruction::AccountMeta::new(config, false),
    ];
    let compact = vec![phygital_wallet::CompactInstruction {
        program_id_index: 0,
        account_indexes: vec![1, 2, 3],
        data: transfer_ix.data,
    }];
    let err = ctx
        .send_execute(asset, compact, remaining, &mut passkey, &[])
        .expect_err("writable config in inner accounts must fail");
    assert_tx_err(&err, &["ProtectedAccountPrivilege"]);
}

#[test]
fn execute_rejects_wallet_assign() {
    let mut ctx = TestContext::new();
    let (mut passkey, asset) = setup_locked_asset(&mut ctx);
    let evil_owner = Keypair::new().pubkey();
    let wallet = ctx.wallet(asset);

    let assign_ix = system_instruction::assign(&wallet, &evil_owner);
    let remaining = vec![
        anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
            anchor_lang::system_program::ID,
            false,
        ),
        anchor_lang::solana_program::instruction::AccountMeta::new(wallet, false),
    ];
    let compact = vec![phygital_wallet::CompactInstruction {
        program_id_index: 0,
        account_indexes: vec![1],
        data: assign_ix.data,
    }];
    let err = ctx
        .send_execute(asset, compact, remaining, &mut passkey, &[])
        .expect_err("System::Assign on wallet must fail invariant check");
    assert_tx_err(&err, &["WalletInvariantViolated"]);
}

#[test]
fn execute_empty_compact_is_auth_only() {
    let mut ctx = TestContext::new();
    let (mut passkey, asset) = setup_locked_asset(&mut ctx);

    ctx.send_execute(asset, vec![], vec![], &mut passkey, &[])
        .expect("empty compact execute should succeed");
    assert!(ctx.last_sign_count(asset) > 0);
}


#[test]
fn execute_batch_spl_transfers_to_two_recipients() {
    let mut ctx = TestContext::new();
    let mut passkey = common::TestPasskey::generate();
    let owner = Keypair::new();
    let recip_a = Keypair::new().pubkey();
    let recip_b = Keypair::new().pubkey();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);
    let amount_a = 400_000u64;
    let amount_b = 600_000u64;
    let total = amount_a + amount_b;

    ctx.write_locked_asset(
        asset,
        TestContext::unique_identifier(),
        passkey.compressed_pubkey,
        0,
    );
    let mint = ctx.create_payment_mint();
    let sender = ctx.create_token_account(owner.pubkey(), mint);
    let token_a = ctx.create_token_account(recip_a, mint);
    let token_b = ctx.create_token_account(recip_b, mint);
    ctx.mint_tokens(mint, sender, total);
    ctx.approve_delegate(&owner, asset, mint, sender, total, 6);

    let (remaining, compact) = ctx.dual_spl_transfer_compact(
        asset, mint, sender, token_a, token_b, amount_a, amount_b, 6,
    );
    ctx.send_execute(asset, compact, remaining, &mut passkey, &[])
        .expect("dual SPL transfer should succeed");

    assert_eq!(ctx.token_balance(sender), 0);
    assert_eq!(ctx.token_balance(token_a), amount_a);
    assert_eq!(ctx.token_balance(token_b), amount_b);
}

#[test]
fn execute_mixed_system_and_spl_cpis() {
    let mut ctx = TestContext::new();
    let mut passkey = common::TestPasskey::generate();
    let owner = Keypair::new();
    let sol_recipient = Keypair::new().pubkey();
    let token_recipient = Keypair::new().pubkey();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);
    let sol_amount = 25_000_000u64;
    let token_amount = 750_000u64;

    ctx.write_locked_asset(
        asset,
        TestContext::unique_identifier(),
        passkey.compressed_pubkey,
        0,
    );
    let (mint, sender, recipient_token) =
        setup_delegated_payment(&mut ctx, &owner, asset, token_recipient, token_amount);
    ctx.fund_wallet(asset);

    let wallet = ctx.wallet(asset);
    let wallet_before = ctx.lamports(wallet);
    let sol_before = ctx.lamports(sol_recipient);

    let (remaining, compact) = ctx.mixed_system_spl_compact(
        asset,
        sol_recipient,
        sol_amount,
        mint,
        sender,
        recipient_token,
        token_amount,
        6,
    );
    ctx.send_execute(asset, compact, remaining, &mut passkey, &[])
        .expect("mixed system+SPL execute should succeed");

    assert_eq!(ctx.lamports(sol_recipient), sol_before + sol_amount);
    assert_eq!(ctx.lamports(wallet), wallet_before - sol_amount);
    assert_eq!(ctx.token_balance(sender), 0);
    assert_eq!(ctx.token_balance(recipient_token), token_amount);
}

#[test]
fn execute_create_mint_then_mint_and_transfer() {
    let mut ctx = TestContext::new();
    let mut passkey = common::TestPasskey::generate();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);
    let recipient = Keypair::new().pubkey();
    let decimals = 6u8;
    let mint_amount = 5_000_000u64;
    let transfer_amount = 2_000_000u64;

    ctx.write_locked_asset(
        asset,
        TestContext::unique_identifier(),
        passkey.compressed_pubkey,
        0,
    );
    ctx.fund_wallet(asset);

    let (result, mint_pk) = ctx.send_execute_create_mint(asset, &mut passkey, decimals);
    result.expect("create mint");

    let wallet = ctx.wallet(asset);
    let wallet_ata = ctx.create_token_account(wallet, mint_pk);
    let recipient_token = ctx.create_token_account(recipient, mint_pk);

    let mint_ix = anchor_spl::token_2022::spl_token_2022::instruction::mint_to_checked(
        &TOKEN_2022_ID,
        &mint_pk,
        &wallet_ata,
        &wallet,
        &[],
        mint_amount,
        decimals,
    )
    .expect("mint_to_checked");
    let transfer_ix = anchor_spl::token_2022::spl_token_2022::instruction::transfer_checked(
        &TOKEN_2022_ID,
        &wallet_ata,
        &mint_pk,
        &recipient_token,
        &wallet,
        &[],
        transfer_amount,
        decimals,
    )
    .expect("transfer_checked");

    let remaining = vec![
        anchor_lang::solana_program::instruction::AccountMeta::new_readonly(TOKEN_2022_ID, false),
        anchor_lang::solana_program::instruction::AccountMeta::new(mint_pk, false),
        anchor_lang::solana_program::instruction::AccountMeta::new(wallet_ata, false),
        anchor_lang::solana_program::instruction::AccountMeta::new(recipient_token, false),
        anchor_lang::solana_program::instruction::AccountMeta::new_readonly(wallet, false),
    ];
    let compact = vec![
        phygital_wallet::CompactInstruction {
            program_id_index: 0,
            account_indexes: vec![1, 2, 4],
            data: mint_ix.data,
        },
        phygital_wallet::CompactInstruction {
            program_id_index: 0,
            account_indexes: vec![2, 1, 3, 4],
            data: transfer_ix.data,
        },
    ];

    ctx.send_execute(asset, compact, remaining, &mut passkey, &[])
        .expect("mint + transfer should succeed");

    assert_eq!(ctx.token_balance(wallet_ata), mint_amount - transfer_amount);
    assert_eq!(ctx.token_balance(recipient_token), transfer_amount);

    let mint_account = ctx.svm.get_account(&mint_pk).expect("mint");
    let mint_state = Mint::unpack_from_slice(&mint_account.data).expect("unpack mint");
    assert_eq!(mint_state.supply, mint_amount);
}

#[test]
fn execute_atomic_mint_lifecycle_in_one_tx() {
    use anchor_lang::solana_program::system_instruction;
    use anchor_spl::token_2022::spl_token_2022::instruction::{
        initialize_account3, initialize_mint2, mint_to_checked, transfer_checked,
    };
    use anchor_spl::token_2022::spl_token_2022::state::Account as TokenAccountState;

    let mut ctx = TestContext::new();
    let mut passkey = common::TestPasskey::generate();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);
    let recipient = Keypair::new().pubkey();
    let decimals = 6u8;
    let mint_amount = 10_000_000u64;
    let transfer_amount = 3_500_000u64;

    ctx.write_locked_asset(
        asset,
        TestContext::unique_identifier(),
        passkey.compressed_pubkey,
        0,
    );
    ctx.fund_wallet(asset);

    let mint = Keypair::new();
    let wallet_ata = Keypair::new();
    let recipient_ata = Keypair::new();

    let wallet = ctx.wallet(asset);
    let rent: Rent = ctx.svm.get_sysvar();
    let mint_rent = rent.minimum_balance(Mint::LEN);
    let ata_rent = rent.minimum_balance(TokenAccountState::LEN);

    let create_mint = system_instruction::create_account(
        &wallet,
        &mint.pubkey(),
        mint_rent,
        Mint::LEN as u64,
        &TOKEN_2022_ID,
    );
    let init_mint =
        initialize_mint2(&TOKEN_2022_ID, &mint.pubkey(), &wallet, None, decimals).unwrap();
    let create_wallet_ata = system_instruction::create_account(
        &wallet,
        &wallet_ata.pubkey(),
        ata_rent,
        TokenAccountState::LEN as u64,
        &TOKEN_2022_ID,
    );
    let init_wallet_ata = initialize_account3(
        &TOKEN_2022_ID,
        &wallet_ata.pubkey(),
        &mint.pubkey(),
        &wallet,
    )
    .unwrap();
    let create_recip_ata = system_instruction::create_account(
        &wallet,
        &recipient_ata.pubkey(),
        ata_rent,
        TokenAccountState::LEN as u64,
        &TOKEN_2022_ID,
    );
    let init_recip_ata = initialize_account3(
        &TOKEN_2022_ID,
        &recipient_ata.pubkey(),
        &mint.pubkey(),
        &recipient,
    )
    .unwrap();
    let mint_ix = mint_to_checked(
        &TOKEN_2022_ID,
        &mint.pubkey(),
        &wallet_ata.pubkey(),
        &wallet,
        &[],
        mint_amount,
        decimals,
    )
    .unwrap();
    let xfer_ix = transfer_checked(
        &TOKEN_2022_ID,
        &wallet_ata.pubkey(),
        &mint.pubkey(),
        &recipient_ata.pubkey(),
        &wallet,
        &[],
        transfer_amount,
        decimals,
    )
    .unwrap();

    // 0 system, 1 wallet, 2 mint, 3 token_program, 4 wallet_ata, 5 recipient_ata
    let remaining = vec![
        anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
            anchor_lang::system_program::ID,
            false,
        ),
        anchor_lang::solana_program::instruction::AccountMeta::new(wallet, false),
        anchor_lang::solana_program::instruction::AccountMeta::new(mint.pubkey(), true),
        anchor_lang::solana_program::instruction::AccountMeta::new_readonly(TOKEN_2022_ID, false),
        anchor_lang::solana_program::instruction::AccountMeta::new(wallet_ata.pubkey(), true),
        anchor_lang::solana_program::instruction::AccountMeta::new(recipient_ata.pubkey(), true),
    ];
    let compact = vec![
        phygital_wallet::CompactInstruction {
            program_id_index: 0,
            account_indexes: vec![1, 2],
            data: create_mint.data,
        },
        phygital_wallet::CompactInstruction {
            program_id_index: 3,
            account_indexes: vec![2],
            data: init_mint.data,
        },
        phygital_wallet::CompactInstruction {
            program_id_index: 0,
            account_indexes: vec![1, 4],
            data: create_wallet_ata.data,
        },
        phygital_wallet::CompactInstruction {
            program_id_index: 3,
            account_indexes: vec![4, 2],
            data: init_wallet_ata.data,
        },
        phygital_wallet::CompactInstruction {
            program_id_index: 0,
            account_indexes: vec![1, 5],
            data: create_recip_ata.data,
        },
        phygital_wallet::CompactInstruction {
            program_id_index: 3,
            account_indexes: vec![5, 2],
            data: init_recip_ata.data,
        },
        phygital_wallet::CompactInstruction {
            program_id_index: 3,
            account_indexes: vec![2, 4, 1],
            data: mint_ix.data,
        },
        phygital_wallet::CompactInstruction {
            program_id_index: 3,
            account_indexes: vec![4, 2, 5, 1],
            data: xfer_ix.data,
        },
    ];

    ctx.send_execute(
        asset,
        compact,
        remaining,
        &mut passkey,
        &[mint.pubkey(), wallet_ata.pubkey(), recipient_ata.pubkey()],
    )
    .expect("atomic mint lifecycle should succeed");

    assert_eq!(
        ctx.token_balance(wallet_ata.pubkey()),
        mint_amount - transfer_amount
    );
    assert_eq!(ctx.token_balance(recipient_ata.pubkey()), transfer_amount);
}

#[test]
fn execute_burn_and_close_token_account() {
    let mut ctx = TestContext::new();
    let mut passkey = common::TestPasskey::generate();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);
    let decimals = 6u8;
    let amount = 1_000_000u64;

    ctx.write_locked_asset(
        asset,
        TestContext::unique_identifier(),
        passkey.compressed_pubkey,
        0,
    );
    ctx.fund_wallet(asset);

    let (result, mint) = ctx.send_execute_create_mint(asset, &mut passkey, decimals);
    result.expect("create mint");

    let wallet = ctx.wallet(asset);
    let wallet_ata = ctx.create_token_account(wallet, mint);

    let mint_ix = anchor_spl::token_2022::spl_token_2022::instruction::mint_to_checked(
        &TOKEN_2022_ID,
        &mint,
        &wallet_ata,
        &wallet,
        &[],
        amount,
        decimals,
    )
    .unwrap();
    let remaining = vec![
        anchor_lang::solana_program::instruction::AccountMeta::new_readonly(TOKEN_2022_ID, false),
        anchor_lang::solana_program::instruction::AccountMeta::new(mint, false),
        anchor_lang::solana_program::instruction::AccountMeta::new(wallet_ata, false),
        anchor_lang::solana_program::instruction::AccountMeta::new_readonly(wallet, false),
    ];
    let compact = vec![phygital_wallet::CompactInstruction {
        program_id_index: 0,
        account_indexes: vec![1, 2, 3],
        data: mint_ix.data,
    }];
    ctx.send_execute(asset, compact, remaining, &mut passkey, &[])
        .expect("mint_to");

    assert_eq!(ctx.token_balance(wallet_ata), amount);

    let (remaining, compact) = ctx.burn_compact(asset, mint, wallet_ata, amount, decimals);
    ctx.send_execute(asset, compact, remaining, &mut passkey, &[])
        .expect("burn");
    assert_eq!(ctx.token_balance(wallet_ata), 0);

    let dest_before = ctx.lamports(wallet);
    let (remaining, compact) = ctx.close_token_account_compact(asset, wallet_ata, wallet);
    ctx.send_execute(asset, compact, remaining, &mut passkey, &[])
        .expect("close account");

    assert!(ctx.svm.get_account(&wallet_ata).is_none() || {
        let a = ctx.svm.get_account(&wallet_ata).unwrap();
        a.lamports == 0
    });
    assert!(ctx.lamports(wallet) > dest_before);
}

#[test]
fn execute_rejects_invalid_account_index() {
    let mut ctx = TestContext::new();
    let mut passkey = common::TestPasskey::generate();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);

    ctx.write_locked_asset(
        asset,
        TestContext::unique_identifier(),
        passkey.compressed_pubkey,
        0,
    );

    let remaining = vec![
        anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
            anchor_lang::system_program::ID,
            false,
        ),
    ];
    let compact = vec![phygital_wallet::CompactInstruction {
        program_id_index: 0,
        account_indexes: vec![99],
        data: vec![2, 0, 0, 0], // System transfer discriminant-ish garbage
    }];

    let err = ctx
        .send_execute_with_options(
            asset,
            compact,
            remaining,
            &mut passkey,
            &[],
            true,
            Some([0u8; 32]),
            None,
        )
        .expect_err("oob account index must fail");
    assert_tx_err(&err, &["InvalidAccountIndex"]);
}

#[test]
fn execute_rejects_invalid_program_id_index() {
    let mut ctx = TestContext::new();
    let mut passkey = common::TestPasskey::generate();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);

    ctx.write_locked_asset(
        asset,
        TestContext::unique_identifier(),
        passkey.compressed_pubkey,
        0,
    );

    let compact = vec![phygital_wallet::CompactInstruction {
        program_id_index: 5,
        account_indexes: vec![],
        data: vec![],
    }];

    let err = ctx
        .send_execute_with_options(
            asset,
            compact,
            vec![],
            &mut passkey,
            &[],
            true,
            Some([0u8; 32]),
            None,
        )
        .expect_err("oob program index must fail");
    assert_tx_err(&err, &["InvalidAccountIndex"]);
}

#[test]
fn execute_rejects_writable_phygital_token_in_inner() {
    use anchor_lang::solana_program::system_instruction;

    let mut ctx = TestContext::new();
    let mut passkey = common::TestPasskey::generate();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);
    let recipient = Keypair::new().pubkey();

    ctx.write_locked_asset(
        asset,
        TestContext::unique_identifier(),
        passkey.compressed_pubkey,
        0,
    );

    let wallet = ctx.wallet(asset);
    let transfer_ix = system_instruction::transfer(&wallet, &recipient, 1_000);
    let remaining = vec![
        anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
            anchor_lang::system_program::ID,
            false,
        ),
        anchor_lang::solana_program::instruction::AccountMeta::new(wallet, false),
        anchor_lang::solana_program::instruction::AccountMeta::new(recipient, false),
        // protected: phygital_token marked writable
        anchor_lang::solana_program::instruction::AccountMeta::new(asset, false),
    ];
    let compact = vec![phygital_wallet::CompactInstruction {
        program_id_index: 0,
        account_indexes: vec![1, 2, 3],
        data: transfer_ix.data,
    }];

    let err = ctx
        .send_execute(asset, compact, remaining, &mut passkey, &[])
        .expect_err("writable phygital_token must fail");
    assert_tx_err(&err, &["ProtectedAccountPrivilege"]);
}

#[test]
fn execute_rejects_writable_token_verifier_in_inner() {
    use anchor_lang::solana_program::system_instruction;

    let mut ctx = TestContext::new();
    let mut passkey = common::TestPasskey::generate();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);
    let recipient = Keypair::new().pubkey();

    ctx.write_locked_asset(
        asset,
        TestContext::unique_identifier(),
        passkey.compressed_pubkey,
        0,
    );

    let wallet = ctx.wallet(asset);
    let tv = ctx.token_verifier_pda(asset);
    let transfer_ix = system_instruction::transfer(&wallet, &recipient, 1_000);
    let remaining = vec![
        anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
            anchor_lang::system_program::ID,
            false,
        ),
        anchor_lang::solana_program::instruction::AccountMeta::new(wallet, false),
        anchor_lang::solana_program::instruction::AccountMeta::new(recipient, false),
        anchor_lang::solana_program::instruction::AccountMeta::new(tv, false),
    ];
    let compact = vec![phygital_wallet::CompactInstruction {
        program_id_index: 0,
        account_indexes: vec![1, 2, 3],
        data: transfer_ix.data,
    }];

    let err = ctx
        .send_execute(asset, compact, remaining, &mut passkey, &[])
        .expect_err("writable token_verifier must fail");
    assert_tx_err(&err, &["ProtectedAccountPrivilege"]);
}

#[test]
fn execute_allows_readonly_protected_accounts_in_remaining() {
    use anchor_lang::solana_program::system_instruction;

    let mut ctx = TestContext::new();
    let mut passkey = common::TestPasskey::generate();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);
    let recipient = Keypair::new().pubkey();
    let amount = 10_000_000u64;

    ctx.write_locked_asset(
        asset,
        TestContext::unique_identifier(),
        passkey.compressed_pubkey,
        0,
    );
    ctx.fund_wallet(asset);

    let wallet = ctx.wallet(asset);
    let config = ctx.config_pda();
    let tv = ctx.token_verifier_pda(asset);
    let transfer_ix = system_instruction::transfer(&wallet, &recipient, amount);

    // Protected accounts present as readonly — not referenced by compact indexes
    // except unused; included to prove privilege check allows RO.
    let remaining = vec![
        anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
            anchor_lang::system_program::ID,
            false,
        ),
        anchor_lang::solana_program::instruction::AccountMeta::new(wallet, false),
        anchor_lang::solana_program::instruction::AccountMeta::new(recipient, false),
        anchor_lang::solana_program::instruction::AccountMeta::new_readonly(config, false),
        anchor_lang::solana_program::instruction::AccountMeta::new_readonly(tv, false),
        anchor_lang::solana_program::instruction::AccountMeta::new_readonly(asset, false),
        anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
            ctx.verifier.pubkey(),
            false,
        ),
    ];
    let compact = vec![phygital_wallet::CompactInstruction {
        program_id_index: 0,
        account_indexes: vec![1, 2],
        data: transfer_ix.data,
    }];

    let before = ctx.lamports(recipient);
    ctx.send_execute(asset, compact, remaining, &mut passkey, &[])
        .expect("readonly protected accounts should be allowed");
    assert_eq!(ctx.lamports(recipient), before + amount);
}

#[test]
fn execute_rejects_wrong_challenge_hash() {
    let mut ctx = TestContext::new();
    let (mut passkey, asset) = setup_locked_asset(&mut ctx);

    let err = ctx
        .send_execute_with_options(
            asset,
            vec![],
            vec![],
            &mut passkey,
            &[],
            true,
            Some([0xABu8; 32]),
            None,
        )
        .expect_err("wrong challenge must fail");
    assert_tx_err(&err, &["InvalidSecp256r1", "Mismatch", "mismatch"]);
}


#[test]
fn execute_rejects_insufficient_lamports() {
    let mut ctx = TestContext::new();
    let (mut passkey, asset) = setup_locked_asset(&mut ctx);
    let recipient = Keypair::new().pubkey();

    let err = ctx
        .send_execute_lamport_transfer(asset, recipient, 1_000_000, &mut passkey)
        .expect_err("unfunded wallet transfer must fail");
    assert_tx_err(&err, &["insufficient", "Insufficient"]);
}


#[test]
fn execute_multiple_lamport_transfers_in_one_tx() {
    use anchor_lang::solana_program::system_instruction;

    let mut ctx = TestContext::new();
    let mut passkey = common::TestPasskey::generate();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);
    let a = Keypair::new().pubkey();
    let b = Keypair::new().pubkey();
    let c = Keypair::new().pubkey();
    let amt = 5_000_000u64;

    ctx.write_locked_asset(
        asset,
        TestContext::unique_identifier(),
        passkey.compressed_pubkey,
        0,
    );
    ctx.fund_wallet(asset);

    let wallet = ctx.wallet(asset);
    let ix_a = system_instruction::transfer(&wallet, &a, amt);
    let ix_b = system_instruction::transfer(&wallet, &b, amt);
    let ix_c = system_instruction::transfer(&wallet, &c, amt);

    let remaining = vec![
        anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
            anchor_lang::system_program::ID,
            false,
        ),
        anchor_lang::solana_program::instruction::AccountMeta::new(wallet, false),
        anchor_lang::solana_program::instruction::AccountMeta::new(a, false),
        anchor_lang::solana_program::instruction::AccountMeta::new(b, false),
        anchor_lang::solana_program::instruction::AccountMeta::new(c, false),
    ];
    let compact = vec![
        phygital_wallet::CompactInstruction {
            program_id_index: 0,
            account_indexes: vec![1, 2],
            data: ix_a.data,
        },
        phygital_wallet::CompactInstruction {
            program_id_index: 0,
            account_indexes: vec![1, 3],
            data: ix_b.data,
        },
        phygital_wallet::CompactInstruction {
            program_id_index: 0,
            account_indexes: vec![1, 4],
            data: ix_c.data,
        },
    ];

    let before_a = ctx.lamports(a);
    let before_b = ctx.lamports(b);
    let before_c = ctx.lamports(c);

    ctx.send_execute(asset, compact, remaining, &mut passkey, &[])
        .expect("triple lamport transfer");

    assert_eq!(ctx.lamports(a), before_a + amt);
    assert_eq!(ctx.lamports(b), before_b + amt);
    assert_eq!(ctx.lamports(c), before_c + amt);
}

#[test]
fn execute_many_inner_lamport_transfers() {
    use anchor_lang::solana_program::system_instruction;

    let mut ctx = TestContext::new();
    let mut passkey = common::TestPasskey::generate();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);

    ctx.write_locked_asset(
        asset,
        TestContext::unique_identifier(),
        passkey.compressed_pubkey,
        0,
    );
    ctx.fund_wallet(asset);

    let wallet = ctx.wallet(asset);
    let batch_size = 16usize;
    let recipients: Vec<Pubkey> = (0..batch_size)
        .map(|_| Keypair::new().pubkey())
        .collect();
    let amt = 100_000u64;

    let mut remaining = vec![
        anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
            anchor_lang::system_program::ID,
            false,
        ),
        anchor_lang::solana_program::instruction::AccountMeta::new(wallet, false),
    ];
    for r in &recipients {
        remaining.push(anchor_lang::solana_program::instruction::AccountMeta::new(*r, false));
    }

    let compact: Vec<_> = recipients
        .iter()
        .enumerate()
        .map(|(i, r)| {
            let ix = system_instruction::transfer(&wallet, r, amt);
            phygital_wallet::CompactInstruction {
                program_id_index: 0,
                account_indexes: vec![1, (i + 2) as u8],
                data: ix.data,
            }
        })
        .collect();

    ctx.send_execute(asset, compact, remaining, &mut passkey, &[])
        .expect("batched lamport transfers should succeed");

    for r in &recipients {
        assert_eq!(ctx.lamports(*r), amt);
    }
}
