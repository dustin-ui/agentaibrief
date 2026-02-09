'use client';

import { useState } from 'react';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-gray-600 hover:text-gray-900"
        aria-label="Toggle menu"
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
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <nav className="flex flex-col px-4 py-3 space-y-3">
            <a href="/contract-analyzer" className="text-sm text-gray-700 hover:text-blue-600 font-medium flex items-center gap-2" onClick={() => setOpen(false)}>
              📄 Contract Analyzer
            </a>
            <a href="/videos" className="text-sm text-gray-700 hover:text-blue-600 font-medium flex items-center gap-2" onClick={() => setOpen(false)}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
              </svg>
              Video Library
            </a>
            <a href="/preferences" className="text-sm text-gray-700 hover:text-blue-600 font-medium flex items-center gap-2" onClick={() => setOpen(false)}>
              ⚙️ Email Preferences
            </a>
            <a href="/pro-dashboard" className="text-sm text-gray-700 hover:text-blue-600 font-medium flex items-center gap-2" onClick={() => setOpen(false)}>
              📊 SEO Reports
            </a>
            <a href="/subscribe" className="text-sm text-blue-600 hover:text-blue-700 font-semibold" onClick={() => setOpen(false)}>
              Subscribe →
            </a>
          </nav>
        </div>
      )}
    </div>
  );
}
