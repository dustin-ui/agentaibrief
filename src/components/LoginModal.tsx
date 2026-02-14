'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#f0ece4] border border-[#d8d4cc] rounded-2xl max-w-md w-full p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#666] hover:text-gray-200">✕</button>

        <h2 className="text-2xl font-bold text-[#2a2a2a] mb-2">Welcome back</h2>
        <p className="text-sm text-[#666] mb-6">
          Log in to access your Agent<span className="text-[#e85d26]">AI</span>Brief subscription.
        </p>

        <form onSubmit={handleSubmit}>
          {error && <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">{error}</div>}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#555] mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-2.5 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:ring-2 focus:ring-[#e85d26] outline-none" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#555] mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-2.5 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:ring-2 focus:ring-[#e85d26] outline-none" placeholder="••••••••" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full mt-6 py-3 bg-[#e85d26] text-[#2a2a2a] font-semibold rounded-lg hover:bg-[#c44a1a] transition-colors disabled:opacity-50">
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

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
