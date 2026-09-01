import type { QueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queries";

/** Mark this browser's API key live in the preauth cache after provision. */
export function markApiKeyVerified(queryClient: QueryClient, wallet: string) {
  queryClient.setQueryData(
    queryKeys.preauthRequired.byWallet(wallet),
    (prev: { required?: boolean; keyOk?: boolean } | undefined) => ({
      required: prev?.required ?? true,
      keyOk: true,
    }),
  );
}
