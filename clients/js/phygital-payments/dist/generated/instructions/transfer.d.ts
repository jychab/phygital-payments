import { type AccountMeta, type AccountSignerMeta, type Address, type Codec, type Decoder, type Encoder, type Instruction, type InstructionWithAccounts, type InstructionWithData, type ReadonlyAccount, type ReadonlySignerAccount, type ReadonlyUint8Array, type TransactionSigner, type WritableAccount } from "@solana/kit";
import { PHYGITAL_PAYMENTS_PROGRAM_ADDRESS } from "../programs/index.js";
export declare const TRANSFER_DISCRIMINATOR: ReadonlyUint8Array;
export declare function getTransferDiscriminatorBytes(): ReadonlyUint8Array;
export type TransferInstruction<TProgram extends string = typeof PHYGITAL_PAYMENTS_PROGRAM_ADDRESS, TAccountVerifier extends string | AccountMeta<string> = string, TAccountConfig extends string | AccountMeta<string> = string, TAccountOwnerVerifier extends string | AccountMeta<string> = string, TAccountAsset extends string | AccountMeta<string> = string, TAccountMint extends string | AccountMeta<string> = string, TAccountRecipient extends string | AccountMeta<string> = string, TAccountProgramAuthority extends string | AccountMeta<string> = string, TAccountSenderTokenAccount extends string | AccountMeta<string> = string, TAccountRecipientTokenAccount extends string | AccountMeta<string> = string, TAccountSlotHashes extends string | AccountMeta<string> = "SysvarS1otHashes111111111111111111111111111", TAccountInstructionsSysvar extends string | AccountMeta<string> = "Sysvar1nstructions1111111111111111111111111", TAccountPhygitalTokenProgram extends string | AccountMeta<string> = "DuPpckdjjgVAnYok2aTMAt264ZPBXqq3JSazJjCUzTJQ", TAccountTokenProgram extends string | AccountMeta<string> = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", TRemainingAccounts extends readonly AccountMeta<string>[] = []> = Instruction<TProgram> & InstructionWithData<ReadonlyUint8Array> & InstructionWithAccounts<[
    TAccountVerifier extends string ? ReadonlySignerAccount<TAccountVerifier> & AccountSignerMeta<TAccountVerifier> : TAccountVerifier,
    TAccountConfig extends string ? ReadonlyAccount<TAccountConfig> : TAccountConfig,
    TAccountOwnerVerifier extends string ? ReadonlyAccount<TAccountOwnerVerifier> : TAccountOwnerVerifier,
    TAccountAsset extends string ? WritableAccount<TAccountAsset> : TAccountAsset,
    TAccountMint extends string ? ReadonlyAccount<TAccountMint> : TAccountMint,
    TAccountRecipient extends string ? ReadonlyAccount<TAccountRecipient> : TAccountRecipient,
    TAccountProgramAuthority extends string ? ReadonlyAccount<TAccountProgramAuthority> : TAccountProgramAuthority,
    TAccountSenderTokenAccount extends string ? WritableAccount<TAccountSenderTokenAccount> : TAccountSenderTokenAccount,
    TAccountRecipientTokenAccount extends string ? WritableAccount<TAccountRecipientTokenAccount> : TAccountRecipientTokenAccount,
    TAccountSlotHashes extends string ? ReadonlyAccount<TAccountSlotHashes> : TAccountSlotHashes,
    TAccountInstructionsSysvar extends string ? ReadonlyAccount<TAccountInstructionsSysvar> : TAccountInstructionsSysvar,
    TAccountPhygitalTokenProgram extends string ? ReadonlyAccount<TAccountPhygitalTokenProgram> : TAccountPhygitalTokenProgram,
    TAccountTokenProgram extends string ? ReadonlyAccount<TAccountTokenProgram> : TAccountTokenProgram,
    ...TRemainingAccounts
]>;
export type TransferInstructionData = {
    discriminator: ReadonlyUint8Array;
    amount: bigint;
    verifyArgsRelativeIndex: bigint;
    signedMessageIndex: number;
    clientDataJson: ReadonlyUint8Array;
    slotNumber: bigint;
};
export type TransferInstructionDataArgs = {
    amount: number | bigint;
    verifyArgsRelativeIndex: number | bigint;
    signedMessageIndex: number;
    clientDataJson: ReadonlyUint8Array;
    slotNumber: number | bigint;
};
export declare function getTransferInstructionDataEncoder(): Encoder<TransferInstructionDataArgs>;
export declare function getTransferInstructionDataDecoder(): Decoder<TransferInstructionData>;
export declare function getTransferInstructionDataCodec(): Codec<TransferInstructionDataArgs, TransferInstructionData>;
export type TransferAsyncInput<TAccountVerifier extends string = string, TAccountConfig extends string = string, TAccountOwnerVerifier extends string = string, TAccountAsset extends string = string, TAccountMint extends string = string, TAccountRecipient extends string = string, TAccountProgramAuthority extends string = string, TAccountSenderTokenAccount extends string = string, TAccountRecipientTokenAccount extends string = string, TAccountSlotHashes extends string = string, TAccountInstructionsSysvar extends string = string, TAccountPhygitalTokenProgram extends string = string, TAccountTokenProgram extends string = string> = {
    verifier: TransactionSigner<TAccountVerifier>;
    config?: Address<TAccountConfig>;
    ownerVerifier: Address<TAccountOwnerVerifier>;
    asset: Address<TAccountAsset>;
    mint: Address<TAccountMint>;
    recipient: Address<TAccountRecipient>;
    programAuthority?: Address<TAccountProgramAuthority>;
    senderTokenAccount: Address<TAccountSenderTokenAccount>;
    recipientTokenAccount: Address<TAccountRecipientTokenAccount>;
    slotHashes?: Address<TAccountSlotHashes>;
    instructionsSysvar?: Address<TAccountInstructionsSysvar>;
    phygitalTokenProgram?: Address<TAccountPhygitalTokenProgram>;
    tokenProgram?: Address<TAccountTokenProgram>;
    amount: TransferInstructionDataArgs["amount"];
    verifyArgsRelativeIndex: TransferInstructionDataArgs["verifyArgsRelativeIndex"];
    signedMessageIndex: TransferInstructionDataArgs["signedMessageIndex"];
    clientDataJson: TransferInstructionDataArgs["clientDataJson"];
    slotNumber: TransferInstructionDataArgs["slotNumber"];
};
export declare function getTransferInstructionAsync<TAccountVerifier extends string, TAccountConfig extends string, TAccountOwnerVerifier extends string, TAccountAsset extends string, TAccountMint extends string, TAccountRecipient extends string, TAccountProgramAuthority extends string, TAccountSenderTokenAccount extends string, TAccountRecipientTokenAccount extends string, TAccountSlotHashes extends string, TAccountInstructionsSysvar extends string, TAccountPhygitalTokenProgram extends string, TAccountTokenProgram extends string, TProgramAddress extends Address = typeof PHYGITAL_PAYMENTS_PROGRAM_ADDRESS>(input: TransferAsyncInput<TAccountVerifier, TAccountConfig, TAccountOwnerVerifier, TAccountAsset, TAccountMint, TAccountRecipient, TAccountProgramAuthority, TAccountSenderTokenAccount, TAccountRecipientTokenAccount, TAccountSlotHashes, TAccountInstructionsSysvar, TAccountPhygitalTokenProgram, TAccountTokenProgram>, config?: {
    programAddress?: TProgramAddress;
}): Promise<TransferInstruction<TProgramAddress, TAccountVerifier, TAccountConfig, TAccountOwnerVerifier, TAccountAsset, TAccountMint, TAccountRecipient, TAccountProgramAuthority, TAccountSenderTokenAccount, TAccountRecipientTokenAccount, TAccountSlotHashes, TAccountInstructionsSysvar, TAccountPhygitalTokenProgram, TAccountTokenProgram>>;
export type TransferInput<TAccountVerifier extends string = string, TAccountConfig extends string = string, TAccountOwnerVerifier extends string = string, TAccountAsset extends string = string, TAccountMint extends string = string, TAccountRecipient extends string = string, TAccountProgramAuthority extends string = string, TAccountSenderTokenAccount extends string = string, TAccountRecipientTokenAccount extends string = string, TAccountSlotHashes extends string = string, TAccountInstructionsSysvar extends string = string, TAccountPhygitalTokenProgram extends string = string, TAccountTokenProgram extends string = string> = {
    verifier: TransactionSigner<TAccountVerifier>;
    config: Address<TAccountConfig>;
    ownerVerifier: Address<TAccountOwnerVerifier>;
    asset: Address<TAccountAsset>;
    mint: Address<TAccountMint>;
    recipient: Address<TAccountRecipient>;
    programAuthority: Address<TAccountProgramAuthority>;
    senderTokenAccount: Address<TAccountSenderTokenAccount>;
    recipientTokenAccount: Address<TAccountRecipientTokenAccount>;
    slotHashes?: Address<TAccountSlotHashes>;
    instructionsSysvar?: Address<TAccountInstructionsSysvar>;
    phygitalTokenProgram?: Address<TAccountPhygitalTokenProgram>;
    tokenProgram?: Address<TAccountTokenProgram>;
    amount: TransferInstructionDataArgs["amount"];
    verifyArgsRelativeIndex: TransferInstructionDataArgs["verifyArgsRelativeIndex"];
    signedMessageIndex: TransferInstructionDataArgs["signedMessageIndex"];
    clientDataJson: TransferInstructionDataArgs["clientDataJson"];
    slotNumber: TransferInstructionDataArgs["slotNumber"];
};
export declare function getTransferInstruction<TAccountVerifier extends string, TAccountConfig extends string, TAccountOwnerVerifier extends string, TAccountAsset extends string, TAccountMint extends string, TAccountRecipient extends string, TAccountProgramAuthority extends string, TAccountSenderTokenAccount extends string, TAccountRecipientTokenAccount extends string, TAccountSlotHashes extends string, TAccountInstructionsSysvar extends string, TAccountPhygitalTokenProgram extends string, TAccountTokenProgram extends string, TProgramAddress extends Address = typeof PHYGITAL_PAYMENTS_PROGRAM_ADDRESS>(input: TransferInput<TAccountVerifier, TAccountConfig, TAccountOwnerVerifier, TAccountAsset, TAccountMint, TAccountRecipient, TAccountProgramAuthority, TAccountSenderTokenAccount, TAccountRecipientTokenAccount, TAccountSlotHashes, TAccountInstructionsSysvar, TAccountPhygitalTokenProgram, TAccountTokenProgram>, config?: {
    programAddress?: TProgramAddress;
}): TransferInstruction<TProgramAddress, TAccountVerifier, TAccountConfig, TAccountOwnerVerifier, TAccountAsset, TAccountMint, TAccountRecipient, TAccountProgramAuthority, TAccountSenderTokenAccount, TAccountRecipientTokenAccount, TAccountSlotHashes, TAccountInstructionsSysvar, TAccountPhygitalTokenProgram, TAccountTokenProgram>;
export type ParsedTransferInstruction<TProgram extends string = typeof PHYGITAL_PAYMENTS_PROGRAM_ADDRESS, TAccountMetas extends readonly AccountMeta[] = readonly AccountMeta[]> = {
    programAddress: Address<TProgram>;
    accounts: {
        verifier: TAccountMetas[0];
        config: TAccountMetas[1];
        ownerVerifier: TAccountMetas[2];
        asset: TAccountMetas[3];
        mint: TAccountMetas[4];
        recipient: TAccountMetas[5];
        programAuthority: TAccountMetas[6];
        senderTokenAccount: TAccountMetas[7];
        recipientTokenAccount: TAccountMetas[8];
        slotHashes: TAccountMetas[9];
        instructionsSysvar: TAccountMetas[10];
        phygitalTokenProgram: TAccountMetas[11];
        tokenProgram: TAccountMetas[12];
    };
    data: TransferInstructionData;
};
export declare function parseTransferInstruction<TProgram extends string, TAccountMetas extends readonly AccountMeta[]>(instruction: Instruction<TProgram> & InstructionWithAccounts<TAccountMetas> & InstructionWithData<ReadonlyUint8Array>): ParsedTransferInstruction<TProgram, TAccountMetas>;
//# sourceMappingURL=transfer.d.ts.map