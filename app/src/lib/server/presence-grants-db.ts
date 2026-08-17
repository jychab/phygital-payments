import "server-only";

import { getPaymentsDb } from "./payments-db";
import type { D1Database } from "../../../worker/presence-grants";

/** Next API surface — worker-only helpers stay imported from `worker/presence-grants`. */
export {
  issueWalletApiKey,
  revokeWalletApiKey,
  resolveWalletFromApiKey,
  walletHasActiveApiKey,
  createPreauthGrant,
  invalidateActiveGrantsForWallet,
} from "../../../worker/presence-grants";

export function getPreauthDb(): D1Database {
  return getPaymentsDb() as unknown as D1Database;
}
