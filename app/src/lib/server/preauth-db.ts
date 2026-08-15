import "server-only";

import { getPaymentsDb } from "./payments-db";
import type { D1Database } from "../../../worker/preauth";

/** Next API surface — worker-only helpers stay imported from `worker/preauth`. */
export {
  issueWalletApiKey,
  revokeWalletApiKey,
  resolveWalletFromApiKey,
  createPreauthGrant,
  invalidateActiveGrantsForWallet,
} from "../../../worker/preauth";

export function getPreauthDb(): D1Database {
  return getPaymentsDb() as unknown as D1Database;
}
