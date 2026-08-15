import { addDecoderSizePrefix, addEncoderSizePrefix, combineCodec, fixDecoderSize, fixEncoderSize, getBytesDecoder, getBytesEncoder, getI64Decoder, getI64Encoder, getStructDecoder, getStructEncoder, getU32Decoder, getU32Encoder, getU64Decoder, getU64Encoder, getU8Decoder, getU8Encoder, SOLANA_ERROR__PROGRAM_CLIENTS__INSUFFICIENT_ACCOUNT_METAS, SolanaError, transformEncoder, } from "@solana/kit";
import { getAccountMetaFactory, } from "@solana/kit/program-client-core";
import { findConfigPda } from "../pdas/index.js";
import { PHYGITAL_PAYMENTS_PROGRAM_ADDRESS } from "../programs/index.js";
export const TRANSFER_DISCRIMINATOR = new Uint8Array([
    163, 52, 200, 231, 140, 3, 69, 186,
]);
export function getTransferDiscriminatorBytes() {
    return fixEncoderSize(getBytesEncoder(), 8).encode(TRANSFER_DISCRIMINATOR);
}
export function getTransferInstructionDataEncoder() {
    return transformEncoder(getStructEncoder([
        ["discriminator", fixEncoderSize(getBytesEncoder(), 8)],
        ["amount", getU64Encoder()],
        ["verifyArgsRelativeIndex", getI64Encoder()],
        ["signedMessageIndex", getU8Encoder()],
        [
            "clientDataJson",
            addEncoderSizePrefix(getBytesEncoder(), getU32Encoder()),
        ],
        ["slotNumber", getU64Encoder()],
    ]), (value) => ({ ...value, discriminator: TRANSFER_DISCRIMINATOR }));
}
export function getTransferInstructionDataDecoder() {
    return getStructDecoder([
        ["discriminator", fixDecoderSize(getBytesDecoder(), 8)],
        ["amount", getU64Decoder()],
        ["verifyArgsRelativeIndex", getI64Decoder()],
        ["signedMessageIndex", getU8Decoder()],
        [
            "clientDataJson",
            addDecoderSizePrefix(getBytesDecoder(), getU32Decoder()),
        ],
        ["slotNumber", getU64Decoder()],
    ]);
}
export function getTransferInstructionDataCodec() {
    return combineCodec(getTransferInstructionDataEncoder(), getTransferInstructionDataDecoder());
}
export async function getTransferInstructionAsync(input, config) {
    const programAddress = config?.programAddress ?? PHYGITAL_PAYMENTS_PROGRAM_ADDRESS;
    const originalAccounts = {
        verifier: { value: input.verifier ?? null, isWritable: false },
        config: { value: input.config ?? null, isWritable: false },
        ownerVerifier: { value: input.ownerVerifier ?? null, isWritable: false },
        asset: { value: input.asset ?? null, isWritable: true },
        mint: { value: input.mint ?? null, isWritable: false },
        recipient: { value: input.recipient ?? null, isWritable: false },
        programAuthority: {
            value: input.programAuthority ?? null,
            isWritable: false,
        },
        senderTokenAccount: {
            value: input.senderTokenAccount ?? null,
            isWritable: true,
        },
        recipientTokenAccount: {
            value: input.recipientTokenAccount ?? null,
            isWritable: true,
        },
        slotHashes: { value: input.slotHashes ?? null, isWritable: false },
        instructionsSysvar: {
            value: input.instructionsSysvar ?? null,
            isWritable: false,
        },
        phygitalTokenProgram: {
            value: input.phygitalTokenProgram ?? null,
            isWritable: false,
        },
        tokenProgram: { value: input.tokenProgram ?? null, isWritable: false },
    };
    const accounts = originalAccounts;
    const args = { ...input };
    if (!accounts.config.value) {
        accounts.config.value = await findConfigPda();
    }
    if (!accounts.slotHashes.value) {
        accounts.slotHashes.value =
            "SysvarS1otHashes111111111111111111111111111";
    }
    if (!accounts.instructionsSysvar.value) {
        accounts.instructionsSysvar.value =
            "Sysvar1nstructions1111111111111111111111111";
    }
    if (!accounts.phygitalTokenProgram.value) {
        accounts.phygitalTokenProgram.value =
            "DuPpckdjjgVAnYok2aTMAt264ZPBXqq3JSazJjCUzTJQ";
    }
    if (!accounts.tokenProgram.value) {
        accounts.tokenProgram.value =
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
    }
    const getAccountMeta = getAccountMetaFactory(programAddress, "programId");
    return Object.freeze({
        accounts: [
            getAccountMeta("verifier", accounts.verifier),
            getAccountMeta("config", accounts.config),
            getAccountMeta("ownerVerifier", accounts.ownerVerifier),
            getAccountMeta("asset", accounts.asset),
            getAccountMeta("mint", accounts.mint),
            getAccountMeta("recipient", accounts.recipient),
            getAccountMeta("programAuthority", accounts.programAuthority),
            getAccountMeta("senderTokenAccount", accounts.senderTokenAccount),
            getAccountMeta("recipientTokenAccount", accounts.recipientTokenAccount),
            getAccountMeta("slotHashes", accounts.slotHashes),
            getAccountMeta("instructionsSysvar", accounts.instructionsSysvar),
            getAccountMeta("phygitalTokenProgram", accounts.phygitalTokenProgram),
            getAccountMeta("tokenProgram", accounts.tokenProgram),
        ],
        data: getTransferInstructionDataEncoder().encode(args),
        programAddress,
    });
}
export function getTransferInstruction(input, config) {
    const programAddress = config?.programAddress ?? PHYGITAL_PAYMENTS_PROGRAM_ADDRESS;
    const originalAccounts = {
        verifier: { value: input.verifier ?? null, isWritable: false },
        config: { value: input.config ?? null, isWritable: false },
        ownerVerifier: { value: input.ownerVerifier ?? null, isWritable: false },
        asset: { value: input.asset ?? null, isWritable: true },
        mint: { value: input.mint ?? null, isWritable: false },
        recipient: { value: input.recipient ?? null, isWritable: false },
        programAuthority: {
            value: input.programAuthority ?? null,
            isWritable: false,
        },
        senderTokenAccount: {
            value: input.senderTokenAccount ?? null,
            isWritable: true,
        },
        recipientTokenAccount: {
            value: input.recipientTokenAccount ?? null,
            isWritable: true,
        },
        slotHashes: { value: input.slotHashes ?? null, isWritable: false },
        instructionsSysvar: {
            value: input.instructionsSysvar ?? null,
            isWritable: false,
        },
        phygitalTokenProgram: {
            value: input.phygitalTokenProgram ?? null,
            isWritable: false,
        },
        tokenProgram: { value: input.tokenProgram ?? null, isWritable: false },
    };
    const accounts = originalAccounts;
    const args = { ...input };
    if (!accounts.slotHashes.value) {
        accounts.slotHashes.value =
            "SysvarS1otHashes111111111111111111111111111";
    }
    if (!accounts.instructionsSysvar.value) {
        accounts.instructionsSysvar.value =
            "Sysvar1nstructions1111111111111111111111111";
    }
    if (!accounts.phygitalTokenProgram.value) {
        accounts.phygitalTokenProgram.value =
            "DuPpckdjjgVAnYok2aTMAt264ZPBXqq3JSazJjCUzTJQ";
    }
    if (!accounts.tokenProgram.value) {
        accounts.tokenProgram.value =
            "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
    }
    const getAccountMeta = getAccountMetaFactory(programAddress, "programId");
    return Object.freeze({
        accounts: [
            getAccountMeta("verifier", accounts.verifier),
            getAccountMeta("config", accounts.config),
            getAccountMeta("ownerVerifier", accounts.ownerVerifier),
            getAccountMeta("asset", accounts.asset),
            getAccountMeta("mint", accounts.mint),
            getAccountMeta("recipient", accounts.recipient),
            getAccountMeta("programAuthority", accounts.programAuthority),
            getAccountMeta("senderTokenAccount", accounts.senderTokenAccount),
            getAccountMeta("recipientTokenAccount", accounts.recipientTokenAccount),
            getAccountMeta("slotHashes", accounts.slotHashes),
            getAccountMeta("instructionsSysvar", accounts.instructionsSysvar),
            getAccountMeta("phygitalTokenProgram", accounts.phygitalTokenProgram),
            getAccountMeta("tokenProgram", accounts.tokenProgram),
        ],
        data: getTransferInstructionDataEncoder().encode(args),
        programAddress,
    });
}
export function parseTransferInstruction(instruction) {
    if (instruction.accounts.length < 13) {
        throw new SolanaError(SOLANA_ERROR__PROGRAM_CLIENTS__INSUFFICIENT_ACCOUNT_METAS, {
            actualAccountMetas: instruction.accounts.length,
            expectedAccountMetas: 13,
        });
    }
    let accountIndex = 0;
    const getNextAccount = () => {
        const accountMeta = instruction.accounts[accountIndex];
        accountIndex += 1;
        return accountMeta;
    };
    return {
        programAddress: instruction.programAddress,
        accounts: {
            verifier: getNextAccount(),
            config: getNextAccount(),
            ownerVerifier: getNextAccount(),
            asset: getNextAccount(),
            mint: getNextAccount(),
            recipient: getNextAccount(),
            programAuthority: getNextAccount(),
            senderTokenAccount: getNextAccount(),
            recipientTokenAccount: getNextAccount(),
            slotHashes: getNextAccount(),
            instructionsSysvar: getNextAccount(),
            phygitalTokenProgram: getNextAccount(),
            tokenProgram: getNextAccount(),
        },
        data: getTransferInstructionDataDecoder().decode(instruction.data),
    };
}
//# sourceMappingURL=transfer.js.map