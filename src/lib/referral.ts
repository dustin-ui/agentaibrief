// Referral system — Supabase-backed
import { supabaseAdmin } from './supabase';
import crypto from 'crypto';

export interface Referral {
  email: string;
  code: string;
  referredBy?: string;
  referrals: string[];
  createdAt: string;
  rewardsClaimed: string[];
}

export const REWARD_TIERS = [
  { count: 3, id: 'badge', label: '🏅 Referral Champion Badge', description: 'Exclusive badge on your profile' },
  { count: 5, id: 'pro-1month', label: '⭐ 1 Month Pro Free', description: 'One month of Pro access, on us' },
  { count: 10, id: 'call', label: '📞 Call with Dustin', description: '30-min strategy call with Dustin Fox' },
  { count: 25, id: 'lifetime-pro', label: '🚀 Lifetime Pro', description: 'Pro access forever' },
];

function generateCode(): string {
  return crypto.randomBytes(4).toString('hex');
}

// Fetch the list of referred emails for a given referrer code from the
// normalized referral_events table. Returns [] if none / on error.
async function getReferredEmails(
  sb: ReturnType<typeof supabaseAdmin>,
  referrerCode: string
): Promise<string[]> {
  const { data, error } = await sb
    .from('referral_events')
    .select('referred_email')
    .eq('referrer_code', referrerCode);
  if (error) {
    console.error('Failed to load referral_events:', error.message);
    return [];
  }
  return ((data as { referred_email: string }[] | null) || []).map(r => r.referred_email);
}

export async function getOrCreateReferral(email: string, referrerCode?: string): Promise<Referral> {
  const sb = supabaseAdmin();

  // Check if exists (maybeSingle avoids throwing when there are 0 rows)
  const { data: existing } = await sb.from('referrals').select('*').eq('email', email).maybeSingle();
  if (existing) {
    // If a valid referrer code was supplied and we haven't already recorded
    // this referral, insert it now (UNIQUE constraint + maybeSingle dedupe).
    if (referrerCode) {
      await recordReferralEvent(sb, referrerCode, email);
    }
    return {
      email: existing.email,
      code: existing.code,
      referredBy: existing.referred_by || undefined,
      referrals: await getReferredEmails(sb, existing.code),
      createdAt: existing.created_at,
      rewardsClaimed: existing.rewards_claimed || [],
    };
  }

  // Create new entry
  const code = generateCode();
  const entry: { email: string; code: string; referred_by?: string; rewards_claimed: string[] } = {
    email,
    code,
    rewards_claimed: [],
  };

  // Track referral if valid code provided
  if (referrerCode) {
    const { data: referrer } = await sb.from('referrals').select('code, email').eq('code', referrerCode).maybeSingle();
    if (referrer && referrer.email !== email) {
      entry.referred_by = referrerCode;
      await recordReferralEvent(sb, referrerCode, email);
    }
  }

  const { error } = await sb.from('referrals').insert(entry);
  if (error) {
    console.error('Failed to create referral:', error.message);
    // Return a default even on error
    return { email, code, referrals: [], createdAt: new Date().toISOString(), rewardsClaimed: [] };
  }

  return { email, code, referredBy: entry.referred_by, referrals: [], createdAt: new Date().toISOString(), rewardsClaimed: [] };
}

// Insert a referral event. The UNIQUE(referrer_code, referred_email) constraint
// prevents double-counting; we ignore unique-violation errors (code 23505).
async function recordReferralEvent(
  sb: ReturnType<typeof supabaseAdmin>,
  referrerCode: string,
  referredEmail: string
): Promise<void> {
  const { error } = await sb
    .from('referral_events')
    .insert({ referrer_code: referrerCode, referred_email: referredEmail });
  if (error && error.code !== '23505') {
    console.error('Failed to record referral event:', error.message);
  }
}

export async function getReferralByEmail(email: string): Promise<Referral | null> {
  const sb = supabaseAdmin();
  const { data } = await sb.from('referrals').select('*').eq('email', email).maybeSingle();
  if (!data) return null;
  return {
    email: data.email,
    code: data.code,
    referredBy: data.referred_by || undefined,
    referrals: await getReferredEmails(sb, data.code),
    createdAt: data.created_at,
    rewardsClaimed: data.rewards_claimed || [],
  };
}

export async function getReferralByCode(code: string): Promise<Referral | null> {
  const sb = supabaseAdmin();
  const { data } = await sb.from('referrals').select('*').eq('code', code).maybeSingle();
  if (!data) return null;
  return {
    email: data.email,
    code: data.code,
    referredBy: data.referred_by || undefined,
    referrals: await getReferredEmails(sb, data.code),
    createdAt: data.created_at,
    rewardsClaimed: data.rewards_claimed || [],
  };
}

export function getUnlockedRewards(referralCount: number) {
  return REWARD_TIERS.filter(t => referralCount >= t.count);
}

export function getNextReward(referralCount: number) {
  return REWARD_TIERS.find(t => referralCount < t.count) || null;
}
