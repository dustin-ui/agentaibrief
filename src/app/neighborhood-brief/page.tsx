'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

// Sample demo data for Arlington VA
const SAMPLE_BRIEF = {
  neighborhood: 'Arlington',
  address: '1234 Oak Street, Arlington, VA 22201',
  generatedDate: new Date().toISOString(),
  marketSnapshot: {
    medianHomePrice: '$735,000',
    avgDaysOnMarket: 14,
    priceTrend: 'up' as const,
    priceTrendDetail: 'Arlington home prices have increased 4.2% year-over-year, driven by continued demand from federal workers, tech professionals, and proximity to Amazon HQ2.',
    inventoryLevel: 'low' as const,
    inventoryDetail: 'Active listings are 18% below the 5-year average. New construction in Rosslyn and Ballston corridors has not kept pace with demand.',
    marketType: "seller's" as const,
    marketTypeDetail: 'Multiple offer situations remain common, especially for updated homes under $800K. Average sale-to-list price ratio is 101.3%.',
  },
  searchDemand: {
    primarySearchVolume: 2900,
    primaryKeyword: 'Arlington VA homes for sale',
    searchTrend: 'growing' as const,
    searchTrendDetail: 'Search demand has increased 12% over the past 6 months, correlating with Amazon HQ2 hiring waves and return-to-office mandates.',
    relatedSearches: [
      { keyword: 'Arlington VA real estate', volume: 3600, cpc: 4.82 },
      { keyword: 'homes for sale in Arlington VA', volume: 2400, cpc: 3.95 },
      { keyword: 'Arlington VA condos for sale', volume: 1300, cpc: 3.20 },
      { keyword: 'Arlington VA townhomes', volume: 880, cpc: 2.75 },
      { keyword: 'Clarendon Arlington homes', volume: 590, cpc: 4.10 },
    ],
    buyerSearchInsight: 'Buyers searching for Arlington are particularly interested in walkability, Metro access, and proximity to Amazon HQ2. "Arlington VA walkable neighborhoods" and "Arlington VA near Metro" are rising search terms. There\'s also growing interest in "Arlington VA homes with ADU" as accessory dwelling unit policies expand.',
  },
  neighborhoodHighlights: {
    schoolRatings: 'Arlington Public Schools consistently rank among the top districts in Virginia. Notable schools include Arlington Traditional School (10/10 GreatSchools), Yorktown High School (8/10), and Washington-Liberty High School (8/10). The district is known for its immersive language programs and strong STEM curriculum.',
    commuteTimes: [
      { destination: 'Washington, DC (Downtown)', time: '15 min', method: 'Metro' },
      { destination: 'Pentagon', time: '8 min', method: 'drive' },
      { destination: 'Tysons Corner', time: '20 min', method: 'drive' },
      { destination: 'Amazon HQ2', time: '10 min', method: 'Metro' },
    ],
    amenities: 'Arlington offers an exceptional quality of life with over 100 parks, 60+ miles of trails, and vibrant commercial corridors. The Clarendon-Ballston corridor features dozens of restaurants, craft breweries, and boutique shopping. Mosaic District and Pentagon City Mall provide major retail options. The W&OD Trail and Four Mile Run Trail are popular for cycling and running.',
    recentDevelopments: 'Amazon HQ2 Phase 2 construction continues in Pentagon City with 2.8M sq ft of office space. The Clarendon Sector Plan update is introducing new mixed-use development. Metro\'s Silver Line expansion has increased connectivity. Several luxury condo projects are breaking ground along the Rosslyn-Ballston corridor.',
  },
  competitiveAnalysis: {
    agentActivity: 'Arlington is one of the most competitive real estate markets in the DC metro area with over 2,500 active agents. Top teams include The Belt Team (Keller Williams), The Royster Hearth Group (Compass), and several Redfin and Compass mega-teams. Digital marketing competition is fierce, with top agents spending $3,000-$8,000/month on paid search.',
    contentGaps: [
      'Detailed neighborhood comparison guides (Clarendon vs. Ballston vs. Lyon Village)',
      'Amazon HQ2 impact analysis on specific micro-neighborhoods',
      'ADU/renovation ROI analysis specific to Arlington zoning',
      'First-time buyer guides for Arlington\'s competitive market',
    ],
    competitiveInsight: 'Despite heavy competition, there\'s a significant content gap around hyper-local micro-neighborhood analysis. Most agents market "Arlington" broadly. An agent who creates detailed content about specific blocks, condo buildings, and micro-neighborhoods will capture high-intent organic traffic.',
  },
  aiRecommendations: {
    suggestedPriceRange: '$710,000 - $760,000',
    bestTimeToList: 'Late March to mid-April — inventory is still low from winter, but buyer demand surges with spring. Avoid listing the week of July 4th or during federal government shutdowns.',
    keySellingPoints: [
      'Walking distance to Ballston Metro station (Orange/Silver lines)',
      'Updated kitchen and bathrooms command 8-12% premium in this neighborhood',
      'Arlington\'s top-rated school district — always mention specific school assignments',
      'Under 15-minute commute to Amazon HQ2, Pentagon, and downtown DC',
    ],
    potentialChallenges: [
      'High property tax rate (Arlington has one of the highest in VA at $1.013/$100)',
      'Parking limitations in urban corridors may deter some buyers',
      'Competition from new construction condos at lower price points',
    ],
  },
};

