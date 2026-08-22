export type ParsedTask = {
  label: string;
  spendingLimitSol: string | null;
};

const DCA_RE =
  /^\s*(?:dca|swap|buy)\s+(?:(\d+(?:\.\d+)?)\s*sol\s+(?:into|to|for)\s+)?(.+?)(?:\s+(?:daily|weekly|every\s+day|every\s+week))?\.?\s*$/i;

/** In-app NL → autonomous agent task draft. Local only. */
export function parseTaskIntent(raw: string): ParsedTask | null {
  const text = raw.trim();
  if (!text) return null;

  const dca = DCA_RE.exec(text);
  if (dca) {
    const amount = dca[1]?.trim();
    let target = dca[2]?.trim() ?? "";
    target = target.replace(/^(?:into|to|for)\s+/i, "").trim();
    if (!target) return null;
    const cadence = /\b(weekly|every\s+week)\b/i.test(text) ? "weekly" : "daily";
    const label = amount
      ? `Swap ${amount} SOL to ${target} ${cadence}`
      : `DCA into ${target} ${cadence}`;
    return {
      label,
      spendingLimitSol: amount ?? null,
    };
  }

  if (/^(automate|schedule|recurring|task)\b/i.test(text)) {
    const rest = text.replace(/^(automate|schedule|recurring|task)\s+/i, "").trim();
    if (rest.length >= 3) {
      return { label: rest, spendingLimitSol: null };
    }
  }

  return null;
}
