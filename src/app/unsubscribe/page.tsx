'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function UnsubscribeForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(decodeURIComponent(emailParam));
  }, [searchParams]);

  async function handleUnsubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {status === 'success' ? (
        <div className="text-center">
          <div className="text-5xl mb-4">👋</div>
          <h1 className="text-2xl font-bold text-[#2a2a2a] mb-2">You&apos;ve been unsubscribed</h1>
          <p className="text-[#666] mb-6">We&apos;re sorry to see you go. You won&apos;t receive any more emails from us.</p>
          <p className="text-sm text-[#888] mb-6">Changed your mind?</p>
          <a href="/subscribe" className="inline-block px-6 py-3 bg-[#e85d26] text-white font-semibold rounded-lg hover:bg-[#c44a1a] transition-colors">
            Re-subscribe →
          </a>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-[#2a2a2a] mb-2 text-center">Unsubscribe</h1>
          <p className="text-[#666] text-center mb-6">Enter your email to unsubscribe from all AgentAIBrief emails.</p>

          <form onSubmit={handleUnsubscribe} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#e85d26]"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full px-4 py-3 bg-[#2a2a2a] text-white font-medium rounded-lg hover:bg-[#444] transition-colors disabled:opacity-50"
            >
              {status === 'loading' ? 'Processing...' : 'Unsubscribe'}
            </button>

            {status === 'error' && (
              <p className="text-red-600 text-sm text-center">Something went wrong. Please try again or email dustin@foxhomesteam.com</p>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-[#888] mb-3">Or adjust your preferences instead:</p>
            <a href="/manage-subscription" className="text-sm text-[#e85d26] hover:underline">
              Manage Email Preferences →
            </a>
          </div>
        </>
      )}
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen bg-[#e8e6e1] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#2a2a2a' }}>
            Agent<span style={{ color: '#e85d26' }}>AI</span>Brief
          </Link>
        </div>

        {/* Paid subscriber shortcut */}
        <div className="bg-white rounded-2xl shadow-lg p-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#888] text-center mb-3">Paid subscriber? Manage or cancel here:</p>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/manage-subscription"
              className="flex flex-col items-center gap-1 p-4 rounded-xl border-2 border-[#e85d26] bg-[#fff3ee] hover:bg-[#ffe8dc] transition-colors text-center"
            >
              <span className="text-2xl">⚡</span>
              <span className="font-bold text-[#e85d26] text-sm">Pro</span>
              <span className="text-xs text-[#888]">Cancel or downgrade</span>
            </a>
            <a
              href="/manage-subscription"
              className="flex flex-col items-center gap-1 p-4 rounded-xl border-2 border-[#7c3aed] bg-[#f5f0ff] hover:bg-[#ede8ff] transition-colors text-center"
            >
              <span className="text-2xl">👑</span>
              <span className="font-bold text-[#7c3aed] text-sm">Inner Circle</span>
              <span className="text-xs text-[#888]">Cancel or downgrade</span>
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 border-t border-gray-300" />
          <span className="text-xs text-[#888] whitespace-nowrap">or unsubscribe from emails only</span>
          <div className="flex-1 border-t border-gray-300" />
        </div>

        <Suspense fallback={<div className="bg-white rounded-2xl shadow-lg p-8 text-center text-[#888]">Loading...</div>}>
          <UnsubscribeForm />
        </Suspense>

        <div className="text-center mt-6">
          <a href="/" className="text-sm text-[#888] hover:text-[#e85d26] transition-colors">
            ← Back to AgentAIBrief
          </a>
        </div>
      </div>
    </div>
  );
}
