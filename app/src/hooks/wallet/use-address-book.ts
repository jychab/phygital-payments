"use client";

import { addressBookStore } from "@/lib/wallet/address-book";
import { useLocalStore } from "@/hooks/use-local-store";

export function useAddressBook() {
  return useLocalStore(addressBookStore);
}
