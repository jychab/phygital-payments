#![allow(dead_code)] // shared across execute_flow / verifier / cu_hot_path crates

mod secp256r1;

pub use secp256r1::{current_slot_entry, TestPasskey, TEST_RP_ID};

use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_pack::Pack;
use anchor_lang::solana_program::system_instruction;
use anchor_lang::{InstructionData, ToAccountMetas};
use anchor_spl::token_2022::spl_token_2022::instruction::{
    approve_checked, burn_checked, close_account, initialize_account3, initialize_mint2, mint_to,
    transfer_checked,
};
use anchor_spl::token_2022::spl_token_2022::state::{Account as TokenAccountState, Mint};
use anchor_spl::token_2022::ID as TOKEN_2022_ID;
use borsh::BorshDeserialize;
use litesvm::LiteSVM;
use phygital_wallet::{
    ADMIN, CONFIG_SEED, PROGRAM_WALLET_SEED,
    TOKEN_VERIFIER_SEED, CompactInstruction, Secp256r1VerifyArgs,
};
use phygital_token_client::{PhygitalToken, PhygitalTokenType, PHYGITAL_TOKEN_DISCRIMINATOR};
use solana_account::Account as SolanaAccount;
use solana_keypair::Keypair;
use solana_message::{Message, VersionedMessage};
use solana_sdk_ids::sysvar::{
    instructions::ID as INSTRUCTIONS_SYSVAR_ID, slot_hashes::ID as SLOT_HASHES_SYSVAR_ID,
};
use solana_signature::Signature;
use solana_signer::Signer;
use solana_transaction::versioned::VersionedTransaction;
use sha2::{Digest, Sha256};

pub const TOKEN_SEED: &[u8] = b"token";
pub const LAMPORTS_PER_SOL: u64 = 1_000_000_000;
const EXECUTE_CHALLENGE_PREFIX: &[u8] = b"phygital_wallet:execute:v2";

/// Offline pack — mirrors on-chain `instructions_hash` preimage layout.
pub fn pack_compact_instructions(instructions: &[CompactInstruction]) -> Vec<u8> {
    assert!(instructions.len() <= u8::MAX as usize);
    let mut bytes = Vec::new();
    bytes.push(instructions.len() as u8);
    for ix in instructions {
        assert!(ix.account_indexes.len() <= u8::MAX as usize);
        assert!(ix.data.len() <= u16::MAX as usize);
        bytes.push(ix.program_id_index);
        bytes.push(ix.account_indexes.len() as u8);
        bytes.extend_from_slice(&ix.account_indexes);
        bytes.extend_from_slice(&(ix.data.len() as u16).to_le_bytes());
        bytes.extend_from_slice(&ix.data);
    }
    bytes
}

pub fn hash_compact_instructions(instructions: &[CompactInstruction]) -> [u8; 32] {
    Sha256::digest(&pack_compact_instructions(instructions)).into()
}

/// Offline `accounts_hash` over remaining pubkeys (tests have no AccountInfo).
pub fn hash_referenced_accounts(
    remaining_keys: &[Pubkey],
    instructions: &[CompactInstruction],
) -> [u8; 32] {
    let mut buf = Vec::new();
    for ix in instructions {
        let program = remaining_keys
            .get(ix.program_id_index as usize)
            .expect("program_id_index");
        buf.extend_from_slice(program.as_ref());
        for &idx in &ix.account_indexes {
            let key = remaining_keys.get(idx as usize).expect("account index");
            buf.extend_from_slice(key.as_ref());
        }
    }
    Sha256::digest(&buf).into()
}

pub fn hash_execute_challenge(
    slot_hash: &[u8; 32],
    instructions_hash: &[u8; 32],
    accounts_hash: &[u8; 32],
) -> [u8; 32] {
    let mut preimage = Vec::with_capacity(EXECUTE_CHALLENGE_PREFIX.len() + 96);
    preimage.extend_from_slice(EXECUTE_CHALLENGE_PREFIX);
    preimage.extend_from_slice(slot_hash);
    preimage.extend_from_slice(instructions_hash);
    preimage.extend_from_slice(accounts_hash);
    Sha256::digest(&preimage).into()
}

/// Offline execute challenge over remaining pubkeys (tests have no AccountInfo).
pub fn build_execute_challenge(
    slot_hash: [u8; 32],
    compact_instructions: &[CompactInstruction],
    remaining_keys: &[Pubkey],
) -> [u8; 32] {
    let instructions_hash = hash_compact_instructions(compact_instructions);
    let accounts_hash = hash_referenced_accounts(remaining_keys, compact_instructions);
    hash_execute_challenge(&slot_hash, &instructions_hash, &accounts_hash)
}

/// Assert a LiteSVM/Anchor failure mentions at least one expected needle.
pub fn assert_tx_err(err: impl std::fmt::Debug, needles: &[&str]) {
    let err_str = format!("{err:?}");
    assert!(
        needles.iter().any(|n| err_str.contains(n)),
        "expected one of {needles:?}, got: {err:?}"
    );
}

