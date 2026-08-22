import { readFileSync, writeFileSync } from "node:fs";

const MAINNET = "LazorjRFNavitUaBu5m3WaNPjU1maipvSW2rZfAFAKi";
const target = "clients/js/lazor_kit/src/generated/programs/lazorkitProgram.ts";

let src = readFileSync(target, "utf8");
const replacement = `export const LAZORKIT_PROGRAM_PROGRAM_ADDRESS =
  "${MAINNET}" as Address<"${MAINNET}">;`;

if (!src.includes('export const LAZORKIT_PROGRAM_PROGRAM_ADDRESS')) {
  throw new Error(`Expected LAZORKIT_PROGRAM_PROGRAM_ADDRESS in ${target}`);
}

src = src.replace(
  /export const LAZORKIT_PROGRAM_PROGRAM_ADDRESS =[\s\S]*?;/,
  replacement,
);
writeFileSync(target, src);
