import { isProgramError, } from "@solana/kit";
import { PHYGITAL_PAYMENTS_PROGRAM_ADDRESS } from "../programs/index.js";
export const PHYGITAL_PAYMENTS_ERROR__ASSET_IS_CURRENTLY_UN_LOCKED = 0x1770;
let phygitalPaymentsErrorMessages;
if (process.env["NODE_ENV"] !== "production") {
    phygitalPaymentsErrorMessages = {
        [PHYGITAL_PAYMENTS_ERROR__ASSET_IS_CURRENTLY_UN_LOCKED]: `Asset must be lockable and currently locked`,
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