'use client';

import { useAuth, SubscriptionTier } from '@/lib/auth-context';
import Link from 'next/link';
import { createContext, useContext, useEffect, useState } from 'react';

interface PaywallGateProps {
  requiredTier: 'pro' | 'inner_circle';
  children: React.ReactNode;
  featureName?: string;
  allowFreeTrial?: boolean;
  trialKey?: string;
}

type TrialGateContextValue = {
  consumeTrial: () => void;
  trialAvailable: boolean;
};

const TrialGateContext = createContext<TrialGateContextValue>({
  consumeTrial: () => {},
  trialAvailable: false,
});

const TIER_RANK: Record<SubscriptionTier, number> = { free: 0, pro: 1, inner_circle: 2, team: 3 };
const TIER_LABELS: Record<string, string> = { pro: 'Pro', inner_circle: 'Inner Circle' };

export function PaywallGate({ requiredTier, children, featureName, allowFreeTrial = false, trialKey }: PaywallGateProps) {
  // ACCESS OPEN — login/pricing requirements temporarily disabled
  // To re-enable: restore the original PaywallGate logic
  const consumeTrial = () => {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void requiredTier; void featureName; void allowFreeTrial; void trialKey;

  if (true) { // ACCESS OPEN
    return (
      <TrialGateContext.Provider value={{ consumeTrial, trialAvailable: false }}>
        {children}
      </TrialGateContext.Provider>
    );
  }

  if (allowFreeTrial && trialSessionUnlocked) {
    return (
      <TrialGateContext.Provider value={{ consumeTrial, trialAvailable: !isLoggedIn }}>
        <>
          {!isLoggedIn && (
            <div className="max-w-4xl mx-auto mb-4 p-4 rounded-xl bg-gradient-to-r from-[#e85d26]/15 to-[#e85d26]/5 border border-[#e85d26]/40 flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-[#2a2a2a]">
                🎁 <strong>Free trial - 1 use.</strong> This page stays unlocked for this visit.{' '}
                <Link href="/pricing" className="text-[#e85d26] font-semibold underline hover:no-underline">Upgrade to Pro ($19/mo)</Link> for unlimited use.
              </p>
              <Link href="/pricing" className="shrink-0 px-4 py-1.5 bg-[#e85d26] text-white text-sm font-semibold rounded-lg hover:bg-[#c44a1a] transition-colors">
                Upgrade Now →
              </Link>
            </div>
          )}
          {children}
        </>
      </TrialGateContext.Provider>
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

  const upgradeHref = requiredTier === 'inner_circle' ? '/subscribe' : '/pricing';
  const upgradeCta = requiredTier === 'inner_circle' ? 'Join Inner Circle' : 'View Pricing';

  return (
    <div className="max-w-lg mx-auto my-12 p-8 rounded-2xl bg-[#f0ece4]/80 border border-[#d8d4cc] text-center">
      <div className="text-4xl mb-4">⬆️</div>
      <h3 className="text-xl font-bold text-[#2a2a2a] mb-2">Upgrade to {TIER_LABELS[requiredTier]}</h3>
      <p className="text-[#666] mb-6">
        {featureName || 'This feature'} requires a {TIER_LABELS[requiredTier]} subscription. You&apos;re currently on the <span className="text-[#2a2a2a] font-medium capitalize">{tier.replace('_', ' ')}</span> plan.
      </p>
      <Link href={upgradeHref} className="inline-block px-6 py-2.5 bg-[#e85d26] text-white rounded-lg hover:bg-[#c44a1a] transition-colors font-medium">
        {upgradeCta}
      </Link>
    </div>
  );
}

export function useTrialGate() {
  return useContext(TrialGateContext);
}
