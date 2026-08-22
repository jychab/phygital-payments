/**
 * Wipe app client storage on disconnect (preauth keys, passkey session, etc.).
 */

const APP_STORAGE_PREFIXES = ["phygital."] as const;

function clearAppKeys(storage: Storage): void {
  const toRemove: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key) continue;
    if (APP_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      toRemove.push(key);
    }
  }
  for (const key of toRemove) {
    storage.removeItem(key);
  }
}

/** Clear app-owned localStorage / sessionStorage keys for this origin. */
export function clearAppClientStorage(): void {
  if (typeof window === "undefined") return;
  try {
    clearAppKeys(window.localStorage);
  } catch {
    /* private mode / blocked */
  }
  try {
    clearAppKeys(window.sessionStorage);
  } catch {
    /* private mode / blocked */
  }
}
