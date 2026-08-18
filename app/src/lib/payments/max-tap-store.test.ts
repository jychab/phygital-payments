import { afterEach, describe, expect, it } from "vitest";

import { DEFAULT_PAY_AMOUNT_UI } from "@/lib/payments/payment-token";
import {
  hasStoredMaxTapAmount,
  parseMaxTapAmountUi,
  readMaxTapAmountUi,
  storeMaxTapAmountUi,
} from "@/lib/payments/max-tap-store";

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

describe("parseMaxTapAmountUi", () => {
  it("accepts positive decimals and drops trailing integer noise", () => {
    expect(parseMaxTapAmountUi("100")).toBe("100");
    expect(parseMaxTapAmountUi(" 20.5 ")).toBe("20.5");
    expect(parseMaxTapAmountUi("0")).toBeNull();
    expect(parseMaxTapAmountUi("")).toBeNull();
    expect(parseMaxTapAmountUi("nope")).toBeNull();
  });
});

describe("read / store max tap amount", () => {
  it("defaults to 100 when nothing is stored", () => {
    installLocalStorage();
    expect(readMaxTapAmountUi("Wallet111")).toBe(DEFAULT_PAY_AMOUNT_UI);
    expect(hasStoredMaxTapAmount("Wallet111")).toBe(false);
  });

  it("persists per wallet and ignores another wallet", () => {
    installLocalStorage();
    storeMaxTapAmountUi("Wallet111", "40");
    expect(readMaxTapAmountUi("Wallet111")).toBe("40");
    expect(hasStoredMaxTapAmount("Wallet111")).toBe(true);
    expect(readMaxTapAmountUi("Wallet222")).toBe(DEFAULT_PAY_AMOUNT_UI);
    expect(hasStoredMaxTapAmount("Wallet222")).toBe(false);
  });

  it("rejects invalid amounts", () => {
    installLocalStorage();
    expect(() => storeMaxTapAmountUi("Wallet111", "0")).toThrow(
      /valid amount/i,
    );
  });
});
