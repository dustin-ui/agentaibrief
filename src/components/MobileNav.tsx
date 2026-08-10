'use client';

import { useState } from 'react';
import Link from 'next/link';
import { NAV_ITEMS, SUPPORT_MAILTO } from '@/lib/nav-items';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-[#666] hover:text-[#2a2a2a]"
        aria-label="Toggle menu"
        aria-expanded={open}
        aria-controls="mobile-site-nav"
      >
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
        <div
          id="mobile-site-nav"
          className="absolute left-0 right-0 top-full z-50 border-b-2 shadow-lg"
          style={{ background: '#f0ece4', borderColor: '#d8d4cc' }}
        >
          <nav className="flex flex-col space-y-3 px-4 py-4" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm text-[#555] hover:text-[#e85d26] font-medium flex items-center gap-2 transition-colors" onClick={() => setOpen(false)}>
                {item.icon ? `${item.icon} ` : ''}{item.label}
              </Link>
            ))}
            <a href={SUPPORT_MAILTO} className="text-sm text-[#555] hover:text-[#e85d26] font-medium flex items-center gap-2 transition-colors" onClick={() => setOpen(false)}>📧 Support</a>
          </nav>
        </div>
      )}
    </div>
  );
}
