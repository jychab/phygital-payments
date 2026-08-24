import {
  address,
  appendTransactionMessageInstructions,
  compileTransaction,
  createTransactionMessage,
  getBase64EncodedWireTransaction,
  isTransactionModifyingSigner,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  type Blockhash,
} from "@solana/kit";
import { createTransactionModifyingSigner } from "lazor-kit";
import { afterEach, describe, expect, it, vi } from "vitest";

const vault = address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");

const LIFETIME = {
  blockhash: "11111111111111111111111111111111" as Blockhash,
  lastValidBlockHeight: 300n,
};

function unsignedWire(): string {
  const tx = pipe(
    createTransactionMessage({ version: 0 }),
    (m) => setTransactionMessageFeePayer(vault, m),
    (m) => setTransactionMessageLifetimeUsingBlockhash(LIFETIME, m),
    (m) =>
      appendTransactionMessageInstructions(
        [
          {
            programAddress: address("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
            data: new Uint8Array([1]),
          },
        ],
        m,
      ),
  );
  return getBase64EncodedWireTransaction(compileTransaction(tx));
}

function unsignedTransaction() {
  return compileTransaction(
    pipe(
      createTransactionMessage({ version: 0 }),
      (m) => setTransactionMessageFeePayer(vault, m),
      (m) => setTransactionMessageLifetimeUsingBlockhash(LIFETIME, m),
      (m) =>
        appendTransactionMessageInstructions(
          [
            {
              programAddress: address(
                "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
              ),
              data: new Uint8Array([1]),
            },
          ],
          m,
        ),
    ),
  );
}

describe("createTransactionModifyingSigner", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("implements TransactionModifyingSigner at the vault address", () => {
    const signer = createTransactionModifyingSigner({}, "req", vault);
    expect(isTransactionModifyingSigner(signer)).toBe(true);
    expect(signer.address).toBe(vault);
  });

  it("POSTs requestId, response, and transaction to modifyAndSign", async () => {
    const response = { id: "chip-key" };
    const returned = unsignedWire();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ transaction: returned }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const signer = createTransactionModifyingSigner(response, "req-1", vault);
    const input = unsignedTransaction();
    const [signed] = await signer.modifyAndSignTransactions([input]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.revibase.com/api/modifyAndSign");
    expect(init.method).toBe("POST");
    const body = JSON.parse(String(init.body)) as {
      requestId: string;
      response: unknown;
      transaction: string;
    };
    expect(body.requestId).toBe("req-1");
    expect(body.response).toEqual(response);
    expect(body.transaction).toBe(getBase64EncodedWireTransaction(input));
    expect(signed.lifetimeConstraint).toBeDefined();
    expect("blockhash" in signed.lifetimeConstraint).toBe(true);
  });

  it("uses modifyAndSignUrl when provided", async () => {
    const returned = unsignedWire();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ transaction: returned }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const signer = createTransactionModifyingSigner({}, "req", vault, {
      modifyAndSignUrl: "https://wallet.example/api/modifyAndSign",
    });
    await signer.modifyAndSignTransactions([unsignedTransaction()]);
    expect(fetchMock.mock.calls[0]![0]).toBe(
      "https://wallet.example/api/modifyAndSign",
    );
  });
});
