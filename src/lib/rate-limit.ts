// Lightweight in-memory token-bucket rate limiter.
//
// COLD-START CAVEAT: This state lives in module memory and is therefore
// per-serverless-instance. On Vercel, each cold start / concurrent lambda gets
// its own buckets, so the effective limit is (configured limit) x (warm
// instances). This is intentionally a cheap first line of defense against
// runaway/scripted abuse of cost-bearing LLM routes given there is no Redis
// available. For hard, globally-consistent limits, move this to a shared store
// (Upstash Redis, Vercel KV, etc.). TODO(dustin): swap to a shared store if/when
// monetization + strict per-user budgets are enabled.

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds the caller should wait before retrying (only meaningful when !allowed). */
  retryAfterSec: number;
  /** Approximate tokens remaining in the bucket after this call. */
  remaining: number;
}

interface Bucket {
  tokens: number;
  last: number; // ms timestamp of last refill
}

const buckets = new Map<string, Bucket>();
let lastPrune = Date.now();
const PRUNE_INTERVAL_MS = 5 * 60 * 1000;

function maybePrune(now: number) {
  if (now - lastPrune < PRUNE_INTERVAL_MS) return;
  lastPrune = now;
  // Drop buckets idle for >15 min to bound memory.
  for (const [key, b] of buckets) {
    if (now - b.last > 15 * 60 * 1000) buckets.delete(key);
  }
}

/**
 * Token-bucket rate limit.
 * @param key       Unique bucket key (e.g. "analyze:ip:1.2.3.4").
 * @param capacity  Max burst (bucket size).
 * @param perMinute Sustained refill rate, tokens per minute.
 */
export function tokenBucket(
  key: string,
  capacity: number,
  perMinute: number
): RateLimitResult {
  const now = Date.now();
  maybePrune(now);

  const refillPerMs = perMinute / 60_000;
  let b = buckets.get(key);
  if (!b) {
    b = { tokens: capacity, last: now };
    buckets.set(key, b);
  }

  // Refill based on elapsed time.
  const elapsed = now - b.last;
  if (elapsed > 0) {
    b.tokens = Math.min(capacity, b.tokens + elapsed * refillPerMs);
    b.last = now;
  }

  if (b.tokens >= 1) {
    b.tokens -= 1;
    return { allowed: true, retryAfterSec: 0, remaining: Math.floor(b.tokens) };
  }

  // Not enough tokens — compute wait until 1 token is available.
  const deficit = 1 - b.tokens;
  const waitMs = refillPerMs > 0 ? deficit / refillPerMs : 60_000;
  return {
    allowed: false,
    retryAfterSec: Math.max(1, Math.ceil(waitMs / 1000)),
    remaining: 0,
  };
}

/** Best-effort client IP extraction from common proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}
