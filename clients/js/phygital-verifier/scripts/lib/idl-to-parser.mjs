/**
 * IDL → minimal parser module emitter (Codama, Shank, Anchor).
 * Resolves defined / option / vec / array / enum / struct / bytes / bool.
 * Nested leaves use dotted paths (e.g. transferArgs.amount).
 */
import { createHash } from "node:crypto";

/** Cap dynamic lengths (vec/string/bytes/map) to prevent decode DoS. */
export const MAX_DYNAMIC_LEN = 4096;

function constName(name) {
  return name.toUpperCase().replace(/[^A-Z0-9]+/g, "_") || "IX";
}

/** After reading a numeric length `n`, reject oversized values. */
function emitMaxLenGuard(lines, ind, nExpr) {
  lines.push(`${ind}  if (${nExpr} > ${MAX_DYNAMIC_LEN}) return null;`);
}

/** After reading a bigint length, reject before Number(). */
function emitMaxLenGuardBigint(lines, ind, lenExpr) {
  lines.push(`${ind}  if (${lenExpr} > ${MAX_DYNAMIC_LEN}n) return null;`);
}

function kindOfFormat(fmt) {
  switch (fmt) {
    case "bool":
      return "bool";
    case "u8":
    case "i8":
    case "u16":
    case "i16":
    case "u32":
    case "i32":
      return "number";
    case "f32":
    case "f64":
      return "float";
    case "u64":
    case "i64":
      return "u64";
    case "u128":
    case "i128":
      return "u128";
    default:
      return null;
  }
}

function joinPath(base, name) {
  return base ? `${base}.${name}` : name;
}

function describeType(typeNode) {
  if (typeNode == null) return "missing";
  if (typeof typeNode === "string") return typeNode;
  if (typeNode.kind) return typeNode.kind;
  try {
    return JSON.stringify(typeNode);
  } catch {
    return String(typeNode);
  }
}

/** Detect Codama vs Shank vs Anchor. */
export function detectIdlFormat(idl) {
  if (
    idl?.kind === "rootNode" ||
    idl?.program?.kind === "programNode" ||
    (Array.isArray(idl?.program?.instructions) &&
      idl.program.instructions[0]?.kind === "instructionNode")
  ) {
    return "codama";
  }

  if (!Array.isArray(idl?.instructions)) {
    throw new Error(
      "Unrecognized IDL: expected Codama (program.instructions) or Anchor/Shank (top-level instructions)",
    );
  }

  const origin = idl.metadata?.origin;
  if (origin === "shank") return "shank";
  if (origin === "anchor") return "anchor";

  const hasDiscriminant = idl.instructions.some((ix) => ix.discriminant != null);
  const hasDiscriminator = idl.instructions.some((ix) =>
    Array.isArray(ix.discriminator),
  );
  if (hasDiscriminant && !hasDiscriminator) return "shank";
  return "anchor";
}

export function programIdFromIdl(idl, fallback) {
  if (fallback) return fallback;
  const pk =
    idl.program?.publicKey ??
    idl.address ??
    idl.metadata?.address ??
    idl.metadata?.programId;
  if (typeof pk === "string" && pk.length > 0) return pk;
  throw new Error(
    "Could not determine programId from IDL; pass --program-id",
  );
}

export function anchorDiscriminator(name) {
  return [
    ...createHash("sha256").update(`global:${name}`).digest().subarray(0, 8),
  ];
}

/* ─── TypeSpec ─────────────────────────────────────────────────────────── */

function schemaTypeOf(spec) {
  switch (spec.kind) {
    case "u64":
    case "u128":
      return "bigint";
    case "bool":
      return "bool";
    case "pubkey":
    case "string":
    case "enum":
      return "string";
    case "bytes":
      return "bytes";
    case "vec":
    case "array":
    case "remainderVec":
    case "struct":
      return "json";
    case "option":
      return schemaTypeOf(spec.inner);
    case "number":
      return "number";
    case "float":
      return "number";
    default:
      return "json";
  }
}

/** Collect leaf schema fields for flattened decode paths. */
export function collectSchemaFields(path, spec, out = []) {
  switch (spec.kind) {
    case "struct":
      for (const f of spec.fields) {
        collectSchemaFields(joinPath(path, f.name), f.type, out);
      }
      break;
    case "enum":
      out.push({ name: path, type: "string" });
      for (const v of spec.variants) {
        for (const f of v.fields) {
          collectSchemaFields(joinPath(path, f.name), f.type, out);
        }
      }
      break;
    case "option":
      collectSchemaFields(path, spec.inner, out);
      break;
    case "vec":
    case "array":
    case "hashMap":
      out.push({ name: path, type: "json" });
      break;
    default:
      out.push({ name: path, type: schemaTypeOf(spec) });
  }
  return out;
}

export function buildSchema(instructions) {
  return instructions.map((ix) => {
    const fields = [
      ...ix.accounts.map((a) => ({ name: a.name, type: "string" })),
    ];
    for (const arg of ix.args) {
      collectSchemaFields(arg.name, arg.type, fields);
    }
    // Dedupe by name (enum nested may overlap theoretically)
    const seen = new Set();
    const deduped = [];
    for (const f of fields) {
      if (seen.has(f.name)) continue;
      seen.add(f.name);
      deduped.push(f);
    }
    return { instruction: ix.name, fields: deduped };
  });
}

/* ─── Legacy (Anchor / Shank) type resolution ──────────────────────────── */

function indexLegacyTypes(idl) {
  const map = new Map();
  for (const t of idl.types ?? []) {
    if (t?.name) map.set(t.name, t);
  }
  return map;
}

function resolveLegacyType(typeNode, typesByName, stack = []) {
  if (typeNode == null) {
    throw new Error("missing type");
  }

  if (typeof typeNode === "string") {
    if (typeNode === "publicKey" || typeNode === "pubkey") {
      return { kind: "pubkey" };
    }
    if (typeNode === "string") {
      return { kind: "string", prefix: "u32" };
    }
    if (typeNode === "bytes") {
      return { kind: "bytes", prefix: "u32" };
    }
    if (typeNode === "bool") {
      return { kind: "bool" };
    }
    const kf = kindOfFormat(typeNode);
    if (kf === "u64") return { kind: "u64" };
    if (kf === "u128") return { kind: "u128" };
    if (kf === "bool") return { kind: "bool" };
    if (kf === "float") return { kind: "float", format: typeNode };
    if (kf === "number") return { kind: "number", format: typeNode };
    // Bare defined type name
    if (typesByName.has(typeNode)) {
      return resolveDefinedLegacy(typeNode, typesByName, stack);
    }
    throw new Error(`unsupported type string ${typeNode}`);
  }

  if (typeNode.defined != null) {
    const name =
      typeof typeNode.defined === "string"
        ? typeNode.defined
        : typeNode.defined.name;
    if (!name) throw new Error(`defined type missing name`);
    return resolveDefinedLegacy(name, typesByName, stack);
  }

  if (typeNode.option != null) {
    return {
      kind: "option",
      inner: resolveLegacyType(typeNode.option, typesByName, stack),
    };
  }

  if (typeNode.vec != null) {
    return {
      kind: "vec",
      inner: resolveLegacyType(typeNode.vec, typesByName, stack),
    };
  }

  if (Array.isArray(typeNode.array)) {
    const [inner, len] = typeNode.array;
    return {
      kind: "array",
      len: Number(len),
      inner: resolveLegacyType(inner, typesByName, stack),
    };
  }

  if (Array.isArray(typeNode.tuple)) {
    return {
      kind: "struct",
      fields: typeNode.tuple.map((t, i) => ({
        name: `field${i}`,
        type: resolveLegacyType(t, typesByName, stack),
      })),
    };
  }

  if (Array.isArray(typeNode.hashMap) && typeNode.hashMap.length === 2) {
    return {
      kind: "hashMap",
      key: resolveLegacyType(typeNode.hashMap[0], typesByName, stack),
      value: resolveLegacyType(typeNode.hashMap[1], typesByName, stack),
    };
  }

  if (Array.isArray(typeNode.bTreeMap) && typeNode.bTreeMap.length === 2) {
    return {
      kind: "hashMap",
      key: resolveLegacyType(typeNode.bTreeMap[0], typesByName, stack),
      value: resolveLegacyType(typeNode.bTreeMap[1], typesByName, stack),
    };
  }

  throw new Error(`unsupported type ${describeType(typeNode)}`);
}

