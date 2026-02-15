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

export async function getOrCreateReferral(email: string, referrerCode?: string): Promise<Referral> {
  const sb = supabaseAdmin();

  // Check if exists
  const { data: existing } = await sb.from('referrals').select('*').eq('email', email).single();
  if (existing) {
    return {
      email: existing.email,
      code: existing.code,
      referredBy: existing.referred_by || undefined,
      referrals: existing.referrals || [],
      createdAt: existing.created_at,
      rewardsClaimed: existing.rewards_claimed || [],
    };
  }

  // Create new entry
  const code = generateCode();
  const entry: { email: string; code: string; referred_by?: string; referrals: string[]; rewards_claimed: string[] } = {
    email,
    code,
    referrals: [],
    rewards_claimed: [],
  };

  // Track referral if valid code provided
  if (referrerCode) {
    const { data: referrer } = await sb.from('referrals').select('*').eq('code', referrerCode).single();
    if (referrer && referrer.email !== email) {
      entry.referred_by = referrerCode;
      // Add to referrer's referrals array
      const updatedReferrals = [...(referrer.referrals || []), email];
      await sb.from('referrals').update({ referrals: updatedReferrals }).eq('code', referrerCode);
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

export async function getReferralByEmail(email: string): Promise<Referral | null> {
  const sb = supabaseAdmin();
  const { data } = await sb.from('referrals').select('*').eq('email', email).single();
  if (!data) return null;
  return {
    email: data.email,
    code: data.code,
    referredBy: data.referred_by || undefined,
    referrals: data.referrals || [],
    createdAt: data.created_at,
    rewardsClaimed: data.rewards_claimed || [],
  };
}

export async function getReferralByCode(code: string): Promise<Referral | null> {
  const sb = supabaseAdmin();
  const { data } = await sb.from('referrals').select('*').eq('code', code).single();
  if (!data) return null;
  return {
    email: data.email,
    code: data.code,
    referredBy: data.referred_by || undefined,
    referrals: data.referrals || [],
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
