import {
  address,
  fixEncoderSize,
  getBytesEncoder,
  getStructEncoder,
  getU64Encoder,
  transformEncoder,
  type Address,
  type Instruction,
} from "@solana/kit";
import { getAccountMetaFactory } from "@solana/kit/program-client-core";
import {
  getSecp256r1VerifyArgsEncoder,
  PHYGITAL_TOKEN_PROGRAM_ADDRESS,
  type Secp256r1VerifyArgsArgs,
} from "phygital-token-sdk";

const EXECUTE_TRANSFER_DISCRIMINATOR = new Uint8Array([
  233, 126, 160, 184, 235, 206, 31, 119,
]);

const SLOT_HASHES_SYSVAR = address(
  "SysvarS1otHashes111111111111111111111111111",
);
const INSTRUCTIONS_SYSVAR = address(
  "Sysvar1nstructions1111111111111111111111111",
);

const EXECUTE_TRANSFER_DATA_ENCODER = transformEncoder(
  getStructEncoder([
    ["discriminator", fixEncoderSize(getBytesEncoder(), 8)],
    ["secp256r1VerifyArgs", getSecp256r1VerifyArgsEncoder()],
    ["slotNumber", getU64Encoder()],
  ]),
  (value: {
    secp256r1VerifyArgs: Secp256r1VerifyArgsArgs;
    slotNumber: number | bigint;
  }) => ({ ...value, discriminator: EXECUTE_TRANSFER_DISCRIMINATOR }),
);

export type ExecuteTransferInput = {
  recipient: Address;
  asset: Address;
  secp256r1VerifyArgs: Secp256r1VerifyArgsArgs;
  slotNumber: number | bigint;
};

/** phygital-token `execute_transfer` — recipient is readonly (cross-browser finish). */
export function getExecuteTransferInstruction(
  input: ExecuteTransferInput,
): Instruction {
  const programAddress = PHYGITAL_TOKEN_PROGRAM_ADDRESS;
  const accounts = {
    recipient: { value: input.recipient, isWritable: false as const },
    asset: { value: input.asset, isWritable: true as const },
    slotHashes: { value: SLOT_HASHES_SYSVAR, isWritable: false as const },
    instructionsSysvar: {
      value: INSTRUCTIONS_SYSVAR,
      isWritable: false as const,
    },
  };
  const getAccountMeta = getAccountMetaFactory(programAddress, "programId");
  const instruction = {
    accounts: [
      getAccountMeta("recipient", accounts.recipient),
      getAccountMeta("asset", accounts.asset),
      getAccountMeta("slotHashes", accounts.slotHashes),
      getAccountMeta("instructionsSysvar", accounts.instructionsSysvar),
    ],
    data: EXECUTE_TRANSFER_DATA_ENCODER.encode({
      secp256r1VerifyArgs: input.secp256r1VerifyArgs,
      slotNumber: input.slotNumber,
    }),
    programAddress,
  };
  return instruction as Instruction;
}
