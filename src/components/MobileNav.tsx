'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { NAV_ITEMS, SUPPORT_MAILTO } from '@/lib/nav-items';
import { FREE_ACCESS_MODE } from '@/lib/site-mode';

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
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-[#555] hover:text-[#e85d26] font-medium flex items-center gap-2 transition-colors" onClick={() => setOpen(false)}>
                {item.icon ? `${item.icon} ` : ''}{item.label}
              </Link>
            ))}
            {/* Pricing + Affiliate hidden — open access mode */}
            <a href={SUPPORT_MAILTO} className="text-sm text-[#555] hover:text-[#e85d26] font-medium flex items-center gap-2 transition-colors" onClick={() => setOpen(false)}>📧 Support</a>
            <Link href="/manage-subscription" className="text-sm text-[#555] hover:text-[#e85d26] font-medium flex items-center gap-2 transition-colors" onClick={() => setOpen(false)}>⚙️ Manage Subscription</Link>
            <Link href="/unsubscribe" className="text-sm text-[#888] hover:text-[#e85d26] font-medium flex items-center gap-2 transition-colors" onClick={() => setOpen(false)}>🚫 Unsubscribe</Link>

            <div className="border-t pt-3 mt-2" style={{ borderColor: '#d8d4cc' }}>
              {FREE_ACCESS_MODE ? (
                <Link href="/subscribe" onClick={() => setOpen(false)} className="btn-primary block text-center py-2 rounded-lg text-sm font-medium">
                  Subscribe to Newsletter
                </Link>
              ) : isLoggedIn ? (
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
