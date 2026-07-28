import { type Address, type ClientWithTransactionPlanning, type ClientWithTransactionSending, type ExtendedClient, type Instruction, type InstructionWithData, type ReadonlyUint8Array } from "@solana/kit";
import { type SelfPlanAndSendFunctions } from "@solana/kit/program-client-core";
import { getTransferInstruction, type ParsedTransferInstruction, type TransferInput } from "../instructions/index.js";
export declare const PHYGITAL_PAYMENTS_PROGRAM_ADDRESS: Address<"DQJiqvPmzfsrd2UnAfG5msSvgo1X8QXvm1q4axUsdvok">;
export declare enum PhygitalPaymentsInstruction {
    Transfer = 0
}
export declare function identifyPhygitalPaymentsInstruction(instruction: {
    data: ReadonlyUint8Array;
} | ReadonlyUint8Array): PhygitalPaymentsInstruction;
export type ParsedPhygitalPaymentsInstruction<TProgram extends string = "DQJiqvPmzfsrd2UnAfG5msSvgo1X8QXvm1q4axUsdvok"> = {
    instructionType: PhygitalPaymentsInstruction.Transfer;
} & ParsedTransferInstruction<TProgram>;
export declare function parsePhygitalPaymentsInstruction<TProgram extends string>(instruction: Instruction<TProgram> & InstructionWithData<ReadonlyUint8Array>): ParsedPhygitalPaymentsInstruction<TProgram>;
export type PhygitalPaymentsPlugin = {
    instructions: PhygitalPaymentsPluginInstructions;
    identifyInstruction: typeof identifyPhygitalPaymentsInstruction;
    parseInstruction: typeof parsePhygitalPaymentsInstruction;
};
export type PhygitalPaymentsPluginInstructions = {
    transfer: (input: TransferInput) => ReturnType<typeof getTransferInstruction> & SelfPlanAndSendFunctions;
};
export type PhygitalPaymentsPluginRequirements = ClientWithTransactionPlanning & ClientWithTransactionSending;
export declare function phygitalPaymentsProgram(): <T extends PhygitalPaymentsPluginRequirements>(client: T) => ExtendedClient<T, {
    phygitalPayments: PhygitalPaymentsPlugin;
}>;
//# sourceMappingURL=phygitalPayments.d.ts.map