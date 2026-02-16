'use client';

import { useState } from 'react';
import { MobileNav } from '@/components/MobileNav';
import { SiteNav } from '@/components/SiteNav';
import { PaywallGate } from '@/components/PaywallGate';

interface KeywordResult {
  keyword: string;
  volume: number;
  cpc: number;
  competition: number;
  results: number;
  type: 'related' | 'question';
}

const DEMO_KEYWORDS: KeywordResult[] = [
  { keyword: 'arlington va homes for sale', volume: 2900, cpc: 2.45, competition: 0.38, results: 12400000, type: 'related' },
  { keyword: 'arlington va real estate market', volume: 1600, cpc: 1.89, competition: 0.29, results: 8900000, type: 'related' },
  { keyword: 'condos for sale arlington va', volume: 1300, cpc: 3.12, competition: 0.35, results: 5600000, type: 'related' },
  { keyword: 'arlington va townhouses', volume: 880, cpc: 2.78, competition: 0.22, results: 3400000, type: 'related' },
  { keyword: 'best neighborhoods in arlington va', volume: 720, cpc: 1.45, competition: 0.18, results: 2100000, type: 'related' },
  { keyword: 'arlington va housing market forecast', volume: 590, cpc: 1.67, competition: 0.25, results: 1800000, type: 'related' },
  { keyword: 'is arlington va a good place to live', volume: 480, cpc: 0.89, competition: 0.12, results: 4500000, type: 'question' },
  { keyword: 'what is the average home price in arlington va', volume: 390, cpc: 1.23, competition: 0.15, results: 3200000, type: 'question' },
  { keyword: 'arlington va first time home buyer', volume: 320, cpc: 2.56, competition: 0.31, results: 2800000, type: 'related' },
  { keyword: 'arlington va luxury homes', volume: 260, cpc: 4.12, competition: 0.42, results: 1900000, type: 'related' },
  { keyword: 'when is the best time to buy in arlington va', volume: 210, cpc: 1.34, competition: 0.19, results: 1500000, type: 'question' },
  { keyword: 'arlington va school districts homes', volume: 180, cpc: 1.78, competition: 0.27, results: 980000, type: 'related' },
  { keyword: 'arlington va metro accessible homes', volume: 170, cpc: 2.01, competition: 0.23, results: 1200000, type: 'related' },
  { keyword: 'how much do you need to buy a house in arlington va', volume: 150, cpc: 1.56, competition: 0.14, results: 2300000, type: 'question' },
  { keyword: 'arlington va new construction homes', volume: 140, cpc: 3.45, competition: 0.39, results: 870000, type: 'related' },
];

function CompetitionBadge({ score }: { score: number }) {
  const color = score < 0.3 ? 'bg-green-500/20 text-green-400' : score < 0.6 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400';
  const label = score < 0.3 ? 'Easy Win' : score < 0.6 ? 'Moderate' : 'Hard';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label} ({score.toFixed(2)})</span>;
}

