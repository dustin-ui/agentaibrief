'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const NAV_ITEMS = [
  { href: '/', label: 'News' },
  { href: '/blog', label: 'Blog' },
  { href: '/tools', label: 'AI Tools' },
  { href: '/prompts', label: 'Prompts' },
  { href: '/neighborhood-brief', label: 'Market Brief' },
  { href: '/seo-sniper', label: 'SEO Sniper' },
  { href: '/seo-command', label: 'SEO Command' },
  { href: '/listing-generator', label: 'Listing Generator' },
  { href: '/listing-description', label: 'Listing Description' },
  { href: '/listing-radar', label: 'Listing Radar' },
  { href: '/market-update', label: 'Market Update' },
  { href: '/newsletter-builder', label: 'Newsletter' },
  { href: '/videos', label: 'Video Library' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/affiliate', label: 'Affiliate' },
];

const TIER_BADGE: Record<string, { label: string; color: string }> = {
  pro: { label: 'PRO', color: 'bg-[#e85d26]' },
  inner_circle: { label: 'IC', color: 'bg-[#2a2a2a]' },
};

export function SiteNav({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const pathname = usePathname();
  const { isLoggedIn, profile, signOut, tier } = useAuth();
  const isActive = (href: string) => pathname === href;

  const badge = TIER_BADGE[tier];

  return (
    <nav className="hidden md:flex items-center gap-4">
      {NAV_ITEMS.map((item) => (
        <Link key={item.href} href={item.href}
          className={`text-sm transition-colors duration-200 ${
            isActive(item.href)
              ? 'text-[#e85d26] font-semibold border-b-2 border-[#e85d26] pb-0.5'
              : 'text-[#555] hover:text-[#e85d26]'
          }`}>
          {item.label}
        </Link>
      ))}
      <div className="ml-2 flex items-center gap-2">
        {isLoggedIn ? (
          <>
            {badge && (
              <span className={`${badge.color} text-white text-[10px] font-bold px-1.5 py-0.5 rounded`}>{badge.label}</span>
            )}
            <span className="text-xs text-[#888] max-w-[120px] truncate">
              {profile?.full_name || profile?.email}
            </span>
            <button onClick={() => signOut()}
              className="text-xs text-[#888] hover:text-[#e85d26] transition-colors">
              Log Out
            </button>
          </>
        ) : (
          <Link href="/login"
            className="text-sm px-4 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#e85d26] transition-colors font-medium">
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
}
