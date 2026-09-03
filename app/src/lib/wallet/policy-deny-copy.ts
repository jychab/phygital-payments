import { PolicyDeniedError } from "phygital-wallet-sdk";

import { copy } from "@/lib/copy/phygital";

export function policySoftDenyBody(deny: PolicyDeniedError): string {
  if (deny.code === "spend_limit") {
    const limit =
      typeof deny.details?.limitUi === "string" ? deny.details.limitUi : null;
    return limit ? copy.wallet.approveSendBodyLimit(limit) : deny.message;
  }
  if (deny.code === "recipient_not_allowed") {
    return copy.wallet.approveSendBodyRecipient;
  }
  if (deny.code === "outside_time_window") {
    return copy.wallet.approveSendBodyTime;
  }
  return deny.message;
}