function resolveDefinedLegacy(name, typesByName, stack) {
  if (stack.includes(name)) {
    throw new Error(`recursive type ${name}`);
  }
  const def = typesByName.get(name);
  if (!def) throw new Error(`unknown defined type ${name}`);
  const next = [...stack, name];
  const t = def.type;
  if (!t || typeof t !== "object") {
    throw new Error(`defined type ${name} has no type body`);
  }

  if (t.kind === "struct") {
    const fields = [];
    for (const f of t.fields ?? []) {
      if (typeof f === "object" && f.name != null) {
        fields.push({
          name: f.name,
          type: resolveLegacyType(f.type, typesByName, next),
        });
      } else {
        // tuple struct field without name
        fields.push({
          name: `field${fields.length}`,
          type: resolveLegacyType(f, typesByName, next),
        });
      }
    }
    return { kind: "struct", fields };
  }

  if (t.kind === "enum") {
    const variants = [];
    for (const v of t.variants ?? []) {
      const fields = [];
      if (Array.isArray(v.fields)) {
        for (let i = 0; i < v.fields.length; i++) {
          const f = v.fields[i];
          if (typeof f === "object" && f.name != null && f.type != null) {
            fields.push({
              name: f.name,
              type: resolveLegacyType(f.type, typesByName, next),
            });
          } else {
            fields.push({
              name: `field${i}`,
              type: resolveLegacyType(f, typesByName, next),
            });
          }
        }
      }
      variants.push({ name: v.name, fields });
    }
    return { kind: "enum", variants, disc: "u8" };
  }

  // type alias: { type: "u64" } etc. uncommon
  return resolveLegacyType(t, typesByName, next);
}

function mapLegacyArgs(ixName, rawArgs, typesByName) {
  const args = [];
  for (const a of rawArgs ?? []) {
    if (a.name === "discriminator") continue;
    try {
      args.push({
        name: a.name,
        type: resolveLegacyType(a.type, typesByName),
      });
    } catch (err) {
      throw new Error(
        `${ixName}.${a.name}: ${err instanceof Error ? err.message : err}`,
      );
    }
  }
  return args;
}

function accountsFromLegacy(ix) {
  return (ix.accounts ?? []).map((a, index) => ({
    name: a.name,
    index,
    optional: Boolean(a.optional ?? a.isOptional),
  }));
}

function discFromShank(ix) {
  const d = ix.discriminant;
  if (!d || d.value == null) {
    throw new Error(`No discriminant for Shank instruction ${ix.name}`);
  }
  const t = d.type ?? "u8";
  if (t === "u8") return { disc: d.value, discSize: 1 };
  if (t === "u16") {
    const buf = new Uint8Array(2);
    new DataView(buf.buffer).setUint16(0, d.value, true);
    return { disc: [...buf], discSize: 2 };
  }
  if (t === "u32") {
    const buf = new Uint8Array(4);
    new DataView(buf.buffer).setUint32(0, d.value, true);
    return { disc: [...buf], discSize: 4 };
  }
  throw new Error(`Unsupported Shank discriminant type ${t} on ${ix.name}`);
}

function discFromAnchor(ix) {
  if (Array.isArray(ix.discriminator) && ix.discriminator.length > 0) {
    return {
      disc: ix.discriminator.map((n) => Number(n)),
      discSize: ix.discriminator.length,
    };
  }
  const disc = anchorDiscriminator(ix.name);
  return { disc, discSize: disc.length };
}

export function fromShank(idl) {
  const typesByName = indexLegacyTypes(idl);
  return (idl.instructions ?? []).map((ix) => {
    const { disc, discSize } = discFromShank(ix);
    return {
      name: ix.name,
      constName: constName(ix.name),
      disc,
      discSize,
      accounts: accountsFromLegacy(ix),
      args: mapLegacyArgs(ix.name, ix.args, typesByName),
    };
  });
}

export function fromAnchor(idl) {
  const typesByName = indexLegacyTypes(idl);
  return (idl.instructions ?? []).map((ix) => {
    const { disc, discSize } = discFromAnchor(ix);
    return {
      name: ix.name,
      constName: constName(ix.name),
      disc,
      discSize,
      accounts: accountsFromLegacy(ix),
      args: mapLegacyArgs(ix.name, ix.args, typesByName),
    };
  });
}

/* ─── Codama type resolution ───────────────────────────────────────────── */

function indexCodamaTypes(idl) {
  const map = new Map();
  for (const t of idl.program?.definedTypes ?? []) {
    if (t?.name) map.set(t.name, t);
  }
  return map;
}

