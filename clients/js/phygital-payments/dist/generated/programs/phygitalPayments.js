import { assertIsInstructionWithAccounts, containsBytes, extendClient, fixEncoderSize, getBytesEncoder, SOLANA_ERROR__PROGRAM_CLIENTS__FAILED_TO_IDENTIFY_ACCOUNT, SOLANA_ERROR__PROGRAM_CLIENTS__FAILED_TO_IDENTIFY_INSTRUCTION, SOLANA_ERROR__PROGRAM_CLIENTS__UNRECOGNIZED_INSTRUCTION_TYPE, SolanaError, } from "@solana/kit";
import { addSelfFetchFunctions, addSelfPlanAndSendFunctions, } from "@solana/kit/program-client-core";
import { getConfigCodec, getOwnerVerifierCodec, } from "../accounts/index.js";
import { getAddVerifierInstructionAsync, getClearOwnerVerifierInstructionAsync, getInitializeConfigInstructionAsync, getRemoveVerifierInstructionAsync, getSetOwnerVerifierInstructionAsync, getTransferInstructionAsync, parseAddVerifierInstruction, parseClearOwnerVerifierInstruction, parseInitializeConfigInstruction, parseRemoveVerifierInstruction, parseSetOwnerVerifierInstruction, parseTransferInstruction, } from "../instructions/index.js";
import { findConfigPda, findOwnerVerifierPda, findProgramAuthorityPda, } from "../pdas/index.js";
export const PHYGITAL_PAYMENTS_PROGRAM_ADDRESS = "EMxvE5xxqXTWwTt391NsULydeT2QyG2UdN45VHpFxeVH";
export var PhygitalPaymentsAccount;
(function (PhygitalPaymentsAccount) {
    PhygitalPaymentsAccount[PhygitalPaymentsAccount["Config"] = 0] = "Config";
    PhygitalPaymentsAccount[PhygitalPaymentsAccount["OwnerVerifier"] = 1] = "OwnerVerifier";
})(PhygitalPaymentsAccount || (PhygitalPaymentsAccount = {}));
export function identifyPhygitalPaymentsAccount(account) {
    const data = "data" in account ? account.data : account;
    if (containsBytes(data, fixEncoderSize(getBytesEncoder(), 8).encode(new Uint8Array([155, 12, 170, 224, 30, 250, 204, 130])), 0)) {
        return PhygitalPaymentsAccount.Config;
    }
    if (containsBytes(data, fixEncoderSize(getBytesEncoder(), 8).encode(new Uint8Array([241, 123, 5, 72, 241, 211, 246, 253])), 0)) {
        return PhygitalPaymentsAccount.OwnerVerifier;
    }
    throw new SolanaError(SOLANA_ERROR__PROGRAM_CLIENTS__FAILED_TO_IDENTIFY_ACCOUNT, { accountData: data, programName: "phygitalPayments" });
}
export var PhygitalPaymentsInstruction;
(function (PhygitalPaymentsInstruction) {
    PhygitalPaymentsInstruction[PhygitalPaymentsInstruction["AddVerifier"] = 0] = "AddVerifier";
    PhygitalPaymentsInstruction[PhygitalPaymentsInstruction["ClearOwnerVerifier"] = 1] = "ClearOwnerVerifier";
    PhygitalPaymentsInstruction[PhygitalPaymentsInstruction["InitializeConfig"] = 2] = "InitializeConfig";
    PhygitalPaymentsInstruction[PhygitalPaymentsInstruction["RemoveVerifier"] = 3] = "RemoveVerifier";
    PhygitalPaymentsInstruction[PhygitalPaymentsInstruction["SetOwnerVerifier"] = 4] = "SetOwnerVerifier";
    PhygitalPaymentsInstruction[PhygitalPaymentsInstruction["Transfer"] = 5] = "Transfer";
})(PhygitalPaymentsInstruction || (PhygitalPaymentsInstruction = {}));
export function identifyPhygitalPaymentsInstruction(instruction) {
    const data = "data" in instruction ? instruction.data : instruction;
    if (containsBytes(data, fixEncoderSize(getBytesEncoder(), 8).encode(new Uint8Array([165, 72, 135, 225, 67, 181, 255, 135])), 0)) {
        return PhygitalPaymentsInstruction.AddVerifier;
    }
    if (containsBytes(data, fixEncoderSize(getBytesEncoder(), 8).encode(new Uint8Array([22, 210, 50, 56, 238, 126, 242, 84])), 0)) {
        return PhygitalPaymentsInstruction.ClearOwnerVerifier;
    }
    if (containsBytes(data, fixEncoderSize(getBytesEncoder(), 8).encode(new Uint8Array([208, 127, 21, 1, 194, 190, 196, 70])), 0)) {
        return PhygitalPaymentsInstruction.InitializeConfig;
    }
    if (containsBytes(data, fixEncoderSize(getBytesEncoder(), 8).encode(new Uint8Array([179, 9, 132, 183, 233, 23, 172, 111])), 0)) {
        return PhygitalPaymentsInstruction.RemoveVerifier;
    }
    if (containsBytes(data, fixEncoderSize(getBytesEncoder(), 8).encode(new Uint8Array([99, 221, 200, 143, 93, 97, 22, 69])), 0)) {
        return PhygitalPaymentsInstruction.SetOwnerVerifier;
    }
    if (containsBytes(data, fixEncoderSize(getBytesEncoder(), 8).encode(new Uint8Array([163, 52, 200, 231, 140, 3, 69, 186])), 0)) {
        return PhygitalPaymentsInstruction.Transfer;
    }
    throw new SolanaError(SOLANA_ERROR__PROGRAM_CLIENTS__FAILED_TO_IDENTIFY_INSTRUCTION, { instructionData: data, programName: "phygitalPayments" });
}
export function parsePhygitalPaymentsInstruction(instruction) {
    const instructionType = identifyPhygitalPaymentsInstruction(instruction);
    switch (instructionType) {
        case PhygitalPaymentsInstruction.AddVerifier: {
            assertIsInstructionWithAccounts(instruction);
            return {
                instructionType: PhygitalPaymentsInstruction.AddVerifier,
                ...parseAddVerifierInstruction(instruction),
            };
        }
        case PhygitalPaymentsInstruction.ClearOwnerVerifier: {
            assertIsInstructionWithAccounts(instruction);
            return {
                instructionType: PhygitalPaymentsInstruction.ClearOwnerVerifier,
                ...parseClearOwnerVerifierInstruction(instruction),
            };
        }
        case PhygitalPaymentsInstruction.InitializeConfig: {
            assertIsInstructionWithAccounts(instruction);
            return {
                instructionType: PhygitalPaymentsInstruction.InitializeConfig,
                ...parseInitializeConfigInstruction(instruction),
            };
        }
        case PhygitalPaymentsInstruction.RemoveVerifier: {
            assertIsInstructionWithAccounts(instruction);
            return {
                instructionType: PhygitalPaymentsInstruction.RemoveVerifier,
                ...parseRemoveVerifierInstruction(instruction),
            };
        }
        case PhygitalPaymentsInstruction.SetOwnerVerifier: {
            assertIsInstructionWithAccounts(instruction);
            return {
                instructionType: PhygitalPaymentsInstruction.SetOwnerVerifier,
                ...parseSetOwnerVerifierInstruction(instruction),
            };
        }
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
                accounts: {
                    config: addSelfFetchFunctions(client, getConfigCodec()),
                    ownerVerifier: addSelfFetchFunctions(client, getOwnerVerifierCodec()),
                },
                instructions: {
                    addVerifier: (input) => addSelfPlanAndSendFunctions(client, getAddVerifierInstructionAsync(input)),
                    clearOwnerVerifier: (input) => addSelfPlanAndSendFunctions(client, getClearOwnerVerifierInstructionAsync(input)),
                    initializeConfig: (input) => addSelfPlanAndSendFunctions(client, getInitializeConfigInstructionAsync(input)),
                    removeVerifier: (input) => addSelfPlanAndSendFunctions(client, getRemoveVerifierInstructionAsync(input)),
                    setOwnerVerifier: (input) => addSelfPlanAndSendFunctions(client, getSetOwnerVerifierInstructionAsync(input)),
                    transfer: (input) => addSelfPlanAndSendFunctions(client, getTransferInstructionAsync(input)),
                },
                pdas: {
                    config: findConfigPda,
                    ownerVerifier: findOwnerVerifierPda,
                    programAuthority: findProgramAuthorityPda,
                },
                identifyAccount: identifyPhygitalPaymentsAccount,
                identifyInstruction: identifyPhygitalPaymentsInstruction,
                parseInstruction: parsePhygitalPaymentsInstruction,
            },
        });
    };
}
//# sourceMappingURL=phygitalPayments.js.map