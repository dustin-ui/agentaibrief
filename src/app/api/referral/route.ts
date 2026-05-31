import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getReferralByEmail, getUnlockedRewards, getNextReward, REWARD_TIERS } from '@/lib/referral';

// Resolve the authenticated user (and their email) from a Bearer token.
async function getUserFromRequest(req: NextRequest): Promise<{ id: string; email: string } | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return { id: user.id, email: user.email || '' };
}

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Require the caller to be the authenticated owner of this email.
    // Referral payloads include the list of referred emails (PII) and must
    // never be enumerable for arbitrary addresses.
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    if (user.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const referral = await getReferralByEmail(email);
    if (!referral) {
      return NextResponse.json({ error: 'No referral found for this email' }, { status: 404 });
    }

    const count = referral.referrals.length;
    return NextResponse.json({
      code: referral.code,
      referralCount: count,
      referrals: referral.referrals,
      unlockedRewards: getUnlockedRewards(count),
      nextReward: getNextReward(count),
      allTiers: REWARD_TIERS,
      referralLink: `https://agentaibrief.com/?ref=${referral.code}`,
    });
  } catch (error: unknown) {
    console.error('Referral lookup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