function resolveCodamaType(typeNode, typesByName, stack = []) {
  if (!typeNode) throw new Error("missing type");

  if (typeNode.kind === "publicKeyTypeNode") return { kind: "pubkey" };
  if (typeNode.kind === "boolTypeNode" || typeNode.kind === "booleanTypeNode") {
    return { kind: "bool" };
  }
  if (typeNode.kind === "bytesTypeNode") {
    return { kind: "bytes", prefix: "u32" };
  }
  if (typeNode.kind === "fixedSizeTypeNode") {
    const size = Number(typeNode.size);
    const inner = typeNode.type;
    if (
      !inner ||
      inner.kind === "bytesTypeNode" ||
      inner.kind === "stringTypeNode"
    ) {
      return { kind: "bytes", size };
    }
    return {
      kind: "array",
      len: size,
      inner: resolveCodamaType(inner, typesByName, stack),
    };
  }
  if (typeNode.kind === "stringTypeNode") {
    return { kind: "string", prefix: "u32" };
  }
  if (typeNode.kind === "numberTypeNode" && typeNode.format) {
    const kf = kindOfFormat(typeNode.format);
    if (kf === "u64") return { kind: "u64" };
    if (kf === "u128") return { kind: "u128" };
    if (kf === "bool") return { kind: "bool" };
    if (kf === "float") return { kind: "float", format: typeNode.format };
    if (kf === "number") return { kind: "number", format: typeNode.format };
    throw new Error(`unsupported number format ${typeNode.format}`);
  }
  if (typeNode.kind === "sizePrefixTypeNode") {
    const pref = typeNode.prefix?.format ?? "u32";
    if (typeNode.type?.kind === "stringTypeNode") {
      return { kind: "string", prefix: pref };
    }
    if (
      typeNode.type?.kind === "bytesTypeNode" ||
      typeNode.type?.kind === "remainderOptionTypeNode"
    ) {
      return { kind: "bytes", prefix: pref };
    }
    // size-prefixed vec-like
    return {
      kind: "vec",
      prefix: pref,
      inner: resolveCodamaType(typeNode.type, typesByName, stack),
    };
  }
  if (typeNode.kind === "optionTypeNode" || typeNode.kind === "zeroableOptionTypeNode") {
    return {
      kind: "option",
      inner: resolveCodamaType(typeNode.item ?? typeNode.type, typesByName, stack),
    };
  }
  if (typeNode.kind === "arrayTypeNode") {
    // Codama uses `count`; some older shapes used `size`.
    const countNode = typeNode.count ?? typeNode.size;
    if (countNode?.kind === "remainderCountNode") {
      return {
        kind: "remainderVec",
        inner: resolveCodamaType(typeNode.item ?? typeNode.type, typesByName, stack),
      };
    }
    let len;
    if (countNode?.kind === "fixedCountNode") {
      len = Number(countNode.value);
    } else if (countNode?.kind === "numberValueNode") {
      len = Number(countNode.number);
    } else if (typeof countNode === "number") {
      len = countNode;
    } else {
      throw new Error(
        `arrayTypeNode: unsupported count ${JSON.stringify(countNode)}`,
      );
    }
    if (!Number.isFinite(len) || len < 0) {
      throw new Error(
        `arrayTypeNode: invalid length ${JSON.stringify(countNode)}`,
      );
    }
    return {
      kind: "array",
      len,
      inner: resolveCodamaType(typeNode.item ?? typeNode.type, typesByName, stack),
    };
  }
  if (typeNode.kind === "definedTypeLinkNode") {
    return resolveDefinedCodama(typeNode.name, typesByName, stack);
  }
  if (typeNode.kind === "structTypeNode") {
    return {
      kind: "struct",
      fields: (typeNode.fields ?? []).map((f) => ({
        name: f.name,
        type: resolveCodamaType(f.type, typesByName, stack),
      })),
    };
  }
  if (typeNode.kind === "enumTypeNode") {
    const discFormat = typeNode.size?.format ?? "u8";
    const variants = (typeNode.variants ?? []).map((v) => {
      if (v.kind === "enumEmptyVariantTypeNode") {
        return { name: v.name, fields: [] };
      }
      if (v.kind === "enumStructVariantTypeNode") {
        return {
          name: v.name,
          fields: (v.fields?.fields ?? v.fields ?? []).map((f) => ({
            name: f.name,
            type: resolveCodamaType(f.type, typesByName, stack),
          })),
        };
      }
      if (v.kind === "enumTupleVariantTypeNode") {
        return {
          name: v.name,
          fields: (v.fields?.items ?? v.tuple?.items ?? []).map((t, i) => ({
            name: `field${i}`,
            type: resolveCodamaType(t, typesByName, stack),
          })),
        };
      }
      return { name: v.name ?? "unknown", fields: [] };
    });
    return { kind: "enum", variants, disc: discFormat };
  }

  throw new Error(`unsupported Codama type ${typeNode.kind}`);
}

function resolveDefinedCodama(name, typesByName, stack) {
  if (stack.includes(name)) throw new Error(`recursive type ${name}`);
  const def = typesByName.get(name);
  if (!def) throw new Error(`unknown defined type ${name}`);
  return resolveCodamaType(def.type, typesByName, [...stack, name]);
}

export function fromCodama(idl) {
  const all = idl.program?.instructions;
  if (!Array.isArray(all)) {
    throw new Error("Not a Codama IDL (missing program.instructions)");
  }
  const typesByName = indexCodamaTypes(idl);
  const out = [];

  for (const ix of all) {
    const discArg = ix.arguments?.find((a) => a.name === "discriminator");
    let disc;
    let discSize;
    const discNum = discArg?.defaultValue?.number;
    const discBytes = discArg?.defaultValue?.data;
    const discEncoding = discArg?.defaultValue?.encoding;
    if (discNum != null) {
      const discFormat = discArg?.type?.format ?? "u8";
      if (discFormat === "u32") {
        const buf = new Uint8Array(4);
        new DataView(buf.buffer).setUint32(0, discNum, true);
        disc = [...buf];
        discSize = 4;
      } else if (discFormat === "u8") {
        disc = discNum;
        discSize = 1;
      } else {
        throw new Error(
          `Unsupported discriminator format ${discFormat} on ${ix.name}`,
        );
      }
    } else if (typeof discBytes === "string") {
      const hex =
        discEncoding === "base16" || /^[0-9a-fA-F]+$/.test(discBytes)
          ? discBytes
          : null;
      if (!hex || hex.length % 2 !== 0) {
        throw new Error(`Bad bytes discriminator on ${ix.name}`);
      }
      disc = [];
      for (let i = 0; i < hex.length; i += 2) {
        disc.push(parseInt(hex.slice(i, i + 2), 16));
      }
      discSize = disc.length;
    } else {
      throw new Error(`No discriminator for instruction ${ix.name}`);
    }

    const args = [];
    for (const a of ix.arguments ?? []) {
      if (a.name === "discriminator") continue;
      try {
        args.push({
          name: a.name,
          type: resolveCodamaType(a.type, typesByName),
        });
      } catch (err) {
        throw new Error(
          `${ix.name}.${a.name}: ${err instanceof Error ? err.message : err}`,
        );
      }
    }

    out.push({
      name: ix.name,
      constName: constName(ix.name),
      disc,
      discSize,
      accounts: (ix.accounts ?? []).map((a, index) => ({
        name: a.name,
        index,
        optional: Boolean(a.isOptional ?? a.optional),
      })),
      args,
    });
  }
  return out;
}

/* ─── Emit decode ──────────────────────────────────────────────────────── */

function emitSet(lines, ind, path, type, valueExpr) {
  lines.push(
    `${ind}fields[${JSON.stringify(path)}] = { type: ${JSON.stringify(type)}, value: ${valueExpr} };`,
  );
}

