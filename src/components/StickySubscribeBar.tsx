'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

export function StickySubscribeBar() {
  const { isLoggedIn } = useAuth();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    const hero = document.querySelector('[data-hero]');
    if (!hero) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  if (isLoggedIn || status === 'success' || !visible) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tier: 'free' }),
      });
      if (res.ok) setStatus('success');
      else setStatus('idle');
    } catch {
      setStatus('idle');
    }
  }

  return (
    <>
      {/* Mobile: bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-blue-600 border-t border-blue-500 shadow-lg">
        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2.5">
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-3 py-2 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none min-w-0"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-2 bg-white text-blue-700 text-sm font-bold rounded-lg whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            {status === 'loading' ? '...' : 'Free Brief →'}
          </button>
        </form>
      </div>

      {/* Desktop: top bar (below header) */}
      <div className="hidden md:block fixed top-0 left-0 right-0 z-[60] bg-blue-600 shadow-md">
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-center gap-3">
          <span className="text-white text-sm font-medium">Get the Free Daily Brief →</span>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-3 py-1.5 rounded text-sm text-gray-900 placeholder-gray-400 focus:outline-none w-56"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-1.5 bg-white text-blue-700 text-sm font-bold rounded hover:bg-blue-50 disabled:opacity-50"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </>
  );
}
