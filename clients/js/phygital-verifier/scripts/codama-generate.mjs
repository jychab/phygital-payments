#!/usr/bin/env node
/**
 * Generate a full-IDL parser module (exact IDL instruction/field names).
 *
 * Accepts Codama, Shank, or Anchor IDLs.
 *
 *   pnpm exec phygital-verifier-generate --idl ./idls/my.json --out ./src/parsers/my.generated.ts
 *   npx phygital-verifier-generate --idl ./idls/my.json --out ./my.ts --program-id <addr>
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { generateFromIdl } from "./lib/idl-to-parser.mjs";

function parseArgs(argv) {
  const out = { idl: null, outFile: null, programId: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--idl") out.idl = argv[++i];
    else if (a === "--out") out.outFile = argv[++i];
    else if (a === "--program-id") out.programId = argv[++i];
    else if (a === "--help" || a === "-h") out.help = true;
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (args.help || !args.idl || !args.outFile) {
  console.log(`Usage: phygital-verifier-generate --idl <path.json> --out <path.ts> [--program-id <addr>]

Generates tryDecode + FIELD_SCHEMA for every instruction.
Supports Codama, Shank, and Anchor IDL JSON.
Instruction and field names match the IDL exactly (no renames).`);
  process.exit(args.help ? 0 : 1);
}

const idlPath = resolve(args.idl);
const outPath = resolve(args.outFile);
const idl = JSON.parse(await readFile(idlPath, "utf8"));

let result;
try {
  result = generateFromIdl(idl, {
    programId: args.programId ?? undefined,
  });
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}

const { format, programId, schema, source, warnings } = result;

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, source);

console.log(`wrote ${outPath}`);
console.log(`format=${format}`);
console.log(`PROGRAM_ID=${programId}`);
if (warnings?.length) {
  console.log("warnings:");
  for (const w of warnings) console.log(`  - ${w}`);
}
console.log("FIELD_SCHEMA instructions:");
for (const entry of schema) {
  const fields = entry.fields.map((f) => `${f.name}:${f.type}`).join(", ");
  console.log(`  ${entry.instruction} { ${fields} }`);
}
console.log(`
Wrap with fromGenerated / ProgramParser, then:

  createVerifier({ parsers: [...STANDARD_PARSERS, myParser] })
  definePolicy([...standardPolicy(), defineProgram(myParser, { allows: [...] })])
`);
