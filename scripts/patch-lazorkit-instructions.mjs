/**
 * Overlays runtime-correct instruction encoders onto Codama output.
 * Source of truth: clients/js/lazor_kit/patches/instructions/
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const patchDir = join(root, "clients/js/lazor_kit/patches/instructions");
const generatedDir = join(root, "clients/js/lazor_kit/src/generated/instructions");

const files = [
  "createWallet.ts",
  "execute.ts",
  "createSession.ts",
  "executeDeferred.ts",
];

for (const file of files) {
  const src = join(patchDir, file);
  const dest = join(generatedDir, file);
  if (!existsSync(src)) {
    throw new Error(`Missing patch overlay: ${src}`);
  }
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(src, dest);
}

console.log(`Patched ${files.length} lazor-kit instruction encoders.`);
