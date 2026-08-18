import "server-only";

import { getPaymentsDb } from "./payments-db";
import type { D1Database } from "../../../worker/wallet-api-keys";

export {
  issueWalletApiKey,
  verifyPayApiKey,
  walletHasActiveApiKey,
} from "../../../worker/wallet-api-keys";

export function getWalletApiKeysDb(): D1Database {
  return getPaymentsDb() as unknown as D1Database;
}
