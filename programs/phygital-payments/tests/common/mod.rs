mod secp256r1;

pub use secp256r1::{current_slot_entry, TestPasskey, TEST_RP_ID};

use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_pack::Pack;
use anchor_lang::solana_program::system_instruction;
use anchor_lang::{InstructionData, ToAccountMetas};
use anchor_spl::token_2022::spl_token_2022::instruction::{
    approve_checked, initialize_account3, initialize_mint2, mint_to,
};
use anchor_spl::token_2022::spl_token_2022::state::{Account as TokenAccountState, Mint};
use anchor_spl::token_2022::ID as TOKEN_2022_ID;
use borsh::BorshDeserialize;
use litesvm::LiteSVM;
use phygital_payments::{
    CONFIG_SEED, OWNER_VERIFIER_SEED, PROGRAM_AUTHORITY_SEED, PHYGITAL_TOKEN_PROGRAM_ID,
    Secp256r1VerifyArgs,
};
use phygital_token_client::{Asset, AssetType, ASSET_DISCRIMINATOR};
use solana_account::Account as SolanaAccount;
use solana_keypair::Keypair;
use solana_message::{Message, VersionedMessage};
use solana_sdk_ids::sysvar::{
    instructions::ID as INSTRUCTIONS_SYSVAR_ID, slot_hashes::ID as SLOT_HASHES_SYSVAR_ID,
};
use solana_signer::Signer;
use solana_transaction::versioned::VersionedTransaction;

pub const ASSET_SEED: &[u8] = b"asset";
pub const LAMPORTS_PER_SOL: u64 = 1_000_000_000;

pub struct TestContext {
    pub svm: LiteSVM,
    pub payer: Keypair,
    pub verifier: Keypair,
    pub admin: Keypair,
    pub program_id: Pubkey,
    pub mint_authority: Keypair,
}

