import { promises as fs } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

const REFERRAL_DB = join(process.cwd(), 'referrals.json');

export interface Referral {
  email: string;
  code: string;
  referredBy?: string; // code of referrer
  referrals: string[]; // emails of people they referred
  createdAt: string;
  rewardsClaimed: string[]; // tier names already claimed
}

export const REWARD_TIERS = [
  { count: 3, id: 'badge', label: '🏅 Referral Champion Badge', description: 'Exclusive badge on your profile' },
  { count: 5, id: 'pro-1month', label: '⭐ 1 Month Pro Free', description: 'One month of Pro access, on us' },
  { count: 10, id: 'call', label: '📞 Call with Dustin', description: '30-min strategy call with Dustin Fox' },
  { count: 25, id: 'lifetime-pro', label: '🚀 Lifetime Pro', description: 'Pro access forever' },
];

function generateCode(): string {
  return crypto.randomBytes(4).toString('hex'); // 8-char hex code
}

async function loadDB(): Promise<Referral[]> {
  try {
    const data = await fs.readFile(REFERRAL_DB, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveDB(referrals: Referral[]): Promise<void> {
  await fs.writeFile(REFERRAL_DB, JSON.stringify(referrals, null, 2));
}

export async function getOrCreateReferral(email: string, referrerCode?: string): Promise<Referral> {
  const db = await loadDB();
  
  let entry = db.find(r => r.email === email);
  if (entry) return entry;

  // Create new entry
  entry = {
    email,
    code: generateCode(),
    referredBy: undefined,
    referrals: [],
    createdAt: new Date().toISOString(),
    rewardsClaimed: [],
  };

  // Track referral if valid code provided
  if (referrerCode) {
    const referrer = db.find(r => r.code === referrerCode);
    if (referrer && referrer.email !== email) {
      entry.referredBy = referrerCode;
      referrer.referrals.push(email);
    }
  }

  db.push(entry);
  await saveDB(db);
  return entry;
}

export async function getReferralByEmail(email: string): Promise<Referral | null> {
  const db = await loadDB();
  return db.find(r => r.email === email) || null;
}

export async function getReferralByCode(code: string): Promise<Referral | null> {
  const db = await loadDB();
  return db.find(r => r.code === code) || null;
}

export function getUnlockedRewards(referralCount: number) {
  return REWARD_TIERS.filter(t => referralCount >= t.count);
}

export function getNextReward(referralCount: number) {
  return REWARD_TIERS.find(t => referralCount < t.count) || null;
}
