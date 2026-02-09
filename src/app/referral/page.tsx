'use client';

import { useState } from 'react';
import Link from 'next/link';

interface RewardTier {
  count: number;
  id: string;
  label: string;
  description: string;
}

interface ReferralData {
  code: string;
  referralCount: number;
  referrals: string[];
  unlockedRewards: RewardTier[];
  nextReward: RewardTier | null;
  allTiers: RewardTier[];
  referralLink: string;
}

export default function ReferralPage() {
  const [email, setEmail] = useState('');
  const [data, setData] = useState<ReferralData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/referral?email=${encodeURIComponent(email)}`);
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Not found');
        setData(null);
      } else {
        setData(await res.json());
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    if (data) {
      navigator.clipboard.writeText(data.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link href="/">
            <h1 className="text-2xl font-bold text-gray-900">
              Agent<span className="text-blue-600">AI</span>Brief
            </h1>
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">🎁</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Refer Friends, Earn Rewards
          </h2>
          <p className="text-lg text-gray-600">
            Share AgentAIBrief with fellow agents and unlock exclusive perks.
          </p>
        </div>

        {/* Reward Tiers Display */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { count: 3, emoji: '🏅', label: 'Badge' },
            { count: 5, emoji: '⭐', label: '1 Mo Pro' },
            { count: 10, emoji: '📞', label: 'Call w/ Dustin' },
            { count: 25, emoji: '🚀', label: 'Lifetime Pro' },
          ].map((tier) => (
            <div
              key={tier.count}
              className={`text-center p-4 rounded-xl border-2 ${
                data && data.referralCount >= tier.count
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="text-3xl mb-1">{tier.emoji}</div>
              <div className="font-bold text-gray-900">{tier.count} referrals</div>
              <div className="text-sm text-gray-600">{tier.label}</div>
            </div>
          ))}
        </div>

        {/* Lookup Form */}
        {!data && (
          <form onSubmit={handleLookup} className="flex gap-3 mb-8">
            <input
              type="email"
              placeholder="Enter your subscriber email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '...' : 'Look Up'}
            </button>
          </form>
        )}

        {error && (
          <div className="text-center text-red-600 mb-4">
            {error === 'No referral found for this email'
              ? 'No account found. Subscribe first, then come back!'
              : error}
          </div>
        )}

        {/* Referral Dashboard */}
        {data && (
          <div className="space-y-6">
            {/* Referral Link */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">Your Referral Link</h3>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={data.referralLink}
                  className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700"
                />
                <button
                  onClick={copyLink}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="font-bold text-gray-900 mb-2">
                Your Progress: {data.referralCount} referral{data.referralCount !== 1 ? 's' : ''}
              </h3>
              {data.nextReward ? (
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (data.referralCount / data.nextReward.count) * 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600">
                    {data.nextReward.count - data.referralCount} more to unlock: {data.nextReward.label}
                  </p>
                </div>
              ) : (
                <p className="text-green-600 font-semibold">🎉 You&apos;ve unlocked all rewards!</p>
              )}
            </div>

            {/* Unlocked Rewards */}
            {data.unlockedRewards.length > 0 && (
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="font-bold text-gray-900 mb-3">🎉 Unlocked Rewards</h3>
                <ul className="space-y-2">
                  {data.unlockedRewards.map((r) => (
                    <li key={r.id} className="flex items-center gap-2 text-green-800">
                      <span>✅</span> {r.label} — {r.description}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => { setData(null); setEmail(''); }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Look up a different email
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
