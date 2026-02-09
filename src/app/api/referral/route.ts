import { NextRequest, NextResponse } from 'next/server';
import { getReferralByEmail, getUnlockedRewards, getNextReward, REWARD_TIERS } from '@/lib/referral';

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
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
}