export default function SEOSniperPage() {
  const [marketArea, setMarketArea] = useState('');
  const [keywords, setKeywords] = useState<KeywordResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [article, setArticle] = useState('');
  const [articleKeyword, setArticleKeyword] = useState('');
  const [generatingKeyword, setGeneratingKeyword] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!marketArea.trim()) return;
    setLoading(true);
    setError('');
    setKeywords([]);
    setArticle('');

    // Demo mode for Arlington VA
    if (marketArea.trim().toLowerCase().includes('arlington')) {
      setTimeout(() => {
        setKeywords(DEMO_KEYWORDS);
        setIsDemo(true);
        setLoading(false);
      }, 1500);
      return;
    }

    try {
      const res = await fetch('/api/seo-sniper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketArea: marketArea.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setKeywords(data.keywords || []);
      setIsDemo(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch keywords');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerate(keyword: string) {
    setGeneratingKeyword(keyword);
    setArticle('');
    setArticleKeyword('');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 290000);
      const res = await fetch('/api/seo-sniper/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, marketArea: marketArea.trim() }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setArticle(data.article);
      setArticleKeyword(keyword);
      // Scroll to article
      setTimeout(() => document.getElementById('generated-article')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: unknown) {
      const msg = err instanceof DOMException && err.name === 'AbortError' ? 'Request timed out' : (err instanceof Error ? err.message : 'Failed to generate article');
      setError(msg);
    } finally {
      setGeneratingKeyword('');
    }
  }

  function copyArticle() {
    navigator.clipboard.writeText(article);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const wordCount = article.split(/\s+/).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#e8e6e1] text-[#2a2a2a]">
      {/* Header */}
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1]/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-[#e85d26] to-[#c44a1a] bg-clip-text text-transparent">AgentAI Brief</span>
          </a>
          <SiteNav variant="dark" />
          <MobileNav />
        </div>
      </header>

      <PaywallGate requiredTier="inner_circle" featureName="SEO Sniper">
      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e85d26]/10 border border-[#e85d26]/20 text-[#e85d26] text-sm mb-4">
            🎯 SEO Sniper
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Keywords{' '}
            <span className="bg-gradient-to-r from-[#e85d26] to-[#c44a1a] bg-clip-text text-transparent">
              No Agent Ranks For
            </span>
          </h1>
          <p className="text-[#666] text-lg max-w-2xl mx-auto">
            Discover untapped keyword opportunities in your market and generate ready-to-publish SEO content that captures organic traffic.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
          <div className="flex gap-3">
            <input
              type="text"
              value={marketArea}
              onChange={(e) => setMarketArea(e.target.value)}
              placeholder='Enter your market area (e.g., "Arlington VA", "Fairfax County")'
              className="flex-1 px-4 py-3 rounded-lg bg-[#f0ece4] border border-[#d8d4cc] text-[#2a2a2a] placeholder-gray-500 focus:outline-none focus:border-[#e85d26] focus:ring-1 focus:ring-[#e85d26]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-lg bg-[#e85d26] hover:bg-[#d05020] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Analyzing...
                </span>
              ) : 'Find Keyword Gaps'}
            </button>
          </div>
          {isDemo && <p className="text-yellow-400/70 text-sm mt-2 text-center">📊 Showing demo data for Arlington VA</p>}
        </form>

        {error && <div className="max-w-2xl mx-auto mb-8 p-4 rounded-lg bg-red-50 border border-red-300 text-red-800">{error}</div>}

        {/* Loading */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#e85d26]/30 border-t-[#e85d26] rounded-full animate-spin" />
              <p className="text-[#666]">Scanning SemRush for keyword gaps in {marketArea}...</p>
              <div className="w-64 h-2 bg-[#f0ece4] rounded-full overflow-hidden">
                <div className="h-full bg-[#e85d26] rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {keywords.length > 0 && !loading && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              🎯 Keyword Opportunities
              <span className="text-sm font-normal text-[#666]">({keywords.length} found)</span>
            </h2>
            <div className="overflow-x-auto rounded-lg border border-[#e0dcd4]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f0ece4]/50 text-[#666] text-left">
                    <th className="px-4 py-3 font-medium">Keyword</th>
                    <th className="px-4 py-3 font-medium text-right">Volume/mo</th>
                    <th className="px-4 py-3 font-medium text-center">Competition</th>
                    <th className="px-4 py-3 font-medium text-right">CPC</th>
                    <th className="px-4 py-3 font-medium text-center">Type</th>
                    <th className="px-4 py-3 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((kw, i) => (
                    <tr key={i} className="border-t border-[#e0dcd4] hover:bg-[#f0ece4]/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-[#2a2a2a]">{kw.keyword}</td>
                      <td className="px-4 py-3 text-right text-[#555]">{kw.volume.toLocaleString()}</td>
                      <td className="px-4 py-3 text-center"><CompetitionBadge score={kw.competition} /></td>
                      <td className="px-4 py-3 text-right text-[#555]">${kw.cpc.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs ${kw.type === 'question' ? 'bg-purple-500/20 text-purple-400' : 'bg-[#e85d26]/20 text-[#e85d26]'}`}>
                          {kw.type === 'question' ? '❓ Question' : '🔗 Related'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleGenerate(kw.keyword)}
                          disabled={!!generatingKeyword}
                          className="px-3 py-1.5 rounded bg-[#e85d26] hover:bg-[#d05020] text-white text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {generatingKeyword === kw.keyword ? 'Generating...' : 'Generate Article'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 rounded-lg bg-[#f0ece4]/50 border border-[#e0dcd4]">
              <h3 className="font-semibold text-[#e85d26] mb-2">💡 Why These Keywords Matter</h3>
              <ul className="text-sm text-[#666] space-y-1">
                <li>• <strong className="text-[#555]">Low competition</strong> (&lt;0.5) means fewer agents are targeting these terms — easier to rank</li>
                <li>• <strong className="text-[#555]">Question keywords</strong> are perfect for FAQ content and featured snippets</li>
                <li>• <strong className="text-[#555]">Higher CPC</strong> indicates commercial intent — these searchers are closer to buying</li>
                <li>• Publishing optimized content for these gaps can drive organic leads within 30-90 days</li>
              </ul>
            </div>
          </div>
        )}

        {/* Generated Article */}
        {article && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">📝 Generated Article</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#666]">{wordCount.toLocaleString()} words • Target: {articleKeyword}</span>
                <button
                  onClick={copyArticle}
                  className="px-4 py-2 rounded-lg bg-[#f0ece4] hover:bg-[#d8d4cc] text-white text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {copied ? '✅ Copied!' : '📋 Copy to Clipboard'}
                </button>
              </div>
            </div>
            <div className="p-8 rounded-lg bg-[#f0ece4] border border-[#e0dcd4] prose prose-invert prose-orange max-w-none">
              <div dangerouslySetInnerHTML={{ __html: articleToHtml(article) }} />
            </div>
          </div>
        )}

        {generatingKeyword && !article && (
          <div id="generated-article" className="text-center py-16">
            <div className="inline-flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#e85d26]/30 border-t-[#e85d26] rounded-full animate-spin" />
              <p className="text-[#666]">Generating SEO article for &quot;{generatingKeyword}&quot;...</p>
              <p className="text-[#888] text-sm">This takes 15-30 seconds</p>
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className="mt-20 mb-12">
          <h2 className="text-3xl font-bold text-center mb-3">Pricing</h2>
          <p className="text-[#666] text-center mb-10">Find gaps. Generate content. Dominate local SEO.</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Free */}
            <div className="rounded-xl border border-[#e0dcd4] bg-[#f0ece4]/50 p-6">
              <h3 className="text-lg font-semibold mb-1">Free</h3>
              <p className="text-3xl font-bold mb-4">$0<span className="text-sm text-[#666] font-normal">/mo</span></p>
              <ul className="text-sm text-[#666] space-y-2 mb-6">
                <li className="flex items-center gap-2">✅ View 5 keyword gaps</li>
                <li className="flex items-center gap-2">❌ No article generation</li>
                <li className="flex items-center gap-2">✅ Competition analysis</li>
              </ul>
              <button className="w-full py-2 rounded-lg border border-[#d8d4cc] text-[#555] hover:bg-[#f0ece4] transition-colors text-sm font-medium">Get Started</button>
            </div>
            {/* Pro */}
            <div className="rounded-xl border-2 border-[#e85d26] bg-[#f0ece4]/50 p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#e85d26] text-xs font-bold text-white">POPULAR</div>
              <h3 className="text-lg font-semibold mb-1">Pro</h3>
              <p className="text-3xl font-bold mb-4">$19<span className="text-sm text-[#666] font-normal">/mo</span></p>
              <ul className="text-sm text-[#666] space-y-2 mb-6">
                <li className="flex items-center gap-2">✅ 15 keyword gaps</li>
                <li className="flex items-center gap-2">✅ 5 articles/month</li>
                <li className="flex items-center gap-2">✅ Competition analysis</li>
                <li className="flex items-center gap-2">✅ Question keywords</li>
              </ul>
              <button className="w-full py-2 rounded-lg bg-[#e85d26] hover:bg-[#d05020] text-white text-sm font-medium transition-colors">Subscribe</button>
            </div>
            {/* Inner Circle */}
            <div className="rounded-xl border border-[#e0dcd4] bg-[#f0ece4]/50 p-6">
              <h3 className="text-lg font-semibold mb-1">Inner Circle</h3>
              <p className="text-3xl font-bold mb-4">$99<span className="text-sm text-[#666] font-normal">/mo</span></p>
              <ul className="text-sm text-[#666] space-y-2 mb-6">
                <li className="flex items-center gap-2">✅ Unlimited keyword gaps</li>
                <li className="flex items-center gap-2">✅ Unlimited articles</li>
                <li className="flex items-center gap-2">✅ All AI tools access</li>
                <li className="flex items-center gap-2">✅ Priority generation</li>
              </ul>
              <button className="w-full py-2 rounded-lg border border-[#d8d4cc] text-[#555] hover:bg-[#f0ece4] transition-colors text-sm font-medium">Subscribe</button>
            </div>
          </div>
        </div>
      </main>
      </PaywallGate>
    </div>
  );
}

function articleToHtml(markdown: string): string {
  return markdown
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-[#e85d26] mt-6 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-[#2a2a2a] mt-8 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-[#2a2a2a] mb-4">$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p class="text-[#555] leading-relaxed mb-4">')
    .replace(/\n/g, '<br />')
    .replace(/^/, '<p class="text-[#555] leading-relaxed mb-4">')
    .replace(/$/, '</p>');
}
