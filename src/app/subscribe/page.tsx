'use client';

import Link from 'next/link';
import { useState } from 'react';

const PRICE_MAP = {
  pro: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY || 'price_1SwwYyLl6JNvAnqf4tAL2wed',
    annual: process.env.NEXT_PUBLIC_STRIPE_PRO_ANNUAL || 'price_1SwwYyLl6JNvAnqfJVD8gxlk',
  },
  'inner-circle': {
    monthly: process.env.NEXT_PUBLIC_STRIPE_IC_MONTHLY || 'price_1SwwYzLl6JNvAnqfnGZjkj4W',
    annual: process.env.NEXT_PUBLIC_STRIPE_IC_ANNUAL || 'price_1SwwYzLl6JNvAnqfq3AwzB3i',
  },
};

const tiers = [
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
    ctaStyle: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
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
    ctaStyle: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200',
    highlighted: true,
    badge: 'Recommended',
    scarcity: 'Limited seats available',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Private group with Dustin Fox', included: true },
      { text: 'Weekly live Q&A sessions', included: true },
      { text: 'Ask anything, anytime', included: true },
      { text: 'AI implementation coaching', included: true },
      { text: 'Real estate strategy sessions', included: true },
      { text: 'First access to new tools & resources', included: true },
    ],
  },
];

const testimonials: any[] = []; // Real testimonials coming soon

export default function SubscribePage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(tierKey: 'pro' | 'inner-circle') {
    const priceId = PRICE_MAP[tierKey][isAnnual ? 'annual' : 'monthly'];
    setLoading(tierKey);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold text-gray-900">
                Agent<span className="text-blue-600">AI</span>Brief
              </h1>
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back to News
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-50 to-white pt-16 pb-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Join 2,400+ agents staying ahead of AI
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Don&apos;t just read AI news.
            <br />
            <span className="text-blue-600">Know what to do with it.</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
            <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  isAnnual ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-400'}`}>
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
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl p-8 flex flex-col ${
                  tier.highlighted
                    ? 'border-2 border-blue-600 shadow-xl shadow-blue-100 bg-white z-10'
                    : 'border border-gray-200 bg-white'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide">
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {tier.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-gray-900">
                      ${isAnnual ? tier.annualPrice : tier.monthlyPrice}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {isAnnual ? tier.annualPeriod : tier.period}
                    </span>
                  </div>
                  {isAnnual && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      {tier.annualSavings} vs monthly
                    </p>
                  )}
                  {!isAnnual && (
                    <p className="text-sm text-gray-400 mt-1">
                      or ${tier.annualPrice}/year (save {tier.annualSavings.replace('Save ', '')})
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">{tier.description}</p>
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
                          className="w-5 h-5 text-blue-600 mt-0.5 shrink-0"
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
                          className="w-5 h-5 text-gray-300 mt-0.5 shrink-0"
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
                          feature.included ? 'text-gray-700' : 'text-gray-400'
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(tier.tier)}
                  disabled={loading === tier.tier}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 ${tier.ctaStyle}`}
                >
                  {loading === tier.tier ? 'Redirecting...' : tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof — Dustin's Story */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider mb-10">
            Built by someone who actually sells real estate
          </h3>
          
          {/* Dustin's Story Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold shrink-0">
                  DF
                </div>
                <div className="text-center md:text-left">
                  <h4 className="text-xl font-bold mb-1">Dustin Fox</h4>
                  <p className="text-gray-300 text-sm mb-4">Team Lead, Fox Homes • DC Metro Market</p>
                  <p className="text-gray-200 text-sm leading-relaxed max-w-xl">
                    &ldquo;I went from solo agent to leading a 36-agent team doing $277 million in volume. AI didn&apos;t just help — it was the multiplier. This brief is everything I wish I had when I started adopting AI in my business.&rdquo;
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
              <div className="p-6 text-center">
                <p className="text-2xl font-bold text-blue-600">$277M</p>
                <p className="text-xs text-gray-500 mt-1">2025 Sales Volume</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-2xl font-bold text-blue-600">36</p>
                <p className="text-xs text-gray-500 mt-1">Agent Team</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-2xl font-bold text-blue-600">2,102</p>
                <p className="text-xs text-gray-500 mt-1">5-Star Google Reviews</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-2xl font-bold text-blue-600">Top 5</p>
                <p className="text-xs text-gray-500 mt-1">DC Metro Volume Team</p>
              </div>
            </div>
          </div>

          {/* The Pitch */}
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-gray-600 leading-relaxed">
              Most AI newsletters are written by tech people who&apos;ve never held an open house. 
              AgentAIBrief is different — it&apos;s built by a team lead who uses AI every day to 
              generate leads, create content, analyze markets, and coach a 36-agent team. 
              Every angle, every tip comes from real experience.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-10">
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
                a: "Everything in Pro, plus direct access to Dustin Fox — the team lead behind a 36-agent, $277M operation in the DC metro market. He's been implementing AI in real estate since day one and has 2,102 five-star Google reviews to show for it. Ask him anything about AI tools, marketing, scaling your team, or growing your business. Weekly live Q&A sessions and first access to new resources included.",
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
                q: 'Is the annual plan worth it?',
                a: "Both plans include 2 months free when you go annual. That's $38 back on Pro and $198 back on Inner Circle. If you're committed to staying ahead of AI in real estate, it's a no-brainer.",
              },
            ].map((faq) => (
              <div key={faq.q} className="border-b border-gray-200 pb-6">
                <h4 className="text-base font-semibold text-gray-900 mb-2">
                  {faq.q}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            The agents who adopt AI first will win.
          </h3>
          <p className="text-blue-100 text-lg mb-8">
            The team lead behind $277M in volume is sharing exactly how AI got him there.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => handleCheckout('pro')}
              disabled={!!loading}
              className="px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              {loading === 'pro' ? 'Redirecting...' : `Get Pro — $${isAnnual ? '190/yr' : '19/mo'}`}
            </button>
            <button 
              onClick={() => handleCheckout('inner-circle')}
              disabled={!!loading}
              className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-400 transition-colors border border-blue-400 disabled:opacity-50"
            >
              {loading === 'inner-circle' ? 'Redirecting...' : `Join Inner Circle — $${isAnnual ? '990/yr' : '99/mo'}`}
            </button>
          </div>
          <p className="text-blue-200 text-sm mt-4">
            ⚡ Inner Circle seats are limited — don&apos;t wait
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-sm text-gray-500 text-center">
            © 2026 AgentAIBrief.com • Built for real estate professionals
          </p>
        </div>
      </footer>
    </div>
  );
}
