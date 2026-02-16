'use client';

import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const ADMIN_EMAILS = ['dustin@foxhomesteam.com'];

export default function AdminPage() {
  const { session, profile } = useAuth();
  const [ccStatus, setCcStatus] = useState<string>('checking...');
  const [ccAccount, setCcAccount] = useState<string>('');
  const [stats, setStats] = useState<{ totalProfiles: number; activeCC: number; totalSubscribers: number } | null>(null);

  const isAdmin = profile?.email && ADMIN_EMAILS.includes(profile.email);

  useEffect(() => {
    if (!isAdmin) return;

    // Check CC token status
    fetch('/api/admin/cc-status')
      .then(r => r.json())
      .then(d => {
        setCcStatus(d.status || 'unknown');
        setCcAccount(d.account || '');
      })
      .catch(() => setCcStatus('error'));

    // Get stats
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {});
  }, [isAdmin]);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#e8e6e1] flex items-center justify-center">
        <div className="bg-[#f5f0ea] rounded-2xl p-8 border border-[#e0dcd4] text-center">
          <p className="text-[#2a2a2a] font-semibold mb-4">Please log in to access admin</p>
          <Link href="/login" className="text-[#e85d26] font-medium">Go to Login →</Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#e8e6e1] flex items-center justify-center">
        <div className="bg-[#f5f0ea] rounded-2xl p-8 border border-[#e0dcd4] text-center">
          <p className="text-[#2a2a2a] font-semibold">Access denied</p>
          <p className="text-[#888] text-sm mt-2">Admin access is restricted.</p>
        </div>
      </div>
    );
  }

  const ccAuthUrl = `https://authz.constantcontact.com/oauth2/default/v1/authorize?client_id=4012da91-493c-4f46-9093-b01eff0b8f53&redirect_uri=https://agentaibrief.com/api/auth/callback/constantcontact&response_type=code&scope=contact_data+campaign_data+offline_access&state=admin_reauth&prompt=consent`;

  return (
    <div className="min-h-screen bg-[#e8e6e1]">
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1]/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <h1 className="text-2xl font-bold text-[#2a2a2a]">
              Agent<span className="text-[#e85d26]">AI</span>Brief
            </h1>
          </Link>
          <span className="text-sm text-[#888]">Admin Panel</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-[#2a2a2a] mb-8">Admin Dashboard</h2>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[#f5f0ea] rounded-xl p-6 border border-[#e0dcd4] text-center">
              <p className="text-3xl font-bold text-[#2a2a2a]">{stats.totalSubscribers}</p>
              <p className="text-sm text-[#888] mt-1">Total Subscribers</p>
            </div>
            <div className="bg-[#f5f0ea] rounded-xl p-6 border border-[#e0dcd4] text-center">
              <p className="text-3xl font-bold text-[#2a2a2a]">{stats.totalProfiles}</p>
              <p className="text-sm text-[#888] mt-1">Newsletter Profiles</p>
            </div>
            <div className="bg-[#f5f0ea] rounded-xl p-6 border border-[#e0dcd4] text-center">
              <p className="text-3xl font-bold text-[#e85d26]">{stats.activeCC}</p>
              <p className="text-sm text-[#888] mt-1">CC Connected</p>
            </div>
          </div>
        )}

        {/* CC Status */}
        <div className="bg-[#f5f0ea] rounded-2xl p-6 border border-[#e0dcd4] mb-6">
          <h3 className="text-lg font-bold text-[#2a2a2a] mb-4">📧 Constant Contact Admin Token</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[#888] text-sm w-24">Status:</span>
              <span className={`text-sm font-medium ${ccStatus === 'active' ? 'text-green-700' : 'text-red-700'}`}>
                {ccStatus === 'active' ? '✅ Active' : ccStatus === 'wrong_account' ? '⚠️ Wrong Account' : ccStatus === 'expired' ? '❌ Expired' : ccStatus}
              </span>
            </div>
            {ccAccount && (
              <div className="flex items-center gap-3">
                <span className="text-[#888] text-sm w-24">Account:</span>
                <span className="text-sm text-[#2a2a2a]">{ccAccount}</span>
              </div>
            )}
            <div className="pt-3 border-t border-[#e0dcd4]">
              <p className="text-sm text-[#888] mb-3">
                Re-authorize the Fox Homes CC account to restore admin email capabilities.
                Make sure you&apos;re logged into Constant Contact as <strong>dustin@foxhomesteam.com</strong> before clicking.
              </p>
              <a
                href={ccAuthUrl}
                className="inline-block px-6 py-3 bg-[#e85d26] text-white rounded-lg font-semibold hover:bg-[#c44a1a] transition-colors"
              >
                Re-authorize Fox Homes CC Account →
              </a>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#f5f0ea] rounded-2xl p-6 border border-[#e0dcd4]">
          <h3 className="text-lg font-bold text-[#2a2a2a] mb-4">⚡ Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/newsletter-builder/dashboard" className="block px-4 py-3 bg-[#e8e6e1] rounded-lg hover:bg-[#d8d4cc] transition-colors text-[#2a2a2a] text-sm font-medium">
              📊 Newsletter Dashboard
            </Link>
            <Link href="/newsletter-builder" className="block px-4 py-3 bg-[#e8e6e1] rounded-lg hover:bg-[#d8d4cc] transition-colors text-[#2a2a2a] text-sm font-medium">
              ✏️ Newsletter Builder
            </Link>
            <Link href="/pro-dashboard" className="block px-4 py-3 bg-[#e8e6e1] rounded-lg hover:bg-[#d8d4cc] transition-colors text-[#2a2a2a] text-sm font-medium">
              🛠️ Pro Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