function emitDecode(path, spec, lines, ind) {
  switch (spec.kind) {
    case "u64": {
      lines.push(`${ind}{`);
      lines.push(`${ind}  const v = readU64Le(data, o);`);
      lines.push(`${ind}  if (v == null) return null;`);
      emitSet(lines, `${ind}  `, path, "bigint", "v");
      lines.push(`${ind}  o += 8;`);
      lines.push(`${ind}}`);
      break;
    }
    case "u128": {
      lines.push(`${ind}{`);
      lines.push(`${ind}  const v = readU128Le(data, o);`);
      lines.push(`${ind}  if (v == null) return null;`);
      emitSet(lines, `${ind}  `, path, "bigint", "v");
      lines.push(`${ind}  o += 16;`);
      lines.push(`${ind}}`);
      break;
    }
    case "number": {
      const fmt = spec.format ?? "u8";
      if (fmt === "u32" || fmt === "i32") {
        lines.push(`${ind}{`);
        lines.push(`${ind}  const v = readU32Le(data, o);`);
        lines.push(`${ind}  if (v == null) return null;`);
        emitSet(lines, `${ind}  `, path, "number", "v");
        lines.push(`${ind}  o += 4;`);
        lines.push(`${ind}}`);
      } else if (fmt === "u16" || fmt === "i16") {
        lines.push(`${ind}{`);
        lines.push(`${ind}  const v = readU16Le(data, o);`);
        lines.push(`${ind}  if (v == null) return null;`);
        emitSet(lines, `${ind}  `, path, "number", "v");
        lines.push(`${ind}  o += 2;`);
        lines.push(`${ind}}`);
      } else {
        lines.push(`${ind}if (data.length <= o) return null;`);
        emitSet(lines, ind, path, "number", "data[o]!");
        lines.push(`${ind}o += 1;`);
      }
      break;
    }
    case "float": {
      const size = spec.format === "f32" ? 4 : 8;
      lines.push(`${ind}{`);
      lines.push(`${ind}  const v = readFloatLe(data, o, ${size});`);
      lines.push(`${ind}  if (v == null) return null;`);
      emitSet(lines, `${ind}  `, path, "number", "v");
      lines.push(`${ind}  o += ${size};`);
      lines.push(`${ind}}`);
      break;
    }
    case "bool": {
      lines.push(`${ind}{`);
      lines.push(`${ind}  const v = readBool(data, o);`);
      lines.push(`${ind}  if (v == null) return null;`);
      emitSet(lines, `${ind}  `, path, "bool", "v");
      lines.push(`${ind}  o += 1;`);
      lines.push(`${ind}}`);
      break;
    }
    case "pubkey": {
      lines.push(`${ind}{`);
      lines.push(`${ind}  const v = readPubkey(data, o);`);
      lines.push(`${ind}  if (v == null) return null;`);
      emitSet(lines, `${ind}  `, path, "string", "v");
      lines.push(`${ind}  o += 32;`);
      lines.push(`${ind}}`);
      break;
    }
    case "string": {
      const pref = spec.prefix ?? "u32";
      lines.push(`${ind}{`);
      if (pref === "u64" || pref === "i64") {
        lines.push(`${ind}  const len = readU64Le(data, o);`);
        lines.push(`${ind}  if (len == null) return null;`);
        emitMaxLenGuardBigint(lines, ind, "len");
        lines.push(`${ind}  o += 8;`);
        lines.push(`${ind}  const n = Number(len);`);
      } else {
        lines.push(`${ind}  const len = readU32Le(data, o);`);
        lines.push(`${ind}  if (len == null) return null;`);
        emitMaxLenGuard(lines, ind, "len");
        lines.push(`${ind}  o += 4;`);
        lines.push(`${ind}  const n = len;`);
      }
      lines.push(`${ind}  if (data.length < o + n) return null;`);
      lines.push(`${ind}  const s = readUtf8(data, o, n);`);
      lines.push(`${ind}  if (s == null) return null;`);
      emitSet(lines, `${ind}  `, path, "string", "s");
      lines.push(`${ind}  o += n;`);
      lines.push(`${ind}}`);
      break;
    }
    case "bytes": {
      if (spec.size != null) {
        const n = Number(spec.size);
        lines.push(`${ind}if (data.length < o + ${n}) return null;`);
        emitSet(
          lines,
          ind,
          path,
          "bytes",
          `encodeBase58(data.subarray(o, o + ${n}))`,
        );
        lines.push(`${ind}o += ${n};`);
      } else {
        const pref = spec.prefix ?? "u32";
        lines.push(`${ind}{`);
        if (pref === "u64" || pref === "i64") {
          lines.push(`${ind}  const len = readU64Le(data, o);`);
          lines.push(`${ind}  if (len == null) return null;`);
          emitMaxLenGuardBigint(lines, ind, "len");
          lines.push(`${ind}  o += 8;`);
          lines.push(`${ind}  const n = Number(len);`);
        } else if (pref === "u16" || pref === "i16") {
          lines.push(`${ind}  const len = readU16Le(data, o);`);
          lines.push(`${ind}  if (len == null) return null;`);
          emitMaxLenGuard(lines, ind, "len");
          lines.push(`${ind}  o += 2;`);
          lines.push(`${ind}  const n = len;`);
        } else if (pref === "u8" || pref === "i8") {
          lines.push(`${ind}  if (data.length <= o) return null;`);
          lines.push(`${ind}  const n = data[o]!;`);
          lines.push(`${ind}  o += 1;`);
        } else {
          lines.push(`${ind}  const len = readU32Le(data, o);`);
          lines.push(`${ind}  if (len == null) return null;`);
          emitMaxLenGuard(lines, ind, "len");
          lines.push(`${ind}  o += 4;`);
          lines.push(`${ind}  const n = len;`);
        }
        lines.push(`${ind}  if (data.length < o + n) return null;`);
        emitSet(lines, `${ind}  `, path, "bytes", "encodeBase58(data.subarray(o, o + n))");
        lines.push(`${ind}  o += n;`);
        lines.push(`${ind}}`);
      }
      break;
    }
    case "option": {
      lines.push(`${ind}if (data.length <= o) return null;`);
      lines.push(`${ind}{`);
      lines.push(`${ind}  const opt = data[o]!;`);
      lines.push(`${ind}  o += 1;`);
      lines.push(`${ind}  if (opt === 1) {`);
      emitDecode(path, spec.inner, lines, `${ind}    `);
      lines.push(`${ind}  }`);
      lines.push(`${ind}}`);
      break;
    }
    case "struct": {
      for (const f of spec.fields) {
        emitDecode(joinPath(path, f.name), f.type, lines, ind);
      }
      break;
    }
    case "enum": {
      const discFmt = spec.disc ?? "u8";
      lines.push(`${ind}{`);
      if (discFmt === "u32") {
        lines.push(`${ind}  const tag = readU32Le(data, o);`);
        lines.push(`${ind}  if (tag == null) return null;`);
        lines.push(`${ind}  o += 4;`);
      } else if (discFmt === "u16") {
        lines.push(`${ind}  const tag = readU16Le(data, o);`);
        lines.push(`${ind}  if (tag == null) return null;`);
        lines.push(`${ind}  o += 2;`);
      } else {
        lines.push(`${ind}  if (data.length <= o) return null;`);
        lines.push(`${ind}  const tag = data[o]!;`);
        lines.push(`${ind}  o += 1;`);
      }
      for (let i = 0; i < spec.variants.length; i++) {
        const v = spec.variants[i];
        lines.push(`${ind}  if (tag === ${i}) {`);
        emitSet(lines, `${ind}    `, path, "string", JSON.stringify(v.name));
        for (const f of v.fields) {
          emitDecode(joinPath(path, f.name), f.type, lines, `${ind}    `);
        }
        lines.push(`${ind}  }`);
      }
      lines.push(`${ind}}`);
      break;
    }
    case "array": {
      // Fixed array of u8 → bytes; otherwise JSON array of decoded scalars
      if (spec.inner.kind === "number" && (spec.inner.format === "u8" || !spec.inner.format)) {
        const n = Number(spec.len);
        lines.push(`${ind}if (data.length < o + ${n}) return null;`);
        emitSet(
          lines,
          ind,
          path,
          "bytes",
          `encodeBase58(data.subarray(o, o + ${n}))`,
        );
        lines.push(`${ind}o += ${n};`);
      } else {
        lines.push(`${ind}{`);
        lines.push(`${ind}  const arr: unknown[] = [];`);
        lines.push(`${ind}  for (let _i = 0; _i < ${Number(spec.len)}; _i++) {`);
        emitJsonItem(spec.inner, lines, `${ind}    `, "arr");
        lines.push(`${ind}  }`);
        emitSet(lines, `${ind}  `, path, "json", "JSON.stringify(arr)");
        lines.push(`${ind}}`);
      }
      break;
    }
    case "remainderVec": {
      // Consume items until end of buffer (Codama remainderCountNode).
      if (spec.inner.kind === "number" && (spec.inner.format === "u8" || !spec.inner.format)) {
        emitSet(
          lines,
          ind,
          path,
          "bytes",
          `encodeBase58(data.subarray(o))`,
        );
        lines.push(`${ind}o = data.length;`);
      } else {
        lines.push(`${ind}{`);
        lines.push(`${ind}  const arr: unknown[] = [];`);
        lines.push(`${ind}  let _guard = 0;`);
        lines.push(`${ind}  while (o < data.length) {`);
        lines.push(`${ind}    if (++_guard > 4096) return null;`);
        emitJsonItem(spec.inner, lines, `${ind}    `, "arr");
        lines.push(`${ind}  }`);
        emitSet(lines, `${ind}  `, path, "json", "JSON.stringify(arr)");
        lines.push(`${ind}}`);
      }
      break;
    }
    case "vec": {
      if (spec.inner.kind === "number" && (spec.inner.format === "u8" || !spec.inner.format)) {
        // vec<u8> as bytes
        emitDecode(path, { kind: "bytes", prefix: spec.prefix ?? "u32" }, lines, ind);
      } else {
        const pref = spec.prefix ?? "u32";
        lines.push(`${ind}{`);
        if (pref === "u64" || pref === "i64") {
          lines.push(`${ind}  const len = readU64Le(data, o);`);
          lines.push(`${ind}  if (len == null) return null;`);
          emitMaxLenGuardBigint(lines, ind, "len");
          lines.push(`${ind}  o += 8;`);
          lines.push(`${ind}  const n = Number(len);`);
        } else {
          lines.push(`${ind}  const len = readU32Le(data, o);`);
          lines.push(`${ind}  if (len == null) return null;`);
          emitMaxLenGuard(lines, ind, "len");
          lines.push(`${ind}  o += 4;`);
          lines.push(`${ind}  const n = len;`);
        }
        lines.push(`${ind}  const arr: unknown[] = [];`);
        lines.push(`${ind}  for (let _i = 0; _i < n; _i++) {`);
        emitJsonItem(spec.inner, lines, `${ind}    `, "arr");
        lines.push(`${ind}  }`);
        emitSet(lines, `${ind}  `, path, "json", "JSON.stringify(arr)");
        lines.push(`${ind}}`);
      }
      break;
    }
    case "hashMap": {
      lines.push(`${ind}{`);
      lines.push(`${ind}  const len = readU32Le(data, o);`);
      lines.push(`${ind}  if (len == null) return null;`);
      emitMaxLenGuard(lines, ind, "len");
      lines.push(`${ind}  o += 4;`);
      lines.push(`${ind}  const obj: Record<string, unknown> = {};`);
      lines.push(`${ind}  for (let _i = 0; _i < len; _i++) {`);
      lines.push(`${ind}    let mapKey: string = "";`);
      emitJsonKey(spec.key, lines, `${ind}    `, "mapKey");
      lines.push(`${ind}    const mapValHolder: Record<string, unknown> = {};`);
      emitJsonObjectField("__v", spec.value, lines, `${ind}    `, "mapValHolder");
      lines.push(`${ind}    obj[mapKey] = mapValHolder["__v"];`);
      lines.push(`${ind}  }`);
      emitSet(lines, `${ind}  `, path, "json", "JSON.stringify(obj)");
      lines.push(`${ind}}`);
      break;
    }
    default:
      throw new Error(`emitDecode: unsupported kind ${spec.kind}`);
  }
}

