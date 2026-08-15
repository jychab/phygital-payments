import { getAddressEncoder, getProgramDerivedAddress } from "@solana/kit";
import { sha256 } from "@noble/hashes/sha2.js";
export const PROGRAM_AUTHORITY_SEED = new TextEncoder().encode("program_authority");
export async function findProgramAuthorityPda(owner, programAddress) {
    const [pda] = await getProgramDerivedAddress({
        programAddress,
        seeds: [PROGRAM_AUTHORITY_SEED, getAddressEncoder().encode(owner)],
    });
    return pda;
}
export function buildTransferChallenge(mint, recipient, amount, slotHash) {
    if (slotHash.length !== 32) {
        throw new Error("slotHash must be 32 bytes");
    }
    const prefix = new TextEncoder().encode("phygital_payments:transfer");
    const mintBytes = getAddressEncoder().encode(mint);
    const recipientBytes = getAddressEncoder().encode(recipient);
    const amountBytes = new Uint8Array(8);
    new DataView(amountBytes.buffer).setBigUint64(0, BigInt(amount), true);
    const preimage = new Uint8Array(prefix.length + mintBytes.length + recipientBytes.length + amountBytes.length + 32);
    let offset = 0;
    preimage.set(prefix, offset);
    offset += prefix.length;
    preimage.set(mintBytes, offset);
    offset += mintBytes.length;
    preimage.set(recipientBytes, offset);
    offset += recipientBytes.length;
    preimage.set(amountBytes, offset);
    offset += amountBytes.length;
    preimage.set(slotHash, offset);
    return sha256(preimage);
}
//# sourceMappingURL=transfer.js.map