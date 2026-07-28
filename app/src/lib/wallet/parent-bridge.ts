"use client";

import { base64ToBytes, bytesToBase64 } from "@/lib/payments/submitter-types";

/**
 * postMessage bridge that lets a parent window act as the wallet when
 * Phygital Pay is embedded as an iframe. The parent owns the keys / Privy
 * session; this iframe asks it for the connected address and forwards
 * transactions to it for signing.
 *
 * Protocol (all messages share `{ channel, v }`):
 *
 *   child → parent
 *     { kind: "connect" }                                  handshake probe
 *     { kind: "sign-transactions", id, transactions }      base64 wire txs
 *     { kind: "disconnect" }
 *
 *   parent → child
 *     { kind: "ready", address }                           handshake ack
 *     { kind: "accounts-changed", address | null }         wallet switched
 *     { kind: "sign-transactions:result", id, transactions }  signed base64 wires
 *     { kind: "sign-transactions:error", id, message }
 *
 * The parent must sign each wire transaction as-is (the iframe builds the full
 * transaction message, including fee payer) and return the fully-signed wire.
 */

export const BRIDGE_CHANNEL = "phygital-pay";
export const BRIDGE_VERSION = 1;

const CONNECT_PROBE_INTERVAL_MS = 150;
const SIGN_TIMEOUT_MS = 120_000;

type OutboundKind = "connect" | "sign-transactions" | "disconnect";

type InboundMessage =
  | { kind: "ready"; address: string }
  | { kind: "accounts-changed"; address: string | null }
  | { kind: "sign-transactions:result"; id: number; transactions: string[] }
  | { kind: "sign-transactions:error"; id: number; message: string };

type PendingSign = {
  resolve: (wires: Uint8Array[]) => void;
  reject: (error: Error) => void;
  timer: ReturnType<typeof setTimeout>;
};

/** True when this document is rendered inside another (cross- or same-origin). */
export function isInIframe(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    // Cross-origin access to window.top throws — which means we are framed.
    return true;
  }
}

function parseAllowedOrigins(): string[] | null {
  const raw = process.env.NEXT_PUBLIC_PARENT_ORIGINS?.trim();
  if (!raw) return null;
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return list.length > 0 ? list : null;
}

export class ParentBridge {
  /** Origin used for outbound postMessage; pinned to the parent after "ready". */
  private targetOrigin = "*";
  private readonly allowedOrigins = parseAllowedOrigins();
  private readonly pending = new Map<number, PendingSign>();
  private nextId = 1;
  private connected = false;
  private accountsChangedCb: ((address: string | null) => void) | null = null;
  /** Cancels an in-flight `connect()` handshake (probe interval + timeout). */
  private cancelConnect: (() => void) | null = null;
  private readonly listener = (event: MessageEvent) => this.handleMessage(event);

  start(): void {
    if (typeof window === "undefined") return;
    window.addEventListener("message", this.listener);
  }

  stop(): void {
    if (typeof window === "undefined") return;
    window.removeEventListener("message", this.listener);
    this.cancelConnect?.();
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(new Error("Wallet bridge closed"));
    }
    this.pending.clear();
    this.connected = false;
  }

  onAccountsChanged(cb: (address: string | null) => void): void {
    this.accountsChangedCb = cb;
  }

  /**
   * Send handshake probes until the parent replies "ready" or `timeoutMs`
   * elapses. Resolves with the connected address, or null if the parent never
   * responds (i.e. it does not support the bridge — caller falls back to Privy).
   */
  connect(timeoutMs: number): Promise<string | null> {
    if (typeof window === "undefined" || window.parent === window) {
      return Promise.resolve(null);
    }
    return new Promise((resolve) => {
      let settled = false;
      const finish = (address: string | null) => {
        if (settled) return;
        settled = true;
        clearInterval(probe);
        clearTimeout(timer);
        this.connectResolver = null;
        this.cancelConnect = null;
        resolve(address);
      };
      this.connectResolver = (address, origin) => {
        this.connected = true;
        if (this.targetOrigin === "*" && origin && origin !== "null") {
          this.targetOrigin = origin;
        }
        finish(address);
      };
      // Aborts the handshake without connecting (e.g. on unmount via stop()).
      this.cancelConnect = () => finish(null);
      // Probe repeatedly: the parent may attach its listener after we mount.
      this.post("connect");
      const probe = setInterval(() => this.post("connect"), CONNECT_PROBE_INTERVAL_MS);
      const timer = setTimeout(() => finish(null), timeoutMs);
    });
  }

  private connectResolver:
    | ((address: string, origin: string) => void)
    | null = null;

  async signWires(wires: Uint8Array[]): Promise<Uint8Array[]> {
    if (!this.connected) {
      throw new Error("Parent wallet is not connected");
    }
    const id = this.nextId++;
    const transactions = wires.map((wire) => bytesToBase64(wire));
    const result = new Promise<Uint8Array[]>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error("Timed out waiting for the parent to sign"));
      }, SIGN_TIMEOUT_MS);
      this.pending.set(id, { resolve, reject, timer });
    });
    this.post("sign-transactions", { id, transactions });
    return result;
  }

  disconnect(): void {
    if (this.connected) this.post("disconnect");
    this.connected = false;
  }

  private post(kind: OutboundKind, payload?: Record<string, unknown>): void {
    if (typeof window === "undefined") return;
    window.parent.postMessage(
      { channel: BRIDGE_CHANNEL, v: BRIDGE_VERSION, kind, ...payload },
      this.targetOrigin,
    );
  }

  private handleMessage(event: MessageEvent): void {
    if (event.source !== window.parent) return;
    const data = event.data as
      | ({ channel?: unknown; v?: unknown } & Partial<InboundMessage>)
      | null;
    if (!data || data.channel !== BRIDGE_CHANNEL || data.v !== BRIDGE_VERSION) {
      return;
    }
    if (this.allowedOrigins && !this.allowedOrigins.includes(event.origin)) {
      return;
    }
    // Once pinned, only accept messages from the pinned parent origin.
    if (this.targetOrigin !== "*" && event.origin !== this.targetOrigin) {
      return;
    }

    switch (data.kind) {
      case "ready": {
        if (typeof data.address === "string" && data.address.length > 0) {
          this.connectResolver?.(data.address, event.origin);
        }
        return;
      }
      case "accounts-changed": {
        const address =
          typeof data.address === "string" && data.address.length > 0
            ? data.address
            : null;
        this.accountsChangedCb?.(address);
        return;
      }
      case "sign-transactions:result": {
        const pending = this.takePending(data.id);
        if (!pending) return;
        try {
          const wires = (data.transactions ?? []).map((tx) =>
            base64ToBytes(tx),
          );
          pending.resolve(wires);
        } catch (error) {
          pending.reject(
            error instanceof Error
              ? error
              : new Error("Malformed signed transaction from parent"),
          );
        }
        return;
      }
      case "sign-transactions:error": {
        const pending = this.takePending(data.id);
        pending?.reject(new Error(data.message || "Parent declined to sign"));
        return;
      }
      default:
        return;
    }
  }

  private takePending(id: unknown): PendingSign | null {
    if (typeof id !== "number") return null;
    const pending = this.pending.get(id);
    if (!pending) return null;
    clearTimeout(pending.timer);
    this.pending.delete(id);
    return pending;
  }
}

export function getIframeProbeTimeoutMs(): number {
  const raw = Number(process.env.NEXT_PUBLIC_IFRAME_PROBE_TIMEOUT_MS);
  return Number.isFinite(raw) && raw > 0 ? raw : 1200;
}
