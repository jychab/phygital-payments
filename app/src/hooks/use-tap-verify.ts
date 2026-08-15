"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/queries";

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

  const res = await fetch(`/api/verify-tap?${params.toString()}`);
  const body = (await res.json().catch(() => ({}))) as {
    isVerified?: boolean;
    secp256r1PublicKey?: string;
    counter?: number;
    reentry?: boolean;
    error?: string;
  };

  if (!res.ok || !body.isVerified) {
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
    refetchOnWindowFocus: false,
    // Server allows same-counter reentry briefly; cache the successful result.
    staleTime: Infinity,
  });

  const verify: TapVerifyStatus =
    !hasTapProof || verifyQuery.isError
      ? "failed"
      : (verifyQuery.data?.status ?? "pending");

  const verifyPending = hasTapProof && verifyQuery.isPending;

  return {
    pk,
    tapParamsString,
    hasTapProof,
    verify,
    verifyPending,
    verifyError: verifyQuery.error,
  };
}
