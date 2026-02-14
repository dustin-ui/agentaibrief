'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

const TIER_BADGE: Record<string, { label: string; color: string }> = {
  pro: { label: 'PRO', color: 'bg-[#e85d26]' },
  inner_circle: { label: 'INNER CIRCLE', color: 'bg-[#2a2a2a]' },
};

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { isLoggedIn, profile, signOut, tier } = useAuth();
  const badge = TIER_BADGE[tier];

  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(!open)} className="p-2 text-[#666] hover:text-[#2a2a2a]" aria-label="Toggle menu">
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>
      {open && (
        <div className="absolute top-full left-0 right-0 border-b-2 shadow-lg z-50" style={{ background: '#f0ece4', borderColor: '#d8d4cc' }}>
          <nav className="flex flex-col px-4 py-3 space-y-3">
            <a href="/tools" className="text-sm text-[#555] hover:text-[#e85d26] font-medium flex items-center gap-2 transition-colors" onClick={() => setOpen(false)}>🛠️ All AI Tools</a>
            <a href="/listing-generator" className="text-sm text-[#555] hover:text-[#e85d26] font-medium flex items-center gap-2 transition-colors" onClick={() => setOpen(false)}>🏠 Listing Generator</a>
            <a href="/listing-description" className="text-sm text-[#555] hover:text-[#e85d26] font-medium flex items-center gap-2 transition-colors" onClick={() => setOpen(false)}>✍️ Listing Description</a>
            <a href="/content-briefing" className="text-sm text-[#555] hover:text-[#e85d26] font-medium flex items-center gap-2 transition-colors" onClick={() => setOpen(false)}>📋 Content Briefing</a>
            <a href="/newsletter-builder" className="text-sm text-[#555] hover:text-[#e85d26] font-medium flex items-center gap-2 transition-colors" onClick={() => setOpen(false)}>📧 Newsletter</a>
            <a href="/contract-analyzer" className="text-sm text-[#555] hover:text-[#e85d26] font-medium flex items-center gap-2 transition-colors" onClick={() => setOpen(false)}>📄 Contract Analyzer</a>
            <a href="/neighborhood-brief" className="text-sm text-[#555] hover:text-[#e85d26] font-medium flex items-center gap-2 transition-colors" onClick={() => setOpen(false)}>📊 Market Brief</a>
            <a href="/listing-radar" className="text-sm text-[#555] hover:text-[#e85d26] font-medium flex items-center gap-2 transition-colors" onClick={() => setOpen(false)}>📡 Listing Radar</a>
            <a href="/sphere-monitor" className="text-sm text-[#555] hover:text-[#e85d26] font-medium flex items-center gap-2 transition-colors" onClick={() => setOpen(false)}>🔮 Sphere Seismograph</a>
            <a href="/seo-sniper" className="text-sm text-[#555] hover:text-[#e85d26] font-medium flex items-center gap-2 transition-colors" onClick={() => setOpen(false)}>🎯 SEO Sniper</a>
            <a href="/seo-command" className="text-sm text-[#555] hover:text-[#e85d26] font-medium flex items-center gap-2 transition-colors" onClick={() => setOpen(false)}>📡 SEO Command</a>
            <a href="/prompts" className="text-sm text-[#555] hover:text-[#e85d26] font-medium flex items-center gap-2 transition-colors" onClick={() => setOpen(false)}>💬 Prompts</a>
            <a href="/gpt-templates" className="text-sm text-[#555] hover:text-[#e85d26] font-medium flex items-center gap-2 transition-colors" onClick={() => setOpen(false)}>🤖 GPT Templates</a>
            <a href="/blog" className="text-sm text-[#555] hover:text-[#e85d26] font-medium flex items-center gap-2 transition-colors" onClick={() => setOpen(false)}>📝 Blog</a>
            <a href="/videos" className="text-sm text-[#555] hover:text-[#e85d26] font-medium flex items-center gap-2 transition-colors" onClick={() => setOpen(false)}>🎬 Video Library</a>
            <a href="/pricing" className="text-sm text-[#e85d26] hover:text-[#c44a1a] font-semibold transition-colors" onClick={() => setOpen(false)}>💎 Pricing</a>
            <a href="/affiliate" className="text-sm text-[#e85d26] hover:text-[#c44a1a] font-semibold transition-colors" onClick={() => setOpen(false)}>💰 Affiliate Program</a>

            <div className="border-t pt-3 mt-2" style={{ borderColor: '#d8d4cc' }}>
              {isLoggedIn ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {badge && <span className={`${badge.color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded`}>{badge.label}</span>}
                    <span className="text-xs text-[#888] truncate max-w-[150px]">{profile?.full_name || profile?.email}</span>
                  </div>
                  <button onClick={() => { signOut(); setOpen(false); }} className="text-xs text-[#888] hover:text-[#e85d26] transition-colors">Log Out</button>
                </div>
              ) : (
                <Link href="/login" onClick={() => setOpen(false)} className="btn-primary block text-center py-2 rounded-lg text-sm font-medium">
                  Log In
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
