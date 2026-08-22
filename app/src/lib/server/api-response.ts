import { NextResponse } from "next/server";

import { QUERY_NO_STORE } from "@/lib/queries/http";

export function apiJson(
  body: unknown,
  status = 200,
  extraHeaders?: Record<string, string>,
) {
  return NextResponse.json(body, {
    status,
    headers: { ...QUERY_NO_STORE, ...extraHeaders },
  });
}

export const CORS_HEADERS = {
  ...QUERY_NO_STORE,
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

export function corsJson(body: unknown, status = 200) {
  return apiJson(body, status, CORS_HEADERS);
}

export function corsOptions(methods: string) {
  return new NextResponse(null, {
    status: 204,
    headers: { ...CORS_HEADERS, "Access-Control-Allow-Methods": methods },
  });
}
