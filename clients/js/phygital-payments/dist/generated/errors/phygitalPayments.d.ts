import { type Address, type SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM, type SolanaError } from "@solana/kit";
export declare const PHYGITAL_PAYMENTS_ERROR__ASSET_IS_CURRENTLY_UN_LOCKED = 6000;
export declare const PHYGITAL_PAYMENTS_ERROR__UNAUTHORIZED_VERIFIER = 6001;
export declare const PHYGITAL_PAYMENTS_ERROR__OWNER_VERIFIER_REQUIRED = 6002;
export declare const PHYGITAL_PAYMENTS_ERROR__VERIFIER_ALREADY_EXISTS = 6003;
export declare const PHYGITAL_PAYMENTS_ERROR__VERIFIER_NOT_FOUND = 6004;
export declare const PHYGITAL_PAYMENTS_ERROR__TOO_MANY_VERIFIERS = 6005;
export declare const PHYGITAL_PAYMENTS_ERROR__UNAUTHORIZED_ADMIN = 6006;
export declare const PHYGITAL_PAYMENTS_ERROR__OWNER_VERIFIER_MISMATCH = 6007;
export declare const PHYGITAL_PAYMENTS_ERROR__INVALID_ENDPOINT = 6008;
export declare const PHYGITAL_PAYMENTS_ERROR__ENDPOINT_TOO_LONG = 6009;
export declare const PHYGITAL_PAYMENTS_ERROR__INVALID_SLOT_HASH = 6010;
export declare const PHYGITAL_PAYMENTS_ERROR__INVALID_SYSVAR_DATA_FORMAT = 6011;
export type PhygitalPaymentsError = typeof PHYGITAL_PAYMENTS_ERROR__ASSET_IS_CURRENTLY_UN_LOCKED | typeof PHYGITAL_PAYMENTS_ERROR__ENDPOINT_TOO_LONG | typeof PHYGITAL_PAYMENTS_ERROR__INVALID_ENDPOINT | typeof PHYGITAL_PAYMENTS_ERROR__INVALID_SLOT_HASH | typeof PHYGITAL_PAYMENTS_ERROR__INVALID_SYSVAR_DATA_FORMAT | typeof PHYGITAL_PAYMENTS_ERROR__OWNER_VERIFIER_MISMATCH | typeof PHYGITAL_PAYMENTS_ERROR__OWNER_VERIFIER_REQUIRED | typeof PHYGITAL_PAYMENTS_ERROR__TOO_MANY_VERIFIERS | typeof PHYGITAL_PAYMENTS_ERROR__UNAUTHORIZED_ADMIN | typeof PHYGITAL_PAYMENTS_ERROR__UNAUTHORIZED_VERIFIER | typeof PHYGITAL_PAYMENTS_ERROR__VERIFIER_ALREADY_EXISTS | typeof PHYGITAL_PAYMENTS_ERROR__VERIFIER_NOT_FOUND;
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