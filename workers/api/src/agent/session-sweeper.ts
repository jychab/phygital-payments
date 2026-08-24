import { liveSessionPdas } from "./session-live";
import { getAppDb } from "@/platform/app-db";

const BATCH_SIZE = 100;

/** Remove D1 agent rows whose on-chain session no longer exists. */
export async function sweepOrphanedAgentSessions(): Promise<number> {
  const { results } = await getAppDb()
    .prepare(`SELECT session_pda FROM agent_sessions LIMIT ?`)
    .bind(BATCH_SIZE)
    .all<{ session_pda: string }>();
  const sessionPdas = (results ?? []).map((row) => row.session_pda);
  if (sessionPdas.length === 0) return 0;

  const live = await liveSessionPdas(sessionPdas);
  const orphans = sessionPdas.filter((sessionPda) => !live.has(sessionPda));
  if (orphans.length === 0) return 0;

  const result = await getAppDb()
    .prepare(
      `DELETE FROM agent_sessions WHERE session_pda IN (${orphans.map(() => "?").join(",")})`,
    )
    .bind(...orphans)
    .run();
  return result.meta.changes ?? 0;
}