type Brief = typeof SAMPLE_BRIEF;

const trendIcon = (trend: string) => {
  if (trend === 'up' || trend === 'growing') return '📈';
  if (trend === 'down' || trend === 'declining') return '📉';
  return '➡️';
};

const inventoryColor = (level: string) => {
  if (level === 'low') return 'text-red-400';
  if (level === 'high') return 'text-green-400';
  return 'text-yellow-400';
};

export default function NeighborhoodBriefPage() {
  const [address, setAddress] = useState('');
  const [brief, setBrief] = useState<Brief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [showDemo, setShowDemo] = useState(false);
  const briefRef = useRef<HTMLDivElement>(null);

  const generateBrief = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setError('');
    setProgress(0);
    setBrief(null);

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(p => Math.min(p + Math.random() * 15, 90));
    }, 500);

    try {
      const res = await fetch('/api/neighborhood-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate brief');
      setProgress(100);
      setTimeout(() => {
        setBrief(data.brief);
        setLoading(false);
      }, 300);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setLoading(false);
    } finally {
      clearInterval(interval);
    }
  };

  const showSample = () => {
    setShowDemo(true);
    setBrief(SAMPLE_BRIEF);
    setAddress('1234 Oak Street, Arlington, VA 22201');
  };

  const exportPDF = () => {
    if (!briefRef.current) return;
    window.print();
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}/neighborhood-brief?address=${encodeURIComponent(address)}`;
    navigator.clipboard.writeText(url);
    alert('Share link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            <span className="text-[#37b0c9]">Agent</span>AIBrief
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-gray-400">
            <Link href="/" className="hover:text-white">News</Link>
            <Link href="/blog" className="hover:text-white">Blog</Link>
            <Link href="/tools" className="hover:text-white">AI Tools</Link>
            <Link href="/neighborhood-brief" className="text-white font-medium border-b-2 border-[#37b0c9] pb-0.5">Market Brief</Link>
            <Link href="/subscribe" className="hover:text-white">Subscribe</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            🏘️ Neighborhood Intelligence Brief
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Enter any address and get a comprehensive market brief in seconds. 
            The listing appointment weapon — show up with data that wins.
          </p>
        </div>

        {/* Input */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generateBrief()}
              placeholder="Enter address or neighborhood (e.g., 1234 Oak St, Arlington, VA)"
              className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#37b0c9] focus:ring-1 focus:ring-[#37b0c9]"
            />
            <button
              onClick={generateBrief}
              disabled={loading || !address.trim()}
              className="px-6 py-3 bg-[#37b0c9] hover:bg-[#2d9bb3] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
            >
              {loading ? 'Generating...' : 'Generate Brief'}
            </button>
          </div>
          {!brief && !loading && (
            <button onClick={showSample} className="mt-3 text-sm text-[#37b0c9] hover:underline">
              👀 See sample brief for Arlington, VA
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="animate-spin h-5 w-5 border-2 border-[#37b0c9] border-t-transparent rounded-full" />
                <span className="text-gray-300">Generating your intelligence brief...</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                <div
                  className="bg-[#37b0c9] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <p>{progress > 10 ? '✅' : '⏳'} Analyzing address & neighborhood...</p>
                <p>{progress > 30 ? '✅' : '⏳'} Pulling SemRush search demand data...</p>
                <p>{progress > 50 ? '✅' : '⏳'} Generating market snapshot...</p>
                <p>{progress > 70 ? '✅' : '⏳'} Building competitive analysis...</p>
                <p>{progress > 85 ? '✅' : '⏳'} Preparing AI recommendations...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-300">
            ⚠️ {error}
          </div>
        )}

        {/* Brief Results */}
        {brief && (
          <div ref={briefRef} className="max-w-4xl mx-auto space-y-6">
            {/* Export bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showDemo && (
                  <span className="text-xs bg-yellow-600/30 text-yellow-300 px-2 py-1 rounded">SAMPLE DATA</span>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={exportPDF} className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors">
                  📄 Export PDF
                </button>
                <button onClick={copyShareLink} className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors">
                  🔗 Share Link
                </button>
              </div>
            </div>

            {/* Brief Header */}
            <div className="bg-gradient-to-r from-[#37b0c9]/20 to-gray-800/50 border border-[#37b0c9]/30 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[#37b0c9] font-medium mb-1">NEIGHBORHOOD INTELLIGENCE BRIEF</p>
                  <h2 className="text-2xl font-bold">{brief.address}</h2>
                  <p className="text-gray-400 mt-1">{brief.neighborhood} Market Area</p>
                </div>
                <div className="text-right text-sm text-gray-400">
                  <p>{new Date(brief.generatedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-[#37b0c9] font-medium">AgentAIBrief.com</p>
                </div>
              </div>
            </div>

            {/* Market Snapshot */}
            <Section title="📊 Market Snapshot">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <StatCard label="Median Home Price" value={brief.marketSnapshot.medianHomePrice} />
                <StatCard label="Avg Days on Market" value={String(brief.marketSnapshot.avgDaysOnMarket)} />
                <StatCard label="Price Trend" value={`${trendIcon(brief.marketSnapshot.priceTrend)} ${brief.marketSnapshot.priceTrend.charAt(0).toUpperCase() + brief.marketSnapshot.priceTrend.slice(1)}`} />
                <StatCard label="Inventory" value={brief.marketSnapshot.inventoryLevel.toUpperCase()} className={inventoryColor(brief.marketSnapshot.inventoryLevel)} />
                <StatCard label="Market Type" value={brief.marketSnapshot.marketType.charAt(0).toUpperCase() + brief.marketSnapshot.marketType.slice(1)} />
              </div>
              <p className="text-gray-400 text-sm">{brief.marketSnapshot.priceTrendDetail}</p>
              <p className="text-gray-400 text-sm mt-2">{brief.marketSnapshot.inventoryDetail}</p>
              <p className="text-gray-400 text-sm mt-2">{brief.marketSnapshot.marketTypeDetail}</p>
            </Section>

            {/* Search Demand */}
            <Section title="🔍 Online Search Demand">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <StatCard label={brief.searchDemand.primaryKeyword} value={`${brief.searchDemand.primarySearchVolume.toLocaleString()} /mo`} />
                <StatCard label="Search Trend" value={`${trendIcon(brief.searchDemand.searchTrend)} ${brief.searchDemand.searchTrend.charAt(0).toUpperCase() + brief.searchDemand.searchTrend.slice(1)}`} />
              </div>
              <p className="text-gray-400 text-sm mb-4">{brief.searchDemand.searchTrendDetail}</p>
              
              <h4 className="text-sm font-semibold text-gray-300 mb-2">Related Buyer Searches</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 border-b border-gray-700">
                      <th className="text-left py-2">Keyword</th>
                      <th className="text-right py-2">Volume</th>
                      <th className="text-right py-2">CPC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brief.searchDemand.relatedSearches.map((s, i) => (
                      <tr key={i} className="border-b border-gray-800">
                        <td className="py-2 text-gray-300">{s.keyword}</td>
                        <td className="py-2 text-right text-gray-400">{Number(s.volume).toLocaleString()}</td>
                        <td className="py-2 text-right text-green-400">${Number(s.cpc).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
                <h4 className="text-sm font-semibold text-[#37b0c9] mb-1">💡 What Buyers Are Searching For</h4>
                <p className="text-gray-400 text-sm">{brief.searchDemand.buyerSearchInsight}</p>
              </div>
            </Section>

            {/* Neighborhood Highlights */}
            <Section title="🏡 Neighborhood Highlights">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-1">🎓 Schools & Education</h4>
                  <p className="text-gray-400 text-sm">{brief.neighborhoodHighlights.schoolRatings}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">🚗 Commute Times</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {brief.neighborhoodHighlights.commuteTimes.map((c, i) => (
                      <div key={i} className="bg-gray-800/50 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-[#37b0c9]">{c.time}</p>
                        <p className="text-xs text-gray-400">{c.destination}</p>
                        <p className="text-xs text-gray-500">{c.method}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-1">🌳 Amenities & Lifestyle</h4>
                  <p className="text-gray-400 text-sm">{brief.neighborhoodHighlights.amenities}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-1">📰 Recent Developments</h4>
                  <p className="text-gray-400 text-sm">{brief.neighborhoodHighlights.recentDevelopments}</p>
                </div>
              </div>
            </Section>

            {/* Competitive Analysis */}
            <Section title="⚔️ Competitive Analysis">
              <p className="text-gray-400 text-sm mb-4">{brief.competitiveAnalysis.agentActivity}</p>
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Content Gaps (Opportunities)</h4>
                <ul className="space-y-1">
                  {brief.competitiveAnalysis.contentGaps.map((gap, i) => (
                    <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                      <span className="text-[#37b0c9]">→</span> {gap}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-gray-400 text-sm mt-4">{brief.competitiveAnalysis.competitiveInsight}</p>
            </Section>

            {/* AI Recommendations */}
            <Section title="🤖 AI Recommendations for the Listing Agent">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase mb-1">Suggested Price Range</p>
                  <p className="text-xl font-bold text-[#37b0c9]">{brief.aiRecommendations.suggestedPriceRange}</p>
                </div>
                <div className="bg-gray-800/30 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase mb-1">Best Time to List</p>
                  <p className="text-sm text-gray-300">{brief.aiRecommendations.bestTimeToList}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-green-400 mb-2">✅ Key Selling Points</h4>
                  <ul className="space-y-1">
                    {brief.aiRecommendations.keySellingPoints.map((p, i) => (
                      <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">•</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-yellow-400 mb-2">⚠️ Prepare For</h4>
                  <ul className="space-y-1">
                    {brief.aiRecommendations.potentialChallenges.map((c, i) => (
                      <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                        <span className="text-yellow-400 mt-0.5">•</span> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Section>

            {/* Disclaimer */}
            <div className="text-xs text-gray-600 border-t border-gray-800 pt-4">
              <p><strong>Disclaimer:</strong> This brief is AI-generated using publicly available data and SemRush analytics. Verify all data points independently. Not a substitute for a formal CMA.</p>
            </div>
          </div>
        )}

        {/* Pricing */}
        {!brief && !loading && (
          <div className="max-w-4xl mx-auto mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">Pricing</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <PricingCard
                title="Free"
                price="$0"
                period=""
                features={['1 brief/month', 'Sample data only', 'Basic market snapshot']}
              />
              <PricingCard
                title="Pro"
                price="$19"
                period="/mo"
                features={['10 briefs/month', 'Live SemRush data', 'Full AI analysis', 'PDF export', 'Share links']}
                highlighted
              />
              <PricingCard
                title="Inner Circle"
                price="$99"
                period="/mo"
                features={['Unlimited briefs', 'Live SemRush data', 'Full AI analysis', 'PDF export', 'Share links', 'Priority support', 'Custom branding']}
              />
            </div>
          </div>
        )}
      </main>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; color: black !important; }
          header, button, .no-print { display: none !important; }
          .print\\:bg-white { background: white !important; }
          * { color: #1a1a1a !important; border-color: #ddd !important; }
          .text-\\[\\#37b0c9\\] { color: #2196F3 !important; }
          .bg-gray-800\\/50, .bg-gray-800\\/30 { background: #f5f5f5 !important; }
          .bg-gradient-to-r { background: #f0f9ff !important; }
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function StatCard({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${className || 'text-white'}`}>{value}</p>
    </div>
  );
}

function PricingCard({ title, price, period, features, highlighted }: {
  title: string; price: string; period: string; features: string[]; highlighted?: boolean;
}) {
  return (
    <div className={`rounded-xl p-6 border ${highlighted ? 'border-[#37b0c9] bg-[#37b0c9]/10' : 'border-gray-700 bg-gray-800/50'}`}>
      <h3 className="text-lg font-bold mb-1">{title}</h3>
      <p className="text-3xl font-bold mb-4">
        {price}<span className="text-sm text-gray-400 font-normal">{period}</span>
      </p>
      <ul className="space-y-2">
        {features.map((f, i) => (
          <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
            <span className="text-[#37b0c9]">✓</span> {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
