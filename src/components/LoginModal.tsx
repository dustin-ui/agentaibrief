'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Escape-to-close + autofocus first field while open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    firstFieldRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      onClose();
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMsg('');
    if (!email.trim()) {
      setResetMsg('Enter your email above first, then tap reset.');
      return;
    }
    setResetLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'https://agentaibrief.com/reset-password',
    });
    setResetLoading(false);
    setResetMsg(err ? err.message : 'Check your email for the reset link.');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-[#f0ece4] border border-[#d8d4cc] rounded-2xl max-w-md w-full p-8 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-[#666] hover:text-[#e85d26]">✕</button>

        <h2 id="login-modal-title" className="text-2xl font-bold text-[#2a2a2a] mb-2">Welcome back</h2>
        <p className="text-sm text-[#666] mb-6">
          Log in to access your Agent<span className="text-[#e85d26]">AI</span>Brief subscription.
        </p>

        <form onSubmit={handleSubmit}>
          {error && <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg text-red-800 text-sm">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#555] mb-1">Email</label>
              <input ref={firstFieldRef} type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:ring-2 focus:ring-[#e85d26] outline-none" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#555] mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-2.5 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:ring-2 focus:ring-[#e85d26] outline-none" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full mt-6 py-3 bg-[#e85d26] text-white font-semibold rounded-lg hover:bg-[#c44a1a] transition-colors disabled:opacity-50">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-4 text-center">
          {!showForgot ? (
            <button type="button" onClick={() => { setShowForgot(true); setResetMsg(''); }}
              className="text-sm text-[#e85d26] font-medium hover:underline">
              Forgot your password?
            </button>
          ) : (
            <div className="text-left bg-[#e8e4dc] border border-[#d8d4cc] rounded-lg p-3">
              <p className="text-sm text-[#555] mb-2">Enter your email above, then send yourself a reset link.</p>
              {resetMsg && <p className="text-sm text-[#2a2a2a] mb-2">{resetMsg}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={handleForgot} disabled={resetLoading}
                  className="flex-1 py-2 bg-[#e85d26] text-white text-sm font-semibold rounded-lg hover:bg-[#c44a1a] transition-colors disabled:opacity-50">
                  {resetLoading ? 'Sending...' : 'Send reset link'}
                </button>
                <button type="button" onClick={() => setShowForgot(false)}
                  className="px-3 py-2 text-sm text-[#666] hover:text-[#2a2a2a]">Cancel</button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-[#d8d4cc] text-center">
          <p className="text-sm text-[#666]">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#e85d26] font-medium hover:underline" onClick={onClose}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
