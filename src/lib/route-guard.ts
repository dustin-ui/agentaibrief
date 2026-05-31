import { NextRequest, NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { getAuthedUser } from '@/lib/api-auth';
import { getClientIp, tokenBucket } from '@/lib/rate-limit';

/**
 * Shared guard for cost-bearing LLM / 3rd-party API routes.
 *
 * Responsibilities:
 *  1. ALWAYS rate-limit (per-IP, and per-authed-user when a session is present).
 *  2. Optionally require an authenticated session + tier gate.
 *
 * Free-access toggle:
 *  The product currently runs in free-access mode (see auth-context.tsx
 *  FREE_ACCESS_MODE). Hard auth/tier blocking is therefore gated behind the
 *  REQUIRE_AUTH_ON_TOOLS env flag so we can flip monetization on without a code
 *  change. Rate limiting is NEVER skipped, regardless of the flag.
 *
 * TODO(dustin): when monetization is re-enabled, set REQUIRE_AUTH_ON_TOOLS=true
 * (and optionally TOOLS_MIN_TIER) and wire real per-tier token/credit budgets.
 */

export interface GuardOptions {
  /** Stable route name used as the rate-limit bucket prefix, e.g. "analyze". */
  name: string;
  /** Per-IP burst capacity. Default 10. */
  ipCapacity?: number;
  /** Per-IP sustained refill (tokens/min). Default 10. */
  ipPerMinute?: number;
  /** Per-authed-user burst capacity. Default 20. */
  userCapacity?: number;
  /** Per-authed-user sustained refill (tokens/min). Default 20. */
  userPerMinute?: number;
}

export interface GuardPass {
  ok: true;
  /** Authenticated user, if a valid session was supplied (may be null in free mode). */
  user: User | null;
  response?: never;
}

export interface GuardFail {
  ok: false;
  user?: never;
  response: NextResponse;
}

export type GuardResult = GuardPass | GuardFail;

function authRequired(): boolean {
  return /^(1|true|yes)$/i.test(process.env.REQUIRE_AUTH_ON_TOOLS || '');
}

function rateLimited(name: string, scope: string, capacity: number, perMinute: number) {
  const res = tokenBucket(`${name}:${scope}`, capacity, perMinute);
  if (res.allowed) return null;
  return NextResponse.json(
    { error: 'Rate limit exceeded. Please slow down and try again shortly.' },
    { status: 429, headers: { 'Retry-After': String(res.retryAfterSec) } }
  );
}

/**
 * Run the guard. Returns { ok: true, user } to proceed, or { ok: false, response }
 * with a ready-to-return 401/403/429 NextResponse.
 */
export async function guardRoute(
  req: NextRequest,
  opts: GuardOptions
): Promise<GuardResult> {
  const {
    name,
    ipCapacity = 10,
    ipPerMinute = 10,
    userCapacity = 20,
    userPerMinute = 20,
  } = opts;

  // 1. Per-IP rate limit (always on).
  const ip = getClientIp(req);
  const ipBlock = rateLimited(name, `ip:${ip}`, ipCapacity, ipPerMinute);
  if (ipBlock) return { ok: false, response: ipBlock };

  // 2. Resolve session (best-effort; may be null in free-access mode).
  const user = await getAuthedUser(req);

  if (authRequired() && !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  // 3. Per-user rate limit (tighter accountability when authed).
  if (user) {
    const userBlock = rateLimited(name, `user:${user.id}`, userCapacity, userPerMinute);
    if (userBlock) return { ok: false, response: userBlock };

    // TODO(dustin): tier gating. When REQUIRE_AUTH_ON_TOOLS + monetization are
    // on, read the user's subscription_tier from `profiles` and compare against
    // TOOLS_MIN_TIER here, returning 403 if insufficient.
  }

  return { ok: true, user };
}
