// Centralized configuration: Constant Contact list IDs + AI model names.
//
// Goals:
//  - Single source of truth for CC list UUIDs (sourced from env, with the
//    previously-hardcoded values as documented fallbacks so behavior is
//    unchanged if env vars are not yet set).
//  - Single source of truth for per-provider model IDs so dated snapshot
//    strings (which providers eventually retire) live in one place.
//
// Dustin TODO: set CC_LIST_FREE_ID / CC_LIST_PRO_ID / CC_LIST_INNER_CIRCLE_ID
// (and optionally the AI_MODEL_* overrides) in the environment. Once set,
// the hardcoded fallbacks below can be removed.

export type Tier = 'free' | 'pro' | 'inner_circle';

// --- Constant Contact list IDs -------------------------------------------
// Fallbacks preserve the prior hardcoded values to avoid a behavior change
// before env vars are configured.
export const CC_LISTS: Record<Tier, string> = {
  free: process.env.CC_LIST_FREE_ID || '6ed164ce-017a-11f1-a92b-0242340da00b',
  pro: process.env.CC_LIST_PRO_ID || '8807bcb0-053d-11f1-ac8d-0242d66c4631',
  inner_circle:
    process.env.CC_LIST_INNER_CIRCLE_ID || 'ddceae1c-054a-11f1-bdec-02425936aa0c',
};

/** Return the CC list IDs a member of `tier` should be on (always includes free). */
export function ccListsForTier(tier: Tier): string[] {
  if (tier === 'free') return [CC_LISTS.free];
  return [CC_LISTS.free, CC_LISTS[tier]];
}

// --- AI model names per provider -----------------------------------------
// Centralized so dated snapshot IDs are updated in one place. Each can be
// overridden via env without a code change.
export const AI_MODELS = {
  anthropic: process.env.AI_MODEL_ANTHROPIC || 'claude-sonnet-4-20250514',
  gemini: process.env.AI_MODEL_GEMINI || 'gemini-2.0-flash',
  grok: process.env.AI_MODEL_GROK || 'grok-3-mini',
  perplexity: process.env.AI_MODEL_PERPLEXITY || 'sonar',
  openai: process.env.AI_MODEL_OPENAI || 'gpt-4o',
} as const;
