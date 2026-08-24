import { afterEach, describe, expect, it, vi } from "vitest";

const getSignatureStatuses = vi.fn();
const getBlockHeight = vi.fn();
const signatureNotifications = vi.fn();

vi.mock("@/lib/solana/rpc", () => ({
  getSolanaRpc: () => ({
    getSignatureStatuses: (...args: unknown[]) => ({
      send: () => getSignatureStatuses(...args),
    }),
    getBlockHeight: (...args: unknown[]) => ({
      send: () => getBlockHeight(...args),
    }),
  }),
  getSolanaRpcSubscriptions: () => ({
    signatureNotifications: (...args: unknown[]) => ({
      subscribe: () => signatureNotifications(...args),
    }),
  }),
}));

import { waitForSignatureConfirmed } from "./wait-for-confirmation";

afterEach(() => {
  vi.clearAllMocks();
  vi.useRealTimers();
});

describe("waitForSignatureConfirmed", () => {
  it("returns immediately when status is already confirmed", async () => {
    getSignatureStatuses.mockResolvedValue({
      value: [{ err: null, confirmationStatus: "confirmed" }],
    });
    signatureNotifications.mockRejectedValue(new Error("ws unused"));

    await waitForSignatureConfirmed("sig111", 100);

    expect(getSignatureStatuses).toHaveBeenCalledTimes(1);
  });

  it("rejects on on-chain error from status lookup", async () => {
    getSignatureStatuses.mockResolvedValue({
      value: [{ err: { InstructionError: [0, "Custom"] }, confirmationStatus: null }],
    });

    await expect(waitForSignatureConfirmed("sig222", 100)).rejects.toThrow(
      /Transaction failed on-chain/,
    );
  });

  it("polls until confirmed when websocket fails", async () => {
    vi.useFakeTimers();
    getSignatureStatuses
      .mockResolvedValueOnce({ value: [null] })
      .mockResolvedValueOnce({ value: [null] })
      .mockResolvedValueOnce({
        value: [{ err: null, confirmationStatus: "confirmed" }],
      });
    getBlockHeight.mockResolvedValue(50n);
    signatureNotifications.mockRejectedValue(new Error("ws down"));

    const pending = waitForSignatureConfirmed("sig333", 200);
    await vi.advanceTimersByTimeAsync(1_500);
    await vi.advanceTimersByTimeAsync(1_500);
    await pending;

    expect(getSignatureStatuses.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it("times out when block height exceeds lastValidBlockHeight", async () => {
    getSignatureStatuses.mockResolvedValue({ value: [null] });
    getBlockHeight.mockResolvedValue(500n);
    signatureNotifications.mockRejectedValue(new Error("ws down"));

    await expect(waitForSignatureConfirmed("sig444", 100)).rejects.toThrow(
      /timed out waiting for sponsored/,
    );
  });
});
