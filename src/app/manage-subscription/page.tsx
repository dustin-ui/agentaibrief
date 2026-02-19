'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

const TIER_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pro: { label: 'Pro', color: '#e85d26', bg: '#fff3ee' },
  inner_circle: { label: 'Inner Circle', color: '#7c3aed', bg: '#f5f0ff' },
  team: { label: 'Team', color: '#0ea5e9', bg: '#f0f9ff' },
};

function ManageSubscriptionContent() {
  const { user, profile, loading } = useAuth();
  const searchParams = useSearchParams();
  const returned = searchParams.get('returned') === 'true';

  const [email, setEmail] = useState('');
  const [portalStatus, setPortalStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (profile?.email) setEmail(profile.email);
  }, [profile]);

  async function openBillingPortal(lookupEmail?: string) {
    setPortalStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/billing-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id ?? undefined,
          email: lookupEmail ?? email,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong.');
        setPortalStatus('error');
        return;
      }
      window.location.href = data.url;
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setPortalStatus('error');
    }
  }

  const tier = profile?.subscription_tier;
  const tierInfo = tier && tier !== 'free' ? TIER_LABELS[tier] : null;

  return (
    <div className="min-h-screen bg-[#e8e6e1] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#2a2a2a' }}>
            Agent<span style={{ color: '#e85d26' }}>AI</span>Brief
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          {/* Returned from portal */}
          {returned && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm text-center">
              ✅ Your subscription has been updated.
            </div>
          )}

          <h1 className="text-2xl font-bold text-[#2a2a2a] mb-1 text-center">Manage Subscription</h1>
          <p className="text-[#666] text-center text-sm mb-8">Cancel, downgrade, or update your billing details.</p>

          {loading ? (
            <div className="text-center text-[#888] py-8">Loading your account...</div>
          ) : tierInfo && profile ? (
            /* Logged-in paying user */
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl border-2" style={{ borderColor: tierInfo.color, background: tierInfo.bg }}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#888] mb-1">Current Plan</p>
                  <p className="text-xl font-bold" style={{ color: tierInfo.color }}>{tierInfo.label}</p>
                </div>
                <span className="text-3xl">
                  {tier === 'pro' ? '⚡' : tier === 'inner_circle' ? '👑' : '🚀'}
                </span>
              </div>

              <div className="space-y-3 text-sm text-[#555]">
                <p className="font-medium text-[#2a2a2a]">From the billing portal you can:</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2"><span className="text-[#e85d26]">→</span> Cancel your subscription</li>
                  <li className="flex items-center gap-2"><span className="text-[#e85d26]">→</span> Downgrade to a lower plan</li>
                  <li className="flex items-center gap-2"><span className="text-[#e85d26]">→</span> Update your payment method</li>
                  <li className="flex items-center gap-2"><span className="text-[#e85d26]">→</span> View billing history & invoices</li>
                </ul>
              </div>

              <button
                onClick={() => openBillingPortal()}
                disabled={portalStatus === 'loading'}
                className="w-full py-3 px-6 rounded-xl font-semibold text-white transition-colors disabled:opacity-50"
                style={{ background: tierInfo.color }}
              >
                {portalStatus === 'loading' ? 'Redirecting...' : 'Open Billing Portal →'}
              </button>

              {portalStatus === 'error' && (
                <p className="text-red-600 text-sm text-center">{errorMsg}</p>
              )}
            </div>
          ) : (
            /* Not logged in or free plan — email lookup */
            <div className="space-y-6">
              {/* Quick-select tier buttons */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#888] text-center mb-3">I&apos;m a paid subscriber on:</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => openBillingPortal(email || undefined)}
                    className="flex flex-col items-center gap-1 p-4 rounded-xl border-2 border-[#e85d26] bg-[#fff3ee] hover:bg-[#ffe8dc] transition-colors"
                  >
                    <span className="text-2xl">⚡</span>
                    <span className="font-bold text-[#e85d26]">Pro</span>
                    <span className="text-xs text-[#888]">$19/mo</span>
                  </button>
                  <button
                    onClick={() => openBillingPortal(email || undefined)}
                    className="flex flex-col items-center gap-1 p-4 rounded-xl border-2 border-[#7c3aed] bg-[#f5f0ff] hover:bg-[#ede8ff] transition-colors"
                  >
                    <span className="text-2xl">👑</span>
                    <span className="font-bold text-[#7c3aed]">Inner Circle</span>
                    <span className="text-xs text-[#888]">$99/mo</span>
                  </button>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-[#888]">enter your account email</span></div>
              </div>

              <div className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e85d26]"
                />
                <button
                  onClick={() => openBillingPortal()}
                  disabled={!email || portalStatus === 'loading'}
                  className="w-full py-3 px-6 rounded-xl font-semibold text-white bg-[#2a2a2a] hover:bg-[#444] transition-colors disabled:opacity-40"
                >
                  {portalStatus === 'loading' ? 'Redirecting...' : 'Open Billing Portal →'}
                </button>
                {portalStatus === 'error' && (
                  <p className="text-red-600 text-sm text-center">{errorMsg}</p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200 text-center">
                <p className="text-xs text-[#888]">
                  Need help? Email{' '}
                  <a href="mailto:dustin@foxhomesteam.com" className="text-[#e85d26] hover:underline">
                    dustin@foxhomesteam.com
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom links */}
        <div className="flex justify-center gap-6 mt-6 text-sm text-[#888]">
          <a href="/unsubscribe" className="hover:text-[#e85d26] transition-colors">Unsubscribe from emails</a>
          <a href="/" className="hover:text-[#e85d26] transition-colors">← Back to home</a>
        </div>
      </div>
    </div>
  );
}

export default function ManageSubscriptionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#e8e6e1] flex items-center justify-center text-[#888]">Loading...</div>}>
      <ManageSubscriptionContent />
    </Suspense>
  );
}
