import { getAddressEncoder, getProgramDerivedAddress } from "@solana/kit";
export const PROGRAM_AUTHORITY_SEED = new TextEncoder().encode("program_authority");
export async function findProgramAuthorityPda(owner, programAddress) {
    const [pda] = await getProgramDerivedAddress({
        programAddress,
        seeds: [PROGRAM_AUTHORITY_SEED, getAddressEncoder().encode(owner)],
    });
    return pda;
}
export function buildTransferMessage(mint, recipient, amount) {
    const prefix = new TextEncoder().encode("phygital_payments:transfer");
    const mintBytes = getAddressEncoder().encode(mint);
    const recipientBytes = getAddressEncoder().encode(recipient);
    const amountBytes = new Uint8Array(8);
    new DataView(amountBytes.buffer).setBigUint64(0, BigInt(amount), true);
    const message = new Uint8Array(prefix.length + mintBytes.length + recipientBytes.length + amountBytes.length);
    message.set(prefix, 0);
    message.set(mintBytes, prefix.length);
    message.set(recipientBytes, prefix.length + mintBytes.length);
    message.set(amountBytes, prefix.length + mintBytes.length + recipientBytes.length);
    return message;
}
//# sourceMappingURL=transfer.js.map