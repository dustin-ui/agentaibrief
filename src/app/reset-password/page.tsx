'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase sets the session from the URL hash automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });
    // Also check if already in recovery state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#e8e6e1] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[#2a2a2a]">
            Agent<span className="text-[#e85d26]">AI</span>Brief
          </Link>
          <h1 className="text-xl font-semibold text-[#2a2a2a] mt-4">Set New Password</h1>
          <p className="text-[#666] text-sm mt-1">Enter your new password below</p>
        </div>

        {success ? (
          <div className="bg-[#f0ece4]/60 border border-[#e0dcd4] rounded-2xl p-8 text-center">
            <div className="text-3xl mb-3">✅</div>
            <h2 className="text-lg font-semibold text-[#2a2a2a] mb-2">Password Updated</h2>
            <p className="text-[#666] text-sm">Redirecting you to login...</p>
          </div>
        ) : !ready ? (
          <div className="bg-[#f0ece4]/60 border border-[#e0dcd4] rounded-2xl p-8 text-center">
            <p className="text-[#666] text-sm">Loading your reset session...</p>
            <p className="text-[#999] text-xs mt-2">If this takes too long, try clicking the reset link in your email again.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#f0ece4]/60 border border-[#e0dcd4] rounded-2xl p-8 space-y-4">
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">{error}</div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#555] mb-1">New Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                className="w-full px-4 py-2.5 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:ring-2 focus:ring-[#e85d26] focus:border-[#e85d26] outline-none"
                placeholder="At least 8 characters" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#555] mb-1">Confirm Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                className="w-full px-4 py-2.5 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:ring-2 focus:ring-[#e85d26] focus:border-[#e85d26] outline-none"
                placeholder="Re-enter password" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-[#e85d26] text-white font-semibold rounded-lg hover:bg-[#c44a1a] transition-colors disabled:opacity-50">
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link href="/login" className="text-[#e85d26] hover:underline text-sm font-medium">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