/** Decode a map key into a string variable (advances o). */
function emitJsonKey(spec, lines, ind, keyVar) {
  switch (spec.kind) {
    case "string":
      lines.push(`${ind}{`);
      lines.push(`${ind}  const len = readU32Le(data, o); if (len == null) return null;`);
      emitMaxLenGuard(lines, ind, "len");
      lines.push(`${ind}  o += 4;`);
      lines.push(`${ind}  if (data.length < o + len) return null;`);
      lines.push(`${ind}  ${keyVar} = readUtf8(data, o, len) ?? ""; o += len;`);
      lines.push(`${ind}}`);
      break;
    case "pubkey":
      lines.push(`${ind}{ const v = readPubkey(data, o); if (v == null) return null; ${keyVar} = v; o += 32; }`);
      break;
    case "u64":
    case "u128":
      lines.push(`${ind}{`);
      lines.push(
        `${ind}  const v = ${spec.kind === "u128" ? "readU128Le" : "readU64Le"}(data, o);`,
      );
      lines.push(`${ind}  if (v == null) return null;`);
      lines.push(`${ind}  ${keyVar} = v.toString();`);
      lines.push(`${ind}  o += ${spec.kind === "u128" ? 16 : 8};`);
      lines.push(`${ind}}`);
      break;
    case "number": {
      const fmt = spec.format ?? "u8";
      if (fmt === "u32" || fmt === "i32") {
        lines.push(`${ind}{ const v = readU32Le(data, o); if (v == null) return null; ${keyVar} = String(v); o += 4; }`);
      } else if (fmt === "u16" || fmt === "i16") {
        lines.push(`${ind}{ const v = readU16Le(data, o); if (v == null) return null; ${keyVar} = String(v); o += 2; }`);
      } else {
        lines.push(`${ind}if (data.length <= o) return null; ${keyVar} = String(data[o]!); o += 1;`);
      }
      break;
    }
    case "bool":
      lines.push(`${ind}if (data.length <= o) return null; ${keyVar} = data[o]! !== 0 ? "true" : "false"; o += 1;`);
      break;
    default:
      throw new Error(`hashMap key unsupported kind ${spec.kind}`);
  }
}

