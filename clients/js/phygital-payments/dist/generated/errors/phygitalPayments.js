import { isProgramError, } from "@solana/kit";
import { PHYGITAL_PAYMENTS_PROGRAM_ADDRESS } from "../programs/index.js";
export const PHYGITAL_PAYMENTS_ERROR__TOKEN_IS_CURRENTLY_UN_LOCKED = 0x1770;
export const PHYGITAL_PAYMENTS_ERROR__UNAUTHORIZED_VERIFIER = 0x1771;
export const PHYGITAL_PAYMENTS_ERROR__OWNER_VERIFIER_REQUIRED = 0x1772;
export const PHYGITAL_PAYMENTS_ERROR__VERIFIER_ALREADY_EXISTS = 0x1773;
export const PHYGITAL_PAYMENTS_ERROR__VERIFIER_NOT_FOUND = 0x1774;
export const PHYGITAL_PAYMENTS_ERROR__TOO_MANY_VERIFIERS = 0x1775;
export const PHYGITAL_PAYMENTS_ERROR__UNAUTHORIZED_ADMIN = 0x1776;
export const PHYGITAL_PAYMENTS_ERROR__OWNER_VERIFIER_MISMATCH = 0x1777;
export const PHYGITAL_PAYMENTS_ERROR__INVALID_ENDPOINT = 0x1778;
export const PHYGITAL_PAYMENTS_ERROR__ENDPOINT_TOO_LONG = 0x1779;
export const PHYGITAL_PAYMENTS_ERROR__INVALID_SLOT_HASH = 0x177a;
export const PHYGITAL_PAYMENTS_ERROR__INVALID_SYSVAR_DATA_FORMAT = 0x177b;
let phygitalPaymentsErrorMessages;
if (process.env["NODE_ENV"] !== "production") {
    phygitalPaymentsErrorMessages = {
        [PHYGITAL_PAYMENTS_ERROR__ENDPOINT_TOO_LONG]: `Verifier endpoint URL exceeds max length`,
        [PHYGITAL_PAYMENTS_ERROR__INVALID_ENDPOINT]: `Verifier endpoint URL is empty or invalid`,
        [PHYGITAL_PAYMENTS_ERROR__INVALID_SLOT_HASH]: `Slot not found in SlotHashes sysvar — signature has expired or is being replayed`,
        [PHYGITAL_PAYMENTS_ERROR__INVALID_SYSVAR_DATA_FORMAT]: `Invalid SlotHashes sysvar data format`,
        [PHYGITAL_PAYMENTS_ERROR__OWNER_VERIFIER_MISMATCH]: `Owner verifier account does not match the token owner`,
        [PHYGITAL_PAYMENTS_ERROR__OWNER_VERIFIER_REQUIRED]: `Owner has configured a custom verifier; that key must sign`,
        [PHYGITAL_PAYMENTS_ERROR__TOKEN_IS_CURRENTLY_UN_LOCKED]: `Token must be lockable and currently locked`,
        [PHYGITAL_PAYMENTS_ERROR__TOO_MANY_VERIFIERS]: `Config verifier set is full`,
        [PHYGITAL_PAYMENTS_ERROR__UNAUTHORIZED_ADMIN]: `Only the config admin may perform this action`,
        [PHYGITAL_PAYMENTS_ERROR__UNAUTHORIZED_VERIFIER]: `Verifier is not authorized for this transfer`,
        [PHYGITAL_PAYMENTS_ERROR__VERIFIER_ALREADY_EXISTS]: `Verifier is already in the config set`,
        [PHYGITAL_PAYMENTS_ERROR__VERIFIER_NOT_FOUND]: `Verifier was not found in the config set`,
    };
}
export function getPhygitalPaymentsErrorMessage(code) {
    if (process.env["NODE_ENV"] !== "production") {
        return phygitalPaymentsErrorMessages[code];
    }
    return "Error message not available in production bundles.";
}
export function isPhygitalPaymentsError(error, transactionMessage, code) {
    return isProgramError(error, transactionMessage, PHYGITAL_PAYMENTS_PROGRAM_ADDRESS, code);
}
//# sourceMappingURL=phygitalPayments.js.map