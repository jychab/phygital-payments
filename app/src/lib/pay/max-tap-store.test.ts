import { afterEach, describe, expect, it } from "vitest";

import { DEFAULT_PAY_AMOUNT_UI } from "@/lib/tokens/payment-token";
import { getUsdcMint } from "@/lib/tokens/usdc-mint";
import {
  hasStoredMaxTapAmount,
  parseMaxTapAmountUi,
  readMaxTapAmountUi,
  storeMaxTapAmountUi,
} from "@/lib/pay/max-tap-store";

const USDC = String(getUsdcMint());
const OTHER = "OtherMint111111111111111111111111111111111";

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
    removeItem(key: string): string {
      memory.delete(key);
      return key;
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
  it("defaults USDC to 100 when nothing is stored", () => {
    installLocalStorage();
    expect(readMaxTapAmountUi("Wallet111", USDC)).toBe(DEFAULT_PAY_AMOUNT_UI);
    expect(hasStoredMaxTapAmount("Wallet111", USDC)).toBe(false);
  });

  it("does not default non-USDC mints", () => {
    installLocalStorage();
    expect(readMaxTapAmountUi("Wallet111", OTHER)).toBeNull();
    expect(hasStoredMaxTapAmount("Wallet111", OTHER)).toBe(false);
  });

  it("persists per wallet and mint", () => {
    installLocalStorage();
    storeMaxTapAmountUi("Wallet111", USDC, "40");
    expect(readMaxTapAmountUi("Wallet111", USDC)).toBe("40");
    expect(hasStoredMaxTapAmount("Wallet111", USDC)).toBe(true);
    expect(readMaxTapAmountUi("Wallet222", USDC)).toBe(DEFAULT_PAY_AMOUNT_UI);
    expect(readMaxTapAmountUi("Wallet111", OTHER)).toBeNull();
    storeMaxTapAmountUi("Wallet111", OTHER, "15");
    expect(readMaxTapAmountUi("Wallet111", USDC)).toBe("40");
    expect(readMaxTapAmountUi("Wallet111", OTHER)).toBe("15");
  });

  it("reads the legacy per-wallet key as USDC", () => {
    installLocalStorage();
    memory.set("phygital.pay.maxTapAmountUi.Wallet111", "25");
    expect(readMaxTapAmountUi("Wallet111", USDC)).toBe("25");
    expect(readMaxTapAmountUi("Wallet111", OTHER)).toBeNull();
  });

  it("rejects invalid amounts", () => {
    installLocalStorage();
    expect(() => storeMaxTapAmountUi("Wallet111", USDC, "0")).toThrow(
      /valid amount/i,
    );
  });
});
