import { describe, expect, it } from "vitest";
import { AccountRole, address } from "@solana/kit";
import { findWalletPda } from "phygital-wallet-sdk";

import { assertPreviewWalletSigner } from "@/verifier/assert-preview-wallet";
import { SYSTEM_PROGRAM } from "@/verifier/constants";

const TOKEN = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

async function walletPdaFor(token: string): Promise<string> {
  const [pda] = await findWalletPda({ phygitalToken: address(token) });
  return String(pda);
}

describe("assertPreviewWalletSigner", () => {
  it("accepts instructions where wallet PDA is a writable signer", async () => {
    const walletPda = await walletPdaFor(TOKEN);
    await expect(
      assertPreviewWalletSigner(TOKEN, [
        {
          programAddress: SYSTEM_PROGRAM,
          accounts: [
            { address: walletPda, role: AccountRole.WRITABLE_SIGNER },
            {
              address: "11111111111111111111111111111112",
              role: AccountRole.WRITABLE,
            },
          ],
          data: new Uint8Array(),
        },
      ]),
    ).resolves.toBeUndefined();
  });

  it("rejects when wallet PDA is present but not a signer", async () => {
    const walletPda = await walletPdaFor(TOKEN);
    await expect(
      assertPreviewWalletSigner(TOKEN, [
        {
          programAddress: SYSTEM_PROGRAM,
          accounts: [
            { address: walletPda, role: AccountRole.WRITABLE },
          ],
          data: new Uint8Array(),
        },
      ]),
    ).rejects.toMatchObject({ code: "invalid_transaction" });
  });

  it("rejects when wallet PDA is missing", async () => {
    await expect(
      assertPreviewWalletSigner(TOKEN, [
        {
          programAddress: SYSTEM_PROGRAM,
          accounts: [
            {
              address: String(address("11111111111111111111111111111112")),
              role: AccountRole.WRITABLE_SIGNER,
            },
          ],
          data: new Uint8Array(),
        },
      ]),
    ).rejects.toMatchObject({ code: "invalid_transaction" });
  });
});
