import {
  AccountRole,
  address,
  appendTransactionMessageInstructions,
  compileTransaction,
  createTransactionMessage,
  getBase64EncodedWireTransaction,
  getCompiledTransactionMessageDecoder,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  type Address,
  type Blockhash,
  type Instruction,
  type Transaction,
  type TransactionVersion,
} from "@solana/kit";
import { EXECUTE_DISCRIMINATOR } from "lazor-kit";
import { describe, expect, it } from "vitest";

import { LAZORKIT_PROGRAM_DEVNET, SYSTEM_PROGRAM_ADDRESS } from "@/lib/lazorkit/constants";
import { runWithRequestContext } from "@/lib/server/request-context";
import { COMPUTE_BUDGET_PROGRAM_ADDRESS } from "@/shared/compute-budget";
import {
  decodeAndAssertSignTransaction,
  SignTransactionError,
} from "./agent-sign";

const TEST_REQUEST_CONTEXT = {
  env: {
    NEXT_PUBLIC_SOLANA_CLUSTER: "devnet",
    NEXT_PUBLIC_SOLANA_RPC_URL: "https://api.devnet.solana.com",
  } as CloudflareEnv,
  request: new Request("https://test.local/"),
  ctx: {
    waitUntil() {},
    passThroughOnException() {},
    props: {},
  } as unknown as ExecutionContext,
};

function withRequestContext<T>(fn: () => Promise<T>): Promise<T> {
  return runWithRequestContext(TEST_REQUEST_CONTEXT, fn) as Promise<T>;
}

