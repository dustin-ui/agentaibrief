'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { PaywallGate } from '@/components/PaywallGate';
import { SiteNav } from '@/components/SiteNav';

interface Signal {
  type: string;
  emoji: string;
  description: string;
  date: string;
  source: string;
}

interface PropertyResult {
  address: string;
  city: string;
  state: string;
  zip: string;
  signals: Signal[];
  signalStrength: number;
  estimatedEquity: number;
  mortgageRate: number;
  ownerName: string;
  yearsOwned: number;
  suggestedAction: string;
  suggestedScript: string;
  daysSinceSignal: number;
}

interface RadarResponse {
  location: string;
  radius: number;
  resultCount: number;
  dataSource: 'ai-enhanced' | 'live';
  dataSources: { connected: string[]; comingSoon: string[] };
  results: PropertyResult[];
}

const SIGNAL_META: Record<string, { emoji: string; label: string; color: string }> = {
  'building-permit': { emoji: '🔨', label: 'Building Permit', color: '#f59e0b' },
  'probate': { emoji: '⚖️', label: 'Probate/Estate', color: '#8b5cf6' },
  'divorce': { emoji: '💔', label: 'Divorce Filing', color: '#ec4899' },
  'pre-foreclosure': { emoji: '⚠️', label: 'Pre-Foreclosure', color: '#ef4444' },
  'expired-listing': { emoji: '📋', label: 'Expired Listing', color: '#6b7280' },
  'vacancy': { emoji: '🏚️', label: 'Vacancy', color: '#78716c' },
  'high-equity': { emoji: '💰', label: 'High Equity', color: '#22c55e' },
  'fsbo': { emoji: '📦', label: 'FSBO', color: '#3b82f6' },
  'investor-flip': { emoji: '🏗️', label: 'Investor Flip', color: '#f97316' },
  'tax-delinquent': { emoji: '📉', label: 'Tax Delinquent', color: '#dc2626' },
};

function SignalBadge({ type }: { type: string }) {
  const meta = SIGNAL_META[type];
  if (!meta) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-[#2a2a2a]"
      style={{ backgroundColor: meta.color + '33', border: `1px solid ${meta.color}`, color: meta.color }}
    >
      {meta.emoji} {meta.label}
    </span>
  );
}

