export type SignerEnv = {
  phygital_signer: D1Database;
  APP_ENCRYPTION_SECRET: string;
  SIGNER_INTERNAL_TOKEN?: string;
};

export function requireEncryptionSecret(env: SignerEnv): string {
  const secret = env.APP_ENCRYPTION_SECRET?.trim();
  if (!secret) throw new Error("APP_ENCRYPTION_SECRET is not configured");
  return secret;
}