const payer = address("2qLZosEYxN4Bp7dGySYgjWEmXR9jQ4za6hr2AFocUHxU");
const wallet = address("LazorjRFNavitUaBu5m3WaNPjU1maipvSW2rZfAFAKi");
const sessionPda = address("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
const vault = address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const sessionKey = address("So11111111111111111111111111111111111111112");
const other = address("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
const sysvar = address("Sysvar1nstructions1111111111111111111111111");
const memo = address("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

const GRANT = {
  walletPda: String(wallet),
  vaultPda: String(vault),
  sessionPda: String(sessionPda),
  sessionPublicKey: String(sessionKey),
};

const LIFETIME = {
  blockhash: "11111111111111111111111111111111" as Blockhash,
  lastValidBlockHeight: 300n,
};

function computeBudgetLimit(units: number): Instruction {
  const data = new Uint8Array(5);
  data[0] = 0x02;
  new DataView(data.buffer).setUint32(1, units, true);
  return {
    programAddress: address(COMPUTE_BUDGET_PROGRAM_ADDRESS),
    data,
  };
}

function executeData(): Uint8Array {
  const data = new Uint8Array(5);
  data[0] = EXECUTE_DISCRIMINATOR;
  return data;
}

function executeIx(args?: {
  wallet?: Address;
  authority?: Address;
  sessionSigner?: boolean;
}): Instruction {
  return {
    programAddress: LAZORKIT_PROGRAM_DEVNET,
    accounts: [
      { address: payer, role: AccountRole.WRITABLE_SIGNER },
      { address: args?.wallet ?? wallet, role: AccountRole.READONLY },
      { address: args?.authority ?? sessionPda, role: AccountRole.WRITABLE },
      { address: vault, role: AccountRole.WRITABLE },
      { address: sysvar, role: AccountRole.READONLY },
      {
        address: sessionKey,
        role:
          args?.sessionSigner === false
            ? AccountRole.READONLY
            : AccountRole.READONLY_SIGNER,
      },
    ],
    data: executeData(),
  };
}

function systemTransfer(): Instruction {
  return {
    programAddress: SYSTEM_PROGRAM_ADDRESS,
    accounts: [
      { address: vault, role: AccountRole.WRITABLE_SIGNER },
      { address: other, role: AccountRole.WRITABLE },
    ],
    data: new Uint8Array([2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]),
  };
}

function wireOf(
  ixs: Instruction[],
  feePayer: Address = payer,
  version: TransactionVersion = 0,
): string {
  const tx = pipe(
    createTransactionMessage({ version: version as 0 | "legacy" }),
    (m) => setTransactionMessageFeePayer(feePayer, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(LIFETIME, m),
    (m) => appendTransactionMessageInstructions(ixs, m),
  );
  return getBase64EncodedWireTransaction(compileTransaction(tx));
}

function programsOf(transaction: Pick<Transaction, "messageBytes">): string[] {
  const compiled = getCompiledTransactionMessageDecoder().decode(
    transaction.messageBytes,
  );
  if (compiled.version === 1) {
    return compiled.instructionHeaders.map((ix) =>
      String(compiled.staticAccounts[ix.programAccountIndex]),
    );
  }
  return compiled.instructions.map((ix) =>
    String(compiled.staticAccounts[ix.programAddressIndex]),
  );
}

function compiledVersion(transaction: Pick<Transaction, "messageBytes">) {
  return getCompiledTransactionMessageDecoder().decode(transaction.messageBytes)
    .version;
}

const SPONSOR = payer;

function assertSign(
  ...args: Parameters<typeof decodeAndAssertSignTransaction>
) {
  return withRequestContext(() => decodeAndAssertSignTransaction(...args));
}

describe("decodeAndAssertSignTransaction", () => {
  it("accepts compute-budget plus one LazorKit Execute", async () => {
    const asserted = await assertSign(
      wireOf([computeBudgetLimit(200_000), executeIx()]),
      GRANT,
      SPONSOR,
    );
    expect(String(asserted.feePayer)).toBe(String(payer));
    expect(compiledVersion(asserted.transaction)).toBe(0);
  });

  it("prepends compute budget when Execute has none", async () => {
    const asserted = await assertSign(wireOf([executeIx()]), GRANT, SPONSOR);
    expect(compiledVersion(asserted.transaction)).toBe(0);
    expect(String(asserted.feePayer)).toBe(String(payer));
  });

  it("wraps a vault System transfer in session Execute", async () => {
    const asserted = await assertSign(
      wireOf([systemTransfer()], vault),
      GRANT,
      SPONSOR,
    );
    expect(String(asserted.feePayer)).toBe(String(SPONSOR));
    const programs = programsOf(asserted.transaction);
    expect(programs).toContain(String(LAZORKIT_PROGRAM_DEVNET));
    expect(programs).not.toContain(String(SYSTEM_PROGRAM_ADDRESS));
  });

  it("accepts legacy input and recompiles as legacy", async () => {
    const asserted = await assertSign(
      wireOf([systemTransfer()], payer, "legacy"),
      GRANT,
      SPONSOR,
    );
    expect(String(asserted.feePayer)).toBe(String(payer));
    expect(compiledVersion(asserted.transaction)).toBe("legacy");
  });

  it("accepts v1 input and recompiles as v1", async () => {
    const asserted = await assertSign(
      wireOf([systemTransfer()], payer, 1),
      GRANT,
      SPONSOR,
    );
    expect(String(asserted.feePayer)).toBe(String(payer));
    expect(compiledVersion(asserted.transaction)).toBe(1);
  });

  it("wraps memo when vault is fee payer and sole signer", async () => {
    const asserted = await assertSign(
      wireOf(
        [
          {
            programAddress: memo,
            data: new Uint8Array([1]),
          },
        ],
        vault,
      ),
      GRANT,
      SPONSOR,
    );
    expect(String(asserted.feePayer)).toBe(String(SPONSOR));
    const compiled = getCompiledTransactionMessageDecoder().decode(
      asserted.transaction.messageBytes,
    );
    const signers = compiled.staticAccounts
      .slice(0, compiled.header.numSignerAccounts)
      .map(String);
    expect(signers).toContain(String(sessionKey));
    expect(signers).not.toContain(String(vault));
  });

  it("wraps inner transfer when fee payer and vault are distinct signers", async () => {
    const asserted = await assertSign(
      wireOf([systemTransfer()], payer),
      GRANT,
      SPONSOR,
    );
    expect(String(asserted.feePayer)).toBe(String(payer));
    const compiled = getCompiledTransactionMessageDecoder().decode(
      asserted.transaction.messageBytes,
    );
    const signers = compiled.staticAccounts
      .slice(0, compiled.header.numSignerAccounts)
      .map(String);
    expect(signers).toContain(String(sessionKey));
    expect(signers).not.toContain(String(vault));
  });

  it("substitutes session key on a pre-built Execute missing it", async () => {
    const asserted = await assertSign(
      wireOf([
        executeIx({
          sessionSigner: false,
          authority: sessionPda,
        }),
      ]),
      GRANT,
      SPONSOR,
    );
    expect(String(asserted.feePayer)).toBe(String(payer));
    const compiled = getCompiledTransactionMessageDecoder().decode(
      asserted.transaction.messageBytes,
    );
    const signers = compiled.staticAccounts
      .slice(0, compiled.header.numSignerAccounts)
      .map(String);
    expect(signers).toContain(String(sessionKey));
  });

  it("rejects Memo mixed with Execute at the top level", async () => {
    await expect(
      assertSign(
        wireOf([
          {
            programAddress: memo,
            data: new Uint8Array([1]),
          },
          executeIx(),
        ]),
        GRANT,
        SPONSOR,
      ),
    ).rejects.toThrow(SignTransactionError);
  });

  it("rejects System mixed with Execute at the top level", async () => {
    await expect(
      assertSign(wireOf([systemTransfer(), executeIx()]), GRANT, SPONSOR),
    ).rejects.toThrow(/isn’t supported/);
  });

  it("rejects Execute with the wrong wallet", async () => {
    await expect(
      assertSign(wireOf([executeIx({ wallet: other })]), GRANT, SPONSOR),
    ).rejects.toThrow(/isn’t for that wallet/);
  });

  it("rejects Execute with the wrong authority", async () => {
    await expect(
      assertSign(wireOf([executeIx({ authority: other })]), GRANT, SPONSOR),
    ).rejects.toThrow(/isn’t for that wallet/);
  });
});
