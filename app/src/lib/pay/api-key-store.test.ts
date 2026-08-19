import { afterEach, describe, expect, it } from "vitest";

import {
  clearApiKey,
  hasStoredApiKey,
  maskApiKey,
  readApiKey,
  storeApiKey,
} from "@/lib/pay/api-key-store";

const memory = new Map<string, string>();

function installLocalStorage(): void {
  memory.clear();
  const localStorage = {
    getItem(key: string): string | null {
      return memory.has(key) ? (memory.get(key) as string) : null;
    },
    setItem(key: string, value: string): void {
      memory.set(key, value);
    },
    removeItem(key: string): void {
      memory.delete(key);
    },
  };
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: localStorage,
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: globalThis,
  });
}

afterEach(() => {
  memory.clear();
  Reflect.deleteProperty(globalThis, "localStorage");
  Reflect.deleteProperty(globalThis, "window");
});

describe("maskApiKey", () => {
  it("keeps a short prefix and suffix", () => {
    expect(maskApiKey("ppk_wallet_1_secretpart")).toBe(
      `ppk_${"•".repeat(16)}part`,
    );
  });
});

describe("per-wallet API key storage", () => {
  it("stores and replaces a key under the wallet address", () => {
    installLocalStorage();
    const wallet = "Wallet111111111111111111111111111111111";
    storeApiKey(wallet, "ppk_old");
    expect(readApiKey(wallet)).toBe("ppk_old");
    storeApiKey(wallet, "ppk_new");
    expect(readApiKey(wallet)).toBe("ppk_new");
    expect(hasStoredApiKey(wallet)).toBe(true);
  });

  it("keeps keys for different wallets separate", () => {
    installLocalStorage();
    storeApiKey("aaa", "ppk_a");
    storeApiKey("bbb", "ppk_b");
    expect(readApiKey("aaa")).toBe("ppk_a");
    expect(readApiKey("bbb")).toBe("ppk_b");
    clearApiKey("aaa");
    expect(hasStoredApiKey("aaa")).toBe(false);
    expect(readApiKey("bbb")).toBe("ppk_b");
  });
});
