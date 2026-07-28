import { assertIsInstructionWithAccounts, containsBytes, extendClient, fixEncoderSize, getBytesEncoder, SOLANA_ERROR__PROGRAM_CLIENTS__FAILED_TO_IDENTIFY_INSTRUCTION, SOLANA_ERROR__PROGRAM_CLIENTS__UNRECOGNIZED_INSTRUCTION_TYPE, SolanaError, } from "@solana/kit";
import { addSelfPlanAndSendFunctions, } from "@solana/kit/program-client-core";
import { getTransferInstruction, parseTransferInstruction, } from "../instructions/index.js";
export const PHYGITAL_PAYMENTS_PROGRAM_ADDRESS = "DQJiqvPmzfsrd2UnAfG5msSvgo1X8QXvm1q4axUsdvok";
export var PhygitalPaymentsInstruction;
(function (PhygitalPaymentsInstruction) {
    PhygitalPaymentsInstruction[PhygitalPaymentsInstruction["Transfer"] = 0] = "Transfer";
})(PhygitalPaymentsInstruction || (PhygitalPaymentsInstruction = {}));
export function identifyPhygitalPaymentsInstruction(instruction) {
    const data = "data" in instruction ? instruction.data : instruction;
    if (containsBytes(data, fixEncoderSize(getBytesEncoder(), 8).encode(new Uint8Array([163, 52, 200, 231, 140, 3, 69, 186])), 0)) {
        return PhygitalPaymentsInstruction.Transfer;
    }
    throw new SolanaError(SOLANA_ERROR__PROGRAM_CLIENTS__FAILED_TO_IDENTIFY_INSTRUCTION, { instructionData: data, programName: "phygitalPayments" });
}
export function parsePhygitalPaymentsInstruction(instruction) {
    const instructionType = identifyPhygitalPaymentsInstruction(instruction);
    switch (instructionType) {
        case PhygitalPaymentsInstruction.Transfer: {
            assertIsInstructionWithAccounts(instruction);
            return {
                instructionType: PhygitalPaymentsInstruction.Transfer,
                ...parseTransferInstruction(instruction),
            };
        }
        default:
            throw new SolanaError(SOLANA_ERROR__PROGRAM_CLIENTS__UNRECOGNIZED_INSTRUCTION_TYPE, {
                instructionType: instructionType,
                programName: "phygitalPayments",
            });
    }
}
export function phygitalPaymentsProgram() {
    return (client) => {
        return extendClient(client, {
            phygitalPayments: {
                instructions: {
                    transfer: (input) => addSelfPlanAndSendFunctions(client, getTransferInstruction(input)),
                },
                identifyInstruction: identifyPhygitalPaymentsInstruction,
                parseInstruction: parsePhygitalPaymentsInstruction,
            },
        });
    };
}
//# sourceMappingURL=phygitalPayments.js.map