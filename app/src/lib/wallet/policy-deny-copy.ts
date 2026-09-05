import { PolicyDeniedError } from "phygital-wallet-sdk";

import { copy } from "@/lib/copy/phygital";
import { shortAddress } from "@/lib/utils";

export function policySoftDenyBody(deny: PolicyDeniedError): string {
  if (deny.code === "spend_limit") {
    const limit =
      typeof deny.details?.limitUi === "string" ? deny.details.limitUi : null;
    return limit ? copy.wallet.approveSendBodyLimit(limit) : deny.message;
  }
  if (deny.code === "recipient_not_allowed") {
    return copy.wallet.approveSendBodyRecipient;
  }
  if (deny.code === "recipient_denied") {
    return copy.wallet.approveSendBodyRecipientDenied;
  }
  if (deny.code === "outside_time_window") {
    return copy.wallet.approveSendBodyTime;
  }
  if (deny.code === "approval_required") {
    return copy.wallet.approveSendBodyApproval;
  }
  if (deny.code === "instruction_not_allowed") {
    return deny.message || copy.wallet.approveSendBodyInstruction;
  }
  if (deny.code === "program_not_allowed") {
    return copy.wallet.approveSendBodyProgram;
  }
  if (deny.code === "unexpected_instruction") {
    return copy.wallet.approveSendBodyUnexpected;
  }
  return deny.message;
}

/** Structured rows for Approve-once (destination / amount / mint / program). */
export function policyApprovalDetailRows(
  details: Record<string, unknown> | null | undefined,
): { label: string; value: string }[] {
  if (!details) return [];
  const rows: { label: string; value: string }[] = [];

  const destination =
    typeof details.destination === "string" ? details.destination : null;
  if (destination) {
    rows.push({
      label: copy.wallet.approveSendDestination,
      value: shortAddress(destination, 6),
    });
  }

  const requestedUi =
    typeof details.requestedUi === "string" ? details.requestedUi : null;
  const amount = typeof details.amount === "string" ? details.amount : null;
  if (requestedUi) {
    rows.push({
      label: copy.wallet.approveSendAmount,
      value: `$${requestedUi}`,
    });
  } else if (amount) {
    rows.push({
      label: copy.wallet.approveSendAmount,
      value: amount,
    });
  }

  const mint = typeof details.mint === "string" ? details.mint : null;
  if (mint) {
    rows.push({
      label: copy.wallet.approveSendMint,
      value: shortAddress(mint, 4),
    });
  }

  const instructionName =
    typeof details.instructionName === "string"
      ? details.instructionName
      : null;
  if (instructionName) {
    rows.push({
      label: copy.wallet.approveSendInstruction,
      value: instructionName,
    });
  }

  const programId =
    typeof details.programId === "string" ? details.programId : null;
  if (programId) {
    rows.push({
      label: copy.wallet.approveSendProgram,
      value: shortAddress(programId, 4),
    });
  }

  return rows;
}
