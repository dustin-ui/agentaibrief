'use client';

import { useState, useRef } from 'react';
import { NewsFeed } from '@/components/NewsFeed';
import { TrendingBar } from '@/components/TrendingBar';
import { LoginModal } from '@/components/LoginModal';
import { MobileNav } from '@/components/MobileNav';
import { StickySubscribeBar } from '@/components/StickySubscribeBar';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

const tools = [
  {
    name: 'Listing Content Factory',
    href: '/listing-generator',
    description: '1 listing → 9 pieces of content in 60 seconds',
    icon: '🏠',
    badge: 'PRO',
  },
  {
    name: 'Content Briefing',
    href: '/content-briefing',
    description: '15 local stories with video scripts, weekly',
    icon: '📋',
    badge: 'PRO',
  },
  {
    name: 'Newsletter Builder',
    href: '/newsletter-builder',
    description: 'Branded weekly newsletter on autopilot',
    icon: '📰',
    badge: 'PRO',
  },
  {
    name: 'Prompt Library',
    href: '/prompts',
    description: '53 battle-tested prompts for every scenario',
    icon: '💬',
    badge: null,
  },
  {
    name: 'Custom GPT Templates',
    href: '/gpt-templates',
    description: '16 ready-to-deploy AI assistants',
    icon: '🤖',
    badge: 'IC',
  },
  {
    name: 'Contract Analyzer',
    href: '/contract-analyzer',
    description: 'Upload a contract, get instant clause-by-clause analysis',
    icon: '📄',
    badge: 'PRO',
  },
  {
    name: 'SEO Sniper',
    href: '/seo-sniper',
    description: 'Find and dominate local search gaps',
    icon: '🎯',
    badge: 'IC',
  },
  {
    name: 'SEO Command Center',
    href: '/seo-command',
    description: 'Prescriptive local SEO actions + ranking grid + full audit',
    icon: '📡',
    badge: 'IC',
  },
  {
    name: 'Neighborhood Market Brief',
    href: '/neighborhood-brief',
    description: 'Hyperlocal market data for any neighborhood',
    icon: '📊',
    badge: 'PRO',
  },
  {
    name: 'Listing Launch Radar',
    href: '/listing-radar',
    description: 'Detect pre-listing sell signals before anyone else',
    icon: '📡',
    badge: 'PRO',
  },
  {
    name: 'Sphere Seismograph',
    href: '/sphere-monitor',
    description: 'Track life events in your sphere — never miss a move signal',
    icon: '🔮',
    badge: 'PRO',
  },
];

