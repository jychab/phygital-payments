"use client";

import { useQuery } from "@tanstack/react-query";
import type { Address } from "@solana/kit";

import { queryFetch, queryKeys, queryOptions, readJson } from "@/lib/queries";
import type { AgentSessionDetail } from "@/lib/server/agent-policy";

async function fetchAgentSessions(vaultPda: Address) {
  const res = await queryFetch(
    `/api/agent/grant?vault=${encodeURIComponent(String(vaultPda))}`,
  );
  const body = await readJson<{ agents: AgentSessionDetail[] }>(
    res,
    "Couldn’t load",
  );
  return body.agents;
}

export function useAgentSessions(vaultPda: Address | null) {
  return useQuery({
    queryKey: queryKeys.agentSession.byVault(vaultPda ? String(vaultPda) : null),
    queryFn: async () => {
      if (!vaultPda) return [];
      return fetchAgentSessions(vaultPda);
    },
    enabled: Boolean(vaultPda),
    ...queryOptions.recent,
  });
}