/// Locked phygital token only (no payment mint / ATAs).
pub fn setup_locked_asset(ctx: &mut TestContext) -> (TestPasskey, Pubkey) {
    let passkey = TestPasskey::generate();
    let asset = ctx.asset_pda(&passkey.compressed_pubkey);
    ctx.write_locked_asset(
        asset,
        TestContext::unique_identifier(),
        passkey.compressed_pubkey,
        0,
    );
    (passkey, asset)
}

/// Mint + ATAs + approve wallet as delegate. Does not fund the wallet PDA with SOL.
pub fn setup_delegated_payment(
    ctx: &mut TestContext,
    owner: &Keypair,
    asset: Pubkey,
    recipient: Pubkey,
    amount: u64,
) -> (Pubkey, Pubkey, Pubkey) {
    let payment_mint = ctx.create_payment_mint();
    let sender_token = ctx.create_token_account(owner.pubkey(), payment_mint);
    let recipient_token = ctx.create_token_account(recipient, payment_mint);
    ctx.mint_tokens(payment_mint, sender_token, amount);
    ctx.approve_delegate(owner, asset, payment_mint, sender_token, amount, 6);
    (payment_mint, sender_token, recipient_token)
}

/// Locked asset + delegated SPL payment ready for execute.
pub fn setup_locked_execute(
    ctx: &mut TestContext,
    amount: u64,
) -> (
    TestPasskey,
    Keypair,
    Pubkey,
    Pubkey,
    Pubkey,
    Pubkey,
    Pubkey,
) {
    let (passkey, asset) = setup_locked_asset(ctx);
    let owner = Keypair::new();
    let recipient = Keypair::new().pubkey();
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

pub struct TestContext {
    pub svm: LiteSVM,
    pub payer: Keypair,
    pub verifier: Keypair,
    /// Hardcoded program admin (`ADMIN`); no secret needed — LiteSVM sigverify is off.
    pub admin: Pubkey,
    pub program_id: Pubkey,
    pub mint_authority: Keypair,
}

impl TestContext {
    pub fn new() -> Self {
        let program_id = phygital_wallet::ID;
        let mut svm = LiteSVM::new().with_precompiles().with_sigverify(false);
        let manifest_dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"));

        Self::deploy_program(
            &mut svm,
            program_id,
            &program_artifact_paths(manifest_dir, "phygital_wallet"),
            "phygital_wallet",
        );
        Self::deploy_program(
            &mut svm,
            phygital_token_client::PHYGITAL_TOKEN_ID,
            &phygital_token_artifact_paths(manifest_dir),
            "phygital_token",
        );

        let payer = Keypair::new();
        let verifier = Keypair::new();
        svm.airdrop(&payer.pubkey(), 10 * LAMPORTS_PER_SOL)
            .expect("airdrop payer");
        svm.airdrop(&verifier.pubkey(), 10 * LAMPORTS_PER_SOL)
            .expect("airdrop verifier");
        svm.airdrop(&ADMIN, LAMPORTS_PER_SOL)
            .expect("airdrop admin");

        let mut ctx = Self {
            svm,
            payer,
            verifier,
            admin: ADMIN,
            program_id,
            mint_authority: Keypair::new(),
        };
        ctx.initialize_config(&[ctx.verifier.pubkey()])
            .expect("initialize config");
        ctx
    }

    pub fn config_pda(&self) -> Pubkey {
        Pubkey::find_program_address(&[CONFIG_SEED], &self.program_id).0
    }

    pub fn token_verifier_pda(&self, phygital_token: Pubkey) -> Pubkey {
        Pubkey::find_program_address(
            &[TOKEN_VERIFIER_SEED, phygital_token.as_ref()],
            &self.program_id,
        )
        .0
    }

    pub fn initialize_config(
        &mut self,
        initial_verifiers: &[Pubkey],
    ) -> litesvm::types::TransactionResult {
        let ix = anchor_lang::solana_program::instruction::Instruction {
            program_id: self.program_id,
            accounts: phygital_wallet::accounts::InitializeConfig {
                admin: self.admin,
                config: self.config_pda(),
                system_program: anchor_lang::system_program::ID,
            }
            .to_account_metas(None),
            data: phygital_wallet::instruction::InitializeConfig {
                initial_verifiers: initial_verifiers.to_vec(),
            }
            .data(),
        };
        Self::send_instructions(&mut self.svm, &[ix], &[self.admin])
    }

    pub fn set_token_verifier(
        &mut self,
        passkey: &mut TestPasskey,
        phygital_token: Pubkey,
        new_verifier: Pubkey,
        endpoint: &str,
    ) -> litesvm::types::TransactionResult {
        self.set_token_verifier_with_signer(
            passkey,
            phygital_token,
            new_verifier,
            endpoint,
            &self.verifier.insecure_clone(),
        )
    }

    pub fn set_token_verifier_with_signer(
        &mut self,
        passkey: &mut TestPasskey,
        phygital_token: Pubkey,
        new_verifier: Pubkey,
        endpoint: &str,
        signer: &Keypair,
    ) -> litesvm::types::TransactionResult {
        let (slot_number, slot_hash) = current_slot_entry(&self.svm);
        let challenge =
            phygital_wallet::instructions::token_verifier::build_set_token_verifier_challenge(
                slot_hash, &phygital_token, &new_verifier, endpoint,
            );
        let (secp_ix, verify_args) =
            passkey.verify_asset_secp256r1_instruction_with_rp_id(challenge, TEST_RP_ID);
        let ix = anchor_lang::solana_program::instruction::Instruction {
            program_id: self.program_id,
            accounts: phygital_wallet::accounts::SetTokenVerifier {
                payer: self.payer.pubkey(),
                verifier: signer.pubkey(),
                config: self.config_pda(),
                phygital_token,
                token_verifier: self.token_verifier_pda(phygital_token),
                slot_hashes: SLOT_HASHES_SYSVAR_ID,
                instructions_sysvar: INSTRUCTIONS_SYSVAR_ID,
                phygital_token_program: phygital_token_client::PHYGITAL_TOKEN_ID,
                system_program: anchor_lang::system_program::ID,
            }
            .to_account_metas(None),
            data: phygital_wallet::instruction::SetTokenVerifier {
                new_verifier,
                endpoint: endpoint.to_string(),
                secp256r1_verify_args: verify_args,
                slot_number,
            }
            .data(),
        };
        if signer.pubkey() == self.payer.pubkey() {
            Self::send_instructions(&mut self.svm, &[secp_ix, ix], &[self.payer.pubkey()])
        } else {
            Self::send_instructions(
                &mut self.svm,
                &[secp_ix, ix],
                &[self.payer.pubkey(), signer.pubkey()],
            )
        }
    }

    pub fn clear_token_verifier(
        &mut self,
        passkey: &mut TestPasskey,
        phygital_token: Pubkey,
    ) -> litesvm::types::TransactionResult {
        self.clear_token_verifier_with_signer(
            passkey,
            phygital_token,
            &self.verifier.insecure_clone(),
        )
    }

    pub fn clear_token_verifier_with_signer(
        &mut self,
        passkey: &mut TestPasskey,
        phygital_token: Pubkey,
        signer: &Keypair,
    ) -> litesvm::types::TransactionResult {
        let (slot_number, slot_hash) = current_slot_entry(&self.svm);
        let challenge =
            phygital_wallet::instructions::token_verifier::build_clear_token_verifier_challenge(
                slot_hash,
                &phygital_token
            );
        let (secp_ix, verify_args) =
            passkey.verify_asset_secp256r1_instruction_with_rp_id(challenge, TEST_RP_ID);
        let ix = anchor_lang::solana_program::instruction::Instruction {
            program_id: self.program_id,
            accounts: phygital_wallet::accounts::ClearTokenVerifier {
                verifier: signer.pubkey(),
                config: self.config_pda(),
                phygital_token,
                rent_receiver: self.payer.pubkey(),
                token_verifier: self.token_verifier_pda(phygital_token),
                slot_hashes: SLOT_HASHES_SYSVAR_ID,
                instructions_sysvar: INSTRUCTIONS_SYSVAR_ID,
                phygital_token_program: phygital_token_client::PHYGITAL_TOKEN_ID,
            }
            .to_account_metas(None),
            data: phygital_wallet::instruction::ClearTokenVerifier {
                secp256r1_verify_args: verify_args,
                slot_number,
            }
            .data(),
        };
        if signer.pubkey() == self.payer.pubkey() {
            Self::send_instructions(&mut self.svm, &[secp_ix, ix], &[self.payer.pubkey()])
        } else {
            Self::send_instructions(
                &mut self.svm,
                &[secp_ix, ix],
                &[self.payer.pubkey(), signer.pubkey()],
            )
        }
    }

    fn deploy_program(
        svm: &mut LiteSVM,
        program_id: Pubkey,
        candidates: &[std::path::PathBuf],
        name: &str,
    ) {
        let bytes = candidates
            .iter()
            .find_map(|path| std::fs::read(path).ok())
            .unwrap_or_else(|| {
                panic!(
                    "{name} artifact not found. run `anchor build` (and build phygital-token). tried: {}",
                    candidates
                        .iter()
                        .map(|path| path.display().to_string())
                        .collect::<Vec<_>>()
                        .join(", ")
                )
            });
        svm.add_program(program_id, &bytes)
            .unwrap_or_else(|err| panic!("deploy {name}: {err:?}"));
    }

    pub fn wallet(&self, asset: Pubkey) -> Pubkey {
        Pubkey::find_program_address(&[PROGRAM_WALLET_SEED, asset.as_ref()], &self.program_id).0
    }

    /// Outermost `Program <id> consumed N of M compute units` from LiteSVM logs.
    pub fn program_compute_units(logs: &[String], program_id: &Pubkey) -> Option<u64> {
        let needle = format!("Program {program_id} consumed ");
        logs.iter().rev().find_map(|line| {
            let rest = line.strip_prefix(&needle)?;
            rest.split_whitespace().next()?.parse().ok()
        })
    }

    /// Derive the token PDA from the compressed secp256r1 passkey public key.
    pub fn asset_pda(&self, secp256r1_pubkey: &[u8; 33]) -> Pubkey {
        Pubkey::find_program_address(
            &[TOKEN_SEED, &secp256r1_pubkey[1..]],
            &phygital_token_client::PHYGITAL_TOKEN_ID,
        )
        .0
    }

    pub fn unique_identifier() -> [u8; 33] {
        use rand::RngCore;
        let mut bytes = [0u8; 33];
        rand::rngs::OsRng.fill_bytes(&mut bytes);
        bytes[0] = 0x02;
        bytes
    }

    pub fn create_payment_mint(&mut self) -> Pubkey {
        let mint = Keypair::new();
        let rent: Rent = self.svm.get_sysvar();
        let rent_lamports = rent.minimum_balance(Mint::LEN);

        let create_ix = system_instruction::create_account(
            &self.payer.pubkey(),
            &mint.pubkey(),
            rent_lamports,
            Mint::LEN as u64,
            &TOKEN_2022_ID,
        );
        let init_ix = initialize_mint2(
            &TOKEN_2022_ID,
            &mint.pubkey(),
            &self.mint_authority.pubkey(),
            None,
            6,
        )
        .expect("initialize_mint2");
        Self::send_instructions(
            &mut self.svm,
            &[create_ix, init_ix],
            &[self.payer.pubkey(), mint.pubkey()],
        )
        .expect("create+init mint");

        mint.pubkey()
    }

    pub fn create_token_account(&mut self, owner: Pubkey, mint: Pubkey) -> Pubkey {
        let token_account = Keypair::new();
        let rent: Rent = self.svm.get_sysvar();
        let rent_lamports = rent.minimum_balance(TokenAccountState::LEN);

        let create_ix = system_instruction::create_account(
            &self.payer.pubkey(),
            &token_account.pubkey(),
            rent_lamports,
            TokenAccountState::LEN as u64,
            &TOKEN_2022_ID,
        );
        let init_ix =
            initialize_account3(&TOKEN_2022_ID, &token_account.pubkey(), &mint, &owner)
                .expect("initialize_account3");
        Self::send_instructions(
            &mut self.svm,
            &[create_ix, init_ix],
            &[self.payer.pubkey(), token_account.pubkey()],
        )
        .expect("create+init token account");

        token_account.pubkey()
    }

    pub fn mint_tokens(&mut self, mint: Pubkey, destination: Pubkey, amount: u64) {
        let ix = mint_to(
            &TOKEN_2022_ID,
            &mint,
            &destination,
            &self.mint_authority.pubkey(),
            &[],
            amount,
        )
        .expect("mint_to");
        Self::send_instruction(
            &mut self.svm,
            ix,
            &[self.payer.pubkey(), self.mint_authority.pubkey()],
        )
        .expect("mint tokens");
    }

    pub fn approve_delegate(
        &mut self,
        owner: &Keypair,
        asset: Pubkey,
        mint: Pubkey,
        token_account: Pubkey,
        amount: u64,
        decimals: u8,
    ) {
        let delegate = self.wallet(asset);
        let ix = approve_checked(
            &TOKEN_2022_ID,
            &token_account,
            &mint,
            &delegate,
            &owner.pubkey(),
            &[],
            amount,
            decimals,
        )
        .expect("approve_checked");
        Self::send_instruction(&mut self.svm, ix, &[self.payer.pubkey(), owner.pubkey()])
            .expect("approve delegate");
    }

    pub fn fund_wallet(&mut self, asset: Pubkey) {
        let wallet = self.wallet(asset);
        self.svm
            .airdrop(&wallet, LAMPORTS_PER_SOL)
            .expect("airdrop wallet");
    }

    pub fn write_locked_asset(
        &mut self,
        asset: Pubkey,
        identifier: [u8; 33],
        public_key: [u8; 33],
        last_sign_count: u32,
    ) {
        // Spends require phygital_token.owner == wallet PDA.
        let wallet = self.wallet(asset);
        self.write_token_account(asset, wallet, identifier, public_key, last_sign_count, true);
    }

    pub fn write_unlocked_asset(
        &mut self,
        asset: Pubkey,
        identifier: [u8; 33],
        public_key: [u8; 33],
    ) {
        let wallet = self.wallet(asset);
        self.write_token_account(asset, wallet, identifier, public_key, 0, false);
    }

    /// Test helper: locked token whose `owner` is *not* the wallet PDA.
    pub fn write_locked_asset_with_owner(
        &mut self,
        asset: Pubkey,
        owner: Pubkey,
        identifier: [u8; 33],
        public_key: [u8; 33],
        last_sign_count: u32,
    ) {
        self.write_token_account(asset, owner, identifier, public_key, last_sign_count, true);
    }

    fn write_token_account(
        &mut self,
        token: Pubkey,
        owner: Pubkey,
        identifier: [u8; 33],
        public_key: [u8; 33],
        last_sign_count: u32,
        is_locked: bool,
    ) {
        let token_data = PhygitalToken {
            discriminator: PHYGITAL_TOKEN_DISCRIMINATOR,
            owner: owner.to_bytes().into(),
            mint: Pubkey::default().to_bytes().into(),
            last_sign_count,
            token_type: PhygitalTokenType::Controlled as u8,
            is_locked: is_locked as u8,
            public_key,
            identifier,
        };
        let data = borsh::to_vec(&token_data).expect("serialize token");
        let rent: Rent = self.svm.get_sysvar();
        self.svm
            .set_account(
                token,
                SolanaAccount {
                    lamports: rent.minimum_balance(data.len()),
                    data,
                    owner: phygital_token_client::PHYGITAL_TOKEN_ID,
                    executable: false,
                    rent_epoch: 0,
                },
            )
            .expect("set token account");
    }

    pub fn lamports(&self, address: Pubkey) -> u64 {
        self.svm
            .get_account(&address)
            .map(|a| a.lamports)
            .unwrap_or(0)
    }

    pub fn token_balance(&self, token_account: Pubkey) -> u64 {
        let account = self
            .svm
            .get_account(&token_account)
            .expect("token account");
        TokenAccountState::unpack_from_slice(&account.data)
            .expect("unpack token account")
            .amount
    }

    pub fn last_sign_count(&self, asset: Pubkey) -> u32 {
        let account = self.svm.get_account(&asset).expect("token account");
        let decoded = PhygitalToken::try_from_slice(&account.data).expect("deserialize token");
        decoded.last_sign_count
    }

    /// Build remaining accounts + compact SPL transfer_checked for execute.
    pub fn spl_transfer_compact(
        &self,
        asset: Pubkey,
        mint: Pubkey,
        sender_token_account: Pubkey,
        recipient_token_account: Pubkey,
        amount: u64,
        decimals: u8,
    ) -> (
        Vec<anchor_lang::solana_program::instruction::AccountMeta>,
        Vec<CompactInstruction>,
    ) {
        let wallet = self.wallet(asset);
        let transfer_ix = transfer_checked(
            &TOKEN_2022_ID,
            &sender_token_account,
            &mint,
            &recipient_token_account,
            &wallet,
            &[],
            amount,
            decimals,
        )
        .expect("transfer_checked");

        // remaining: [token_program, sender, mint, recipient, wallet]
        let remaining = vec![
            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(TOKEN_2022_ID, false),
            anchor_lang::solana_program::instruction::AccountMeta::new(sender_token_account, false),
            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(mint, false),
            anchor_lang::solana_program::instruction::AccountMeta::new(recipient_token_account, false),
            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(wallet, false),
        ];
        let compact = vec![CompactInstruction {
            program_id_index: 0,
            account_indexes: vec![1, 2, 3, 4],
            data: transfer_ix.data,
        }];
        (remaining, compact)
    }

    /// Build remaining accounts + compact system transfer for execute (wallet PDA → recipient).
    pub fn lamport_transfer_compact(
        &self,
        asset: Pubkey,
        recipient: Pubkey,
        amount: u64,
    ) -> (
        Vec<anchor_lang::solana_program::instruction::AccountMeta>,
        Vec<CompactInstruction>,
    ) {
        let wallet = self.wallet(asset);
        let transfer_ix = system_instruction::transfer(&wallet, &recipient, amount);

        let remaining = vec![
            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                anchor_lang::system_program::ID,
                false,
            ),
            anchor_lang::solana_program::instruction::AccountMeta::new(wallet, false),
            anchor_lang::solana_program::instruction::AccountMeta::new(recipient, false),
        ];
        let compact = vec![CompactInstruction {
            program_id_index: 0,
            account_indexes: vec![1, 2],
            data: transfer_ix.data,
        }];
        (remaining, compact)
    }

    /// Build remaining accounts + compact create + initialize Token-2022 mint via wallet PDA.
    /// The mint keypair must co-sign the outer transaction.
    pub fn create_mint_compact(
        &self,
        asset: Pubkey,
        mint: &Pubkey,
        decimals: u8,
    ) -> (
        Vec<anchor_lang::solana_program::instruction::AccountMeta>,
        Vec<CompactInstruction>,
    ) {
        let wallet = self.wallet(asset);
        let rent: Rent = self.svm.get_sysvar();
        let rent_lamports = rent.minimum_balance(Mint::LEN);

        let create_ix = system_instruction::create_account(
            &wallet,
            mint,
            rent_lamports,
            Mint::LEN as u64,
            &TOKEN_2022_ID,
        );
        let init_ix = initialize_mint2(&TOKEN_2022_ID, mint, &wallet, None, decimals)
            .expect("initialize_mint2");

        let remaining = vec![
            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                anchor_lang::system_program::ID,
                false,
            ),
            anchor_lang::solana_program::instruction::AccountMeta::new(wallet, false),
            anchor_lang::solana_program::instruction::AccountMeta::new(*mint, true),
            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                TOKEN_2022_ID,
                false,
            ),
        ];
        let compact = vec![
            CompactInstruction {
                program_id_index: 0,
                account_indexes: vec![1, 2],
                data: create_ix.data,
            },
            CompactInstruction {
                program_id_index: 3,
                account_indexes: vec![2],
                data: init_ix.data,
            },
        ];
        (remaining, compact)
    }

    pub fn execute_ix(
        &self,
        asset: Pubkey,
        compact_instructions: Vec<CompactInstruction>,
        remaining: Vec<anchor_lang::solana_program::instruction::AccountMeta>,
        secp256r1_verify_args: Secp256r1VerifyArgs,
        slot_number: u64,
        verifier: Pubkey,
    ) -> anchor_lang::solana_program::instruction::Instruction {
        let mut accounts = phygital_wallet::accounts::Execute {
            verifier,
            config: self.config_pda(),
            phygital_token: asset,
            token_verifier: self.token_verifier_pda(asset),
            wallet: self.wallet(asset),
            slot_hashes: SLOT_HASHES_SYSVAR_ID,
            instructions_sysvar: INSTRUCTIONS_SYSVAR_ID,
            phygital_token_program: phygital_token_client::PHYGITAL_TOKEN_ID,
        }
        .to_account_metas(None);
        accounts.extend(remaining);

        anchor_lang::solana_program::instruction::Instruction {
            program_id: self.program_id,
            accounts,
            data: phygital_wallet::instruction::Execute {
                compact_instructions,
                secp256r1_verify_args,
                slot_number,
            }
            .data(),
        }
    }

    pub fn send_execute_spl_transfer(
        &mut self,
        asset: Pubkey,
        mint: Pubkey,
        sender_token_account: Pubkey,
        recipient_token_account: Pubkey,
        amount: u64,
        passkey: &mut TestPasskey,
        include_secp_ix: bool,
    ) -> litesvm::types::TransactionResult {
        let (remaining, compact) = self.spl_transfer_compact(
            asset,
            mint,
            sender_token_account,
            recipient_token_account,
            amount,
            6,
        );
        let verifier = self.verifier.insecure_clone();
        self.send_execute_inner(
            asset,
            compact,
            remaining,
            passkey,
            &[],
            include_secp_ix,
            None,
            None,
            &verifier,
            TEST_RP_ID,
        )
    }

    #[allow(clippy::too_many_arguments)]
    pub fn send_execute_spl_transfer_with_verifier(
        &mut self,
        asset: Pubkey,
        mint: Pubkey,
        sender_token_account: Pubkey,
        recipient_token_account: Pubkey,
        amount: u64,
        passkey: &mut TestPasskey,
        include_secp_ix: bool,
        rp_id: &str,
        verifier: &Keypair,
        slot_override: Option<(u64, [u8; 32])>,
    ) -> litesvm::types::TransactionResult {
        let (remaining, compact) = self.spl_transfer_compact(
            asset,
            mint,
            sender_token_account,
            recipient_token_account,
            amount,
            6,
        );
        self.send_execute_inner(
            asset,
            compact,
            remaining,
            passkey,
            &[],
            include_secp_ix,
            None,
            slot_override,
            verifier,
            rp_id,
        )
    }

    pub fn send_execute_lamport_transfer(
        &mut self,
        asset: Pubkey,
        recipient: Pubkey,
        amount: u64,
        passkey: &mut TestPasskey,
    ) -> litesvm::types::TransactionResult {
        let (remaining, compact) = self.lamport_transfer_compact(asset, recipient, amount);
        self.send_execute(asset, compact, remaining, passkey, &[])
    }

    pub fn send_execute_create_mint(
        &mut self,
        asset: Pubkey,
        passkey: &mut TestPasskey,
        decimals: u8,
    ) -> (litesvm::types::TransactionResult, Pubkey) {
        let mint = Keypair::new();
        let (remaining, compact) = self.create_mint_compact(asset, &mint.pubkey(), decimals);
        (
            self.send_execute(asset, compact, remaining, passkey, &[mint.pubkey()]),
            mint.pubkey(),
        )
    }

    /// Generic execute with passkey challenge for the current slot.
    pub fn send_execute(
        &mut self,
        asset: Pubkey,
        compact_instructions: Vec<CompactInstruction>,
        remaining: Vec<anchor_lang::solana_program::instruction::AccountMeta>,
        passkey: &mut TestPasskey,
        extra_signers: &[Pubkey],
    ) -> litesvm::types::TransactionResult {
        self.send_execute_with_options(
            asset,
            compact_instructions,
            remaining,
            passkey,
            extra_signers,
            true,
            None,
            None,
        )
    }

    #[allow(clippy::too_many_arguments)]
    pub fn send_execute_with_options(
        &mut self,
        asset: Pubkey,
        compact_instructions: Vec<CompactInstruction>,
        remaining: Vec<anchor_lang::solana_program::instruction::AccountMeta>,
        passkey: &mut TestPasskey,
        extra_signers: &[Pubkey],
        include_secp_ix: bool,
        challenge_override: Option<[u8; 32]>,
        slot_override: Option<(u64, [u8; 32])>,
    ) -> litesvm::types::TransactionResult {
        // Clone so we can pass `&Keypair` without borrowing `self` across the call.
        let verifier = self.verifier.insecure_clone();
        self.send_execute_inner(
            asset,
            compact_instructions,
            remaining,
            passkey,
            extra_signers,
            include_secp_ix,
            challenge_override,
            slot_override,
            &verifier,
            TEST_RP_ID,
        )
    }

    #[allow(clippy::too_many_arguments)]
    fn send_execute_inner(
        &mut self,
        asset: Pubkey,
        compact_instructions: Vec<CompactInstruction>,
        remaining: Vec<anchor_lang::solana_program::instruction::AccountMeta>,
        passkey: &mut TestPasskey,
        extra_signers: &[Pubkey],
        include_secp_ix: bool,
        challenge_override: Option<[u8; 32]>,
        slot_override: Option<(u64, [u8; 32])>,
        verifier: &Keypair,
        rp_id: &str,
    ) -> litesvm::types::TransactionResult {
        let (slot_number, slot_hash) =
            slot_override.unwrap_or_else(|| current_slot_entry(&self.svm));
        let challenge = challenge_override.unwrap_or_else(|| {
            let remaining_keys: Vec<_> = remaining.iter().map(|m| m.pubkey).collect();
            build_execute_challenge(slot_hash, &compact_instructions, &remaining_keys)
        });
        let (secp_ix, verify_args) =
            passkey.verify_asset_secp256r1_instruction_with_rp_id(challenge, rp_id);
        let execute_ix = self.execute_ix(
            asset,
            compact_instructions,
            remaining,
            verify_args,
            slot_number,
            verifier.pubkey(),
        );

        let instructions = if include_secp_ix {
            vec![secp_ix, execute_ix]
        } else {
            vec![execute_ix]
        };

        let mut signers = vec![self.payer.pubkey()];
        if verifier.pubkey() != self.payer.pubkey() {
            signers.push(verifier.pubkey());
        }
        for s in extra_signers {
            if !signers.contains(s) {
                signers.push(*s);
            }
        }
        Self::send_instructions(&mut self.svm, &instructions, &signers)
    }

    /// Compact burn_checked of `amount` from a wallet-owned token account.
    pub fn burn_compact(
        &self,
        asset: Pubkey,
        mint: Pubkey,
        token_account: Pubkey,
        amount: u64,
        decimals: u8,
    ) -> (
        Vec<anchor_lang::solana_program::instruction::AccountMeta>,
        Vec<CompactInstruction>,
    ) {
        let wallet = self.wallet(asset);
        let burn_ix = burn_checked(
            &TOKEN_2022_ID,
            &token_account,
            &mint,
            &wallet,
            &[],
            amount,
            decimals,
        )
        .expect("burn_checked");
        let remaining = vec![
            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(TOKEN_2022_ID, false),
            anchor_lang::solana_program::instruction::AccountMeta::new(token_account, false),
            anchor_lang::solana_program::instruction::AccountMeta::new(mint, false),
            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(wallet, false),
        ];
        let compact = vec![CompactInstruction {
            program_id_index: 0,
            account_indexes: vec![1, 2, 3],
            data: burn_ix.data,
        }];
        (remaining, compact)
    }

    /// Compact close_account — destination receives reclaimed rent lamports.
    pub fn close_token_account_compact(
        &self,
        asset: Pubkey,
        token_account: Pubkey,
        destination: Pubkey,
    ) -> (
        Vec<anchor_lang::solana_program::instruction::AccountMeta>,
        Vec<CompactInstruction>,
    ) {
        let wallet = self.wallet(asset);
        let close_ix =
            close_account(&TOKEN_2022_ID, &token_account, &destination, &wallet, &[])
                .expect("close_account");
        let remaining = vec![
            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(TOKEN_2022_ID, false),
            anchor_lang::solana_program::instruction::AccountMeta::new(token_account, false),
            anchor_lang::solana_program::instruction::AccountMeta::new(destination, false),
            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(wallet, false),
        ];
        let compact = vec![CompactInstruction {
            program_id_index: 0,
            account_indexes: vec![1, 2, 3],
            data: close_ix.data,
        }];
        (remaining, compact)
    }

    /// Two SPL transfer_checked CPIs in one execute (same mint).
    pub fn dual_spl_transfer_compact(
        &self,
        asset: Pubkey,
        mint: Pubkey,
        sender_token: Pubkey,
        recipient_a: Pubkey,
        recipient_b: Pubkey,
        amount_a: u64,
        amount_b: u64,
        decimals: u8,
    ) -> (
        Vec<anchor_lang::solana_program::instruction::AccountMeta>,
        Vec<CompactInstruction>,
    ) {
        let wallet = self.wallet(asset);
        let ix_a = transfer_checked(
            &TOKEN_2022_ID,
            &sender_token,
            &mint,
            &recipient_a,
            &wallet,
            &[],
            amount_a,
            decimals,
        )
        .expect("transfer_a");
        let ix_b = transfer_checked(
            &TOKEN_2022_ID,
            &sender_token,
            &mint,
            &recipient_b,
            &wallet,
            &[],
            amount_b,
            decimals,
        )
        .expect("transfer_b");

        // 0 token_program, 1 sender, 2 mint, 3 recip_a, 4 recip_b, 5 wallet
        let remaining = vec![
            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(TOKEN_2022_ID, false),
            anchor_lang::solana_program::instruction::AccountMeta::new(sender_token, false),
            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(mint, false),
            anchor_lang::solana_program::instruction::AccountMeta::new(recipient_a, false),
            anchor_lang::solana_program::instruction::AccountMeta::new(recipient_b, false),
            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(wallet, false),
        ];
        let compact = vec![
            CompactInstruction {
                program_id_index: 0,
                account_indexes: vec![1, 2, 3, 5],
                data: ix_a.data,
            },
            CompactInstruction {
                program_id_index: 0,
                account_indexes: vec![1, 2, 4, 5],
                data: ix_b.data,
            },
        ];
        (remaining, compact)
    }

    /// Mixed: system transfer + SPL transfer_checked in one execute.
    pub fn mixed_system_spl_compact(
        &self,
        asset: Pubkey,
        sol_recipient: Pubkey,
        sol_amount: u64,
        mint: Pubkey,
        sender_token: Pubkey,
        recipient_token: Pubkey,
        token_amount: u64,
        decimals: u8,
    ) -> (
        Vec<anchor_lang::solana_program::instruction::AccountMeta>,
        Vec<CompactInstruction>,
    ) {
        let wallet = self.wallet(asset);
        let sol_ix = system_instruction::transfer(&wallet, &sol_recipient, sol_amount);
        let spl_ix = transfer_checked(
            &TOKEN_2022_ID,
            &sender_token,
            &mint,
            &recipient_token,
            &wallet,
            &[],
            token_amount,
            decimals,
        )
        .expect("transfer_checked");

        // 0 system, 1 wallet, 2 sol_recipient, 3 token_program, 4 sender, 5 mint, 6 recip_token
        let remaining = vec![
            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(
                anchor_lang::system_program::ID,
                false,
            ),
            anchor_lang::solana_program::instruction::AccountMeta::new(wallet, false),
            anchor_lang::solana_program::instruction::AccountMeta::new(sol_recipient, false),
            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(TOKEN_2022_ID, false),
            anchor_lang::solana_program::instruction::AccountMeta::new(sender_token, false),
            anchor_lang::solana_program::instruction::AccountMeta::new_readonly(mint, false),
            anchor_lang::solana_program::instruction::AccountMeta::new(recipient_token, false),
        ];
        let compact = vec![
            CompactInstruction {
                program_id_index: 0,
                account_indexes: vec![1, 2],
                data: sol_ix.data,
            },
            CompactInstruction {
                program_id_index: 3,
                account_indexes: vec![4, 5, 6, 1],
                data: spl_ix.data,
            },
        ];
        (remaining, compact)
    }

    pub fn send_instruction(
        svm: &mut LiteSVM,
        instruction: anchor_lang::solana_program::instruction::Instruction,
        signers: &[Pubkey],
    ) -> litesvm::types::TransactionResult {
        Self::send_instructions(svm, &[instruction], signers)
    }

    pub fn send_instructions(
        svm: &mut LiteSVM,
        instructions: &[anchor_lang::solana_program::instruction::Instruction],
        signers: &[Pubkey],
    ) -> litesvm::types::TransactionResult {
        let blockhash = svm.latest_blockhash();
        let payer = *signers.first().expect("at least one signer");
        let msg = Message::new_with_blockhash(instructions, Some(&payer), &blockhash);
        let signatures = vec![Signature::default(); msg.header.num_required_signatures as usize];
        let tx = VersionedTransaction {
            signatures,
            message: VersionedMessage::Legacy(msg),
        };
        let result = svm.send_transaction(tx);
        svm.expire_blockhash();
        result
    }
}

fn program_artifact_paths(manifest_dir: &std::path::Path, name: &str) -> Vec<std::path::PathBuf> {
    let mut paths = Vec::new();
    if let Ok(cargo_target_dir) = std::env::var("CARGO_TARGET_DIR") {
        paths.push(std::path::PathBuf::from(cargo_target_dir).join(format!("deploy/{name}.so")));
    }
    paths.push(manifest_dir.join(format!("../../target/deploy/{name}.so")));
    paths
}

fn phygital_token_artifact_paths(manifest_dir: &std::path::Path) -> Vec<std::path::PathBuf> {
    let mut paths = vec![manifest_dir.join("../../phygital_token.so")];
    paths.extend(program_artifact_paths(manifest_dir, "phygital_token"));
    paths.push(
        manifest_dir
            .join("../../../phygital-token/target/deploy/phygital_token.so"),
    );
    paths
}
