/**
 * Instruction field layouts for byte-oriented verify (no full FieldValue decode).
 */
export type FixedDataType =
  | "u8"
  | "u16"
  | "u32"
  | "u64"
  | "u128"
  | "pubkey"
  | "bytes";

export type FieldLayout =
  | { readonly kind: "account"; readonly index: number }
  | {
      readonly kind: "data";
      readonly offset: number;
      readonly size: number;
      readonly type: FixedDataType;
    }
  | { readonly kind: "dynamic" };

export type InstructionLayout = {
  readonly name: string;
  readonly discriminator: Uint8Array;
  /**
   * When set, data length must equal this for a successful **allow**
   * (matches generated tryDecode `o === data.length`). Omit for dynamic ix data.
   */
  readonly exactDataLength?: number;
  readonly fields: Readonly<Record<string, FieldLayout>>;
};

export type ProgramLayouts = {
  readonly programId: string;
  readonly instructions: readonly InstructionLayout[];
};
