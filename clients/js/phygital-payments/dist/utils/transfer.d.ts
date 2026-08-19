import { type Address } from "@solana/kit";
export declare const PROGRAM_AUTHORITY_SEED: Uint8Array<ArrayBuffer>;
export declare function findProgramAuthorityPda(asset: Address, programAddress: Address): Promise<Address>;
export declare function buildTransferChallenge(mint: Address, recipient: Address, amount: bigint | number, slotHash: Uint8Array): Uint8Array;
//# sourceMappingURL=transfer.d.ts.map