import { type Address, type ClientWithRpc, type ClientWithTransactionPlanning, type ClientWithTransactionSending, type ExtendedClient, type GetAccountInfoApi, type GetMultipleAccountsApi, type Instruction, type InstructionWithData, type ReadonlyUint8Array } from "@solana/kit";
import { type SelfFetchFunctions, type SelfPlanAndSendFunctions } from "@solana/kit/program-client-core";
import { getConfigCodec, getOwnerVerifierCodec, type Config, type ConfigArgs, type OwnerVerifier, type OwnerVerifierArgs } from "../accounts/index.js";
import { getAddVerifierInstructionAsync, getClearOwnerVerifierInstructionAsync, getInitializeConfigInstructionAsync, getRemoveVerifierInstructionAsync, getSetOwnerVerifierInstructionAsync, getTransferInstructionAsync, type AddVerifierAsyncInput, type ClearOwnerVerifierAsyncInput, type InitializeConfigAsyncInput, type ParsedAddVerifierInstruction, type ParsedClearOwnerVerifierInstruction, type ParsedInitializeConfigInstruction, type ParsedRemoveVerifierInstruction, type ParsedSetOwnerVerifierInstruction, type ParsedTransferInstruction, type RemoveVerifierAsyncInput, type SetOwnerVerifierAsyncInput, type TransferAsyncInput } from "../instructions/index.js";
import { findConfigPda, findOwnerVerifierPda } from "../pdas/index.js";
export declare const PHYGITAL_PAYMENTS_PROGRAM_ADDRESS: Address<"EMxvE5xxqXTWwTt391NsULydeT2QyG2UdN45VHpFxeVH">;
export declare enum PhygitalPaymentsAccount {
    Config = 0,
    OwnerVerifier = 1
}
export declare function identifyPhygitalPaymentsAccount(account: {
    data: ReadonlyUint8Array;
} | ReadonlyUint8Array): PhygitalPaymentsAccount;
export declare enum PhygitalPaymentsInstruction {
    AddVerifier = 0,
    ClearOwnerVerifier = 1,
    InitializeConfig = 2,
    RemoveVerifier = 3,
    SetOwnerVerifier = 4,
    Transfer = 5
}
export declare function identifyPhygitalPaymentsInstruction(instruction: {
    data: ReadonlyUint8Array;
} | ReadonlyUint8Array): PhygitalPaymentsInstruction;
export type ParsedPhygitalPaymentsInstruction<TProgram extends string = "EMxvE5xxqXTWwTt391NsULydeT2QyG2UdN45VHpFxeVH"> = ({
    instructionType: PhygitalPaymentsInstruction.AddVerifier;
} & ParsedAddVerifierInstruction<TProgram>) | ({
    instructionType: PhygitalPaymentsInstruction.ClearOwnerVerifier;
} & ParsedClearOwnerVerifierInstruction<TProgram>) | ({
    instructionType: PhygitalPaymentsInstruction.InitializeConfig;
} & ParsedInitializeConfigInstruction<TProgram>) | ({
    instructionType: PhygitalPaymentsInstruction.RemoveVerifier;
} & ParsedRemoveVerifierInstruction<TProgram>) | ({
    instructionType: PhygitalPaymentsInstruction.SetOwnerVerifier;
} & ParsedSetOwnerVerifierInstruction<TProgram>) | ({
    instructionType: PhygitalPaymentsInstruction.Transfer;
} & ParsedTransferInstruction<TProgram>);
export declare function parsePhygitalPaymentsInstruction<TProgram extends string>(instruction: Instruction<TProgram> & InstructionWithData<ReadonlyUint8Array>): ParsedPhygitalPaymentsInstruction<TProgram>;
export type PhygitalPaymentsPlugin = {
    accounts: PhygitalPaymentsPluginAccounts;
    instructions: PhygitalPaymentsPluginInstructions;
    pdas: PhygitalPaymentsPluginPdas;
    identifyAccount: typeof identifyPhygitalPaymentsAccount;
    identifyInstruction: typeof identifyPhygitalPaymentsInstruction;
    parseInstruction: typeof parsePhygitalPaymentsInstruction;
};
export type PhygitalPaymentsPluginAccounts = {
    config: ReturnType<typeof getConfigCodec> & SelfFetchFunctions<ConfigArgs, Config>;
    ownerVerifier: ReturnType<typeof getOwnerVerifierCodec> & SelfFetchFunctions<OwnerVerifierArgs, OwnerVerifier>;
};
export type PhygitalPaymentsPluginInstructions = {
    addVerifier: (input: AddVerifierAsyncInput) => ReturnType<typeof getAddVerifierInstructionAsync> & SelfPlanAndSendFunctions;
    clearOwnerVerifier: (input: ClearOwnerVerifierAsyncInput) => ReturnType<typeof getClearOwnerVerifierInstructionAsync> & SelfPlanAndSendFunctions;
    initializeConfig: (input: InitializeConfigAsyncInput) => ReturnType<typeof getInitializeConfigInstructionAsync> & SelfPlanAndSendFunctions;
    removeVerifier: (input: RemoveVerifierAsyncInput) => ReturnType<typeof getRemoveVerifierInstructionAsync> & SelfPlanAndSendFunctions;
    setOwnerVerifier: (input: SetOwnerVerifierAsyncInput) => ReturnType<typeof getSetOwnerVerifierInstructionAsync> & SelfPlanAndSendFunctions;
    transfer: (input: TransferAsyncInput) => ReturnType<typeof getTransferInstructionAsync> & SelfPlanAndSendFunctions;
};
export type PhygitalPaymentsPluginPdas = {
    config: typeof findConfigPda;
    ownerVerifier: typeof findOwnerVerifierPda;
};
export type PhygitalPaymentsPluginRequirements = ClientWithRpc<GetAccountInfoApi & GetMultipleAccountsApi> & ClientWithTransactionPlanning & ClientWithTransactionSending;
export declare function phygitalPaymentsProgram(): <T extends PhygitalPaymentsPluginRequirements>(client: T) => ExtendedClient<T, {
    phygitalPayments: PhygitalPaymentsPlugin;
}>;
//# sourceMappingURL=phygitalPayments.d.ts.map