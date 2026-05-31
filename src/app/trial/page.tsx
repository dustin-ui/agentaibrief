'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/lib/auth-context';

// Use anon client directly so we can capture the user ID from signUp response
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TrialPage() {
  const { user, session, loading: authLoading } = useAuth();

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // The server derives the user from the bearer token and ignores any body.
  const grantTrial = async (accessToken: string) => {
    const res = await fetch('/api/grant-trial', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      throw new Error(data.error ?? 'Failed to activate trial');
    }
  };

  // Already-logged-in flow: just activate the trial
  const handleActivateTrial = async () => {
    if (!user || !session) return;
    setLoading(true);
    setError('');
    try {
      await grantTrial(session.access_token);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // New user signup flow
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      // Call supabase directly so we get the user ID back
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      const accessToken = data.session?.access_token;
      if (!accessToken) {
        setError('Signup succeeded. Please log in to activate your trial.');
        return;
      }

      await grantTrial(accessToken);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
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
          No credit card required. Just sign up and get full access for 7 days.
        </p>

        {/* CTA — success state */}
        {success ? (
          <div className="bg-[#f5f0ea] border border-[#e0dcd4] rounded-2xl p-8 mb-6">
            <p className="text-2xl mb-3">🎉</p>
            <p className="text-lg font-bold text-[#2a2a2a] mb-2">
              Your 7-day free trial is active!
            </p>
            <p className="text-[#666] mb-6">
              Check your email to confirm your account, then log in to access Inner Circle.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-3 bg-[#e85d26] text-white text-base font-bold rounded-xl hover:bg-[#c44a1a] transition-colors"
            >
              Log In →
            </Link>
          </div>
        ) : authLoading ? (
          /* Still resolving auth — show nothing yet */
          <div className="flex justify-center py-8">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e85d26]" />
          </div>
        ) : user ? (
          /* Already logged in — one-click activate */
          <div className="bg-[#f5f0ea] border border-[#e0dcd4] rounded-2xl p-8 mb-6">
            <p className="text-[#666] mb-4">
              You&rsquo;re already signed in as <strong>{user.email}</strong>.
            </p>
            <button
              onClick={handleActivateTrial}
              disabled={loading}
              className="inline-flex items-center justify-center px-10 py-4 bg-[#e85d26] text-white text-lg font-bold rounded-xl hover:bg-[#c44a1a] transition-colors shadow-lg shadow-[#e85d26]/30 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  Activating…
                </>
              ) : (
                'Activate My Free Trial'
              )}
            </button>
            {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
          </div>
        ) : (
          /* Signup form */
          <form
            onSubmit={handleSignup}
            className="bg-[#f5f0ea] border border-[#e0dcd4] rounded-2xl p-8 mb-6 text-left max-w-md mx-auto"
          >
            <h3 className="text-lg font-bold text-[#2a2a2a] mb-5 text-center">Create your free account</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#444] mb-1" htmlFor="fullName">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-4 py-3 rounded-lg border border-[#d0ccc6] bg-white text-[#2a2a2a] placeholder-[#aaa] focus:outline-none focus:ring-2 focus:ring-[#e85d26]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#444] mb-1" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-[#d0ccc6] bg-white text-[#2a2a2a] placeholder-[#aaa] focus:outline-none focus:ring-2 focus:ring-[#e85d26]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#444] mb-1" htmlFor="password">
                  Password <span className="text-[#aaa] font-normal">(min 6 characters)</span>
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-[#d0ccc6] bg-white text-[#2a2a2a] placeholder-[#aaa] focus:outline-none focus:ring-2 focus:ring-[#e85d26]/50"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500 mt-4">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full flex items-center justify-center px-10 py-4 bg-[#e85d26] text-white text-lg font-bold rounded-xl hover:bg-[#c44a1a] transition-colors shadow-lg shadow-[#e85d26]/30 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3" />
                  Creating account…
                </>
              ) : (
                'Start Free Trial — No Credit Card'
              )}
            </button>

            <p className="text-xs text-[#aaa] text-center mt-3">
              Already have an account?{' '}
              <Link href="/login" className="text-[#e85d26] hover:underline">
                Log in
              </Link>
            </p>
          </form>
        )}

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
            {
              q: 'Do I need a credit card?',
              a: 'No credit card required to start your trial. You\'ll be asked to add payment info only if you choose to continue after 7 days.',
            },
            {
              q: 'How do I cancel?',
              a: 'Email support@agentaibrief.com or manage your subscription from your account page. Cancel any time before day 8 and you won\'t be charged.',
            },
            {
              q: 'What happens after the trial?',
              a: 'Your Inner Circle membership continues at $99/month. You can cancel or downgrade at any time.',
            },
            {
              q: 'Is this different from the Pro plan?',
              a: 'Yes. Inner Circle is the full suite — it includes everything in Pro plus video library, AI tools, contract analyzer, and direct team access.',
            },
          ].map((item) => (
            <div key={item.q} className="bg-[#f5f0ea] border border-[#e0dcd4] rounded-xl p-5">
              <p className="font-semibold text-[#2a2a2a] mb-1">{item.q}</p>
              <p className="text-sm text-[#666]">{item.a}</p>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        {!success && !user && !authLoading && (
          <div className="mt-12">
            <a
              href="#fullName"
              className="inline-flex items-center justify-center px-10 py-4 bg-[#e85d26] text-white text-lg font-bold rounded-xl hover:bg-[#c44a1a] transition-colors shadow-lg shadow-[#e85d26]/30"
            >
              Start Free Trial Now →
            </a>
            <p className="text-sm text-[#888] mt-3">7 days free. No credit card. Cancel anytime.</p>
          </div>
        )}
      </main>

      <footer className="border-t border-[#e0dcd4] mt-16">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-[#888]">© 2026 AgentAIBrief.com • Built for real estate professionals</p>
        </div>
      </footer>
    </div>
  );
}