export default function Home() {
  const { user, isLoggedIn, isPro, signOut, profile } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [subEmail, setSubEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [showDemo, setShowDemo] = useState(false);

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
    <div className="min-h-screen animate-fade-in" style={{ background: '#e8e6e1' }}>
      {/* Header — warm industrial nav */}
      <header className="sticky top-[48px] md:top-[44px] z-[70] border-b-[3px]" style={{ background: '#d4d0c8', borderColor: '#c4c0b8' }}>
        <div className="max-w-[1200px] mx-auto px-8 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tight" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#2a2a2a' }}>
              Agent<span style={{ color: '#e85d26' }}>AI</span>Brief
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <a href="/tools" className="text-sm font-medium transition-colors text-[#555] hover:text-[#e85d26]">AI Tools</a>
              <a href="/prompts" className="text-sm font-medium transition-colors text-[#555] hover:text-[#e85d26]">Prompts</a>
              <a href="/blog" className="text-sm font-medium transition-colors text-[#555] hover:text-[#e85d26]">Blog</a>
              <a href="/videos" className="text-sm font-medium transition-colors text-[#555] hover:text-[#e85d26]">Videos</a>
              <a href="/pricing" className="text-sm font-medium transition-colors text-[#555] hover:text-[#e85d26]">Pricing</a>
              <a href="/affiliate" className="text-sm font-medium transition-colors text-[#555] hover:text-[#e85d26]">Affiliate</a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <MobileNav />
            {isLoggedIn ? (
              <>
                <span className="text-sm hidden sm:inline" style={{ color: '#888' }}>{user?.email}</span>
                <span className="text-xs px-2 py-1 rounded-full font-semibold uppercase" style={{ background: 'rgba(232,93,38,0.15)', color: '#e85d26' }}>
                  {profile?.subscription_tier === 'inner_circle' ? 'Inner Circle' : profile?.subscription_tier === 'pro' ? 'Pro' : 'Free'}
                </span>
                <button onClick={signOut} className="text-sm transition-colors text-[#888] hover:text-[#e85d26]">Log out</button>
              </>
            ) : (
              <>
                <button onClick={() => setShowLogin(true)} className="btn-outline-dark text-sm">Log In</button>
                <button onClick={() => { window.location.href = '/subscribe'; }} className="text-sm px-4 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#e85d26] transition-colors font-semibold">Get Started</button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Trending Bar */}
      <TrendingBar />

      {/* Hero Section — Modern Industrial */}
      {!isLoggedIn && (
        <section data-hero className="py-24 sm:py-32 max-w-[1400px] mx-auto px-4" style={{ background: '#e8e6e1' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center px-4 sm:px-8">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.8rem] font-extrabold tracking-tight leading-[1.05] mb-6" style={{ color: '#1a1a1a', letterSpacing: '-2px' }}>
                Your AI<br /><span style={{ color: '#e85d26' }}>Command Center</span><br />for Real Estate
              </h1>
              <p className="text-lg leading-relaxed max-w-[500px] mb-10" style={{ color: '#666' }}>
                Daily briefings, market snapshots, listing descriptions, and drip campaigns — all powered by AI, built for agents who move fast.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-start mb-10">
                <a href="/subscribe" className="btn-primary px-8 py-4 text-[1rem]">
                  Start Free Trial
                </a>
                <button onClick={() => setShowDemo(true)} className="btn-outline-dark px-8 py-4 text-[1rem] cursor-pointer">
                  ▶ Watch Demo
                </button>
              </div>

              {/* Inline email subscribe */}
              {subStatus === 'success' ? (
                <div className="max-w-md rounded-2xl p-4" style={{ background: 'rgba(232,93,38,0.08)', border: '2px solid rgba(232,93,38,0.2)' }}>
                  <p className="font-semibold" style={{ color: '#e85d26' }}>✅ You&apos;re in! Check your inbox.</p>
                  {referralCode && (
                    <a href="/referral" className="text-sm underline mt-1 inline-block" style={{ color: '#e85d26' }}>🎁 Share &amp; earn rewards →</a>
                  )}
                </div>
              ) : (
                <form onSubmit={handleEmailSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-[480px]">
                  <input
                    type="email"
                    placeholder="Enter your email for the free daily brief"
                    value={subEmail}
                    onChange={e => setSubEmail(e.target.value)}
                    required
                    className="flex-1 px-4 py-3 rounded-lg text-sm outline-none transition-colors"
                    style={{ background: '#f0ece4', border: '2px solid #d8d4cc', color: '#2a2a2a' }}
                  />
                  <button
                    type="submit"
                    disabled={subStatus === 'loading'}
                    className="px-6 py-3 text-white font-semibold rounded-lg text-sm transition-all disabled:opacity-50 whitespace-nowrap"
                    style={{ background: '#e85d26', boxShadow: '0 3px 0 #c44a1a' }}
                  >
                    {subStatus === 'loading' ? 'Subscribing...' : 'Get Free Brief →'}
                  </button>
                </form>
              )}
              {subStatus === 'error' && (
                <p className="text-red-600 text-sm mt-2">Something went wrong. Try again.</p>
              )}
              <p className="text-xs mt-3" style={{ color: '#888' }}>No spam. Unsubscribe anytime. Join 2,400+ agents.</p>
            </div>

            {/* Hero Visual — Keyboard-inspired device */}
            <div className="hidden lg:block">
              <div style={{ background: '#d4d0c8', borderRadius: '20px', padding: '40px', boxShadow: '0 20px 60px rgba(0,0,0,0.15), inset 0 2px 0 rgba(255,255,255,0.5)', border: '1px solid #b8b4ac' }}>
                <div style={{ background: '#1a1a1a', borderRadius: '12px', padding: '30px', marginBottom: '20px' }}>
                  <div style={{ height: '10px', background: '#e85d26', borderRadius: '5px', marginBottom: '10px' }} />
                  <div style={{ height: '10px', background: '#333', borderRadius: '5px', marginBottom: '10px', width: '80%' }} />
                  <div style={{ height: '10px', background: '#333', borderRadius: '5px', marginBottom: '10px', width: '60%' }} />
                  <div style={{ height: '10px', background: '#333', borderRadius: '5px', marginBottom: '10px' }} />
                  <div style={{ height: '10px', background: '#e85d26', borderRadius: '5px', width: '60%' }} />
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ flex: 1, background: '#f0ece4', borderRadius: '8px', padding: '12px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', fontWeight: 600, color: '#666', boxShadow: '0 3px 0 #c4c0b8', border: '1px solid #d8d4cc', textAlign: 'center' }}>BRIEF</div>
                  <div style={{ flex: 1, background: '#f0ece4', borderRadius: '8px', padding: '12px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', fontWeight: 600, color: '#666', boxShadow: '0 3px 0 #c4c0b8', border: '1px solid #d8d4cc', textAlign: 'center' }}>MARKET</div>
                  <div style={{ flex: 1, background: '#e85d26', borderRadius: '8px', padding: '12px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', fontWeight: 600, color: '#fff', boxShadow: '0 3px 0 #c44a1a', border: '1px solid #d05020', textAlign: 'center' }}>LISTING</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <div style={{ flex: 1, background: '#2a2a2a', borderRadius: '8px', padding: '12px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', fontWeight: 600, color: '#fff', boxShadow: '0 3px 0 #111', border: '1px solid #333', textAlign: 'center' }}>DRIP</div>
                  <div style={{ flex: 1, background: '#f0ece4', borderRadius: '8px', padding: '12px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', fontWeight: 600, color: '#666', boxShadow: '0 3px 0 #c4c0b8', border: '1px solid #d8d4cc', textAlign: 'center' }}>OPEN HSE</div>
                  <div style={{ flex: 1, background: '#f0ece4', borderRadius: '8px', padding: '12px 20px', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', fontWeight: 600, color: '#666', boxShadow: '0 3px 0 #c4c0b8', border: '1px solid #d8d4cc', textAlign: 'center' }}>SCRIPTS</div>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                  <div style={{ width: '36px', height: '36px', background: '#2a2a2a', borderRadius: '50%', border: '2px solid #444', position: 'relative' }} />
                  <div style={{ width: '36px', height: '36px', background: '#2a2a2a', borderRadius: '50%', border: '2px solid #444', position: 'relative' }} />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tool Showcase Grid */}
      <section className="py-20 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[2rem] font-extrabold tracking-tight mb-2" style={{ color: '#2a2a2a', letterSpacing: '-1px' }}>Your AI Toolkit</h2>
            <p style={{ color: '#888' }}>Everything you need to outwork and outsmart the competition.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="glass-card relative p-7"
              >
                {tool.badge && (
                  <span className={`absolute top-4 right-4 text-[0.65rem] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                    tool.badge === 'IC'
                      ? 'text-[#2a2a2a] bg-[#e8e6e1]'
                      : 'text-[#e85d26] bg-[rgba(232,93,38,0.1)]'
                  }`}>
                    {tool.badge === 'IC' ? 'INNER CIRCLE' : 'PRO'}
                  </span>
                )}
                <div className="text-[2rem] mb-4">{tool.icon}</div>
                <h3 className="text-[0.95rem] font-bold mb-1" style={{ color: '#2a2a2a' }}>{tool.name}</h3>
                <p className="text-[0.85rem] leading-relaxed" style={{ color: '#888' }}>{tool.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid — Built Different */}
      <section className="py-20 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[2.5rem] font-extrabold tracking-tight mb-2" style={{ color: '#2a2a2a', letterSpacing: '-1px' }}>Built Different</h2>
            <p style={{ color: '#888', fontSize: '1.1rem' }}>Every tool designed for speed, accuracy, and the way agents actually work.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '📰', title: 'Daily AI Briefings', desc: 'Wake up to a personalized market briefing covering your zip codes, price ranges, and competition.' },
              { icon: '📊', title: 'Market Snapshots', desc: 'Real-time market data turned into shareable graphics and talking points for your clients.' },
              { icon: '🏠', title: 'Listing Descriptions', desc: 'MLS-ready descriptions in seconds. Fair Housing compliant. Multiple tones and styles.' },
              { icon: '💧', title: 'Drip Campaigns', desc: 'AI-generated email sequences that nurture leads from cold to closable.' },
              { icon: '🎤', title: 'Market Update Scripts', desc: 'Teleprompter-ready scripts for video content. 30, 60, 90, or 120 seconds.' },
              { icon: '🔑', title: 'Open House Follow-Up', desc: 'Instant follow-up sequences triggered by sign-in sheets. Never miss a lead.' },
            ].map((f) => (
              <div key={f.title} className="glass-card p-9">
                <div className="feature-icon mb-5">{f.icon}</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#2a2a2a' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#888' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI News Section */}
      <section className="py-20" style={{ background: '#e8e6e1' }}>
        <div className="max-w-[1080px] mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-[2rem] font-extrabold tracking-tight mb-2" style={{ color: '#2a2a2a', letterSpacing: '-1px' }}>AI News for Agents</h2>
            <p style={{ color: '#888' }}>Stay current on what matters. Updated hourly.</p>
          </div>
          <NewsFeed isPremium={isPro} />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4" style={{ background: '#d4d0c8' }}>
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[2.5rem] font-extrabold tracking-tight mb-2" style={{ color: '#2a2a2a', letterSpacing: '-1px' }}>Simple, Clear Pricing</h2>
            <p style={{ color: '#666' }}>Start free, upgrade when you&apos;re ready.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Free */}
            <div className="rounded-2xl p-8 text-center" style={{ background: '#f0ece4', border: '2px solid #d8d4cc' }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#e85d26' }}>Free</div>
              <div className="text-[2.5rem] font-extrabold leading-none mb-1" style={{ color: '#2a2a2a' }}>$0<span className="text-[0.9rem] font-medium" style={{ color: '#888' }}>/mo</span></div>
              <ul className="text-left text-[0.85rem] leading-[2.2] my-5" style={{ color: '#666' }}>
                <li><span style={{ color: '#e85d26' }}>→ </span>Daily AI Brief</li>
                <li><span style={{ color: '#e85d26' }}>→ </span>Prompt Library</li>
                <li><span style={{ color: '#e85d26' }}>→ </span>AI News Feed</li>
              </ul>
              <a href="/subscribe" className="btn-outline-dark block w-full py-3 text-center text-sm">
                Get Started
              </a>
            </div>

            {/* Pro */}
            <div className="rounded-2xl p-8 text-center" style={{ background: '#f0ece4', border: '2px solid #d8d4cc' }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#e85d26' }}>Pro</div>
              <div className="text-[2.5rem] font-extrabold leading-none mb-1" style={{ color: '#2a2a2a' }}>$19<span className="text-[0.9rem] font-medium" style={{ color: '#888' }}>/mo</span></div>
              <ul className="text-left text-[0.85rem] leading-[2.2] my-5" style={{ color: '#666' }}>
                <li><span style={{ color: '#e85d26' }}>→ </span>Everything in Free</li>
                <li><span style={{ color: '#e85d26' }}>→ </span>Listing Content Factory</li>
                <li><span style={{ color: '#e85d26' }}>→ </span>Newsletter Builder</li>
                <li><span style={{ color: '#e85d26' }}>→ </span>Contract Analyzer</li>
                <li><span style={{ color: '#e85d26' }}>→ </span>Neighborhood Market Brief</li>
                <li><span style={{ color: '#e85d26' }}>→ </span>Listing Launch Radar</li>
                <li><span style={{ color: '#e85d26' }}>→ </span>Sphere Seismograph</li>
              </ul>
              <a href="/subscribe" className="block w-full py-3 text-white font-semibold rounded-lg text-sm transition-all" style={{ background: '#e85d26', boxShadow: '0 3px 0 #c44a1a' }}>
                Start Pro →
              </a>
            </div>

            {/* Inner Circle — featured */}
            <div className="rounded-2xl p-8 text-center relative" style={{ background: '#2a2a2a', border: '2px solid #e85d26', boxShadow: '0 3px 0 #e85d26' }}>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[0.7rem] font-bold px-3 py-1 rounded-full uppercase" style={{ background: '#e85d26', color: '#fff' }}>Most Popular</span>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#e85d26' }}>Inner Circle</div>
              <div className="text-[2.5rem] font-extrabold text-white leading-none mb-1">$99<span className="text-[0.9rem] font-medium" style={{ color: '#aaa' }}>/mo</span></div>
              <ul className="text-left text-[0.85rem] leading-[2.2] my-5" style={{ color: '#ccc' }}>
                <li><span style={{ color: '#e85d26' }}>→ </span>Everything in Pro</li>
                <li><span style={{ color: '#e85d26' }}>→ </span>Content Briefing</li>
                <li><span style={{ color: '#e85d26' }}>→ </span>SEO Command Center</li>
                <li><span style={{ color: '#e85d26' }}>→ </span>SEO Sniper</li>
                <li><span style={{ color: '#e85d26' }}>→ </span>Custom GPT Templates</li>
                <li><span style={{ color: '#e85d26' }}>→ </span>Direct access to Dustin Fox</li>
              </ul>
              <a href="/subscribe" className="block w-full py-3 text-white font-semibold rounded-lg text-sm transition-all" style={{ background: '#e85d26', boxShadow: '0 3px 0 #c44a1a' }}>
                Join Inner Circle →
              </a>
            </div>

            {/* Team */}
            <div className="rounded-2xl p-8 text-center" style={{ background: '#f0ece4', border: '2px solid #d8d4cc' }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#e85d26' }}>Team</div>
              <div className="text-[2.5rem] font-extrabold leading-none mb-1" style={{ color: '#2a2a2a' }}>$299<span className="text-[0.9rem] font-medium" style={{ color: '#888' }}>/mo</span></div>
              <ul className="text-left text-[0.85rem] leading-[2.2] my-5" style={{ color: '#666' }}>
                <li><span style={{ color: '#e85d26' }}>→ </span>Everything in Inner Circle</li>
                <li><span style={{ color: '#e85d26' }}>→ </span>Up to 10 agent seats</li>
                <li><span style={{ color: '#e85d26' }}>→ </span>Team analytics</li>
                <li><span style={{ color: '#e85d26' }}>→ </span>Custom onboarding</li>
                <li><span style={{ color: '#e85d26' }}>→ </span>Priority support</li>
              </ul>
              <a href="/subscribe" className="btn-outline-dark block w-full py-3 text-center text-sm">
                Contact Sales →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Affiliate Banner */}
      <section className="py-14 text-center" style={{ background: '#e8e6e1' }}>
        <h2 className="text-[1.6rem] font-extrabold tracking-tight mb-2" style={{ color: '#2a2a2a' }}>Earn 30% Recurring Commission</h2>
        <p className="mb-5 text-[0.95rem]" style={{ color: '#888' }}>Refer agents to AgentAIBrief and earn 30% of every payment, forever.</p>
        <a href="/affiliate" className="btn-primary inline-block px-8 py-3 text-[0.95rem]">
          Join the Affiliate Program →
        </a>
      </section>

      {/* Stats */}
      <section className="py-14 px-4" style={{ background: '#e8e6e1' }}>
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { num: '2,000+', label: '5-Star Google Reviews' },
            { num: '#4', label: 'Team in DC Metro' },
            { num: '$277M', label: '2025 Volume' },
          ].map((s) => (
            <div key={s.label} className="glass-card p-8 text-center">
              <p className="text-[2.5rem] font-extrabold leading-none" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#e85d26' }}>{s.num}</p>
              <p className="text-sm mt-2 font-medium" style={{ color: '#888' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof / Built By Section */}
      <section className="py-20 text-center px-4" style={{ background: '#d4d0c8' }}>
        <div className="max-w-[720px] mx-auto">
          <h2 className="text-[1.6rem] font-extrabold tracking-tight mb-2" style={{ color: '#2a2a2a' }}>Built by Dustin Fox &amp; the Fox Homes Team</h2>
          <p className="mb-8" style={{ color: '#666' }}>DC Metro&apos;s Top Producing Real Estate Team</p>
          <blockquote className="text-lg italic leading-relaxed mb-6 max-w-[700px] mx-auto" style={{ color: '#2a2a2a' }}>
            &ldquo;Built by agents who actually sell real estate. Not coaches. Not gurus. Not theorists.&rdquo;
          </blockquote>
          <div className="font-bold text-[0.9rem]" style={{ color: '#e85d26' }}>Dustin Fox</div>
          <div className="text-xs mt-1" style={{ color: '#888' }}>Fox Homes Team · $277M in Volume · 2,000+ Google Reviews</div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-xs border-t-2" style={{ color: '#888', borderColor: '#d4d0c8' }}>
        <div>© 2026 AgentAIBrief.com</div>
        <div className="mt-2 flex justify-center gap-6">
          <a href="/privacy" className="transition-colors text-[#888] hover:text-[#e85d26]">Privacy Policy</a>
          <a href="/terms" className="transition-colors text-[#888] hover:text-[#e85d26]">Terms of Service</a>
          <a href="/preferences" className="transition-colors text-[#888] hover:text-[#e85d26]">Manage Preferences</a>
        </div>
      </footer>

      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <StickySubscribeBar />

      {/* Demo Video Modal */}
      {showDemo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setShowDemo(false)}>
          <div className="relative w-full max-w-4xl mx-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowDemo(false)}
              className="absolute -top-10 right-0 text-white text-3xl font-light hover:text-[#e85d26] transition-colors cursor-pointer"
            >
              ✕
            </button>
            <div className="rounded-2xl overflow-hidden shadow-2xl bg-black">
              <video
                src="/demo.mp4"
                controls
                autoPlay
                className="w-full"
                style={{ maxHeight: '80vh' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
