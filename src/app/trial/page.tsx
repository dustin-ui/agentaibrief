'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function TrialPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStartTrial = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/trial-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id || null }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e8e6e1]">
      {/* Header */}
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1]/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-[#2a2a2a]">
              Agent<span className="text-[#e85d26]">AI</span>Brief
            </h1>
          </Link>
          <Link href="/login" className="text-sm text-[#666] hover:text-[#2a2a2a] font-medium">
            Log In
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-[#e85d26]/15 text-[#e85d26] text-sm font-semibold px-4 py-1.5 rounded-full border border-[#e85d26]/30 mb-6">
          🎁 Limited Offer — No Charge for 7 Days
        </div>

        <h2 className="text-5xl font-extrabold text-[#2a2a2a] mb-6 leading-tight tracking-tight">
          Try Inner Circle<br />
          <span className="text-[#e85d26]">Free for 7 Days</span>
        </h2>

        <p className="text-xl text-[#666] mb-10 max-w-xl mx-auto">
          Full access to every Inner Circle feature. No charge until day 8. Cancel any time before and you owe nothing.
        </p>

        {/* CTA */}
        <div className="mb-6">
          <button
            onClick={handleStartTrial}
            disabled={loading}
            className="inline-flex items-center justify-center px-10 py-4 bg-[#e85d26] text-white text-lg font-bold rounded-xl hover:bg-[#c44a1a] transition-colors shadow-lg shadow-[#e85d26]/30 disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></span>
                Redirecting…
              </>
            ) : (
              'Start Free Trial — $0 Today'
            )}
          </button>
          <p className="text-sm text-[#888] mt-3">
            Then $99/mo after 7 days. Cancel anytime.
          </p>
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </div>

        {/* Benefits */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
          {[
            { icon: '🎬', title: 'Full Video Library', desc: 'Every livestream replay and exclusive workshop — no locks, no limits' },
            { icon: '🏡', title: 'AI Listing Generator', desc: 'Generate MLS-ready property descriptions in seconds' },
            { icon: '🛠️', title: 'AI Tools Suite', desc: 'Market scripts, SEO commands, open house follow-ups, and more' },
            { icon: '📄', title: 'Contract Analyzer', desc: 'Upload any contract and get plain-English summaries instantly' },
            { icon: '📊', title: 'Weekly SEO Report', desc: 'See exactly which keywords drive traffic to your listings' },
            { icon: '🎯', title: 'Agent Angles', desc: 'Specific scripts and strategies for every top AI story each week' },
          ].map((b) => (
            <div key={b.title} className="flex gap-4 bg-[#f5f0ea] border border-[#e0dcd4] rounded-xl p-4">
              <div className="text-2xl shrink-0">{b.icon}</div>
              <div>
                <p className="font-semibold text-[#2a2a2a] mb-0.5">{b.title}</p>
                <p className="text-sm text-[#888]">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div className="mt-16 bg-[#f5f0ea] border border-[#e0dcd4] rounded-2xl p-8">
          <p className="text-lg font-semibold text-[#2a2a2a] mb-1">
            &ldquo;The only newsletter I actually read every morning.&rdquo;
          </p>
          <p className="text-sm text-[#888]">— Inner Circle member, Arlington VA</p>
        </div>

        {/* FAQ */}
        <div className="mt-12 text-left max-w-xl mx-auto space-y-4">
          <h3 className="text-lg font-bold text-[#2a2a2a] mb-4">Common Questions</h3>
          {[
            { q: 'Do I need a credit card?', a: 'Yes — we collect your payment method upfront so there\'s no interruption after the trial. You\'ll be charged $99/mo on day 8 unless you cancel first.' },
            { q: 'How do I cancel?', a: 'Email support@agentaibrief.com or manage your subscription from your account page. Cancel any time before day 8 and you won\'t be charged.' },
            { q: 'What happens after the trial?', a: 'Your Inner Circle membership continues at $99/month. You can cancel or downgrade at any time.' },
            { q: 'Is this different from the Pro plan?', a: 'Yes. Inner Circle is the full suite — it includes everything in Pro plus video library, AI tools, contract analyzer, and direct team access.' },
          ].map((item) => (
            <div key={item.q} className="bg-[#f5f0ea] border border-[#e0dcd4] rounded-xl p-5">
              <p className="font-semibold text-[#2a2a2a] mb-1">{item.q}</p>
              <p className="text-sm text-[#666]">{item.a}</p>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="mt-12">
          <button
            onClick={handleStartTrial}
            disabled={loading}
            className="inline-flex items-center justify-center px-10 py-4 bg-[#e85d26] text-white text-lg font-bold rounded-xl hover:bg-[#c44a1a] transition-colors shadow-lg shadow-[#e85d26]/30 disabled:opacity-60"
          >
            {loading ? 'Redirecting…' : 'Start Free Trial Now →'}
          </button>
          <p className="text-sm text-[#888] mt-3">7 days free. Then $99/mo. Cancel anytime.</p>
        </div>
      </main>

      <footer className="border-t border-[#e0dcd4] mt-16">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-[#888]">© 2026 AgentAIBrief.com • Built for real estate professionals</p>
        </div>
      </footer>
    </div>
  );
}
