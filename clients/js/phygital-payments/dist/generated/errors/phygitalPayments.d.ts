import { type Address, type SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM, type SolanaError } from "@solana/kit";
export declare const PHYGITAL_PAYMENTS_ERROR__ASSET_IS_CURRENTLY_UN_LOCKED = 6000;
export type PhygitalPaymentsError = typeof PHYGITAL_PAYMENTS_ERROR__ASSET_IS_CURRENTLY_UN_LOCKED;
export declare function getPhygitalPaymentsErrorMessage(code: PhygitalPaymentsError): string;
export declare function isPhygitalPaymentsError<TProgramErrorCode extends PhygitalPaymentsError>(error: unknown, transactionMessage: {
    instructions: Record<number, {
        programAddress: Address;
    }>;
}, code?: TProgramErrorCode): error is SolanaError<typeof SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM> & Readonly<{
    context: Readonly<{
        code: TProgramErrorCode;
    }>;
}>;
//# sourceMappingURL=phygitalPayments.d.ts.map