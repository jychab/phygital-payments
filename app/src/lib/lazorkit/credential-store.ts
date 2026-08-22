import { address, type Address } from "@solana/kit";

import { bytesToBase64, base64ToBytes } from "@/lib/crypto/base64";

const DB_NAME = "phygital.lazorkit";
const STORE = "session";
const SESSION_KEY = "current";

export type SmartWalletSession = {
  vaultPda: Address;
  walletPda: Address;
  authorityPda: Address;
  credentialId: Uint8Array;
  compressedPubkey: Uint8Array;
  userSeed: Uint8Array;
  rpId: string;
};

type SessionWire = {
  vaultPda: string;
  walletPda: string;
  authorityPda: string;
  credentialId: string;
  compressedPubkey: string;
  userSeed: string;
  rpId: string;
};

function toWire(session: SmartWalletSession): SessionWire {
  return {
    vaultPda: String(session.vaultPda),
    walletPda: String(session.walletPda),
    authorityPda: String(session.authorityPda),
    credentialId: bytesToBase64(session.credentialId),
    compressedPubkey: bytesToBase64(session.compressedPubkey),
    userSeed: bytesToBase64(session.userSeed),
    rpId: session.rpId,
  };
}

function fromWire(wire: SessionWire): SmartWalletSession {
  return {
    vaultPda: address(wire.vaultPda),
    walletPda: address(wire.walletPda),
    authorityPda: address(wire.authorityPda),
    credentialId: base64ToBytes(wire.credentialId),
    compressedPubkey: base64ToBytes(wire.compressedPubkey),
    userSeed: base64ToBytes(wire.userSeed),
    rpId: wire.rpId,
  };
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
  });
}

async function idbGet(): Promise<SessionWire | null> {
  if (typeof indexedDB === "undefined") return null;
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(SESSION_KEY);
      req.onsuccess = () => resolve((req.result as SessionWire | undefined) ?? null);
      req.onerror = () => reject(req.error ?? new Error("IndexedDB read failed"));
    });
  } catch {
    return null;
  }
}

async function idbSet(wire: SessionWire | null): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      const req = wire ? store.put(wire, SESSION_KEY) : store.delete(SESSION_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error ?? new Error("IndexedDB write failed"));
    });
  } catch {
    /* private mode */
  }
}

export async function loadSmartWalletSession(): Promise<SmartWalletSession | null> {
  const wire = await idbGet();
  return wire ? fromWire(wire) : null;
}

export async function saveSmartWalletSession(
  session: SmartWalletSession,
): Promise<void> {
  await idbSet(toWire(session));
}

export async function clearSmartWalletSession(): Promise<void> {
  await idbSet(null);
}