/** Push one decoded value onto a JS array for json fields (advances o). */
function emitJsonItem(spec, lines, ind, arrVar) {
  switch (spec.kind) {
    case "u64":
    case "u128":
      lines.push(`${ind}{`);
      lines.push(
        `${ind}  const v = ${spec.kind === "u128" ? "readU128Le" : "readU64Le"}(data, o);`,
      );
      lines.push(`${ind}  if (v == null) return null;`);
      lines.push(`${ind}  ${arrVar}.push(v.toString());`);
      lines.push(`${ind}  o += ${spec.kind === "u128" ? 16 : 8};`);
      lines.push(`${ind}}`);
      break;
    case "number": {
      const fmt = spec.format ?? "u8";
      if (fmt === "u32" || fmt === "i32") {
        lines.push(`${ind}{ const v = readU32Le(data, o); if (v == null) return null; ${arrVar}.push(v); o += 4; }`);
      } else if (fmt === "u16" || fmt === "i16") {
        lines.push(`${ind}{ const v = readU16Le(data, o); if (v == null) return null; ${arrVar}.push(v); o += 2; }`);
      } else {
        lines.push(`${ind}if (data.length <= o) return null; ${arrVar}.push(data[o]!); o += 1;`);
      }
      break;
    }
    case "float": {
      const size = spec.format === "f32" ? 4 : 8;
      lines.push(`${ind}{ const v = readFloatLe(data, o, ${size}); if (v == null) return null; ${arrVar}.push(v); o += ${size}; }`);
      break;
    }
    case "bool":
      lines.push(`${ind}if (data.length <= o) return null; ${arrVar}.push(data[o]! !== 0); o += 1;`);
      break;
    case "pubkey":
      lines.push(`${ind}{ const v = readPubkey(data, o); if (v == null) return null; ${arrVar}.push(v); o += 32; }`);
      break;
    case "string": {
      lines.push(`${ind}{`);
      lines.push(`${ind}  const len = readU32Le(data, o); if (len == null) return null;`);
      emitMaxLenGuard(lines, ind, "len");
      lines.push(`${ind}  o += 4;`);
      lines.push(`${ind}  if (data.length < o + len) return null;`);
      lines.push(`${ind}  ${arrVar}.push(readUtf8(data, o, len) ?? ""); o += len;`);
      lines.push(`${ind}}`);
      break;
    }
    case "struct": {
      lines.push(`${ind}{`);
      lines.push(`${ind}  const obj: Record<string, unknown> = {};`);
      for (const f of spec.fields) {
        emitJsonObjectField(f.name, f.type, lines, `${ind}  `, "obj");
      }
      lines.push(`${ind}  ${arrVar}.push(obj);`);
      lines.push(`${ind}}`);
      break;
    }
    case "array": {
      if (
        spec.inner.kind === "number" &&
        (spec.inner.format === "u8" || !spec.inner.format)
      ) {
        const n = Number(spec.len);
        lines.push(`${ind}if (data.length < o + ${n}) return null;`);
        lines.push(`${ind}${arrVar}.push(encodeBase58(data.subarray(o, o + ${n})));`);
        lines.push(`${ind}o += ${n};`);
      } else {
        lines.push(`${ind}{`);
        lines.push(`${ind}  const inner: unknown[] = [];`);
        lines.push(`${ind}  for (let _j = 0; _j < ${Number(spec.len)}; _j++) {`);
        emitJsonItem(spec.inner, lines, `${ind}    `, "inner");
        lines.push(`${ind}  }`);
        lines.push(`${ind}  ${arrVar}.push(inner);`);
        lines.push(`${ind}}`);
      }
      break;
    }
    case "enum": {
      lines.push(`${ind}{`);
      lines.push(`${ind}  if (data.length <= o) return null;`);
      lines.push(`${ind}  const tag = data[o]!; o += 1;`);
      lines.push(`${ind}  const obj: Record<string, unknown> = { tag };`);
      for (let i = 0; i < spec.variants.length; i++) {
        const v = spec.variants[i];
        lines.push(`${ind}  if (tag === ${i}) {`);
        lines.push(`${ind}    obj["variant"] = ${JSON.stringify(v.name)};`);
        for (const f of v.fields) {
          emitJsonObjectField(f.name, f.type, lines, `${ind}    `, "obj");
        }
        lines.push(`${ind}  }`);
      }
      lines.push(`${ind}  ${arrVar}.push(obj);`);
      lines.push(`${ind}}`);
      break;
    }
    case "option":
      lines.push(`${ind}if (data.length <= o) return null;`);
      lines.push(`${ind}{ const opt = data[o]!; o += 1; if (opt === 1) {`);
      emitJsonItem(spec.inner, lines, `${ind}  `, arrVar);
      lines.push(`${ind}} else { ${arrVar}.push(null); } }`);
      break;
    case "bytes":
      lines.push(`${ind}{`);
      {
        const pref = spec.prefix ?? "u32";
        if (pref === "u8" || pref === "i8") {
          lines.push(`${ind}  if (data.length <= o) return null;`);
          lines.push(`${ind}  const len = data[o]!; o += 1;`);
        } else if (pref === "u16" || pref === "i16") {
          lines.push(`${ind}  const len = readU16Le(data, o); if (len == null) return null;`);
          emitMaxLenGuard(lines, ind, "len");
          lines.push(`${ind}  o += 2;`);
        } else if (pref === "u64" || pref === "i64") {
          lines.push(`${ind}  const lenBig = readU64Le(data, o); if (lenBig == null) return null;`);
          emitMaxLenGuardBigint(lines, ind, "lenBig");
          lines.push(`${ind}  o += 8;`);
          lines.push(`${ind}  const len = Number(lenBig);`);
        } else {
          lines.push(`${ind}  const len = readU32Le(data, o); if (len == null) return null;`);
          emitMaxLenGuard(lines, ind, "len");
          lines.push(`${ind}  o += 4;`);
        }
      }
      lines.push(`${ind}  if (data.length < o + len) return null;`);
      lines.push(`${ind}  ${arrVar}.push(encodeBase58(data.subarray(o, o + len))); o += len;`);
      lines.push(`${ind}}`);
      break;
    default:
      throw new Error(`json item unsupported kind ${spec.kind}`);
  }
}

