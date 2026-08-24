"use client";

import { useMutation } from "@tanstack/react-query";

import { authenticatePhygital } from "@/lib/phygital/authenticate";

export function useAuthenticatePhygital() {
  const mutation = useMutation({
    mutationFn: (args?: { expectedPublicKey?: string }) => authenticatePhygital(args),
  });

  return {
    authenticate: (args?: { expectedPublicKey?: string }) => mutation.mutateAsync(args),
    pending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}