function StrengthDots({ strength }: { strength: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full ${
            i <= strength
              ? strength >= 4
                ? 'bg-red-500'
                : strength >= 3
                ? 'bg-yellow-500'
                : 'bg-green-500'
              : 'bg-gray-700'
          }`}
        />
      ))}
    </div>
  );
}

function PropertyCard({ property }: { property: PropertyResult }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[#f0ece4]/80 border border-[#e0dcd4] rounded-xl p-5 hover:border-[#e85d26]/50 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-[#2a2a2a] font-semibold text-lg truncate">{property.address}</h3>
            <StrengthDots strength={property.signalStrength} />
          </div>
          <p className="text-[#666] text-sm mb-3">
            {property.city}, {property.state} {property.zip} · Owner: {property.ownerName} · {property.yearsOwned}yr ownership
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {property.signals.map((s, i) => (
              <SignalBadge key={i} type={s.type} />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <span className="text-[#888]">Est. Equity</span>
              <p className="text-green-400 font-semibold">${property.estimatedEquity.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-[#888]">Mortgage Rate</span>
              <p className="text-[#2a2a2a] font-semibold">{property.mortgageRate}%</p>
            </div>
            <div>
              <span className="text-[#888]">Days Since Signal</span>
              <p className="text-yellow-400 font-semibold">{property.daysSinceSignal}d</p>
            </div>
            <div>
              <span className="text-[#888]">Action</span>
              <p className="text-[#e85d26] font-medium text-xs">{property.suggestedAction}</p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-sm text-[#e85d26] hover:text-[#4ec5de] transition-colors flex items-center gap-1"
      >
        {expanded ? '▾ Hide Details' : '▸ Show Details & Script'}
      </button>

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-[#e0dcd4] pt-4">
          <div>
            <h4 className="text-sm font-semibold text-[#555] mb-2">Signal Details</h4>
            {property.signals.map((s, i) => (
              <div key={i} className="mb-2 text-sm">
                <span className="text-[#2a2a2a]">{s.emoji} {SIGNAL_META[s.type]?.label}:</span>{' '}
                <span className="text-[#666]">{s.description}</span>
                <span className="text-[#666] ml-2">({s.date} · {s.source})</span>
              </div>
            ))}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[#555] mb-2">📞 Suggested Script</h4>
            <div className="bg-[#e8e6e1] border border-[#e0dcd4] rounded-lg p-4 text-sm text-[#555] italic leading-relaxed">
              {property.suggestedScript}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function exportToCSV(results: PropertyResult[], location: string) {
  const headers = ['Address', 'City', 'State', 'Zip', 'Owner', 'Years Owned', 'Signals', 'Signal Strength', 'Est. Equity', 'Mortgage Rate', 'Days Since Signal', 'Suggested Action'];
  const rows = results.map((r) => [
    r.address,
    r.city,
    r.state,
    r.zip,
    r.ownerName,
    r.yearsOwned,
    r.signals.map((s) => SIGNAL_META[s.type]?.label).join('; '),
    r.signalStrength,
    r.estimatedEquity,
    r.mortgageRate,
    r.daysSinceSignal,
    r.suggestedAction,
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `listing-radar-${location.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ListingRadarPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RadarResponse | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(Object.keys(SIGNAL_META)));
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');

  const search = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/listing-radar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: query, radius: 5 }),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  const filteredResults = data?.results.filter((r) =>
    r.signals.some((s) => activeFilters.has(s.type))
  ) || [];

  const toggleFilter = (key: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#e8e6e1]">
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-[#2a2a2a]">Agent<span className="text-[#e85d26]">AI</span>Brief</h1>
          </Link>
          <SiteNav variant="dark" />
        </div>
      </header>

      <PaywallGate requiredTier="pro" featureName="Listing Launch Radar">
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Hero */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📡</span>
              <h2 className="text-3xl font-extrabold text-[#2a2a2a]">Listing Launch Radar</h2>
              <span className="bg-red-500/20 text-red-400 text-xs font-bold px-2 py-0.5 rounded-full border border-red-500/30">BETA</span>
            </div>
            <p className="text-[#666] text-lg max-w-2xl">
              Detect pre-listing signals before anyone else. Find homeowners likely to sell using public records, court filings, permit data, and predictive analytics.
            </p>
          </div>

          {/* Search */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
                placeholder="Enter zip code, city, or neighborhood (e.g. 22201, Arlington VA)"
                className="w-full bg-[#f0ece4] border border-[#d8d4cc] rounded-xl px-5 py-3.5 text-[#2a2a2a] placeholder-gray-500 focus:outline-none focus:border-[#e85d26] focus:ring-1 focus:ring-[#e85d26] text-lg"
              />
            </div>
            <button
              onClick={search}
              disabled={loading || !query.trim()}
              className="bg-[#e85d26] hover:bg-[#c44a1a] disabled:opacity-50 text-[#2a2a2a] font-semibold px-8 py-3.5 rounded-xl transition-colors text-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                  Scanning...
                </span>
              ) : (
                '🔍 Scan'
              )}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
          )}

          {/* Results area */}
          {data && (
            <>
            {/* Filter sidebar - mobile toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-sm text-[#e85d26] hover:text-[#4ec5de]"
              >
                {showFilters ? '✕ Hide Filters' : '☰ Signal Filters'}
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Filter sidebar */}
              <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 flex-shrink-0`}>
                <div className="bg-[#f0ece4]/80 border border-[#e0dcd4] rounded-xl p-4 sticky top-24">
                  <h3 className="text-[#2a2a2a] font-semibold mb-3 text-sm uppercase tracking-wide">Signal Filters</h3>
                  <div className="space-y-2">
                    {Object.entries(SIGNAL_META).map(([key, meta]) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={activeFilters.has(key)}
                          onChange={() => toggleFilter(key)}
                          className="rounded border-gray-600 bg-[#f0ece4] text-[#e85d26] focus:ring-[#e85d26]"
                        />
                        <span className="text-sm text-[#666] group-hover:text-gray-200 transition-colors">
                          {meta.emoji} {meta.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#e0dcd4] space-y-2">
                    <button
                      onClick={() => setActiveFilters(new Set(Object.keys(SIGNAL_META)))}
                      className="text-xs text-[#888] hover:text-[#555]"
                    >
                      Select All
                    </button>
                    <span className="text-[#555] mx-2">·</span>
                    <button
                      onClick={() => setActiveFilters(new Set())}
                      className="text-xs text-[#888] hover:text-[#555]"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </aside>

              {/* Results */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[#666] text-sm">
                    <span className="text-[#2a2a2a] font-semibold">{filteredResults.length}</span> properties with sell signals in{' '}
                    <span className="text-[#e85d26]">{data.location}</span>
                    <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30">
                      {data.dataSource === 'ai-enhanced' ? 'AI-Enhanced Preview' : 'Live Data'}
                    </span>
                  </div>
                  {filteredResults.length > 0 && (
                    <button
                      onClick={() => exportToCSV(filteredResults, data.location)}
                      className="text-sm bg-[#f0ece4] hover:bg-gray-700 text-[#555] px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      📥 Export CSV
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {filteredResults.map((property, i) => (
                    <PropertyCard key={i} property={property} />
                  ))}
                </div>

                {filteredResults.length === 0 && (
                  <div className="text-center py-16 text-[#888]">
                    No properties match your current filters. Try adjusting your signal filters.
                  </div>
                )}
              </div>
            </div>
            </>
          )}

          {/* Empty state */}
          {!data && !loading && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📡</div>
              <h3 className="text-xl text-[#555] font-semibold mb-2">Enter a location to scan for sell signals</h3>
              <p className="text-[#888] max-w-md mx-auto">
                We analyze public records, court filings, permit data, MLS history, and more to identify homeowners most likely to sell.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                {['22201', 'Arlington VA', 'Bethesda MD', '20001', 'Fairfax VA'].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => { setQuery(ex); }}
                    className="text-sm bg-[#f0ece4] border border-[#e0dcd4] text-[#666] px-3 py-1.5 rounded-lg hover:border-[#e85d26]/50 hover:text-gray-200 transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Data Sources Footer */}
          <div className="mt-12 border-t border-[#e0dcd4] pt-8 pb-4">
            <h3 className="text-sm font-semibold text-[#888] uppercase tracking-wide mb-4">Data Sources</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs text-green-500 font-semibold mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full" /> Connected
                </h4>
                <ul className="space-y-1">
                  {(data?.dataSources?.connected || ['AI-Enhanced Demo Data']).map((s) => (
                    <li key={s} className="text-sm text-[#666]">{s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs text-yellow-500 font-semibold mb-2 flex items-center gap-1">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full" /> Coming Soon
                </h4>
                <ul className="space-y-1">
                  {(data?.dataSources?.comingSoon || ['ATTOM Data API', 'County Records API', 'MLS IDX Feed', 'USPS Vacancy Data', 'Court Records API']).map((s) => (
                    <li key={s} className="text-sm text-[#888]">{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </PaywallGate>
    </div>
  );
}
