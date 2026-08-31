"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { queryKeys, queryOptions } from "@/lib/queries";
import { queryFetch, readJson } from "@/lib/queries/http";

export type TapVerifyStatus = "pending" | "verified" | "failed";

export type TapVerifyResult = {
  status: "verified" | "failed";
  secp256r1PublicKey?: string;
  counter?: number;
  reentry?: boolean;
};

async function fetchTapVerification(
  params: URLSearchParams,
): Promise<TapVerifyResult> {
  if (!["pk", "s", "c", "n"].every((k) => params.get(k))) {
    throw new Error("Missing tap parameters");
  }

  const res = await queryFetch(`/api/verify-tap?${params.toString()}`);
  const body = await readJson<{
    isVerified?: boolean;
    secp256r1PublicKey?: string;
    counter?: number;
    reentry?: boolean;
    error?: string;
  }>(res, "verification failed");

  if (!body.isVerified) {
    throw new Error(body.error ?? "verification failed");
  }

  return {
    status: "verified",
    secp256r1PublicKey: body.secp256r1PublicKey,
    counter: body.counter,
    reentry: body.reentry,
  };
}

/**
 * NFC tap URL params (`pk` / `s` / `c` / `n`) for Asset claim / verify.
 * Full tap proof is required — there is no owner-only `?pk=` path.
 */
export function useTapVerify() {
  const params = useSearchParams();

  const pk = params.get("pk");
  const s = params.get("s");
  const c = params.get("c");
  const n = params.get("n");

  const tapParamsString = useMemo(
    () =>
      new URLSearchParams({
        ...(pk ? { pk } : {}),
        ...(s ? { s } : {}),
        ...(c ? { c } : {}),
        ...(n ? { n } : {}),
      }).toString(),
    [pk, s, c, n],
  );

  const hasTapProof = Boolean(pk && s && c && n);

  const verifyQuery = useQuery<TapVerifyResult, Error>({
    queryKey: queryKeys.tapVerify.byParams(tapParamsString),
    queryFn: () => fetchTapVerification(new URLSearchParams(tapParamsString)),
    enabled: hasTapProof,
    // One-shot proof — cache success; never refetch (reconnect would 409).
    ...queryOptions.immutable,
  });

  // Prefer a successful result over a later error status. A reconnect refetch
  // that hits counter replay must not unmount the verified token home.
  const verify: TapVerifyStatus = !hasTapProof
    ? "failed"
    : verifyQuery.data?.status === "verified"
      ? "verified"
      : verifyQuery.isPending
        ? "pending"
        : verifyQuery.isError
          ? "failed"
          : "pending";

  const verifyPending =
    hasTapProof && verify === "pending" && !verifyQuery.data;

  return {
    pk,
    hasTapProof,
    verify,
    verifyPending,
  };
}
