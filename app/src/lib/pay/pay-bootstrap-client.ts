import { queryFetch, readJson } from "@/lib/queries/http";
import {
  parsePayBootstrap,
  type PayBootstrap,
  type PayBootstrapWire,
} from "@/lib/pay/pay-bootstrap-wire";

export async function fetchPayBootstrapClient(
  owner: string,
): Promise<PayBootstrap> {
  const res = await queryFetch(
    `/api/pay/bootstrap?owner=${encodeURIComponent(owner)}`,
  );
  const body = await readJson<PayBootstrapWire>(res, "Couldn’t load Pay");
  return parsePayBootstrap(body);
}
