'use client';

import { useState } from 'react';
import { NewsFeed } from '@/components/NewsFeed';
import { WeeklyDeepDive } from '@/components/WeeklyDeepDive';
import { AIToolsSection } from '@/components/AIToolsSection';
import { TrendingBar } from '@/components/TrendingBar';
import { LoginModal } from '@/components/LoginModal';
import { MobileNav } from '@/components/MobileNav';
import { StickySubscribeBar } from '@/components/StickySubscribeBar';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { user, isLoggedIn, isPro, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [subEmail, setSubEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // Capture ?ref= param from URL
  const refCode = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('ref')
    : null;

  async function handleEmailSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!subEmail) return;
    setSubStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subEmail, tier: 'free', ref: refCode || undefined }),
      });
      if (res.ok) {
        const data = await res.json();
        setSubStatus('success');
        setReferralCode(data.referralCode || null);
        setSubEmail('');
      } else {
        setSubStatus('error');
      }
    } catch {
      setSubStatus('error');
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Agent<span className="text-blue-600">AI</span>Brief
                </h1>
                <p className="text-sm text-gray-500">
                  AI news for real estate pros • Updated hourly
                </p>
              </div>
              <nav className="hidden md:flex items-center gap-4">
                <a href="/blog" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Blog</a>
                <a href="/tools" className="text-sm text-gray-600 hover:text-gray-900 font-medium">AI Tools</a>
                <a href="/prompts" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Prompts</a>
                <a href="/contract-analyzer" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Contract Analyzer</a>
                <a href="/videos" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Video Library</a>
                {isPro && (
                  <a href="/pro-dashboard" className="text-sm text-gray-600 hover:text-gray-900 font-medium">SEO Reports</a>
                )}
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <MobileNav />
              {isLoggedIn ? (
                <>
                  <span className="text-sm text-gray-600 hidden sm:inline">
                    {user?.email}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium uppercase">
                    {user?.tier === 'inner-circle' ? 'Inner Circle' : 'Pro'}
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-400 hover:text-gray-600"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowLogin(true)}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Log In
                  </button>
                  <a 
                    href="/subscribe" 
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Subscribe
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner — only for guests */}
      {!isLoggedIn && (
        <div data-hero className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="max-w-2xl">
              <p className="text-blue-200 text-sm font-medium mb-2">✨ Join 2,400+ agents staying ahead of AI</p>
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">
                AI is changing real estate. Are you keeping up?
              </h2>
              <p className="text-blue-100 mb-6 text-lg">
                Get the top AI stories + exactly how to use them to win more listings, close faster, and deliver better client experiences. Free daily briefing.
              </p>
              
              {/* Email Capture — THE primary CTA */}
              {subStatus === 'success' ? (
                <div className="bg-white/10 backdrop-blur rounded-lg p-4 max-w-md">
                  <p className="text-white font-semibold">✅ You&apos;re in! Check your inbox.</p>
                  <p className="text-blue-200 text-sm mt-1">Your first briefing arrives tomorrow morning.</p>
                  {referralCode && (
                    <a href="/referral" className="inline-block mt-2 text-sm text-white underline hover:text-blue-200">
                      🎁 Share &amp; earn rewards →
                    </a>
                  )}
                </div>
              ) : (
                <form onSubmit={handleEmailSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-lg">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={subEmail}
                    onChange={e => setSubEmail(e.target.value)}
                    required
                    className="flex-1 px-4 py-3 rounded-lg text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <button
                    type="submit"
                    disabled={subStatus === 'loading'}
                    className="px-6 py-3 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition-colors text-sm whitespace-nowrap disabled:opacity-50"
                  >
                    {subStatus === 'loading' ? 'Subscribing...' : 'Get Free Daily Briefing →'}
                  </button>
                </form>
              )}
              {subStatus === 'error' && (
                <p className="text-red-200 text-sm mt-2">Something went wrong. Try again.</p>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mt-4">
                <p className="text-blue-200 text-xs">No spam. Unsubscribe anytime.</p>
                <span className="hidden sm:inline text-blue-400">•</span>
                <a 
                  href="/demo"
                  className="text-white text-xs font-medium underline underline-offset-2 hover:text-blue-100"
                >
                  📋 See a sample briefing first
                </a>
                <span className="hidden sm:inline text-blue-400">•</span>
                <a 
                  href="/subscribe"
                  className="text-white text-xs font-medium underline underline-offset-2 hover:text-blue-100"
                >
                  Want Pro features? $19/mo →
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Proof Bar */}
      {!isLoggedIn && (
        <div className="bg-gray-900 text-white">
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-3">
                <img src="/dustin-fox.jpg" alt="Dustin Fox" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="font-semibold">Built by Dustin Fox</p>
                  <p className="text-gray-400 text-xs">Fox Homes Team • DC Metro</p>
                </div>
              </div>
              <div className="hidden sm:block w-px h-8 bg-gray-700" />
              <div className="flex items-center gap-6 text-center">
                <div>
                  <p className="text-xl font-bold text-blue-400">$277M</p>
                  <p className="text-gray-400 text-xs">2025 Volume</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-blue-400">2,102</p>
                  <p className="text-gray-400 text-xs">5-Star Reviews</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-blue-400">Top 5</p>
                  <p className="text-gray-400 text-xs">DC Metro Volume</p>
                </div>
              </div>
              <div className="hidden sm:block w-px h-8 bg-gray-700" />
              <p className="text-gray-300 text-xs max-w-xs text-center sm:text-left">
                &ldquo;AI helped me scale from a solo agent to a $277M team. This brief is how I stay ahead.&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Trending Bar — powered by Grok */}
      <TrendingBar />

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-3">
            {/* AI Tools Directory */}
            <AIToolsSection isPremium={isPro} />

            {/* Weekly Deep Dive */}
            <WeeklyDeepDive isPremium={isPro} />

            {/* News Feed */}
            <NewsFeed isPremium={isPro} />
          </div>
          
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Subscribe CTA — guests only */}
            {!isLoggedIn && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">📬 Get the Daily Brief</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Top AI stories + agent angles delivered to your inbox every morning.
                </p>
                {subStatus === 'success' ? (
                  <div className="text-center py-2">
                    <p className="text-green-700 font-semibold text-sm">✅ You&apos;re in!</p>
                    <p className="text-green-600 text-xs mt-1">Check your inbox for a welcome email.</p>
                    {referralCode && (
                      <a href="/referral" className="inline-block mt-1 text-xs text-blue-600 underline">
                        🎁 Share &amp; earn rewards →
                      </a>
                    )}
                  </div>
                ) : (
                  <form method="POST" action="/api/subscribe" onSubmit={handleEmailSubscribe}>
                    <input 
                      type="email" 
                      name="email"
                      placeholder="Enter your email"
                      value={subEmail}
                      onChange={e => setSubEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-blue-300 rounded mb-2 text-sm"
                    />
                    <button 
                      type="submit"
                      disabled={subStatus === 'loading'}
                      className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {subStatus === 'loading' ? 'Subscribing...' : 'Subscribe — Free Daily Brief'}
                    </button>
                    {subStatus === 'error' && (
                      <p className="text-xs text-red-500 mt-2 text-center">Something went wrong. Try again.</p>
                    )}
                  </form>
                )}
                <p className="text-xs text-blue-500 mt-2 text-center">
                  Use code <span className="font-bold">LAUNCH25</span> for 25% off Pro
                </p>
              </div>
            )}

            {/* Pro Features */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">⭐ Pro — $19/mo</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>✅ Agent Angle on every story</li>
                <li>✅ Implementation tips</li>
                <li>✅ Daily digest</li>
                <li>✅ Tool reviews & tutorials</li>
                <li>✅ Weekly Deep Dives</li>
              </ul>
              {!isPro && (
                <a 
                  href="/subscribe" 
                  className="mt-4 block w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded text-center hover:bg-blue-700"
                >
                  Get Started
                </a>
              )}
            </div>

            {/* Inner Circle CTA */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">🔥 Inner Circle — $99/mo</h3>
              <p className="text-sm text-blue-700 mb-2">
                Everything in Pro + direct access to Dustin Fox for coaching & strategy.
              </p>
              <ul className="text-sm text-blue-700 mb-2 space-y-1">
                <li>📊 <strong>Weekly SEO Performance Report</strong></li>
                <li>🤖 AI Search Visibility Score</li>
                <li>🔑 Top Keywords & Rankings</li>
              </ul>
              <p className="text-xs text-amber-600 font-semibold mb-3">⚡ Limited seats available</p>
              <a 
                href="/subscribe" 
                className="block w-full px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded text-center hover:bg-gray-800"
              >
                Join the Inner Circle
              </a>
            </div>

            {/* This Week in Numbers */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">📊 This Week in AI + RE</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-bold text-blue-600">23%</p>
                  <p className="text-xs text-gray-500">More deals closed by AI-using agents</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">$25</p>
                  <p className="text-xs text-gray-500">Cost per AI-staged room (vs $2K+ traditional)</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">67%</p>
                  <p className="text-xs text-gray-500">Lead engagement with AI voice response</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-gray-500">
            <span>© 2026 AgentAIBrief.com</span>
            <span className="hidden sm:inline">•</span>
            <a href="/privacy" className="hover:text-gray-700">Privacy Policy</a>
            <span className="hidden sm:inline">•</span>
            <a href="/terms" className="hover:text-gray-700">Terms of Service</a>
            <span className="hidden sm:inline">•</span>
            <a href="/preferences" className="hover:text-gray-700">Manage Preferences</a>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <StickySubscribeBar />
    </div>
  );
}
