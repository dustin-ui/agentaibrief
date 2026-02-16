'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PaywallGate } from '@/components/PaywallGate';

interface MarketData {
  areaName: string;
  zipCode: string;
  generatedAt: string;
  summary: string;
  stats: {
    medianPrice: string;
    priceChange: string;
    avgDaysOnMarket: string;
    domChange: string;
    activeListings: string;
    inventoryChange: string;
    soldLastMonth: string;
    listToSaleRatio: string;
    monthsOfSupply: string;
    marketType: string;
  };
  trends: string[];
  agentTalkingPoints: string[];
  buyerAdvice: string;
  sellerAdvice: string;
  socialPost: string;
}

function StatCard({ label, value, change, positive }: { label: string; value: string; change?: string; positive?: boolean }) {
  return (
    <div className="bg-[#e8e6e1] border border-[#e0dcd4] rounded-xl p-5">
      <div className="text-xs font-medium text-[#888] uppercase tracking-wide mb-1">{label}</div>
      <div className="text-2xl font-bold text-[#2a2a2a]">{value}</div>
      {change && (
        <div className={`text-sm font-medium mt-1 ${positive ? 'text-emerald-600' : positive === false ? 'text-red-600' : 'text-[#888]'}`}>
          {change}
        </div>
      )}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="px-3 py-1.5 text-xs font-medium rounded-md bg-[#f5f0ea] hover:bg-gray-200 text-[#555] transition-colors">
      {copied ? '✓ Copied' : '📋 Copy'}
    </button>
  );
}

export default function MarketSnapshotPage() {
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<MarketData | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!zipCode || zipCode.length !== 5) {
      setError('Please enter a valid 5-digit zip code');
      return;
    }
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await fetch('/api/market-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zipCode }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const result = await res.json();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#e8e6e1]">
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-[#2a2a2a]">Agent<span className="text-[#e85d26]">AI</span>Brief</h1>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-sm text-[#666] hover:text-[#2a2a2a]">News</Link>
            <Link href="/tools" className="text-sm text-[#666] hover:text-[#2a2a2a]">AI Tools</Link>
            <Link href="/listing-generator" className="text-sm text-[#666] hover:text-[#2a2a2a]">Listing Generator</Link>
            <Link href="/drip-campaign" className="text-sm text-[#666] hover:text-[#2a2a2a]">Drip Campaigns</Link>
            <Link href="/market-snapshot" className="text-sm text-[#2a2a2a] font-medium border-b-2 border-[#e85d26] pb-0.5">Market Snapshot</Link>
            <Link href="/open-house-followup" className="text-sm text-[#666] hover:text-[#2a2a2a]">Open House Follow-Up</Link>
          </nav>
        </div>
      </header>

      <PaywallGate requiredTier="pro" featureName="Market Snapshot Generator">
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium mb-4">
              📊 Pro Tool
            </div>
            <h2 className="text-4xl font-extrabold text-[#2a2a2a] mb-3">Market Snapshot Generator</h2>
            <p className="text-lg text-[#666]">Enter a zip code and get an instant local market report with stats, trends, talking points, and a ready-to-post social media caption.</p>
          </div>

          <div className="bg-[#f0ece4] rounded-2xl p-8 mb-10 border border-[#e0dcd4]">
            <label className="block text-sm font-semibold text-[#555] mb-2">Zip Code</label>
            <div className="flex gap-4">
              <input
                type="text"
                value={zipCode}
                onChange={e => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                placeholder="20170"
                maxLength={5}
                className="flex-1 max-w-xs px-4 py-3 border border-gray-300 rounded-lg text-lg font-mono focus:ring-2 focus:ring-[#e85d26] outline-none"
                onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              />
              <button onClick={handleGenerate} disabled={loading} className="px-8 py-3 bg-[#e85d26] text-white font-bold rounded-xl hover:bg-[#c44a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? '⏳ Generating...' : '📊 Generate Snapshot'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}

          {data && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-[#2a2a2a]">📍 {data.areaName} ({data.zipCode})</h3>
                  <span className="text-xs text-[#666]">AI-generated snapshot</span>
                </div>
                <p className="text-[#555] leading-relaxed">{data.summary}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard label="Median Price" value={data.stats.medianPrice} change={data.stats.priceChange} positive={data.stats.priceChange?.includes('+')} />
                <StatCard label="Avg Days on Market" value={data.stats.avgDaysOnMarket} change={data.stats.domChange} positive={data.stats.domChange?.includes('-')} />
                <StatCard label="Active Listings" value={data.stats.activeListings} change={data.stats.inventoryChange} />
                <StatCard label="Sold Last Month" value={data.stats.soldLastMonth} />
                <StatCard label="List-to-Sale Ratio" value={data.stats.listToSaleRatio} />
                <StatCard label="Months of Supply" value={data.stats.monthsOfSupply} change={data.stats.marketType} />
              </div>

              <div className="bg-[#f5f0ea] border border-[#d8d4cc] rounded-2xl p-6">
                <h4 className="font-bold text-[#2a2a2a] mb-3">🔥 Key Trends</h4>
                <ul className="space-y-2">
                  {data.trends.map((t, i) => (
                    <li key={i} className="text-sm text-[#2a2a2a] flex items-start gap-2">
                      <span className="mt-0.5">•</span><span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-amber-900">🎯 Agent Talking Points</h4>
                  <CopyButton text={data.agentTalkingPoints.join('\n\n')} />
                </div>
                <ul className="space-y-2">
                  {data.agentTalkingPoints.map((p, i) => (
                    <li key={i} className="text-sm text-amber-800 flex items-start gap-2">
                      <span className="font-bold">{i + 1}.</span><span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                  <h4 className="font-bold text-emerald-900 mb-2">🏠 Buyer Advice</h4>
                  <p className="text-sm text-emerald-800 leading-relaxed">{data.buyerAdvice}</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6">
                  <h4 className="font-bold text-purple-900 mb-2">💰 Seller Advice</h4>
                  <p className="text-sm text-purple-800 leading-relaxed">{data.sellerAdvice}</p>
                </div>
              </div>

              <div className="bg-[#f0ece4] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-[#2a2a2a]">📱 Ready-to-Post Social Caption</h4>
                  <CopyButton text={data.socialPost} />
                </div>
                <p className="text-sm text-[#555] whitespace-pre-wrap leading-relaxed">{data.socialPost}</p>
              </div>
            </div>
          )}
        </main>
      </PaywallGate>
    </div>
  );
}
