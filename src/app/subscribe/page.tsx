'use client';

import Link from 'next/link';
import { useState } from 'react';

const PRICE_MAP = {
  pro: {
    monthly: 'price_1SyOXcLkSTdcJUwxORq7h7AT',
    annual: 'price_1SyOXcLkSTdcJUwxWJSqmkMS',
  },
  'inner-circle': {
    monthly: 'price_1SyOXdLkSTdcJUwxyayQCT1g',
    annual: 'price_1SyOXdLkSTdcJUwxgWzEF9OZ',
  },
};

const tiers = [
  {
    name: 'Free',
    tier: 'free' as const,
    monthlyPrice: 0,
    annualPrice: 0,
    period: '',
    annualPeriod: '',
    annualSavings: '',
    description: 'Stay informed with the basics — no credit card required.',
    cta: 'Start Free',
    ctaStyle: 'border-2 border-gray-300 text-[#555] hover:bg-[#f0ece4]',
    highlighted: false,
    features: [
      { text: 'Daily headline digest', included: true },
      { text: 'AI-curated news feed', included: true },
      { text: 'Breaking news alerts', included: false },
      { text: 'Agent Angle on every story', included: false },
      { text: 'Implementation tips & workflows', included: false },
      { text: 'Tool reviews & video tutorials', included: false },
      { text: 'Private group with Dustin Fox', included: false },
      { text: 'Live Q&A sessions', included: false },
      { text: 'Ask anything, anytime', included: false },
    ],
  },
  {
    name: 'Pro',
    tier: 'pro' as const,
    monthlyPrice: 19,
    annualPrice: 190,
    period: '/month',
    annualPeriod: '/year',
    annualSavings: 'Save $38',
    description: 'Daily AI insights that give you a competitive edge in your market.',
    cta: 'Get Started',
    ctaStyle: 'border-2 border-[#e85d26] text-[#e85d26] hover:bg-[#f5f0ea]',
    highlighted: false,
    features: [
      { text: 'Daily email digest', included: true },
      { text: 'AI headlines & summaries', included: true },
      { text: 'Breaking news alerts', included: true },
      { text: 'Agent Angle on every story', included: true },
      { text: 'Implementation tips & workflows', included: true },
      { text: 'Tool reviews & video tutorials', included: true },
      { text: 'Private group with Dustin Fox', included: false },
      { text: 'Live Q&A sessions', included: false },
      { text: 'Ask anything, anytime', included: false },
    ],
  },
  {
    name: 'Inner Circle',
    tier: 'inner-circle' as const,
    monthlyPrice: 99,
    annualPrice: 990,
    period: '/month',
    annualPeriod: '/year',
    annualSavings: 'Save $198',
    description: 'Everything in Pro — plus direct access to Dustin Fox for AI & real estate coaching.',
    cta: 'Join the Inner Circle',
    ctaStyle: 'bg-[#e85d26] text-white hover:bg-[#c44a1a] shadow-lg shadow-[#e85d26]/20',
    highlighted: true,
    badge: 'Recommended',
    scarcity: 'Limited seats available',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Private group with Dustin Fox', included: true },
      { text: 'Twice-monthly live Q&A sessions', included: true },
      { text: 'Ask anything, anytime', included: true },
      { text: 'AI implementation coaching', included: true },
      { text: 'Real estate strategy sessions', included: true },
      { text: 'First access to new tools & resources', included: true },
    ],
  },
];

const _testimonials: { name: string; role: string; text: string }[] = []; // Real testimonials coming soon

