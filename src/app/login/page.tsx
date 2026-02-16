'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

function LoginForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const redirect = searchParams.get('redirect') || '/';

  const handleReset = async () => {
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    setResetMsg('');
    const { error: err } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: 'https://agentaibrief.com/reset-password',
    });
    setResetLoading(false);
    setResetMsg(err ? err.message : 'Check your email for the reset link!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      router.push(redirect);
    }
  };

  return (
    <div className="min-h-screen bg-[#e8e6e1] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[#2a2a2a]">
            Agent<span className="text-[#e85d26]">AI</span>Brief
          </Link>
          <h1 className="text-xl font-semibold text-[#2a2a2a] mt-4">Welcome back</h1>
          <p className="text-[#666] text-sm mt-1">Log in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#f0ece4]/60 border border-[#e0dcd4] rounded-2xl p-8 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-red-800 text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#555] mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-2.5 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:ring-2 focus:ring-[#e85d26] focus:border-[#e85d26] outline-none" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#555] mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-4 py-2.5 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:ring-2 focus:ring-[#e85d26] focus:border-[#e85d26] outline-none" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-[#e85d26] text-white font-semibold rounded-lg hover:bg-[#c44a1a] transition-colors disabled:opacity-50">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="text-center mt-6 space-y-2">
          <p className="text-[#666] text-sm">
            <button type="button" onClick={() => setShowForgot(true)} className="text-[#e85d26] hover:underline font-medium">
              Forgot your password?
            </button>
          </p>
          <p className="text-[#666] text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#e85d26] hover:underline font-medium">Sign up</Link>
          </p>
        </div>

        {showForgot && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4" onClick={() => setShowForgot(false)}>
            <div className="bg-[#f0ece4] border border-[#e0dcd4] rounded-2xl p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-semibold text-[#2a2a2a] mb-2">Reset Password</h2>
              <p className="text-[#666] text-sm mb-4">Enter your email and we&apos;ll send a reset link.</p>
              <input type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:ring-2 focus:ring-[#e85d26] outline-none mb-3" />
              {resetMsg && <p className={`text-sm mb-3 ${resetMsg.includes('Check') ? 'text-green-400' : 'text-red-400'}`}>{resetMsg}</p>}
              <button onClick={handleReset} disabled={resetLoading}
                className="w-full py-2.5 bg-[#e85d26] text-white font-semibold rounded-lg hover:bg-[#c44a1a] transition disabled:opacity-50">
                {resetLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#e8e6e1]" />}>
      <LoginForm />
    </Suspense>
  );
}
