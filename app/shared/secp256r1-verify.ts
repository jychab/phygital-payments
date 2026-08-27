import {
  address,
  combineCodec,
  createDecoder,
  createEncoder,
  fixDecoderSize,
  fixEncoderSize,
  getBytesDecoder,
  getBytesEncoder,
  getStructDecoder,
  getStructEncoder,
  getU16Decoder,
  getU16Encoder,
  getU8Decoder,
  getU8Encoder,
  type Address,
  type Instruction,
} from "@solana/kit";

/** Solana secp256r1 sig-verify precompile. */
const SECP256R1_PROGRAM_ADDRESS = address(
  "Secp256r1SigVerify1111111111111111111111111",
);

const COMPRESSED_PUBKEY_SERIALIZED_SIZE = 33;
const SIGNATURE_SERIALIZED_SIZE = 64;
const SIGNATURE_OFFSETS_SERIALIZED_SIZE = 14;
const SIGNATURE_OFFSETS_START = 2;

/** One secp256r1 signature slot in a combined verify instruction. */
export type Secp256r1VerifyEntry = {
  publicKey: Uint8Array;
  signature: Uint8Array;
  message: Uint8Array;
};

type Secp256r1SignatureOffsets = {
  signatureOffset: number;
  signatureInstructionIndex: number;
  publicKeyOffset: number;
  publicKeyInstructionIndex: number;
  messageDataOffset: number;
  messageDataSize: number;
  messageInstructionIndex: number;
};

type Secp256r1VerifyInstructionData = {
  numSignatures: number;
  padding: number;
  offsets: Secp256r1SignatureOffsets[];
  payload: Secp256r1VerifyEntry[];
};

function getOffsetsEncoder() {
  return getStructEncoder([
    ["signatureOffset", getU16Encoder()],
    ["signatureInstructionIndex", getU16Encoder()],
    ["publicKeyOffset", getU16Encoder()],
    ["publicKeyInstructionIndex", getU16Encoder()],
    ["messageDataOffset", getU16Encoder()],
    ["messageDataSize", getU16Encoder()],
    ["messageInstructionIndex", getU16Encoder()],
  ]);
}

function getOffsetsDecoder() {
  return getStructDecoder([
    ["signatureOffset", getU16Decoder()],
    ["signatureInstructionIndex", getU16Decoder()],
    ["publicKeyOffset", getU16Decoder()],
    ["publicKeyInstructionIndex", getU16Decoder()],
    ["messageDataOffset", getU16Decoder()],
    ["messageDataSize", getU16Decoder()],
    ["messageInstructionIndex", getU16Decoder()],
  ]);
}