function emitJsonObjectField(name, spec, lines, ind, objVar) {
  const key = JSON.stringify(name);
  switch (spec.kind) {
    case "u64":
    case "u128":
      lines.push(`${ind}{`);
      lines.push(
        `${ind}  const v = ${spec.kind === "u128" ? "readU128Le" : "readU64Le"}(data, o);`,
      );
      lines.push(`${ind}  if (v == null) return null;`);
      lines.push(`${ind}  ${objVar}[${key}] = v.toString();`);
      lines.push(`${ind}  o += ${spec.kind === "u128" ? 16 : 8};`);
      lines.push(`${ind}}`);
      break;
    case "number": {
      const fmt = spec.format ?? "u8";
      if (fmt === "u32" || fmt === "i32") {
        lines.push(`${ind}{ const v = readU32Le(data, o); if (v == null) return null; ${objVar}[${key}] = v; o += 4; }`);
      } else if (fmt === "u16" || fmt === "i16") {
        lines.push(`${ind}{ const v = readU16Le(data, o); if (v == null) return null; ${objVar}[${key}] = v; o += 2; }`);
      } else {
        lines.push(`${ind}if (data.length <= o) return null; ${objVar}[${key}] = data[o]!; o += 1;`);
      }
      break;
    }
    case "float": {
      const size = spec.format === "f32" ? 4 : 8;
      lines.push(`${ind}{ const v = readFloatLe(data, o, ${size}); if (v == null) return null; ${objVar}[${key}] = v; o += ${size}; }`);
      break;
    }
    case "bool":
      lines.push(`${ind}if (data.length <= o) return null; ${objVar}[${key}] = data[o]! !== 0; o += 1;`);
      break;
    case "pubkey":
      lines.push(`${ind}{ const v = readPubkey(data, o); if (v == null) return null; ${objVar}[${key}] = v; o += 32; }`);
      break;
    case "string":
      lines.push(`${ind}{`);
      lines.push(`${ind}  const len = readU32Le(data, o); if (len == null) return null;`);
      emitMaxLenGuard(lines, ind, "len");
      lines.push(`${ind}  o += 4;`);
      lines.push(`${ind}  if (data.length < o + len) return null;`);
      lines.push(`${ind}  ${objVar}[${key}] = readUtf8(data, o, len) ?? ""; o += len;`);
      lines.push(`${ind}}`);
      break;
    case "bytes":
      lines.push(`${ind}{`);
      {
        const pref = spec.prefix ?? "u32";
        if (pref === "u8" || pref === "i8") {
          lines.push(`${ind}  if (data.length <= o) return null;`);
          lines.push(`${ind}  const len = data[o]!; o += 1;`);
        } else if (pref === "u16" || pref === "i16") {
          lines.push(`${ind}  const len = readU16Le(data, o); if (len == null) return null;`);
          emitMaxLenGuard(lines, ind, "len");
          lines.push(`${ind}  o += 2;`);
        } else if (pref === "u64" || pref === "i64") {
          lines.push(`${ind}  const lenBig = readU64Le(data, o); if (lenBig == null) return null;`);
          emitMaxLenGuardBigint(lines, ind, "lenBig");
          lines.push(`${ind}  o += 8;`);
          lines.push(`${ind}  const len = Number(lenBig);`);
        } else {
          lines.push(`${ind}  const len = readU32Le(data, o); if (len == null) return null;`);
          emitMaxLenGuard(lines, ind, "len");
          lines.push(`${ind}  o += 4;`);
        }
      }
      lines.push(`${ind}  if (data.length < o + len) return null;`);
      lines.push(`${ind}  ${objVar}[${key}] = encodeBase58(data.subarray(o, o + len)); o += len;`);
      lines.push(`${ind}}`);
      break;
    case "option":
      lines.push(`${ind}if (data.length <= o) return null;`);
      lines.push(`${ind}{ const opt = data[o]!; o += 1; if (opt === 1) {`);
      emitJsonObjectField(name, spec.inner, lines, `${ind}  `, objVar);
      lines.push(`${ind}} }`);
      break;
    case "struct": {
      lines.push(`${ind}{`);
      lines.push(`${ind}  const nested: Record<string, unknown> = {};`);
      for (const f of spec.fields) {
        emitJsonObjectField(f.name, f.type, lines, `${ind}  `, "nested");
      }
      lines.push(`${ind}  ${objVar}[${key}] = nested;`);
      lines.push(`${ind}}`);
      break;
    }
    case "enum": {
      lines.push(`${ind}{`);
      lines.push(`${ind}  if (data.length <= o) return null;`);
      lines.push(`${ind}  const tag = data[o]!; o += 1;`);
      lines.push(`${ind}  const nested: Record<string, unknown> = { tag };`);
      for (let i = 0; i < spec.variants.length; i++) {
        const v = spec.variants[i];
        lines.push(`${ind}  if (tag === ${i}) {`);
        lines.push(`${ind}    nested["variant"] = ${JSON.stringify(v.name)};`);
        for (const f of v.fields) {
          emitJsonObjectField(f.name, f.type, lines, `${ind}    `, "nested");
        }
        lines.push(`${ind}  }`);
      }
      lines.push(`${ind}  ${objVar}[${key}] = nested;`);
      lines.push(`${ind}}`);
      break;
    }
    case "vec":
    case "array":
    case "remainderVec":
    case "hashMap": {
      lines.push(`${ind}{`);
      if (spec.kind === "hashMap") {
        lines.push(`${ind}  const len = readU32Le(data, o); if (len == null) return null;`);
      emitMaxLenGuard(lines, ind, "len");
      lines.push(`${ind}  o += 4;`);
        lines.push(`${ind}  const mapObj: Record<string, unknown> = {};`);
        lines.push(`${ind}  for (let _i = 0; _i < len; _i++) {`);
        lines.push(`${ind}    let mapKey: string = "";`);
        emitJsonKey(spec.key, lines, `${ind}    `, "mapKey");
        lines.push(`${ind}    const mapValHolder: Record<string, unknown> = {};`);
        emitJsonObjectField("__v", spec.value, lines, `${ind}    `, "mapValHolder");
        lines.push(`${ind}    mapObj[mapKey] = mapValHolder["__v"];`);
        lines.push(`${ind}  }`);
        lines.push(`${ind}  ${objVar}[${key}] = mapObj;`);
      } else if (spec.kind === "remainderVec") {
        lines.push(`${ind}  const arr: unknown[] = [];`);
        lines.push(`${ind}  let _guard = 0;`);
        lines.push(`${ind}  while (o < data.length) {`);
        lines.push(`${ind}    if (++_guard > 4096) return null;`);
        emitJsonItem(spec.inner, lines, `${ind}    `, "arr");
        lines.push(`${ind}  }`);
        lines.push(`${ind}  ${objVar}[${key}] = arr;`);
      } else if (spec.kind === "array") {
        lines.push(`${ind}  const arr: unknown[] = [];`);
        lines.push(`${ind}  for (let _i = 0; _i < ${Number(spec.len)}; _i++) {`);
        emitJsonItem(spec.inner, lines, `${ind}    `, "arr");
        lines.push(`${ind}  }`);
        lines.push(`${ind}  ${objVar}[${key}] = arr;`);
      } else {
        lines.push(`${ind}  const len = readU32Le(data, o); if (len == null) return null;`);
      emitMaxLenGuard(lines, ind, "len");
      lines.push(`${ind}  o += 4;`);
        lines.push(`${ind}  const arr: unknown[] = [];`);
        lines.push(`${ind}  for (let _i = 0; _i < len; _i++) {`);
        emitJsonItem(spec.inner, lines, `${ind}    `, "arr");
        lines.push(`${ind}  }`);
        lines.push(`${ind}  ${objVar}[${key}] = arr;`);
      }
      lines.push(`${ind}}`);
      break;
    }
    default:
      throw new Error(`json object field unsupported kind ${spec.kind}`);
  }
}

