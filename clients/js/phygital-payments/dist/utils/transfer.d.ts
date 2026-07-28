import { type Address } from "@solana/kit";
export declare const PROGRAM_AUTHORITY_SEED: Uint8Array<ArrayBuffer>;
export declare function findProgramAuthorityPda(owner: Address, programAddress: Address): Promise<Address>;
export declare function buildTransferMessage(mint: Address, recipient: Address, amount: bigint | number): Uint8Array;
//# sourceMappingURL=transfer.d.ts.map