function getInstructionDataCodec() {
  const encodeOffsets = getOffsetsEncoder();
  const decodeOffsets = getOffsetsDecoder();
  const encoder = createEncoder({
    getSizeFromValue: (value: Secp256r1VerifyInstructionData) => {
      const offsetSize =
        SIGNATURE_OFFSETS_SERIALIZED_SIZE * value.offsets.length;
      const payloadSize = value.payload.reduce((sum, entry) => {
        return (
          sum +
          COMPRESSED_PUBKEY_SERIALIZED_SIZE +
          SIGNATURE_SERIALIZED_SIZE +
          entry.message.length
        );
      }, 0);
      return 2 + offsetSize + payloadSize;
    },
    write: (value, bytes, offset = 0) => {
      offset = getU8Encoder().write(value.numSignatures, bytes, offset);
      offset = getU8Encoder().write(value.padding, bytes, offset);
      for (const offsetEntry of value.offsets) {
        offset = encodeOffsets.write(offsetEntry, bytes, offset);
      }
      for (const entry of value.payload) {
        offset = fixEncoderSize(
          getBytesEncoder(),
          COMPRESSED_PUBKEY_SERIALIZED_SIZE,
        ).write(entry.publicKey, bytes, offset);
        offset = fixEncoderSize(
          getBytesEncoder(),
          SIGNATURE_SERIALIZED_SIZE,
        ).write(entry.signature, bytes, offset);
        offset = getBytesEncoder().write(entry.message, bytes, offset);
      }
      return offset;
    },
  });
  const decoder = createDecoder({
    read: (bytes, offset = 0) => {
      const numSignatures = getU8Decoder().decode(bytes, offset);
      offset += 1;
      const padding = getU8Decoder().decode(bytes, offset);
      offset += 1;
      const offsets: Secp256r1SignatureOffsets[] = [];
      for (let i = 0; i < numSignatures; i += 1) {
        offsets.push(decodeOffsets.decode(bytes, offset));
        offset += SIGNATURE_OFFSETS_SERIALIZED_SIZE;
      }
      const payload: Secp256r1VerifyEntry[] = [];
      for (let i = 0; i < numSignatures; i += 1) {
        const publicKey = new Uint8Array(
          fixDecoderSize(
            getBytesDecoder(),
            COMPRESSED_PUBKEY_SERIALIZED_SIZE,
          ).decode(bytes, offset),
        );
        offset += COMPRESSED_PUBKEY_SERIALIZED_SIZE;
        const signature = new Uint8Array(
          fixDecoderSize(getBytesDecoder(), SIGNATURE_SERIALIZED_SIZE).decode(
            bytes,
            offset,
          ),
        );
        offset += SIGNATURE_SERIALIZED_SIZE;
        const messageSize = offsets[i].messageDataSize;
        const message = new Uint8Array(
          fixDecoderSize(getBytesDecoder(), messageSize).decode(bytes, offset),
        );
        offset += messageSize;
        payload.push({ publicKey, signature, message });
      }
      return [
        {
          numSignatures,
          padding,
          offsets,
          payload,
        },
        offset,
      ] as const;
    },
  });
  return combineCodec(encoder, decoder);
}

/**
 * secp256r1 sig-verify precompile instruction.
 * Local copy — `phygital-token-sdk` 1.0 no longer exports this helper.
 */
export function getSecp256r1VerifyInstruction(
  entries: Secp256r1VerifyEntry[],
  config?: { programAddress?: Address },
): Instruction {
  const numSignatures = entries.length;
  let currentOffset =
    SIGNATURE_OFFSETS_START +
    numSignatures * SIGNATURE_OFFSETS_SERIALIZED_SIZE;
  const offsets: Secp256r1SignatureOffsets[] = [];
  for (let i = 0; i < numSignatures; i += 1) {
    const { message } = entries[i];
    const publicKeyOffset = currentOffset;
    const signatureOffset = publicKeyOffset + COMPRESSED_PUBKEY_SERIALIZED_SIZE;
    const messageDataOffset = signatureOffset + SIGNATURE_SERIALIZED_SIZE;
    offsets.push({
      publicKeyOffset,
      publicKeyInstructionIndex: 0xffff,
      signatureOffset,
      signatureInstructionIndex: 0xffff,
      messageDataOffset,
      messageDataSize: message.length,
      messageInstructionIndex: 0xffff,
    });
    currentOffset +=
      COMPRESSED_PUBKEY_SERIALIZED_SIZE +
      SIGNATURE_SERIALIZED_SIZE +
      message.length;
  }
  return {
    accounts: [],
    programAddress: config?.programAddress ?? SECP256R1_PROGRAM_ADDRESS,
    data: getInstructionDataCodec().encode({
      numSignatures,
      padding: 0,
      offsets,
      payload: entries,
    }),
  };
}

/** Parse secp256r1 precompile instruction data back into entries. */
export function secp256r1EntriesFromInstruction(
  instruction: Instruction,
): Secp256r1VerifyEntry[] {
  const data = instruction.data;
  if (!data) {
    throw new Error("secp256r1 verify instruction has no data");
  }
  return getInstructionDataCodec().decode(data).payload;
}