impl TestContext {
    pub fn new() -> Self {
        let program_id = phygital_payments::ID;
        let mut svm = LiteSVM::new().with_precompiles();
        let manifest_dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"));

        Self::deploy_program(
            &mut svm,
            program_id,
            &program_artifact_paths(manifest_dir, "phygital_payments"),
            "phygital_payments",
        );
        Self::deploy_program(
            &mut svm,
            PHYGITAL_TOKEN_PROGRAM_ID,
            &phygital_token_artifact_paths(manifest_dir),
            "phygital_token",
        );

        let payer = Keypair::new();
        let verifier = Keypair::new();
        let admin = Keypair::new();
        svm.airdrop(&payer.pubkey(), 10 * LAMPORTS_PER_SOL)
            .expect("airdrop payer");
        svm.airdrop(&admin.pubkey(), LAMPORTS_PER_SOL)
            .expect("airdrop admin");

        let mut ctx = Self {
            svm,
            payer,
            verifier,
            admin,
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

    pub fn owner_verifier_pda(&self, owner: Pubkey) -> Pubkey {
        Pubkey::find_program_address(&[OWNER_VERIFIER_SEED, owner.as_ref()], &self.program_id).0
    }

    pub fn initialize_config(
        &mut self,
        initial_verifiers: &[Pubkey],
    ) -> litesvm::types::TransactionResult {
        let ix = anchor_lang::solana_program::instruction::Instruction {
            program_id: self.program_id,
            accounts: phygital_payments::accounts::InitializeConfig {
                admin: self.admin.pubkey(),
                config: self.config_pda(),
                system_program: anchor_lang::system_program::ID,
            }
            .to_account_metas(None),
            data: phygital_payments::instruction::InitializeConfig {
                initial_verifiers: initial_verifiers.to_vec(),
            }
            .data(),
        };
        Self::send_instructions(&mut self.svm, &[ix], &[&self.admin])
    }

    pub fn set_owner_verifier(
        &mut self,
        owner: &Keypair,
        verifier: Pubkey,
        endpoint: &str,
    ) -> litesvm::types::TransactionResult {
        self.svm
            .airdrop(&owner.pubkey(), LAMPORTS_PER_SOL)
            .expect("airdrop owner");
        let ix = anchor_lang::solana_program::instruction::Instruction {
            program_id: self.program_id,
            accounts: phygital_payments::accounts::SetOwnerVerifier {
                owner: owner.pubkey(),
                owner_verifier: self.owner_verifier_pda(owner.pubkey()),
                system_program: anchor_lang::system_program::ID,
            }
            .to_account_metas(None),
            data: phygital_payments::instruction::SetOwnerVerifier {
                verifier,
                endpoint: endpoint.to_string(),
            }
            .data(),
        };
        Self::send_instructions(&mut self.svm, &[ix], &[owner])
    }

    pub fn clear_owner_verifier(
        &mut self,
        owner: &Keypair,
    ) -> litesvm::types::TransactionResult {
        let ix = anchor_lang::solana_program::instruction::Instruction {
            program_id: self.program_id,
            accounts: phygital_payments::accounts::ClearOwnerVerifier {
                owner: owner.pubkey(),
                owner_verifier: self.owner_verifier_pda(owner.pubkey()),
            }
            .to_account_metas(None),
            data: phygital_payments::instruction::ClearOwnerVerifier {}.data(),
        };
        Self::send_instructions(&mut self.svm, &[ix], &[owner])
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

    pub fn program_authority(&self, asset: Pubkey) -> Pubkey {
        Pubkey::find_program_address(&[PROGRAM_AUTHORITY_SEED, asset.as_ref()], &self.program_id).0
    }

    /// Derive the asset PDA from the compressed secp256r1 passkey public key.
    pub fn asset_pda(&self, secp256r1_pubkey: &[u8; 33]) -> Pubkey {
        Pubkey::find_program_address(
            &[ASSET_SEED, &secp256r1_pubkey[1..]],
            &PHYGITAL_TOKEN_PROGRAM_ID,
        )
        .0
    }

    /// Generate a unique chip identifier (stored on the asset; not used as the PDA seed).
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
        Self::send_instruction(&mut self.svm, create_ix, &[&self.payer, &mint])
            .expect("create mint");

        let init_ix = initialize_mint2(
            &TOKEN_2022_ID,
            &mint.pubkey(),
            &self.mint_authority.pubkey(),
            None,
            6,
        )
        .expect("initialize_mint2");
        Self::send_instruction(&mut self.svm, init_ix, &[&self.payer]).expect("init mint");

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
        Self::send_instruction(&mut self.svm, create_ix, &[&self.payer, &token_account])
            .expect("create token account");

        let init_ix = initialize_account3(
            &TOKEN_2022_ID,
            &token_account.pubkey(),
            &mint,
            &owner,
        )
        .expect("initialize_account3");
        Self::send_instruction(&mut self.svm, init_ix, &[&self.payer]).expect("init token account");

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
        Self::send_instruction(&mut self.svm, ix, &[&self.payer, &self.mint_authority])
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
        let delegate = self.program_authority(asset);
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
        Self::send_instruction(&mut self.svm, ix, &[&self.payer, owner]).expect("approve delegate");
    }

    pub fn fund_program_authority(&mut self, asset: Pubkey) {
        let authority = self.program_authority(asset);
        self.svm
            .airdrop(&authority, LAMPORTS_PER_SOL)
            .expect("airdrop program authority");
    }

    pub fn write_locked_asset(
        &mut self,
        asset: Pubkey,
        owner: Pubkey,
        identifier: [u8; 33],
        public_key: [u8; 33],
        last_sign_count: u32,
    ) {
        let asset_data = Asset {
            discriminator: ASSET_DISCRIMINATOR,
            asset_type: AssetType::Lockable,
            owner: owner.to_bytes().into(),
            last_sign_count,
            is_locked: true,
            public_key,
            identifier,
        };
        let data = borsh::to_vec(&asset_data).expect("serialize asset");
        let rent: Rent = self.svm.get_sysvar();
        self.svm
            .set_account(
                asset,
                SolanaAccount {
                    lamports: rent.minimum_balance(data.len()),
                    data,
                    owner: PHYGITAL_TOKEN_PROGRAM_ID,
                    executable: false,
                    rent_epoch: 0,
                },
            )
            .expect("set asset account");
    }

    pub fn write_unlocked_asset(
        &mut self,
        asset: Pubkey,
        owner: Pubkey,
        identifier: [u8; 33],
        public_key: [u8; 33],
    ) {
        let asset_data = Asset {
            discriminator: ASSET_DISCRIMINATOR,
            asset_type: AssetType::Lockable,
            owner: owner.to_bytes().into(),
            last_sign_count: 0,
            is_locked: false,
            public_key,
            identifier,
        };
        let data = borsh::to_vec(&asset_data).expect("serialize asset");
        let rent: Rent = self.svm.get_sysvar();
        self.svm
            .set_account(
                asset,
                SolanaAccount {
                    lamports: rent.minimum_balance(data.len()),
                    data,
                    owner: PHYGITAL_TOKEN_PROGRAM_ID,
                    executable: false,
                    rent_epoch: 0,
                },
            )
            .expect("set asset account");
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
        let account = self.svm.get_account(&asset).expect("asset account");
        let decoded = Asset::try_from_slice(&account.data).expect("deserialize asset");
        decoded.last_sign_count
    }

    pub fn transfer_ix(
        &self,
        asset: Pubkey,
        mint: Pubkey,
        recipient: Pubkey,
        sender_token_account: Pubkey,
        recipient_token_account: Pubkey,
        owner: Pubkey,
        amount: u64,
        secp256r1_verify_args: Secp256r1VerifyArgs,
        slot_number: u64,
        verifier: Pubkey,
    ) -> anchor_lang::solana_program::instruction::Instruction {
        anchor_lang::solana_program::instruction::Instruction {
            program_id: self.program_id,
            accounts: phygital_payments::accounts::ExecuteTransfer {
                verifier,
                config: self.config_pda(),
                owner_verifier: self.owner_verifier_pda(owner),
                asset,
                mint,
                recipient,
                program_authority: self.program_authority(asset),
                sender_token_account,
                recipient_token_account,
                slot_hashes: SLOT_HASHES_SYSVAR_ID,
                instructions_sysvar: INSTRUCTIONS_SYSVAR_ID,
                phygital_token_program: PHYGITAL_TOKEN_PROGRAM_ID,
                token_program: TOKEN_2022_ID,
            }
            .to_account_metas(None),
            data: phygital_payments::instruction::Transfer {
                amount,
                secp256r1_verify_args,
                slot_number,
            }
            .data(),
        }
    }

    pub fn send_transfer(
        &mut self,
        asset: Pubkey,
        mint: Pubkey,
        recipient: Pubkey,
        sender_token_account: Pubkey,
        recipient_token_account: Pubkey,
        owner: Pubkey,
        amount: u64,
        passkey: &TestPasskey,
        include_secp_ix: bool,
    ) -> litesvm::types::TransactionResult {
        self.send_transfer_with_verifier(
            asset,
            mint,
            recipient,
            sender_token_account,
            recipient_token_account,
            owner,
            amount,
            passkey,
            include_secp_ix,
            secp256r1::TEST_RP_ID,
            &self.verifier.insecure_clone(),
        )
    }

    #[allow(clippy::too_many_arguments)]
    pub fn send_transfer_with_rp_id(
        &mut self,
        asset: Pubkey,
        mint: Pubkey,
        recipient: Pubkey,
        sender_token_account: Pubkey,
        recipient_token_account: Pubkey,
        owner: Pubkey,
        amount: u64,
        passkey: &TestPasskey,
        include_secp_ix: bool,
        rp_id: &str,
    ) -> litesvm::types::TransactionResult {
        self.send_transfer_with_verifier(
            asset,
            mint,
            recipient,
            sender_token_account,
            recipient_token_account,
            owner,
            amount,
            passkey,
            include_secp_ix,
            rp_id,
            &self.verifier.insecure_clone(),
        )
    }

    #[allow(clippy::too_many_arguments)]
    pub fn send_transfer_with_verifier(
        &mut self,
        asset: Pubkey,
        mint: Pubkey,
        recipient: Pubkey,
        sender_token_account: Pubkey,
        recipient_token_account: Pubkey,
        owner: Pubkey,
        amount: u64,
        passkey: &TestPasskey,
        include_secp_ix: bool,
        rp_id: &str,
        verifier: &Keypair,
    ) -> litesvm::types::TransactionResult {
        let (slot_number, slot_hash) = current_slot_entry(&self.svm);
        let challenge = phygital_payments::instructions::transfer::build_transfer_challenge(
            &mint, &recipient, amount, slot_hash,
        );
        let (secp_ix, verify_args) =
            passkey.verify_asset_secp256r1_instruction_with_rp_id(challenge, rp_id);
        let transfer_ix = self.transfer_ix(
            asset,
            mint,
            recipient,
            sender_token_account,
            recipient_token_account,
            owner,
            amount,
            verify_args,
            slot_number,
            verifier.pubkey(),
        );

        let instructions = if include_secp_ix {
            vec![secp_ix, transfer_ix]
        } else {
            vec![transfer_ix]
        };

        // payer always signs; verifier signs when distinct.
        if verifier.pubkey() == self.payer.pubkey() {
            Self::send_instructions(&mut self.svm, &instructions, &[&self.payer])
        } else {
            Self::send_instructions(&mut self.svm, &instructions, &[&self.payer, verifier])
        }
    }

    pub fn send_instruction(
        svm: &mut LiteSVM,
        instruction: anchor_lang::solana_program::instruction::Instruction,
        signers: &[&Keypair],
    ) -> litesvm::types::TransactionResult {
        Self::send_instructions(svm, &[instruction], signers)
    }

    pub fn send_instructions(
        svm: &mut LiteSVM,
        instructions: &[anchor_lang::solana_program::instruction::Instruction],
        signers: &[&Keypair],
    ) -> litesvm::types::TransactionResult {
        let blockhash = svm.latest_blockhash();
        let payer = signers
            .first()
            .map(|kp| kp.pubkey())
            .expect("at least one signer");
        let msg = Message::new_with_blockhash(instructions, Some(&payer), &blockhash);
        let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), signers)
            .expect("build tx");
        let result = svm.send_transaction(tx);
        svm.expire_blockhash();
        result
    }
}

fn program_artifact_paths(manifest_dir: &std::path::Path, name: &str) -> Vec<std::path::PathBuf> {
    let mut paths = Vec::new();
    if let Ok(cargo_target_dir) = std::env::var("CARGO_TARGET_DIR") {
        let base = std::path::PathBuf::from(cargo_target_dir);
        paths.push(base.join(format!("deploy/{name}.so")));
    }
    let workspace_target = manifest_dir.join("../../target");
    paths.push(workspace_target.join(format!("deploy/{name}.so")));
    paths
}

fn phygital_token_artifact_paths(manifest_dir: &std::path::Path) -> Vec<std::path::PathBuf> {
    let mut paths = program_artifact_paths(manifest_dir, "phygital_token");
    paths.push(
        manifest_dir
            .join("../../../phygital-token/target/deploy/phygital_token.so"),
    );
    paths
}
