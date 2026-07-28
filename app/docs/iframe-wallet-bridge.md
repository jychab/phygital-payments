# Iframe wallet bridge

Phygital Pay can run standalone or embedded as an iframe. When embedded, it can
delegate wallet connection and transaction signing to the **parent window** over
`postMessage`. If the parent doesn't answer the handshake, the app silently
falls back to its built-in **Privy** wallet — so an embed works with or without
parent support.

- Child (this app) implementation: [`src/lib/wallet/parent-bridge.ts`](../src/lib/wallet/parent-bridge.ts)
- Backend selection / React glue: [`src/lib/wallet/wallet-context.tsx`](../src/lib/wallet/wallet-context.tsx)

## How selection works

On mount, if `window.self !== window.top`, the app sends `connect` probes to the
parent and waits up to `NEXT_PUBLIC_IFRAME_PROBE_TIMEOUT_MS` (default 1200 ms).

- Parent replies `ready` → **parent mode**: address + signing go through the parent.
- No reply before timeout → **Privy mode** (the existing standalone behavior).

Top-level (non-iframe) usage always uses Privy with no delay.

## Protocol

Every message is an object carrying `channel: "phygital-pay"` and `v: 1`.
Transactions are base64-encoded **wire** (fully serialized) transactions.

### Child → parent

| `kind`              | fields                          | meaning                                  |
| ------------------- | ------------------------------- | ---------------------------------------- |
| `connect`           | —                               | handshake probe (repeats until answered) |
| `sign-transactions` | `id`, `transactions: string[]`  | sign these base64 wire transactions      |
| `disconnect`        | —                               | user logged out inside the iframe        |

### Parent → child

| `kind`                      | fields                          | meaning                                    |
| --------------------------- | ------------------------------- | ------------------------------------------ |
| `ready`                     | `address: string`               | handshake ack; the connected Solana address |
| `accounts-changed`          | `address: string \| null`       | wallet switched (null = disconnected)      |
| `sign-transactions:result`  | `id`, `transactions: string[]`  | the signed base64 wire transactions        |
| `sign-transactions:error`   | `id`, `message: string`         | signing failed / was declined              |

Notes:

- The child builds the **full** transaction (including fee payer). The parent
  must sign each wire as-is and return the signed wire — do not rebuild it.
- `id` correlates a `sign-transactions` request with its result/error.
- The child pins to the origin of the first `ready` message and ignores messages
  from any other origin thereafter. If `NEXT_PUBLIC_PARENT_ORIGINS` is set, only
  those origins are accepted.

## Reference parent implementation

The parent already has a Solana wallet (e.g. its own Privy session) exposing an
`address` and a `signTransaction(wireBytes) => signedWireBytes`. Wire it up like:

```ts
const CHANNEL = "phygital-pay";
const V = 1;

// `frame` is the HTMLIFrameElement embedding Phygital Pay.
function connectPhygitalPay(
  frame: HTMLIFrameElement,
  wallet: {
    address: string;
    signTransaction: (wire: Uint8Array) => Promise<Uint8Array>;
  },
  frameOrigin: string, // the iframe's origin, e.g. "https://pay.revibase.com"
) {
  const post = (msg: Record<string, unknown>) =>
    frame.contentWindow?.postMessage({ channel: CHANNEL, v: V, ...msg }, frameOrigin);

  const b64 = (b: Uint8Array) => btoa(String.fromCharCode(...b));
  const bytes = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

  window.addEventListener("message", async (e) => {
    if (e.source !== frame.contentWindow) return;
    if (e.origin !== frameOrigin) return;
    const d = e.data;
    if (!d || d.channel !== CHANNEL || d.v !== V) return;

    switch (d.kind) {
      case "connect":
        post({ kind: "ready", address: wallet.address });
        break;
      case "sign-transactions":
        try {
          const signed = await Promise.all(
            (d.transactions as string[]).map(async (tx) =>
              b64(await wallet.signTransaction(bytes(tx))),
            ),
          );
          post({ kind: "sign-transactions:result", id: d.id, transactions: signed });
        } catch (err) {
          post({
            kind: "sign-transactions:error",
            id: d.id,
            message: err instanceof Error ? err.message : "Signing failed",
          });
        }
        break;
      case "disconnect":
        // optional: reflect disconnect in the host UI
        break;
    }
  });

  // If the wallet later changes:
  // post({ kind: "accounts-changed", address: newAddressOrNull });
}
```

The parent must also allow framing this app (no blocking `X-Frame-Options` /
`Content-Security-Policy: frame-ancestors` on the iframe's document — Phygital
Pay sets none by default).
