/**
 * Built-in Solana program parsers shipped with the SDK.
 *
 * Each parser wraps a full IDL-generated decoder under `./generated/`.
 * Use `parser.fieldSchema` to discover instruction/field names for policies.
 */
import * as ata from "./generated/ata.js";
import * as bubblegum from "./generated/bubblegum.js";
import * as core from "./generated/core.js";
import * as system from "./generated/system.js";
import * as token from "./generated/token.js";
import * as token2022 from "./generated/token-2022.js";
import * as tokenMetadata from "./generated/token-metadata.js";
import type { ProgramParser } from "../core/types.js";
import type { InstructionLayout } from "../core/layout.js";
import { fromGenerated } from "./from-generated.js";
import { indexProgramLayouts } from "./layouts.js";

const LAYOUTS_BY_PROGRAM = indexProgramLayouts();

function layoutsFor(programId: string): InstructionLayout[] | undefined {
  const m = LAYOUTS_BY_PROGRAM.get(programId);
  if (!m) return undefined;
  return [...m.values()];
}

export const tokenParser = fromGenerated(
  token,
  undefined,
  layoutsFor(token.PROGRAM_ID),
);
export const token2022Parser = fromGenerated(
  token2022,
  undefined,
  layoutsFor(token2022.PROGRAM_ID),
);
export const systemParser = fromGenerated(
  system,
  undefined,
  layoutsFor(system.PROGRAM_ID),
);

/** ATA `create` / `createIdempotent` require a disc byte — empty data → Unknown. */
export const ataParser = fromGenerated(
  ata,
  undefined,
  layoutsFor(ata.PROGRAM_ID),
);

export const tokenMetadataParser = fromGenerated(
  tokenMetadata,
  undefined,
  layoutsFor(tokenMetadata.PROGRAM_ID),
);
export const bubblegumParser = fromGenerated(
  bubblegum,
  undefined,
  layoutsFor(bubblegum.PROGRAM_ID),
);
export const coreParser = fromGenerated(
  core,
  undefined,
  layoutsFor(core.PROGRAM_ID),
);

/**
 * All built-in parsers. Pass into createVerifier:
 * `createVerifier({ parsers: [...STANDARD_PARSERS, myParser] })`
 *
 * Compute Budget is intentionally absent — `createVerifier` hard-rejects it.
 */
export const STANDARD_PARSERS: readonly ProgramParser[] = [
  tokenParser,
  token2022Parser,
  systemParser,
  ataParser,
  tokenMetadataParser,
  bubblegumParser,
  coreParser,
];
