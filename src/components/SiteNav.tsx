'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/', label: 'News' },
  { href: '/blog', label: 'Blog' },
  { href: '/tools', label: 'AI Tools' },
  { href: '/prompts', label: 'Prompts' },
  { href: '/neighborhood-brief', label: 'Market Brief' },
  { href: '/videos', label: 'Video Library' },
  { href: '/subscribe', label: 'Subscribe' },
];

export function SiteNav({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href;

  const base = variant === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900';
  const active = variant === 'dark' ? 'text-white font-medium border-b-2 border-blue-500 pb-0.5' : 'text-gray-900 font-medium border-b-2 border-blue-600 pb-0.5';

  return (
    <nav className="hidden md:flex items-center gap-4">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`text-sm transition-colors ${isActive(item.href) ? active : base}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
