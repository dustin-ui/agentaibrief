'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { MobileNav } from '@/components/MobileNav';
import { PaywallGate } from '@/components/PaywallGate';
import Link from 'next/link';

interface SEOReport {
  domain: string;
  reportDate: string;
  authorityScore: number;
  organicTraffic: number;
  trafficChange: number;
  organicKeywords: number;
  keywordsChange: number;
  backlinks: number;
  backlinksChange: number;
  aiVisibilityScore: number;
  aiMentions: number;
  topKeywords: { keyword: string; position: number; traffic: number; volume: number; change: number }[];
  trafficChannels: { direct: number; ai: number; organic: number; referral: number };
  weeklyHistory: { week: string; authorityScore: number; organicTraffic: number; organicKeywords: number }[];
}

function ChangeIndicator({ value, suffix = '' }: { value: number; suffix?: string }) {
  if (value === 0) return <span className="text-[#666] text-sm">—</span>;
  const isPositive = value > 0;
  return (
    <span className={`text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
      {isPositive ? '▲' : '▼'} {Math.abs(value)}{suffix}
    </span>
  );
}

function MetricCard({ label, value, change, changeSuffix = '' }: { label: string; value: string | number; change?: number; changeSuffix?: string }) {
  return (
    <div className="bg-[#f0ece4]/50 border border-[#d8d4cc] rounded-xl p-5">
      <p className="text-[#666] text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-[#2a2a2a]">{typeof value === 'number' ? value.toLocaleString() : value}</p>
      {change !== undefined && <div className="mt-1"><ChangeIndicator value={change} suffix={changeSuffix} /></div>}
    </div>
  );
}

export default function ProDashboard() {
  const { isLoggedIn, isPro, isInnerCircle, user, profile, signOut } = useAuth();
  const [report, setReport] = useState<SEOReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState('foxessellfaster.com');
  const [showSetup, setShowSetup] = useState(false);
  const [setupDomain, setSetupDomain] = useState('');

  useEffect(() => {
    fetchReport(domain);
  }, [domain]);

  async function fetchReport(d: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/seo-report?domain=${encodeURIComponent(d)}`);
      const data = await res.json();
      setReport(data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }

  function handleDomainSetup(e: React.FormEvent) {
    e.preventDefault();
    if (setupDomain) {
      setDomain(setupDomain.replace(/^https?:\/\//, '').replace(/\/+$/, ''));
      setShowSetup(false);
    }
  }

  // Auth gate disabled for demo/preview — will re-enable with proper auth later

  return (
    <div className="min-h-screen bg-[#e8e6e1]">
      {/* Header */}
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/">
              <h1 className="text-xl font-bold text-[#2a2a2a]">Agent<span className="text-[#e85d26]">AI</span>Brief</h1>
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/" className="text-sm text-[#666] hover:text-[#2a2a2a]">Home</Link>
              <Link href="/tools" className="text-sm text-[#666] hover:text-[#2a2a2a]">AI Tools</Link>
              <Link href="/contract-analyzer" className="text-sm text-[#666] hover:text-[#2a2a2a]">Contract Analyzer</Link>
              <span className="text-sm text-[#e85d26] font-medium">SEO Reports</span>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <MobileNav />
            <span className="text-sm text-[#666] hidden sm:inline">{profile?.email}</span>
            <span className="text-xs bg-[#e85d26]/20 text-[#e85d26] px-2 py-1 rounded-full font-medium">
              {profile?.subscription_tier === 'inner_circle' ? 'Inner Circle' : 'Pro'}
            </span>
            <button onClick={signOut} className="text-sm text-[#888] hover:text-[#555]">Log out</button>
          </div>
        </div>
      </header>

      <PaywallGate requiredTier="inner_circle" featureName="Pro SEO Dashboard">
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Title + Domain */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#2a2a2a]">SEO Performance Report</h2>
            <p className="text-[#666] mt-1">
              Weekly insights for <span className="text-[#e85d26] font-medium">{domain}</span>
            </p>
          </div>
          <button
            onClick={() => { setShowSetup(true); setSetupDomain(domain); }}
            className="px-4 py-2 border border-[#d8d4cc] text-[#555] rounded-lg text-sm hover:border-[#e85d26] hover:text-[#e85d26] transition"
          >
            Change Domain
          </button>
        </div>

        {/* Domain Setup Modal */}
        {showSetup && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-[#f0ece4] border border-[#d8d4cc] rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-[#2a2a2a] mb-4">Set Your Domain</h3>
              <form onSubmit={handleDomainSetup}>
                <input
                  type="text"
                  value={setupDomain}
                  onChange={e => setSetupDomain(e.target.value)}
                  placeholder="yourdomain.com"
                  className="w-full px-4 py-3 bg-[#f0ece4] border border-gray-600 rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:outline-none focus:border-[#e85d26] mb-4"
                />
                <div className="flex gap-3">
                  <button type="submit" className="flex-1 px-4 py-2 bg-[#e85d26] text-white font-medium rounded-lg hover:bg-[#c44a1a]">
                    Save & Refresh
                  </button>
                  <button type="button" onClick={() => setShowSetup(false)} className="px-4 py-2 border border-gray-600 text-[#666] rounded-lg hover:text-[#2a2a2a]">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#e85d26] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : report ? (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <MetricCard label="Authority Score" value={report.authorityScore} />
              <MetricCard label="Organic Traffic" value={report.organicTraffic} change={report.trafficChange} changeSuffix="%" />
              <MetricCard label="Keywords" value={report.organicKeywords} change={report.keywordsChange} changeSuffix="%" />
              <MetricCard label="Backlinks" value={report.backlinks} change={report.backlinksChange} changeSuffix="%" />
              <MetricCard label="AI Visibility" value={report.aiVisibilityScore != null ? `${report.aiVisibilityScore}/100` : 'N/A'} />
            </div>

            {/* Two Column: Traffic Channels + AI Visibility */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Traffic Channels */}
              <div className="bg-[#f0ece4]/50 border border-[#d8d4cc] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#2a2a2a] mb-4">Traffic Overview</h3>
                {report.trafficChannels ? (
                  <div className="space-y-3">
                    {[
                      { label: 'Organic Search', value: report.trafficChannels.organic, color: 'bg-emerald-500' },
                      { label: 'Direct', value: report.trafficChannels.direct, color: 'bg-[#e85d26]' },
                      { label: 'AI Search', value: report.trafficChannels.ai, color: 'bg-purple-500' },
                      { label: 'Referral', value: report.trafficChannels.referral, color: 'bg-amber-500' },
                    ].map(ch => (
                      <div key={ch.label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[#555]">{ch.label}</span>
                          <span className="text-[#2a2a2a] font-medium">{ch.value}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div className={`${ch.color} rounded-full h-2`} style={{ width: `${ch.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#555]">SemRush Rank</span>
                      <span className="text-[#2a2a2a] font-medium">#{(report as any).semrushRank?.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#555]">Traffic Value</span>
                      <span className="text-[#2a2a2a] font-medium">${(report as any).trafficCost?.toLocaleString() || '0'}/mo</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#555]">Referring Domains</span>
                      <span className="text-[#2a2a2a] font-medium">{(report as any).referringDomains?.toLocaleString() || 'N/A'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Visibility */}
              <div className="bg-[#f0ece4]/50 border border-[#d8d4cc] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#2a2a2a] mb-4">AI Search Visibility</h3>
                {report.aiVisibilityScore != null ? (
                  <>
                    <div className="flex items-center gap-6 mb-4">
                      <div className="relative w-28 h-28">
                        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#374151" strokeWidth="8" />
                          <circle
                            cx="50" cy="50" r="42" fill="none" stroke="#e85d26" strokeWidth="8"
                            strokeDasharray={`${report.aiVisibilityScore * 2.64} 264`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-[#2a2a2a]">{report.aiVisibilityScore}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-[#666] text-sm">AI Mentions This Week</p>
                        <p className="text-3xl font-bold text-[#2a2a2a]">{report.aiMentions}</p>
                        <p className="text-[#e85d26] text-sm mt-1">ChatGPT, Gemini, Perplexity</p>
                      </div>
                    </div>
                    <p className="text-[#666] text-sm">
                      Your domain appears in <span className="text-[#2a2a2a] font-medium">{report.aiVisibilityScore}%</span> of relevant AI-generated responses about real estate in your market.
                    </p>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-[#666] text-sm">AI Visibility tracking requires the SemRush AI Visibility toolkit.</p>
                    <p className="text-[#888] text-xs mt-2">Coming soon to Pro reports</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Keywords */}
            <div className="bg-[#f0ece4]/50 border border-[#d8d4cc] rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-[#2a2a2a] mb-4">Top 10 Keywords</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-[#666] text-sm border-b border-[#d8d4cc]">
                      <th className="text-left py-2 pr-4">Keyword</th>
                      <th className="text-right py-2 px-3">Position</th>
                      <th className="text-right py-2 px-3">Traffic</th>
                      <th className="text-right py-2 px-3">Volume</th>
                      <th className="text-right py-2 pl-3">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.topKeywords.map((kw, i) => (
                      <tr key={i} className="border-b border-[#e0dcd4] hover:bg-[#f0ece4]/30">
                        <td className="py-3 pr-4 text-[#2a2a2a] text-sm">{kw.keyword}</td>
                        <td className="py-3 px-3 text-right">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            kw.position <= 3 ? 'bg-emerald-500/20 text-emerald-400' :
                            kw.position <= 10 ? 'bg-amber-500/20 text-amber-400' :
                            'bg-gray-600/30 text-[#666]'
                          }`}>
                            #{kw.position}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-[#555] text-sm">{kw.traffic.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-[#666] text-sm">{kw.volume.toLocaleString()}</td>
                        <td className="py-3 pl-3 text-right"><ChangeIndicator value={kw.change} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actionable Priorities */}
            {(report as any).priorities && (report as any).priorities.length > 0 && (
              <div className="bg-[#f0ece4]/50 border border-[#d8d4cc] rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-[#2a2a2a] mb-4">🎯 Your Top 3 Priorities This Week</h3>
                <div className="space-y-4">
                  {(report as any).priorities.map((p: any, i: number) => (
                    <div key={i} className="flex gap-4 p-4 bg-[#f0ece4]/50 border border-[#d8d4cc]/50 rounded-lg">
                      <div className="text-2xl flex-shrink-0 mt-0.5">{p.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-[#2a2a2a] font-medium">{p.title}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            p.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                            p.impact === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-gray-600/30 text-[#666]'
                          }`}>
                            {p.impact} impact
                          </span>
                        </div>
                        <p className="text-[#666] text-sm leading-relaxed">{p.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly History */}
            {report.weeklyHistory && report.weeklyHistory.length > 0 && (
              <div className="bg-[#f0ece4]/50 border border-[#d8d4cc] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#2a2a2a] mb-4">Weekly Trend</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-[#666] text-sm border-b border-[#d8d4cc]">
                        <th className="text-left py-2">Week</th>
                        <th className="text-right py-2">Authority</th>
                        <th className="text-right py-2">Traffic</th>
                        <th className="text-right py-2">Keywords</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.weeklyHistory.map((w, i) => (
                        <tr key={i} className="border-b border-[#e0dcd4]">
                          <td className="py-2 text-[#555] text-sm">{w.week}</td>
                          <td className="py-2 text-right text-[#2a2a2a] text-sm">{w.authorityScore}</td>
                          <td className="py-2 text-right text-[#2a2a2a] text-sm">{w.organicTraffic.toLocaleString()}</td>
                          <td className="py-2 text-right text-[#2a2a2a] text-sm">{w.organicKeywords.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-[#666] text-center py-20">Failed to load report data.</p>
        )}
      </main>
      </PaywallGate>
    </div>
  );
}
