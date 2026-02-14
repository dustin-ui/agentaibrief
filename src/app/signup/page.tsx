'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await signUp(email, password, fullName);
    setLoading(false);
    if (err) {
      setError(err);
    } else {
      setSuccess(true);
      // Notify Dustin (fire-and-forget)
      fetch('/api/notify-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: fullName }),
      }).catch(() => {});
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#e8e6e1] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center bg-[#f0ece4]/60 border border-[#e0dcd4] rounded-2xl p-8">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-[#2a2a2a] mb-2">Check your email</h2>
          <p className="text-[#666] mb-6">We sent a confirmation link to <strong className="text-[#2a2a2a]">{email}</strong>. Click it to activate your account.</p>
          <Link href="/login" className="text-[#e85d26] hover:underline font-medium">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e8e6e1] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-[#2a2a2a]">
            Agent<span className="text-[#e85d26]">AI</span>Brief
          </Link>
          <h1 className="text-xl font-semibold text-[#2a2a2a] mt-4">Create your account</h1>
          <p className="text-[#666] text-sm mt-1">Start with a free account, upgrade anytime</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#f0ece4]/60 border border-[#e0dcd4] rounded-2xl p-8 space-y-4">
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-[#555] mb-1">Full Name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
              className="w-full px-4 py-2.5 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:ring-2 focus:ring-[#e85d26] focus:border-[#e85d26] outline-none" placeholder="Jane Smith" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#555] mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-2.5 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:ring-2 focus:ring-[#e85d26] focus:border-[#e85d26] outline-none" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#555] mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              className="w-full px-4 py-2.5 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:ring-2 focus:ring-[#e85d26] focus:border-[#e85d26] outline-none" placeholder="Min 6 characters" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-[#e85d26] text-[#2a2a2a] font-semibold rounded-lg hover:bg-[#c44a1a] transition-colors disabled:opacity-50">
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-6 text-[#666] text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-[#e85d26] hover:underline font-medium">Log in</Link>
        </p>
      </div>
    </div>
  );
}
