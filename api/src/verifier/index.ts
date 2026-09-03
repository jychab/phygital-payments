/**
 * Phygital wallet verifier template.
 *
 * Start here:
 * 1. Read `README.md`
 * 2. Skim `preview.ts` + `sign.ts` (HTTP surface)
 * 3. Replace `approval/` (or rewire `authorize.ts`) with your own rules
 */
import { Hono } from "hono";

import { previewRoutes } from "@/verifier/preview";
import { signRoutes } from "@/verifier/sign";

export const verifierRoutes = new Hono();

verifierRoutes.route("/", previewRoutes);
verifierRoutes.route("/", signRoutes);
