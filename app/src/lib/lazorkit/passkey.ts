import { compressP256PublicKey } from "lazor-kit";

const ES256 = -7;

export type PasskeyIdentity = {
  credentialId: Uint8Array;
  compressedPubkey: Uint8Array;
  rpId: string;
};

export type CreatedPasskey = PasskeyIdentity & {
  authenticatorData: Uint8Array;
  clientDataJSON: Uint8Array;
};

export type PasskeyAssertion = {
  credentialId: Uint8Array;
  signatureDer: Uint8Array;
  authenticatorData: Uint8Array;
  clientDataJSON: Uint8Array;
  userHandle: Uint8Array | null;
};

export function relyingPartyId(): string {
  if (typeof window === "undefined") {
    throw new Error("Passkeys are only available in the browser");
  }
  return window.location.hostname;
}

function asBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
}

function randomBytes(length: number): Uint8Array {
  const out = new Uint8Array(length);
  crypto.getRandomValues(out);
  return out;
}

/** COSE EC2 P-256 (x, y) from authenticatorData attested credential. */
function coseP256FromAuthenticatorData(
  authenticatorData: Uint8Array,
): Uint8Array | null {
  if (authenticatorData.length < 37) return null;
  const flags = authenticatorData[32]!;
  if ((flags & 0x40) === 0) return null; // no attested credential
  let offset = 37 + 16;
  if (authenticatorData.length < offset + 2) return null;
  const credIdLen =
    (authenticatorData[offset]! << 8) | authenticatorData[offset + 1]!;
  offset += 2 + credIdLen;
  const cose = authenticatorData.subarray(offset);
  // Minimal CBOR map scan for keys -2 (x) and -3 (y), 32-byte bstr values.
  const x = findCoseBytes(cose, 0x21);
  const y = findCoseBytes(cose, 0x22);
  if (!x || !y || x.length !== 32 || y.length !== 32) return null;
  const uncompressed = new Uint8Array(65);
  uncompressed[0] = 0x04;
  uncompressed.set(x, 1);
  uncompressed.set(y, 33);
  return compressP256PublicKey(uncompressed);
}

function findCoseBytes(cose: Uint8Array, key: number): Uint8Array | null {
  for (let i = 0; i < cose.length - 3; i++) {
    if (cose[i] === key && (cose[i + 1]! & 0xe0) === 0x40) {
      const n = cose[i + 1]! & 0x1f;
      if (n === 24) {
        const len = cose[i + 2]!;
        if (i + 3 + len <= cose.length) return cose.slice(i + 3, i + 3 + len);
      } else if (n < 24) {
        if (i + 2 + n <= cose.length) return cose.slice(i + 2, i + 2 + n);
      }
    }
  }
  return null;
}

function compressedFromAttestation(
  response: AuthenticatorAttestationResponse,
): Uint8Array {
  const spki =
    typeof response.getPublicKey === "function" ? response.getPublicKey() : null;
  if (spki && spki.byteLength > 0) {
    return compressP256PublicKey(new Uint8Array(spki));
  }
  const authData =
    typeof response.getAuthenticatorData === "function"
      ? response.getAuthenticatorData()
      : null;
  if (authData) {
    const fromCose = coseP256FromAuthenticatorData(new Uint8Array(authData));
    if (fromCose) return fromCose;
  }
  throw new Error("Couldn’t read the passkey public key");
}

export async function createPlatformPasskey(args: {
  challenge: Uint8Array;
}): Promise<CreatedPasskey> {
  if (typeof navigator === "undefined" || !navigator.credentials?.create) {
    throw new Error("Passkeys are not supported in this browser");
  }
  const rpId = relyingPartyId();
  const credential = (await navigator.credentials.create({
    publicKey: {
      rp: { name: "Wallet", id: rpId },
      user: {
        id: asBuffer(randomBytes(32)),
        name: "wallet",
        displayName: "Wallet",
      },
      challenge: asBuffer(args.challenge),
      pubKeyCredParams: [{ type: "public-key", alg: ES256 }],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "required",
        requireResidentKey: true,
        userVerification: "required",
      },
      timeout: 60_000,
      attestation: "none",
    },
  })) as PublicKeyCredential | null;
  if (!credential) throw new Error("Passkey was cancelled");
  const response = credential.response as AuthenticatorAttestationResponse;
  return {
    credentialId: new Uint8Array(credential.rawId),
    compressedPubkey: compressedFromAttestation(response),
    rpId,
    authenticatorData: new Uint8Array(response.getAuthenticatorData()),
    clientDataJSON: new Uint8Array(response.clientDataJSON),
  };
}

export async function getPasskeyAssertion(args: {
  challenge: Uint8Array;
  credentialId?: Uint8Array;
  rpId?: string;
}): Promise<PasskeyAssertion> {
  if (typeof navigator === "undefined" || !navigator.credentials?.get) {
    throw new Error("Passkeys are not supported in this browser");
  }
  const rpId = args.rpId ?? relyingPartyId();
  const credential = (await navigator.credentials.get({
    publicKey: {
      challenge: asBuffer(args.challenge),
      rpId,
      allowCredentials: args.credentialId
        ? [{ type: "public-key", id: asBuffer(args.credentialId) }]
        : [],
      userVerification: "required",
      timeout: 60_000,
    },
  })) as PublicKeyCredential | null;
  if (!credential) throw new Error("Passkey was cancelled");
  const response = credential.response as AuthenticatorAssertionResponse;
  return {
    credentialId: new Uint8Array(credential.rawId),
    signatureDer: new Uint8Array(response.signature),
    authenticatorData: new Uint8Array(response.authenticatorData),
    clientDataJSON: new Uint8Array(response.clientDataJSON),
    userHandle: response.userHandle
      ? new Uint8Array(response.userHandle)
      : null,
  };
}
