import { getEnv } from "@/lib/server/request-context";

type ApiMetric = {
  route: string;
  status: number;
  latencyMs: number;
  extras?: number[];
};

export function recordApiMetric(metric: ApiMetric): void {
  try {
    const env = getEnv();
    const dataset = env.ANALYTICS;
    if (!dataset) return;
    dataset.writeDataPoint({
      indexes: [metric.route, String(metric.status)],
      doubles: [metric.latencyMs, ...(metric.extras ?? [])],
    });
  } catch {
    /* analytics must never break requests */
  }
}

export async function withApiMetrics(
  route: string,
  fn: () => Promise<Response>,
): Promise<Response> {
  const started = Date.now();
  try {
    const res = await fn();
    void recordApiMetric({
      route,
      status: res.status,
      latencyMs: Date.now() - started,
    });
    return res;
  } catch (error) {
    void recordApiMetric({
      route,
      status: 500,
      latencyMs: Date.now() - started,
    });
    throw error;
  }
}
