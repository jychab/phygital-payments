/** True when `data` starts with the given byte prefix (e.g. instruction discriminator). */
export function bytesMatchPrefix(
  data: ArrayLike<number> | undefined,
  expected: ArrayLike<number>,
): boolean {
  if (!data || data.length < expected.length) return false;
  for (let i = 0; i < expected.length; i++) {
    if (data[i] !== expected[i]) return false;
  }
  return true;
}