export function emitModule(spec) {
  const { programId, instructions, schema } = spec;
  const helpersImport =
    spec.helpersImport ?? "phygital-verifier-sdk/codec-readers";
  const lines = [];
  lines.push(`/** Auto-generated from IDL — do not edit by hand. */`);
  lines.push(
    `import {`,
  );
  lines.push(`  discEq,`);
  lines.push(`  encodeBase58,`);
  lines.push(`  readBool,`);
  lines.push(`  readFloatLe,`);
  lines.push(`  readPubkey,`);
  lines.push(`  readU16Le,`);
  lines.push(`  readU32Le,`);
  lines.push(`  readU64Le,`);
  lines.push(`  readU128Le,`);
  lines.push(`  readUtf8,`);
  lines.push(`} from ${JSON.stringify(helpersImport)};`);
  lines.push(``);
  lines.push(`export const PROGRAM_ID = ${JSON.stringify(programId)} as const;`);
  lines.push(``);
  lines.push(`export type GeneratedIx = {`);
  lines.push(`  name: string;`);
  lines.push(
    `  fields: Record<string, { type: "bigint" | "number" | "string" | "bool" | "bytes" | "json"; value: bigint | number | string | boolean }>;`,
  );
  lines.push(`};`);
  lines.push(``);

  for (const ix of instructions) {
    const discArr = Array.isArray(ix.disc) ? ix.disc : [ix.disc];
    lines.push(
      `const DISC_${ix.constName} = new Uint8Array(${JSON.stringify(discArr)});`,
    );
  }
  lines.push(``);
  // First-byte buckets → decode bodies (longest disc first within bucket).
  const byFirst = new Map();
  for (const ix of instructions) {
    const discArr = Array.isArray(ix.disc) ? ix.disc : [ix.disc];
    const b0 = discArr[0] ?? 0;
    if (!byFirst.has(b0)) byFirst.set(b0, []);
    byFirst.get(b0).push(ix);
  }
  for (const [, list] of byFirst) {
    list.sort((a, b) => {
      const da = Array.isArray(a.disc) ? a.disc.length : 1;
      const db = Array.isArray(b.disc) ? b.disc.length : 1;
      return db - da;
    });
  }

  for (const ix of instructions) {
    const discSize =
      ix.discSize ?? (Array.isArray(ix.disc) ? ix.disc.length : 1);
    lines.push(`function decode_${ix.constName}(`);
    lines.push(`  data: Uint8Array,`);
    lines.push(`  accounts: readonly { address: string }[],`);
    lines.push(`): GeneratedIx | null {`);
    lines.push(`  if (!discEq(data, DISC_${ix.constName})) return null;`);
    lines.push(`  const fields: GeneratedIx["fields"] = {};`);
    for (const acc of ix.accounts) {
      if (acc.optional) {
        lines.push(
          `  { const a = accounts[${acc.index}]?.address; if (a) fields[${JSON.stringify(acc.name)}] = { type: "string", value: a }; }`,
        );
      } else {
        lines.push(
          `  { const a = accounts[${acc.index}]?.address; if (!a) return null; fields[${JSON.stringify(acc.name)}] = { type: "string", value: a }; }`,
        );
      }
    }
    lines.push(`  let o = ${discSize};`);
    for (const arg of ix.args) {
      try {
        emitDecode(arg.name, arg.type, lines, "  ");
      } catch (err) {
        throw new Error(
          `${ix.name}.${arg.name}: ${err instanceof Error ? err.message : err}`,
        );
      }
    }
    lines.push(`  if (o !== data.length) return null;`);
    lines.push(`  return { name: ${JSON.stringify(ix.name)}, fields };`);
    lines.push(`}`);
    lines.push(``);
  }

  lines.push(`const DECODE_BY_FIRST: ReadonlyMap<number, readonly ((`);
  lines.push(`  data: Uint8Array,`);
  lines.push(`  accounts: readonly { address: string }[],`);
  lines.push(`) => GeneratedIx | null)[]> = new Map([`);
  for (const [b0, list] of [...byFirst.entries()].sort((a, b) => a[0] - b[0])) {
    lines.push(
      `  [${b0}, [${list.map((ix) => `decode_${ix.constName}`).join(", ")}]],`,
    );
  }
  lines.push(`]);`);
  lines.push(``);
  lines.push(`export function tryDecode(`);
  lines.push(`  data: Uint8Array,`);
  lines.push(`  accounts: readonly { address: string }[],`);
  lines.push(`): GeneratedIx | null {`);
  lines.push(`  if (data.length === 0) return null;`);
  lines.push(`  const bucket = DECODE_BY_FIRST.get(data[0]!);`);
  lines.push(`  if (!bucket) return null;`);
  lines.push(`  for (const fn of bucket) {`);
  lines.push(`    const r = fn(data, accounts);`);
  lines.push(`    if (r) return r;`);
  lines.push(`  }`);
  lines.push(`  return null;`);
  lines.push(`}`);
  lines.push(``);
  lines.push(
    `export const FIELD_SCHEMA = ${JSON.stringify(schema ?? buildSchema(instructions), null, 2)} as const;`,
  );
  lines.push(``);

  const layouts = buildInstructionLayouts(instructions);
  lines.push(`export const INSTRUCTION_LAYOUTS = [`);
  for (const lay of layouts) {
    lines.push(`  {`);
    lines.push(`    name: ${JSON.stringify(lay.name)},`);
    lines.push(
      `    discriminator: new Uint8Array(${JSON.stringify([...lay.discriminator])}),`,
    );
    if (lay.exactDataLength != null) {
      lines.push(`    exactDataLength: ${lay.exactDataLength},`);
    }
    lines.push(`    fields: ${JSON.stringify(lay.fields)},`);
    lines.push(`  },`);
  }
  lines.push(`] as const;`);
  lines.push(``);

  return lines.join("\n");
}

/** Fixed-offset layouts for byte-oriented verify (accounts + fixed data args). */
export function buildInstructionLayouts(instructions) {
  return instructions.map((ix) => {
    const discArr = Array.isArray(ix.disc) ? ix.disc : [ix.disc];
    const discSize =
      ix.discSize ?? (Array.isArray(ix.disc) ? ix.disc.length : 1);
    const fields = {};
    for (const acc of ix.accounts) {
      fields[acc.name] = { kind: "account", index: acc.index };
    }
    let offset = discSize;
    let stalled = false;
    for (const arg of ix.args ?? []) {
      if (stalled) {
        markDynamic(arg.name, arg.type, fields);
        continue;
      }
      const placed = placeFixed(arg.name, arg.type, offset, fields);
      if (!placed) {
        markDynamic(arg.name, arg.type, fields);
        stalled = true;
      } else {
        offset = placed;
      }
    }
    const out = {
      name: ix.name,
      discriminator: Uint8Array.from(discArr),
      fields,
    };
    if (!stalled) out.exactDataLength = offset;
    return out;
  });
}

function markDynamic(path, spec, fields) {
  const leaves = [];
  collectSchemaFields(path, spec, leaves);
  for (const f of leaves) {
    if (!fields[f.name]) fields[f.name] = { kind: "dynamic" };
  }
}

function placeFixed(path, spec, offset, fields) {
  if (!spec || typeof spec !== "object") return null;
  switch (spec.kind) {
    case "pubkey":
      fields[path] = { kind: "data", offset, size: 32, type: "pubkey" };
      return offset + 32;
    case "u64":
      fields[path] = { kind: "data", offset, size: 8, type: "u64" };
      return offset + 8;
    case "u128":
      fields[path] = { kind: "data", offset, size: 16, type: "u128" };
      return offset + 16;
    case "bool":
      fields[path] = { kind: "data", offset, size: 1, type: "u8" };
      return offset + 1;
    case "number": {
      const fmt = spec.format ?? "u8";
      if (fmt === "u8" || fmt === "u16" || fmt === "u32") {
        const size = fmt === "u8" ? 1 : fmt === "u16" ? 2 : 4;
        fields[path] = { kind: "data", offset, size, type: fmt };
        return offset + size;
      }
      return null;
    }
    case "struct": {
      let o = offset;
      for (const f of spec.fields ?? []) {
        const next = placeFixed(joinPath(path, f.name), f.type, o, fields);
        if (next == null) return null;
        o = next;
      }
      return o;
    }
    default:
      return null;
  }
}

export function generateFromIdl(idl, { programId, helpersImport } = {}) {
  const format = detectIdlFormat(idl);
  const pid = programIdFromIdl(idl, programId);
  let instructions;
  if (format === "codama") {
    instructions = fromCodama(idl);
  } else if (format === "shank") {
    instructions = fromShank(idl);
  } else {
    instructions = fromAnchor(idl);
  }
  const schema = buildSchema(instructions);
  const source = emitModule({
    programId: pid,
    instructions,
    schema,
    helpersImport,
  });
  return { format, programId: pid, instructions, schema, source, warnings: [] };
}
