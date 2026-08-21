export const REQUIRED_MESSAGE_PREFIX = "phygital-pay:required:";

/**
 * Whether a wallet requires an open preauth grant before Revi will settle.
 * Unset + generation 0 → off. Unset + generation > 0 → on. Explicit toggle wins.
 */
export function resolveRequirePreauth(
  stored: boolean | null | undefined,
  generation: number,
): boolean {
  if (typeof stored === "boolean") return stored;
  return generation > 0;
}

export type PreauthPayState = {
  required: boolean;
  keyOk: boolean;
};
