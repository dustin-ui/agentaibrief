'use client';

import Link from 'next/link';
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
      else setStatus('idle');
    } catch {
      setStatus('idle');
    }
  }

  return (
    <>
      {/* Mobile: bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t-2" style={{ background: '#f0ece4', borderColor: '#d8d4cc' }}>
        <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-2.5">
          <input
            type="email"
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
      </div>

      {/* Desktop: top bar */}
      <div className="hidden md:block fixed top-0 left-0 right-0 z-[60]" style={{ background: '#d4d0c8', borderBottom: '2px solid #c4c0b8' }}>
        <form onSubmit={handleSubmit} className="max-w-[1080px] mx-auto px-4 py-2 flex items-center justify-center gap-3">
          <span className="text-[#2a2a2a] text-sm font-medium">Get the Free Daily Brief →</span>
          <span className="text-sm" style={{ color: '#c4c0b8' }}>|</span>
          <Link href="/affiliate" className="text-sm font-medium transition-colors" style={{ color: '#e85d26' }}>Earn 30% commission →</Link>
          <input
            type="email"
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
        </form>
      </div>
    </>
  );
}
