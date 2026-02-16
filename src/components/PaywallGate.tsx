'use client';

import { useAuth, SubscriptionTier } from '@/lib/auth-context';
import Link from 'next/link';

interface PaywallGateProps {
  requiredTier: 'pro' | 'inner_circle';
  children: React.ReactNode;
  featureName?: string;
}

const TIER_RANK: Record<SubscriptionTier, number> = { free: 0, pro: 1, inner_circle: 2, team: 3 };
const TIER_LABELS: Record<string, string> = { pro: 'Pro', inner_circle: 'Inner Circle' };

export function PaywallGate({ requiredTier, children, featureName }: PaywallGateProps) {
  const { isLoggedIn, tier, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e85d26]"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 rounded-2xl bg-[#f0ece4]/80 border border-[#d8d4cc] text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-xl font-bold text-[#2a2a2a] mb-2">Sign up to access {featureName || 'this feature'}</h3>
        <p className="text-[#666] mb-6">
          This is a {TIER_LABELS[requiredTier]} feature. Create a free account to get started, then upgrade to unlock it.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/login" className="px-6 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium">
            Log In
          </Link>
          <Link href="/signup" className="px-6 py-2.5 bg-[#e85d26] text-white rounded-lg hover:bg-[#c44a1a] transition-colors font-medium">
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  if (TIER_RANK[tier] < TIER_RANK[requiredTier]) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 rounded-2xl bg-[#f0ece4]/80 border border-[#d8d4cc] text-center">
        <div className="text-4xl mb-4">⬆️</div>
        <h3 className="text-xl font-bold text-[#2a2a2a] mb-2">Upgrade to {TIER_LABELS[requiredTier]}</h3>
        <p className="text-[#666] mb-6">
          {featureName || 'This feature'} requires a {TIER_LABELS[requiredTier]} subscription. You&apos;re currently on the <span className="text-[#2a2a2a] font-medium capitalize">{tier.replace('_', ' ')}</span> plan.
        </p>
        <Link href="/pricing" className="inline-block px-6 py-2.5 bg-[#e85d26] text-white rounded-lg hover:bg-[#c44a1a] transition-colors font-medium">
          View Pricing
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
