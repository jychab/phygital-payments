"use client";

import { createLocalStore } from "@/lib/local-store";

export type AddressBookEntry = {
  address: string;
  name: string;
  note?: string | null;
  lastUsedAt: number;
  createdAt: number;
};

const MAX_ENTRIES = 64;
export const EMPTY_ADDRESS_BOOK: AddressBookEntry[] = [];

function parseEntries(raw: string | null): AddressBookEntry[] {
  if (!raw) return EMPTY_ADDRESS_BOOK;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return EMPTY_ADDRESS_BOOK;
    return parsed
      .filter((row): row is AddressBookEntry => {
        if (!row || typeof row !== "object") return false;
        const candidate = row as Partial<AddressBookEntry>;
        return (
          typeof candidate.address === "string" &&
          typeof candidate.name === "string" &&
          typeof candidate.lastUsedAt === "number" &&
          typeof candidate.createdAt === "number"
        );
      })
      .sort((a, b) => b.lastUsedAt - a.lastUsedAt)
      .slice(0, MAX_ENTRIES);
  } catch (e) {
    console.warn("[address-book] Failed to parse stored entries", e);
    return EMPTY_ADDRESS_BOOK;
  }
}

export const addressBookStore = createLocalStore<AddressBookEntry>({
  storageKey: "revibase.address-book.v1",
  eventName: "revibase:address-book",
  maxItems: MAX_ENTRIES,
  empty: EMPTY_ADDRESS_BOOK,
  label: "address-book",
  parse: parseEntries,
});

export function listAddressBook(): AddressBookEntry[] {
  return addressBookStore.list() as AddressBookEntry[];
}

export function subscribeAddressBook(onStoreChange: () => void): () => void {
  return addressBookStore.subscribe(onStoreChange);
}

export function upsertAddressBookEntry(input: {
  address: string;
  name: string;
  note?: string | null;
}) {
  const address = input.address.trim();
  const name = input.name.trim();
  if (!address || !name) return;

  const now = Date.now();
  const next: AddressBookEntry = {
    address,
    name,
    note: input.note?.trim() || null,
    lastUsedAt: now,
    createdAt:
      listAddressBook().find((entry) => entry.address === address)?.createdAt ?? now,
  };

  const rest = listAddressBook().filter((entry) => entry.address !== address);
  addressBookStore.write([next, ...rest]);
}

export function touchAddressBookEntry(address: string) {
  const existing = listAddressBook().find((entry) => entry.address === address.trim());
  if (!existing) return;
  upsertAddressBookEntry(existing);
}

export function removeAddressBookEntry(address: string) {
  addressBookStore.write(
    listAddressBook().filter((entry) => entry.address !== address.trim()),
  );
}
