'use client';

import { useState } from 'react';
import { SiteNav } from '@/components/SiteNav';
import { MobileNav } from '@/components/MobileNav';
import { PaywallGate } from '@/components/PaywallGate';
import Link from 'next/link';

/* ── Types ── */
interface TopAction {
  id: number; title: string; why: string; impact: 'high' | 'medium' | 'low';
  timeMinutes: number; preWrittenCopy: string; done: boolean;
}
interface GridPoint {
  row: number; col: number; lat: number; lng: number;
  ranking: number | null; topCompetitors: string[];
}
interface GBPIssue { item: string; status: string; fix: string | null; }
interface Citation { directory: string; status: string; issue?: string; url: string; }
interface Competitor { name: string; count: number; rating: string; }
interface VelocityMonth { month: string; you: number; competitor: number; }
interface AuditData {
  gbpScore: number; gbpIssues: GBPIssue[]; citations: Citation[];
  reviews: { yourCount: number; yourRating: string; competitors: Competitor[];
    monthlyVelocity: VelocityMonth[]; reviewsNeeded: number; };
  generatedAt: string;
}

/* ── Helpers ── */
const impactColor = (i: string) =>
  i === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/40' :
  i === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' :
  'bg-green-500/20 text-green-400 border-green-500/40';

const gridColor = (r: number | null) =>
  r === null ? 'bg-gray-700' : r <= 3 ? 'bg-green-500' : r <= 10 ? 'bg-yellow-500' : 'bg-red-500';

const statusIcon = (s: string) =>
  s === 'ok' || s === 'consistent' ? '✅' :
  s === 'missing' || s === 'empty' ? '❌' : '⚠️';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="px-3 py-1.5 text-xs rounded-lg bg-[#e85d26]/20 text-[#e85d26] hover:bg-[#e85d26]/30 transition-colors font-medium">
      {copied ? '✓ Copied!' : '📋 Copy'}
    </button>
  );
}

