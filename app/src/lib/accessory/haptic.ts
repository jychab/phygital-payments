export function hapticTap() {
  try {
    navigator.vibrate?.(30);
  } catch {
    /* ignore */
  }
}
