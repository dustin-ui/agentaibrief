import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Signed-state helpers for the Constant Contact OAuth flow.
 *
 * The OAuth `state` is a server-issued, HMAC-signed token bound to a one-time
 * nonce stored in an HttpOnly cookie. This prevents CSRF / token-injection
 * (an attacker can no longer pass an arbitrary `state=<victim_user_id>` to bind
 * their tokens to a victim, nor force the admin_reauth path).
 */

export const CC_OAUTH_COOKIE = 'cc_oauth_nonce';
const STATE_MAX_AGE_MS = 10 * 60 * 1000; // 10 minutes

function getSecret(): string {
  // Dedicated secret if provided, else fall back to the service-role key which
  // is always available server-side (never exposed to clients).
  const secret = process.env.CC_OAUTH_STATE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error('CC OAuth signing secret not configured');
  return secret;
}

function b64url(buf: Buffer): string {
  return buf.toString('base64url');
}

export interface CcStatePayload {
  /** one-time nonce, mirrored in the HttpOnly cookie */
  n: string;
  /** authenticated user id (newsletter profile owner), or null for admin_reauth */
  u: string | null;
  /** flow mode */
  m: 'connect' | 'admin_reauth';
  /** issued-at (ms) */
  t: number;
}

export function newNonce(): string {
  return b64url(randomBytes(24));
}

/** Build a signed state string for the given payload. */
export function signState(payload: CcStatePayload): string {
  const json = JSON.stringify(payload);
  const body = b64url(Buffer.from(json, 'utf8'));
  const sig = b64url(createHmac('sha256', getSecret()).update(body).digest());
  return `${body}.${sig}`;
}

/**
 * Verify a signed state against the nonce from the HttpOnly cookie.
 * Returns the payload if valid, else null.
 */
export function verifyState(state: string | null, cookieNonce: string | null): CcStatePayload | null {
  if (!state || !cookieNonce) return null;
  const parts = state.split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;

  const expectedSig = b64url(createHmac('sha256', getSecret()).update(body).digest());
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  let payload: CcStatePayload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (!payload || typeof payload.n !== 'string') return null;
  // nonce must match the HttpOnly cookie (constant-time)
  const a = Buffer.from(payload.n);
  const b = Buffer.from(cookieNonce);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  // expiry
  if (typeof payload.t !== 'number' || Date.now() - payload.t > STATE_MAX_AGE_MS) return null;

  return payload;
}
