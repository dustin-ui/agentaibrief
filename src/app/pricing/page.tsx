'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    features: ['Daily email newsletter', 'AI news feed', 'Blog content', 'Prompt Library (53 prompts)'],
    tier: 'free' as const,
    cta: 'Current Plan',
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/mo',
    features: [
      'Everything in Free',
      'Listing Content Factory (9 outputs per listing)',
      'Newsletter Builder (branded weekly emails)',
      'Neighborhood Market Brief',
      'Listing Launch Radar (pre-listing signals)',
      'Sphere Seismograph (contact intelligence)',
      'Contract Analyzer (1 address/mo)',
    ],
    tier: 'pro' as const,
    cta: 'Subscribe',
    popular: false,
    monthlyEnv: 'STRIPE_PRO_MONTHLY_PRICE_ID',
    annualEnv: 'STRIPE_PRO_ANNUAL_PRICE_ID',
  },
  {
    name: 'Inner Circle',
    price: '$99',
    period: '/mo',
    features: [
      'Everything in Pro',
      'Content Briefing (15 viral stories weekly)',
      'SEO Command Center (local rank grid + audit)',
      'SEO Sniper (keyword domination)',
      'Custom GPT Templates (16 deployable bots)',
      'Pro SEO Dashboard (weekly reports)',
      'Contract Comparison (unlimited)',
      'Direct access to Dustin Fox',
    ],
    tier: 'inner_circle' as const,
    cta: 'Subscribe',
    popular: true,
    monthlyEnv: 'STRIPE_IC_MONTHLY_PRICE_ID',
    annualEnv: 'STRIPE_IC_ANNUAL_PRICE_ID',
  },
  {
    name: 'Team',
    price: '$299',
    period: '/mo',
    features: [
      'Everything in Inner Circle',
      '5 team member seats',
      'Team analytics dashboard',
      'Priority support',
      'Custom onboarding call',
    ],
    tier: 'team' as const,
    cta: 'Subscribe',
    monthlyEnv: 'STRIPE_TEAM_MONTHLY_PRICE_ID',
    annualEnv: 'STRIPE_TEAM_ANNUAL_PRICE_ID',
  },
];

// Price IDs loaded at build time via env
const PRICE_IDS: Record<string, string> = {
  STRIPE_PRO_MONTHLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID || 'price_1SyOXcLkSTdcJUwxORq7h7AT',
  STRIPE_PRO_ANNUAL_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID || 'price_1SyOXcLkSTdcJUwxWJSqmkMS',
  STRIPE_IC_MONTHLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_IC_MONTHLY_PRICE_ID || 'price_1SyOXdLkSTdcJUwxyayQCT1g',
  STRIPE_IC_ANNUAL_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_IC_ANNUAL_PRICE_ID || 'price_1SyOXdLkSTdcJUwxgWzEF9OZ',
  STRIPE_TEAM_MONTHLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_TEAM_MONTHLY_PRICE_ID || '',
  STRIPE_TEAM_ANNUAL_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_TEAM_ANNUAL_PRICE_ID || '',
};

export default function PricingPage() {
  const router = useRouter();
  const { user, tier, isLoggedIn } = useAuth();
  const [annual, setAnnual] = useState(false);
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const handleSubscribe = async (tierInfo: typeof TIERS[number]) => {
    if (!isLoggedIn) {
      router.push('/signup');
      return;
    }
    const envKey = annual ? tierInfo.annualEnv : tierInfo.monthlyEnv;
    if (!envKey) return;
    const priceId = PRICE_IDS[envKey];
    setLoadingTier(tierInfo.tier);

    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, userId: user?.id, referral: typeof window !== 'undefined' && (window as any).Rewardful?.referral || undefined }),
    });
    const data = await res.json();
    setLoadingTier(null);
    if (data.url) router.push(data.url);
  };

  return (
    <div className="min-h-screen py-16 px-4" style={{ background: '#e8e6e1' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <Link href="/" className="text-2xl font-bold text-[#2a2a2a]">
            Agent<span style={{ color: '#e85d26' }}>AI</span>Brief
          </Link>
          <h1 className="text-3xl font-bold text-[#2a2a2a] mt-6">Choose Your Plan</h1>
          <p className="mt-2" style={{ color: '#888' }}>Unlock powerful AI tools for your real estate business</p>

          <div className="flex items-center justify-center gap-3 mt-6">
            <span className={`text-sm ${!annual ? 'text-[#2a2a2a]' : 'text-[#888]'}`}>Monthly</span>
            <button onClick={() => setAnnual(!annual)}
              className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-[#e85d26]' : 'bg-gray-600'}`}>
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-[#e8e6e1] transition-transform ${annual ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
            <span className={`text-sm ${annual ? 'text-[#2a2a2a]' : 'text-[#888]'}`}>Annual <span className="text-green-400 text-xs">(save 20%)</span></span>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-5">
          {TIERS.map((t) => {
            const isCurrent = tier === t.tier;
            const isDowngrade = tier === 'inner_circle' && t.tier === 'pro';
            return (
              <div key={t.name} className={`glass-card p-6 relative ${t.popular ? '' : ''}`}
                style={t.popular ? { borderColor: '#e85d26', boxShadow: '0 0 60px rgba(212,168,83,0.1)' } : {}}>
                {t.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full uppercase" style={{ background: '#e85d26', color: '#e8e6e1' }}>
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-lg font-bold text-[#2a2a2a]">{t.name}</h3>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-[#2a2a2a]">
                    {t.price === '$0' ? 'Free' : annual ? (t.price === '$19' ? '$15' : t.price === '$99' ? '$79' : t.price === '$299' ? '$239' : t.price) : t.price}
                  </span>
                  {t.price !== '$0' && <span className="text-sm" style={{ color: '#888' }}>{t.period}</span>}
                </div>
                <ul className="mt-6 space-y-3">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm" style={{ color: '#888' }}>
                      <span style={{ color: '#e85d26' }} className="mt-0.5">✦</span> {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  {t.tier === 'free' ? (
                    isCurrent ? (
                      <div className="w-full py-2.5 text-center rounded-lg text-sm" style={{ color: '#888', border: '1px solid rgba(255,255,255,0.1)' }}>Current Plan</div>
                    ) : (
                      <Link href="/signup" className="block w-full py-2.5 text-center text-[#2a2a2a] rounded-lg transition-colors text-sm font-medium" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        Sign Up Free
                      </Link>
                    )
                  ) : isCurrent ? (
                    <div className="w-full py-2.5 text-center rounded-lg text-sm font-medium" style={{ color: '#e85d26', border: '1px solid #e85d26' }}>Current Plan ✦</div>
                  ) : isDowngrade ? (
                    <div className="w-full py-2.5 text-center rounded-lg text-sm" style={{ color: '#556', border: '1px solid rgba(255,255,255,0.06)' }}>Included in your plan</div>
                  ) : t.popular ? (
                    <button onClick={() => handleSubscribe(t)} disabled={loadingTier === t.tier}
                      className="btn-gold w-full py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
                      {loadingTier === t.tier ? 'Loading...' : t.cta}
                    </button>
                  ) : (
                    <button onClick={() => handleSubscribe(t)} disabled={loadingTier === t.tier}
                      className="w-full py-2.5 text-[#2a2a2a] rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                      style={{ background: '#e85d26' }}>
                      {loadingTier === t.tier ? 'Loading...' : t.cta}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm mt-8" style={{ color: '#556' }}>
          Have a promo code? It will be applied at checkout. • <Link href="/" style={{ color: '#e85d26' }} className="hover:underline">Back to home</Link>
        </p>
      </div>
    </div>
  );
}
