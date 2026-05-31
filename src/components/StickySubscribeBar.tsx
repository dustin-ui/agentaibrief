'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

export function StickySubscribeBar() {
  const { isLoggedIn } = useAuth();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const hero = document.querySelector('[data-hero]');
    
    if (!hero) {
      // No hero element - defer state update to avoid sync setState warning
      const timer = setTimeout(() => setVisible(true), 0);
      return () => clearTimeout(timer);
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
      else setStatus('error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <>
      {/* Mobile: spacer so the fixed bottom bar never covers footer/Unsubscribe */}
      <div className="md:hidden" style={{ height: '76px' }} aria-hidden="true" />

      {/* Mobile: bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t-2" style={{ background: '#f0ece4', borderColor: '#d8d4cc' }}>
        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2.5">
          <label htmlFor="sticky-email-mobile" className="sr-only">Email address</label>
          <input
            id="sticky-email-mobile"
            type="email"
            aria-label="Email address"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-3 py-2 rounded-lg text-sm text-[#2a2a2a] min-w-0 outline-none"
            style={{ background: '#f0ece4', border: '2px solid #d8d4cc' }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-2 text-sm font-semibold rounded-lg whitespace-nowrap shrink-0 disabled:opacity-50 transition-all"
            style={{ background: '#e85d26', color: '#fff', boxShadow: '0 3px 0 #c44a1a' }}
          >
            {status === 'loading' ? '...' : 'Free Brief →'}
          </button>
        </form>
        {status === 'error' && (
          <p role="alert" className="px-3 pb-2 text-xs text-red-800">Couldn&apos;t subscribe — please try again.</p>
        )}
      </div>

      {/* Desktop: top bar */}
      <div className="hidden md:block fixed top-0 left-0 right-0 z-[60]" style={{ background: '#d4d0c8', borderBottom: '2px solid #c4c0b8' }}>
        <form onSubmit={handleSubmit} className="max-w-[1080px] mx-auto px-4 py-2 flex items-center justify-center gap-3 flex-wrap">
          <span className="text-[#2a2a2a] text-sm font-medium">Get the Free Daily Brief →</span>
          {/* Affiliate link hidden — open access mode */}
          <label htmlFor="sticky-email-desktop" className="sr-only">Email address</label>
          <input
            id="sticky-email-desktop"
            type="email"
            aria-label="Email address"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="px-3 py-1.5 rounded-lg text-sm text-[#2a2a2a] w-56 outline-none"
            style={{ background: '#f0ece4', border: '2px solid #d8d4cc' }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-1.5 text-white text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
            style={{ background: '#e85d26', boxShadow: '0 3px 0 #c44a1a' }}
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
          {status === 'error' && (
            <span role="alert" className="text-xs text-red-800 w-full text-center">Couldn&apos;t subscribe — please try again.</span>
          )}
        </form>
      </div>
    </>
  );
}
