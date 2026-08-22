import {
  address,
  assertIsTransactionWithinSizeLimit,
  getBase64EncodedWireTransaction,
  getBase64Encoder,
  getCompiledTransactionMessageDecoder,
  getTransactionDecoder,
  getTransactionLifetimeConstraintFromCompiledTransactionMessage,
  type Address,
  type Transaction,
  type TransactionModifyingSigner,
  type TransactionWithinSizeLimit,
  type TransactionWithLifetime,
} from "@solana/kit";

const DEFAULT_MODIFY_AND_SIGN_URL = "/api/modifyAndSign";

export type CreateTransactionModifyingSignerOptions = {
  modifyAndSignUrl?: string;
};

async function modifyAndSignOne(
  transaction: Transaction,
  requestId: string,
  response: unknown,
  url: string,
): Promise<Transaction & TransactionWithinSizeLimit & TransactionWithLifetime> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      requestId,
      response,
      transaction: getBase64EncodedWireTransaction(transaction),
    }),
  });
  const body = (await res.json().catch(() => ({}))) as {
    error?: string;
    transaction?: string;
  };
  if (!res.ok) {
    throw new Error(body.error ?? "Couldn’t sign");
  }
  if (typeof body.transaction !== "string" || !body.transaction) {
    throw new Error("Couldn’t sign");
  }
  const decoded = getTransactionDecoder().decode(
    getBase64Encoder().encode(body.transaction),
  );
  const compiled = getCompiledTransactionMessageDecoder().decode(
    decoded.messageBytes,
  );
  const lifetimeConstraint =
    await getTransactionLifetimeConstraintFromCompiledTransactionMessage(
      compiled,
    );
  const signed = Object.freeze({
    ...decoded,
    lifetimeConstraint,
  });
  assertIsTransactionWithinSizeLimit(signed);
  return signed;
}

/**
 * Kit `TransactionModifyingSigner` whose `modifyAndSignTransactions` POSTs
 * each compiled transaction to a wallet `/api/modifyAndSign` endpoint.
 */
export function createTransactionModifyingSigner<TAddress extends string>(
  response: unknown,
  requestId: string,
  vault: Address<TAddress> | string,
  options?: CreateTransactionModifyingSignerOptions,
): TransactionModifyingSigner<TAddress> {
  const url = options?.modifyAndSignUrl ?? DEFAULT_MODIFY_AND_SIGN_URL;
  return {
    address: address(vault) as Address<TAddress>,
    async modifyAndSignTransactions(transactions) {
      return Promise.all(
        transactions.map((transaction) =>
          modifyAndSignOne(transaction, requestId, response, url),
        ),
      );
    },
  };
}