export default function SubscribePage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(tierKey: 'free' | 'pro' | 'inner-circle') {
    if (tierKey === 'free') {
      document.getElementById('free-signup')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const priceId = PRICE_MAP[tierKey][isAnnual ? 'annual' : 'monthly'];
    setLoading(tierKey);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, referral: typeof window !== 'undefined' && (window as any).Rewardful?.referral || undefined }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#e8e6e1]">
      {/* Header */}
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold text-[#2a2a2a]">
                Agent<span className="text-[#e85d26]">AI</span>Brief
              </h1>
            </Link>
            <Link
              href="/"
              className="text-sm text-[#888] hover:text-[#555] transition-colors"
            >
              ← Back to News
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-50 to-white pt-16 pb-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-[#f5f0ea] text-[#c44a1a] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e85d26] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e85d26]"></span>
            </span>
            Join 2,400+ agents staying ahead of AI
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#2a2a2a] mb-4 tracking-tight">
            Don&apos;t just read AI news.
            <br />
            <span className="text-[#e85d26]">Know what to do with it.</span>
          </h2>
          <p className="text-lg text-[#666] max-w-2xl mx-auto">
            Every day, we translate the latest AI breakthroughs into specific actions
            you can take to win more listings, close faster, and deliver better
            client experiences.
          </p>
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="pt-12 pb-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-[#2a2a2a]' : 'text-[#666]'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-[#e85d26]' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-[#e8e6e1] shadow transition-transform ${
                  isAnnual ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-[#2a2a2a]' : 'text-[#666]'}`}>
              Annual
            </span>
            {isAnnual && (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">
                2 months free
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-8 flex flex-col ${
                  tier.highlighted
                    ? 'border-2 border-[#e85d26] shadow-xl shadow-[#e85d26]/10 bg-[#e8e6e1] z-10'
                    : 'border border-[#e0dcd4] bg-[#e8e6e1]'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-[#e85d26] text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#2a2a2a] mb-1">
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-[#2a2a2a]">
                      {tier.tier === 'free' ? '$0' : `$${isAnnual ? tier.annualPrice : tier.monthlyPrice}`}
                    </span>
                    <span className="text-[#888] text-sm">
                      {tier.tier === 'free' ? '' : isAnnual ? tier.annualPeriod : tier.period}
                    </span>
                  </div>
                  {tier.tier === 'free' ? (
                    <p className="text-sm text-green-600 font-medium mt-1">Free forever</p>
                  ) : isAnnual ? (
                    <>
                      <p className="text-sm text-green-600 font-medium mt-1">
                        {tier.annualSavings} vs monthly
                      </p>
                      <p className="text-sm text-[#e85d26] font-medium">
                        That&apos;s just ${tier.tier === 'pro' ? '15.83' : '82.50'}/mo
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-[#666] mt-1">
                      or ${tier.annualPrice}/year (save {tier.annualSavings.replace('Save ', '')})
                    </p>
                  )}
                  <p className="text-sm text-[#888] mt-2">{tier.description}</p>
                  {tier.scarcity && (
                    <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-200">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                      {tier.scarcity}
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3">
                      {feature.included ? (
                        <svg
                          className="w-5 h-5 text-[#e85d26] mt-0.5 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-[#555] mt-0.5 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? 'text-[#555]' : 'text-[#666]'
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(tier.tier as 'free' | 'pro' | 'inner-circle')}
                  disabled={loading === tier.tier}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 ${tier.ctaStyle}`}
                >
                  {loading === tier.tier ? 'Redirecting...' : tier.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Money-Back Guarantee Badge */}
          <div className="flex justify-center mt-10">
            <div className="inline-flex items-center gap-3 bg-green-50 border border-green-200 rounded-full px-6 py-3">
              <svg className="w-6 h-6 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <span className="text-green-800 font-semibold text-sm">
                30-Day Money-Back Guarantee — No Questions Asked
              </span>
            </div>
          </div>

          {/* Free Signup */}
          <div id="free-signup" className="max-w-md mx-auto mt-12">
            <form action="/api/subscribe" method="POST" className="flex gap-2">
              <input
                type="email"
                name="email"
                placeholder="Enter your email for the free digest"
                required
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#e85d26] text-[#2a2a2a]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#e85d26] text-white font-semibold text-sm rounded-lg hover:bg-[#c44a1a] transition-colors"
              >
                Start Free
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Social Proof — Dustin's Story */}
      <section className="py-16 bg-[#f0ece4]">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-center text-sm font-semibold text-[#666] uppercase tracking-wider mb-10">
            Built by someone who actually sells real estate
          </h3>
          
          {/* Dustin's Story Card */}
          <div className="bg-[#e8e6e1] rounded-2xl border border-[#e0dcd4] shadow-sm overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-[#2a2a2a] p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <img src="/dustin-fox.jpg" alt="Dustin Fox" className="w-20 h-20 rounded-full object-cover shrink-0" />
                <div className="text-center md:text-left">
                  <h4 className="text-xl font-bold mb-1">Dustin Fox</h4>
                  <p className="text-[#555] text-sm mb-4">Team Lead, Fox Homes • DC Metro Market</p>
                  <p className="text-gray-200 text-sm leading-relaxed max-w-xl">
                    &ldquo;I went from solo agent to leading the Fox Homes Team doing $277 million in volume. AI didn&apos;t just help — it was the multiplier. This brief is everything I wish I had when I started adopting AI in my business.&rdquo;
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
              <div className="p-6 text-center">
                <p className="text-2xl font-bold text-[#e85d26]">$277M</p>
                <p className="text-xs text-[#888] mt-1">2025 Sales Volume</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-2xl font-bold text-[#e85d26]">Top 5</p>
                <p className="text-xs text-[#888] mt-1">DC Metro Volume Team</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-2xl font-bold text-[#e85d26]">2,102</p>
                <p className="text-xs text-[#888] mt-1">5-Star Google Reviews</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-2xl font-bold text-[#e85d26]">36</p>
                <p className="text-xs text-[#888] mt-1">Agents on Team</p>
              </div>
            </div>
          </div>

          {/* The Pitch */}
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-[#666] leading-relaxed">
              Most AI newsletters are written by tech people who&apos;ve never held an open house. 
              AgentAIBrief is different — it&apos;s built by a team lead who uses AI every day to 
              generate leads, create content, analyze markets, and coach a Fox Homes Team. 
              Every angle, every tip comes from real experience.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-[#2a2a2a] text-center mb-10">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            {[
              {
                q: 'What is an "Agent Angle"?',
                a: "It's our signature analysis — 2-3 sentences explaining exactly why a particular AI news story matters to your real estate business and what competitive advantage it could give you. No fluff, no hype, just actionable context.",
              },
              {
                q: 'How is this different from just reading TechCrunch?',
                a: "TechCrunch writes for tech people. We write for agents. Every story is filtered through a real estate lens: Will this help you get more listings? Close faster? Serve clients better? If it won't impact your business, we skip it.",
              },
              {
                q: 'What do I get with the Inner Circle?',
                a: "Everything in Pro, plus direct access to Dustin Fox — the team lead behind a $277M operation in the DC metro market. He's been implementing AI in real estate since day one and has 2,102 five-star Google reviews to show for it. Ask him anything about AI tools, marketing, scaling your team, or growing your business. Twice-monthly live Q&A sessions and first access to new resources included.",
              },
              {
                q: 'Can I cancel anytime?',
                a: 'Absolutely. No contracts, no commitments. Cancel with one click and your subscription ends at the end of the billing period. We bet you won\'t want to.',
              },
              {
                q: 'What if I\'m not tech-savvy?',
                a: "That's exactly who this is for. We translate complex AI developments into plain English with step-by-step implementation tips. If you can send an email, you can follow our guides.",
              },
              {
                q: "What if I'm not satisfied? Is there a guarantee?",
                a: "Yes — we offer a 30-day money-back guarantee, no questions asked. If AgentAIBrief isn't delivering value in your first month, just email us and we'll refund you in full. Zero risk.",
              },
              {
                q: 'Is the annual plan worth it?',
                a: "Both plans include 2 months free when you go annual. That's $38 back on Pro and $198 back on Inner Circle. If you're committed to staying ahead of AI in real estate, it's a no-brainer.",
              },
            ].map((faq) => (
              <div key={faq.q} className="border-b border-[#e0dcd4] pb-6">
                <h4 className="text-base font-semibold text-[#2a2a2a] mb-2">
                  {faq.q}
                </h4>
                <p className="text-sm text-[#666] leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-[#2a2a2a] text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            The agents who adopt AI first will win.
          </h3>
          <p className="text-gray-300 text-lg mb-8">
            The team lead behind $277M in volume is sharing exactly how AI got him there.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => handleCheckout('pro')}
              disabled={!!loading}
              className="px-8 py-3 bg-[#e8e6e1] text-[#c44a1a] font-semibold rounded-lg hover:bg-[#f5f0ea] transition-colors disabled:opacity-50"
            >
              {loading === 'pro' ? 'Redirecting...' : `Get Pro — $${isAnnual ? '190/yr' : '19/mo'}`}
            </button>
            <button 
              onClick={() => handleCheckout('inner-circle')}
              disabled={!!loading}
              className="px-8 py-3 bg-[#e85d26] text-white font-semibold rounded-lg hover:bg-[#e85d26] transition-colors border border-[#e85d26] disabled:opacity-50"
            >
              {loading === 'inner-circle' ? 'Redirecting...' : `Join Inner Circle — $${isAnnual ? '990/yr' : '99/mo'}`}
            </button>
          </div>
          <p className="text-[#888] text-sm mt-4">
            ⚡ Inner Circle seats are limited — don&apos;t wait
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e0dcd4] bg-[#f0ece4]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-sm text-[#888] text-center">
            © 2026 AgentAIBrief.com • Built for real estate professionals
          </p>
        </div>
      </footer>
    </div>
  );
}
