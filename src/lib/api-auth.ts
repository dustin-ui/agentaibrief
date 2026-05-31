import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import type { User } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Server-side auth helpers for API routes.
 *
 * Every service-role (SUPABASE_SERVICE_ROLE_KEY) route bypasses RLS, so each
 * route MUST independently authorize the caller. Use these helpers to do that
 * consistently:
 *   - getAuthedUser / requireAuth  -> validate a Supabase session JWT
 *   - requireAdmin                 -> validate session JWT + ADMIN_EMAILS allow-list
 *   - requireCronSecret            -> validate the CRON_SECRET bearer (constant-time)
 */

/** Extract a bearer token from the Authorization header. */
export function getBearerToken(req: NextRequest): string | null {
  const header = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

/**
 * Validate the Supabase access token from the Authorization: Bearer header.
 * Returns the authenticated user, or null if missing/invalid.
 */
export async function getAuthedUser(req: NextRequest): Promise<User | null> {
  const token = getBearerToken(req);
  if (!token) return null;
  try {
    const { data, error } = await supabaseAdmin().auth.getUser(token);
    if (error || !data?.user) return null;
    return data.user;
  } catch {
    return null;
  }
}

export type AuthResult =
  | { user: User; response?: never }
  | { user?: never; response: NextResponse };

/**
 * Require a valid authenticated user. On failure returns a 401 response in
 * `response`; on success returns the `user`.
 */
export async function requireAuth(req: NextRequest): Promise<AuthResult> {
  const user = await getAuthedUser(req);
  if (!user) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { user };
}

/** Parse the ADMIN_EMAILS env allow-list (comma-separated). */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Check whether an email is on the ADMIN_EMAILS allow-list. */
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

/**
 * Require a valid authenticated user whose email is on the ADMIN_EMAILS
 * allow-list. Returns a 401/403 response on failure.
 */
export async function requireAdmin(req: NextRequest): Promise<AuthResult> {
  const user = await getAuthedUser(req);
  if (!user) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (!isAdminEmail(user.email)) {
    return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { user };
}

/** Constant-time string comparison that does not leak length via early return. */
export function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  if (bufA.length !== bufB.length) {
    // Still run a compare against a same-length buffer to avoid trivial timing,
    // then return false.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/**
 * Require the CRON_SECRET bearer token (constant-time compare).
 * - Fails closed if CRON_SECRET is not configured.
 * - Does NOT treat the spoofable `x-vercel-cron` header as an auth bypass.
 *   Vercel cron can send the Authorization header, so the bearer is required
 *   for all callers.
 * Returns null on success, or a NextResponse error on failure.
 */
export function requireCronSecret(req: NextRequest): NextResponse | null {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error('[auth] CRON_SECRET is not configured; rejecting cron request');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 503 });
  }
  const token = getBearerToken(req);
  if (!token || !constantTimeEqual(token, cronSecret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

/**
 * Allow-listed site URLs. Never trust the request Origin header for building
 * Stripe redirect URLs (open-redirect / phishing risk). Use NEXT_PUBLIC_SITE_URL,
 * falling back to the canonical production domain.
 */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://agentaibrief.com';
  return url.replace(/\/+$/, '');
}
