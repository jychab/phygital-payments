import { type AccountMeta, type Address, type Codec, type Decoder, type Encoder, type Instruction, type InstructionWithAccounts, type InstructionWithData, type ReadonlyAccount, type ReadonlyUint8Array, type WritableAccount } from "@solana/kit";
import { PHYGITAL_PAYMENTS_PROGRAM_ADDRESS } from "../programs/index.js";
export declare const TRANSFER_DISCRIMINATOR: ReadonlyUint8Array;
export declare function getTransferDiscriminatorBytes(): ReadonlyUint8Array;
export type TransferInstruction<TProgram extends string = typeof PHYGITAL_PAYMENTS_PROGRAM_ADDRESS, TAccountAsset extends string | AccountMeta<string> = string, TAccountMint extends string | AccountMeta<string> = string, TAccountRecipient extends string | AccountMeta<string> = string, TAccountProgramAuthority extends string | AccountMeta<string> = string, TAccountSenderTokenAccount extends string | AccountMeta<string> = string, TAccountRecipientTokenAccount extends string | AccountMeta<string> = string, TAccountSlotHashes extends string | AccountMeta<string> = "SysvarS1otHashes111111111111111111111111111", TAccountInstructionsSysvar extends string | AccountMeta<string> = "Sysvar1nstructions1111111111111111111111111", TAccountPhygitalTokenProgram extends string | AccountMeta<string> = "DdwhetyqgSB56XVcR33ySG5dFmvwbjSc5aSMHRg5Bk6A", TAccountTokenProgram extends string | AccountMeta<string> = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", TRemainingAccounts extends readonly AccountMeta<string>[] = []> = Instruction<TProgram> & InstructionWithData<ReadonlyUint8Array> & InstructionWithAccounts<[
    TAccountAsset extends string ? WritableAccount<TAccountAsset> : TAccountAsset,
    TAccountMint extends string ? ReadonlyAccount<TAccountMint> : TAccountMint,
    TAccountRecipient extends string ? ReadonlyAccount<TAccountRecipient> : TAccountRecipient,
    TAccountProgramAuthority extends string ? WritableAccount<TAccountProgramAuthority> : TAccountProgramAuthority,
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
    slotNumber: bigint;
    clientDataJson: ReadonlyUint8Array;
};
export type TransferInstructionDataArgs = {
    amount: number | bigint;
    verifyArgsRelativeIndex: number | bigint;
    signedMessageIndex: number;
    slotNumber: number | bigint;
    clientDataJson: ReadonlyUint8Array;
};
export declare function getTransferInstructionDataEncoder(): Encoder<TransferInstructionDataArgs>;
export declare function getTransferInstructionDataDecoder(): Decoder<TransferInstructionData>;
export declare function getTransferInstructionDataCodec(): Codec<TransferInstructionDataArgs, TransferInstructionData>;
export type TransferInput<TAccountAsset extends string = string, TAccountMint extends string = string, TAccountRecipient extends string = string, TAccountProgramAuthority extends string = string, TAccountSenderTokenAccount extends string = string, TAccountRecipientTokenAccount extends string = string, TAccountSlotHashes extends string = string, TAccountInstructionsSysvar extends string = string, TAccountPhygitalTokenProgram extends string = string, TAccountTokenProgram extends string = string> = {
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
    slotNumber: TransferInstructionDataArgs["slotNumber"];
    clientDataJson: TransferInstructionDataArgs["clientDataJson"];
};
export declare function getTransferInstruction<TAccountAsset extends string, TAccountMint extends string, TAccountRecipient extends string, TAccountProgramAuthority extends string, TAccountSenderTokenAccount extends string, TAccountRecipientTokenAccount extends string, TAccountSlotHashes extends string, TAccountInstructionsSysvar extends string, TAccountPhygitalTokenProgram extends string, TAccountTokenProgram extends string, TProgramAddress extends Address = typeof PHYGITAL_PAYMENTS_PROGRAM_ADDRESS>(input: TransferInput<TAccountAsset, TAccountMint, TAccountRecipient, TAccountProgramAuthority, TAccountSenderTokenAccount, TAccountRecipientTokenAccount, TAccountSlotHashes, TAccountInstructionsSysvar, TAccountPhygitalTokenProgram, TAccountTokenProgram>, config?: {
    programAddress?: TProgramAddress;
}): TransferInstruction<TProgramAddress, TAccountAsset, TAccountMint, TAccountRecipient, TAccountProgramAuthority, TAccountSenderTokenAccount, TAccountRecipientTokenAccount, TAccountSlotHashes, TAccountInstructionsSysvar, TAccountPhygitalTokenProgram, TAccountTokenProgram>;
export type ParsedTransferInstruction<TProgram extends string = typeof PHYGITAL_PAYMENTS_PROGRAM_ADDRESS, TAccountMetas extends readonly AccountMeta[] = readonly AccountMeta[]> = {
    programAddress: Address<TProgram>;
    accounts: {
        asset: TAccountMetas[0];
        mint: TAccountMetas[1];
        recipient: TAccountMetas[2];
        programAuthority: TAccountMetas[3];
        senderTokenAccount: TAccountMetas[4];
        recipientTokenAccount: TAccountMetas[5];
        slotHashes: TAccountMetas[6];
        instructionsSysvar: TAccountMetas[7];
        phygitalTokenProgram: TAccountMetas[8];
        tokenProgram: TAccountMetas[9];
    };
    data: TransferInstructionData;
};
export declare function parseTransferInstruction<TProgram extends string, TAccountMetas extends readonly AccountMeta[]>(instruction: Instruction<TProgram> & InstructionWithAccounts<TAccountMetas> & InstructionWithData<ReadonlyUint8Array>): ParsedTransferInstruction<TProgram, TAccountMetas>;
//# sourceMappingURL=transfer.d.ts.map