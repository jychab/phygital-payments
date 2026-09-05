/**
 * Revibase co-signer: POST `/preview` + POST `/sign` for phygital-wallet `execute`.
 *
 * Instruction policy is authored with **`phygital-verifier-sdk`**.
 * This folder is the Worker HTTP + D1 approval surface, not a fork template.
 */
import { Hono } from "hono";

import { previewRoutes } from "@/verifier/preview";
import { signRoutes } from "@/verifier/sign";

export const verifierRoutes = new Hono();

verifierRoutes.route("/", previewRoutes);
verifierRoutes.route("/", signRoutes);
