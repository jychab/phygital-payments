/** Truncate an address to `head…tail` for compact, verifiable display. */
export function shortAddress(value: string, length = 4): string {
  if (value.length <= length * 2 + 1) return value;
  return `${value.slice(0, length)}…${value.slice(-length)}`;
}

export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  return error instanceof Error ? error.message : fallback;
}