/* ── Main Page ── */
export default function SEOCommandPage() {
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [topActions, setTopActions] = useState<TopAction[]>([]);
  const [gridData, setGridData] = useState<GridPoint[]>([]);
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [selectedGrid, setSelectedGrid] = useState<GridPoint | null>(null);
  const [doneActions, setDoneActions] = useState<Set<number>>(new Set());

  // Audit section toggles
  const [showGBP, setShowGBP] = useState(false);
  const [showCitations, setShowCitations] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim() || !city.trim()) return;
    setLoading(true); setError(''); setSelectedGrid(null); setDoneActions(new Set());
    try {
      const res = await fetch('/api/seo-command', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName: businessName.trim(), city: city.trim(), state: state.trim(), keyword: keyword.trim() || undefined }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTopActions(data.topActions || []);
      setGridData(data.gridData || []);
      setAudit(data.audit || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally { setLoading(false); }
  }

  function toggleDone(id: number) {
    setDoneActions(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  const hasResults = topActions.length > 0;

  return (
    <div className="min-h-screen bg-[#e8e6e1] text-[#2a2a2a]">
      {/* Header */}
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/"><h1 className="text-xl font-bold">Agent<span className="text-[#e85d26]">AI</span>Brief</h1></Link>
          <div className="flex items-center gap-4">
            <SiteNav variant="dark" />
            <MobileNav />
          </div>
        </div>
      </header>

      <PaywallGate requiredTier="inner_circle" featureName="Local SEO Command Center">
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Hero */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📡</span>
              <h2 className="text-3xl font-extrabold">Local SEO Command Center</h2>
            </div>
            <p className="text-[#666] text-lg">Stop guessing. Get told exactly what to do <span className="text-orange-400 font-semibold">right now</span> to rank higher in local search.</p>
            <p className="text-[#666] text-sm mt-1">BrightLocal charges $39/mo for just the grid. You get the grid + prescriptive actions + full audit.</p>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="bg-[#f0ece4] rounded-2xl border border-[#e0dcd4] p-6 mb-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-[#888] uppercase tracking-wide mb-1 block">Business Name</label>
                <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Fox Homes" required
                  className="w-full px-4 py-2.5 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder:text-[#888] focus:ring-2 focus:ring-[#e85d26] focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="text-xs text-[#888] uppercase tracking-wide mb-1 block">City</label>
                <input value={city} onChange={e => setCity(e.target.value)} placeholder="Arlington" required
                  className="w-full px-4 py-2.5 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder:text-[#888] focus:ring-2 focus:ring-[#e85d26] focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="text-xs text-[#888] uppercase tracking-wide mb-1 block">State</label>
                <input value={state} onChange={e => setState(e.target.value)} placeholder="VA"
                  className="w-full px-4 py-2.5 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder:text-[#888] focus:ring-2 focus:ring-[#e85d26] focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="text-xs text-[#888] uppercase tracking-wide mb-1 block">Keyword (optional)</label>
                <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="realtor near me"
                  className="w-full px-4 py-2.5 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder:text-[#888] focus:ring-2 focus:ring-[#e85d26] focus:border-transparent outline-none" />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="mt-4 px-8 py-3 bg-[#e85d26] hover:bg-[#c44a1a] disabled:opacity-50 text-white font-bold rounded-xl transition-colors">
              {loading ? '⏳ Analyzing...' : '🚀 Generate My SEO Action Plan'}
            </button>
            {error && <p className="text-red-400 mt-3 text-sm">{error}</p>}
          </form>

          {hasResults && (
            <>
              {/* ═══ SECTION A: Top 3 Actions ═══ */}
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-2xl">🔥</span>
                  <h3 className="text-2xl font-extrabold text-orange-400">Do These 3 Things RIGHT NOW</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {topActions.map(action => {
                    const isDone = doneActions.has(action.id);
                    return (
                      <div key={action.id} className={`relative rounded-2xl border-2 p-6 transition-all ${isDone ? 'border-green-500/40 bg-green-500/5' : 'border-orange-500/30 bg-[#f0ece4]'}`}>
                        {/* Number badge */}
                        <div className="absolute -top-4 -left-2 w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-[#2a2a2a] font-black text-lg shadow-lg shadow-orange-500/30">
                          {action.id}
                        </div>
                        {/* Impact + Time */}
                        <div className="flex items-center gap-2 mb-3 mt-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${impactColor(action.impact)}`}>
                            {action.impact.toUpperCase()} IMPACT
                          </span>
                          <span className="text-[#888] text-xs">⏱️ {action.timeMinutes} min</span>
                        </div>
                        {/* Title */}
                        <h4 className="text-lg font-bold text-[#2a2a2a] mb-2">{action.title}</h4>
                        <p className="text-[#666] text-sm mb-4">{action.why}</p>
                        {/* Pre-written copy */}
                        <div className="bg-[#f0ece4]/50 rounded-lg p-3 mb-4 border border-[#d8d4cc]">
                          <p className="text-xs text-[#888] mb-1 font-medium">📝 Ready-to-use copy:</p>
                          <p className="text-sm text-[#555] whitespace-pre-line leading-relaxed">{action.preWrittenCopy}</p>
                          <div className="mt-2"><CopyButton text={action.preWrittenCopy} /></div>
                        </div>
                        {/* Done button */}
                        <button onClick={() => toggleDone(action.id)}
                          className={`w-full py-2.5 rounded-lg font-bold text-sm transition-all ${isDone ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-orange-500/20 text-orange-400 border border-orange-500/40 hover:bg-orange-500/30'}`}>
                          {isDone ? '✅ Done!' : 'Mark as Done ✓'}
                        </button>
                      </div>
                    );
                  })}
                </div>
                {doneActions.size === 3 && (
                  <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
                    <span className="text-green-400 font-bold text-lg">🎉 All 3 actions complete! You&apos;re ahead of 90% of agents.</span>
                  </div>
                )}
              </section>

              {/* ═══ SECTION B: Local Search Grid ═══ */}
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-2xl">🗺️</span>
                  <h3 className="text-2xl font-extrabold">Your Local Search Grid</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Grid visualization */}
                  <div className="lg:col-span-2 bg-[#f0ece4] rounded-2xl border border-[#e0dcd4] p-6">
                    <p className="text-sm text-[#888] mb-4">Keyword: <span className="text-[#e85d26] font-medium">&quot;{keyword || `${businessName} ${city}`}&quot;</span> · 5mi radius · 7×7 grid</p>
                    <div className="grid grid-cols-7 gap-1.5 max-w-md mx-auto">
                      {gridData.map((point, i) => (
                        <button key={i} onClick={() => setSelectedGrid(point)}
                          className={`w-full aspect-square rounded-lg ${gridColor(point.ranking)} ${selectedGrid === point ? 'ring-2 ring-white' : ''} hover:ring-2 hover:ring-white/50 transition-all flex items-center justify-center text-xs font-bold ${point.ranking && point.ranking <= 3 ? 'text-[#2a2a2a]' : 'text-[#2a2a2a]/90'}`}>
                          {point.ranking ?? '—'}
                        </button>
                      ))}
                    </div>
                    {/* Legend */}
                    <div className="flex items-center gap-4 mt-4 justify-center text-xs text-[#666]">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500 inline-block" /> Top 3</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500 inline-block" /> 4-10</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> 11+</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-700 inline-block" /> Not ranked</span>
                    </div>
                  </div>
                  {/* Grid detail panel */}
                  <div className="bg-[#f0ece4] rounded-2xl border border-[#e0dcd4] p-6">
                    {selectedGrid ? (
                      <>
                        <h4 className="font-bold text-lg mb-2">Position Details</h4>
                        <p className="text-sm text-[#666] mb-1">📍 {selectedGrid.lat.toFixed(4)}, {selectedGrid.lng.toFixed(4)}</p>
                        <p className="text-sm mb-4">Your ranking: <span className={`font-bold ${selectedGrid.ranking && selectedGrid.ranking <= 3 ? 'text-green-400' : selectedGrid.ranking && selectedGrid.ranking <= 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                          #{selectedGrid.ranking ?? 'Not ranked'}
                        </span></p>
                        {selectedGrid.topCompetitors.length > 0 && (
                          <>
                            <p className="text-xs text-[#888] uppercase tracking-wide mb-2">Who ranks above you:</p>
                            {selectedGrid.topCompetitors.map((c, i) => (
                              <div key={i} className="flex items-center gap-2 py-1.5 border-b border-[#e0dcd4] last:border-0">
                                <span className="text-xs font-bold text-[#e85d26] w-5">#{i + 1}</span>
                                <span className="text-sm text-[#555]">{c}</span>
                              </div>
                            ))}
                          </>
                        )}
                        <div className="mt-4 p-3 bg-[#f0ece4]/50 rounded-lg">
                          <p className="text-xs text-[#666]">💡 <strong>Tip:</strong> Improve this position by getting reviews mentioning this neighborhood and adding local content to your GBP.</p>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-[#666] text-sm">
                        Click any grid point to see ranking details
                      </div>
                    )}
                  </div>
                </div>
                {/* Grid summary stats */}
                <div className="grid grid-cols-4 gap-4 mt-4">
                  {[
                    { label: 'Top 3 Positions', value: gridData.filter(p => p.ranking && p.ranking <= 3).length, color: 'text-green-400' },
                    { label: 'Positions 4-10', value: gridData.filter(p => p.ranking && p.ranking > 3 && p.ranking <= 10).length, color: 'text-yellow-400' },
                    { label: 'Positions 11+', value: gridData.filter(p => p.ranking && p.ranking > 10).length, color: 'text-red-400' },
                    { label: 'Not Ranked', value: gridData.filter(p => p.ranking === null).length, color: 'text-[#666]' },
                  ].map(s => (
                    <div key={s.label} className="bg-[#f0ece4] rounded-xl border border-[#e0dcd4] p-4 text-center">
                      <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                      <div className="text-xs text-[#888] mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ═══ SECTION C: Full SEO Audit ═══ */}
              {audit && (
                <section className="mb-12">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-2xl">🔍</span>
                    <h3 className="text-2xl font-extrabold">Full SEO Audit</h3>
                    <span className="text-xs text-[#666] ml-2">Generated {audit.generatedAt}</span>
                  </div>

                  {/* GBP Score */}
                  <div className="bg-[#f0ece4] rounded-2xl border border-[#e0dcd4] p-6 mb-4">
                    <button onClick={() => setShowGBP(!showGBP)} className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-black border-4 ${audit.gbpScore >= 80 ? 'border-green-500 text-green-400' : audit.gbpScore >= 60 ? 'border-yellow-500 text-yellow-400' : 'border-red-500 text-red-400'}`}>
                          {audit.gbpScore}
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-lg">GBP Completeness Score</h4>
                          <p className="text-sm text-[#666]">{audit.gbpIssues.filter(i => i.status !== 'ok').length} issues found</p>
                        </div>
                      </div>
                      <span className="text-[#888] text-xl">{showGBP ? '▲' : '▼'}</span>
                    </button>
                    {showGBP && (
                      <div className="mt-6 space-y-3">
                        {audit.gbpIssues.map((issue, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[#f0ece4]/50">
                            <span className="text-lg">{statusIcon(issue.status)}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{issue.item}</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${issue.status === 'ok' ? 'bg-green-500/20 text-green-400' : issue.status === 'missing' || issue.status === 'empty' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                  {issue.status.replace('_', ' ')}
                                </span>
                              </div>
                              {issue.fix && <p className="text-xs text-[#666] mt-1">{issue.fix}</p>}
                            </div>
                            {issue.fix && <CopyButton text={issue.fix} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Citation Health */}
                  <div className="bg-[#f0ece4] rounded-2xl border border-[#e0dcd4] p-6 mb-4">
                    <button onClick={() => setShowCitations(!showCitations)} className="w-full flex items-center justify-between">
                      <div className="text-left">
                        <h4 className="font-bold text-lg">📇 Citation Health</h4>
                        <p className="text-sm text-[#666]">
                          {audit.citations.filter(c => c.status === 'consistent').length}/{audit.citations.length} directories consistent ·
                          {audit.citations.filter(c => c.status === 'missing').length} missing ·
                          {audit.citations.filter(c => c.status === 'inconsistent').length} inconsistent
                        </p>
                      </div>
                      <span className="text-[#888] text-xl">{showCitations ? '▲' : '▼'}</span>
                    </button>
                    {showCitations && (
                      <div className="mt-6 space-y-2">
                        {audit.citations.map((cit, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#f0ece4]/50">
                            <span className="text-lg">{statusIcon(cit.status)}</span>
                            <div className="flex-1">
                              <span className="font-medium text-sm">{cit.directory}</span>
                              {cit.issue && <span className="text-xs text-red-400 ml-2">— {cit.issue}</span>}
                            </div>
                            <a href={cit.url} target="_blank" rel="noopener noreferrer"
                              className="px-3 py-1.5 text-xs rounded-lg bg-[#e85d26]/20 text-[#e85d26] hover:bg-[#e85d26]/30 transition-colors font-medium">
                              {cit.status === 'missing' ? '➕ Add Listing' : '🔧 Fix This'}
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Review Velocity */}
                  <div className="bg-[#f0ece4] rounded-2xl border border-[#e0dcd4] p-6">
                    <button onClick={() => setShowReviews(!showReviews)} className="w-full flex items-center justify-between">
                      <div className="text-left">
                        <h4 className="font-bold text-lg">⭐ Review Velocity & Comparison</h4>
                        <p className="text-sm text-[#666]">
                          You: {audit.reviews.yourCount} reviews ({audit.reviews.yourRating}★) · Need {audit.reviews.reviewsNeeded} more this month
                        </p>
                      </div>
                      <span className="text-[#888] text-xl">{showReviews ? '▲' : '▼'}</span>
                    </button>
                    {showReviews && (
                      <div className="mt-6">
                        {/* You vs Competitors */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
                          <div className="p-4 rounded-xl bg-[#e85d26]/10 border border-[#e85d26]/30 text-center">
                            <p className="text-xs text-[#888] mb-1">YOU</p>
                            <p className="text-2xl font-black text-[#e85d26]">{audit.reviews.yourCount}</p>
                            <p className="text-sm text-[#666]">{audit.reviews.yourRating}★</p>
                          </div>
                          {audit.reviews.competitors.map((comp, i) => (
                            <div key={i} className="p-4 rounded-xl bg-[#f0ece4]/50 text-center">
                              <p className="text-xs text-[#888] mb-1 truncate">{comp.name}</p>
                              <p className="text-2xl font-black text-[#555]">{comp.count}</p>
                              <p className="text-sm text-[#666]">{comp.rating}★</p>
                            </div>
                          ))}
                        </div>
                        {/* Bar chart - reviews per month */}
                        <h5 className="text-sm font-bold text-[#666] mb-3">Reviews Per Month (You vs Top Competitor)</h5>
                        <div className="space-y-2 mb-6">
                          {audit.reviews.monthlyVelocity.map((m, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <span className="text-xs text-[#888] w-8">{m.month}</span>
                              <div className="flex-1 flex items-center gap-2">
                                <div className="h-5 rounded bg-[#e85d26]" style={{ width: `${(m.you / 12) * 100}%`, minWidth: m.you > 0 ? '12px' : '0' }} />
                                <span className="text-xs text-[#e85d26]">{m.you}</span>
                              </div>
                              <div className="flex-1 flex items-center gap-2">
                                <div className="h-5 rounded bg-gray-600" style={{ width: `${(m.competitor / 12) * 100}%`, minWidth: m.competitor > 0 ? '12px' : '0' }} />
                                <span className="text-xs text-[#666]">{m.competitor}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-[#888] mb-6">
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-[#e85d26] inline-block" /> You</span>
                          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-600 inline-block" /> Top Competitor</span>
                        </div>
                        {/* CTA */}
                        <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                          <p className="text-orange-400 font-bold">📈 You need {audit.reviews.reviewsNeeded} more reviews this month to match {audit.reviews.competitors[0]?.name}</p>
                          <p className="text-sm text-[#666] mt-1">Generate a QR code for your Google review link and add it to your email signature, business cards, and closing packets.</p>
                          <div className="mt-3 flex gap-3">
                            <CopyButton text={`https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID`} />
                            <span className="text-xs text-[#666] self-center">← Replace with your Place ID</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </PaywallGate>
    </div>
  );
}
