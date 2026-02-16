'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PaywallGate } from '@/components/PaywallGate';

type Story = {
  headline: string;
  summary: string;
  viralScore: number;
  county: string;
  date: string;
  category: string;
  greenScreenScript: string;
  instagramHook: string;
  hashtags: string[];
  sourceUrls: string[];
};

const US_STATES = [
  { abbr: 'AL', name: 'Alabama' }, { abbr: 'AK', name: 'Alaska' }, { abbr: 'AZ', name: 'Arizona' }, { abbr: 'AR', name: 'Arkansas' },
  { abbr: 'CA', name: 'California' }, { abbr: 'CO', name: 'Colorado' }, { abbr: 'CT', name: 'Connecticut' }, { abbr: 'DE', name: 'Delaware' },
  { abbr: 'DC', name: 'Washington D.C.' }, { abbr: 'FL', name: 'Florida' }, { abbr: 'GA', name: 'Georgia' }, { abbr: 'HI', name: 'Hawaii' },
  { abbr: 'ID', name: 'Idaho' }, { abbr: 'IL', name: 'Illinois' }, { abbr: 'IN', name: 'Indiana' }, { abbr: 'IA', name: 'Iowa' },
  { abbr: 'KS', name: 'Kansas' }, { abbr: 'KY', name: 'Kentucky' }, { abbr: 'LA', name: 'Louisiana' }, { abbr: 'ME', name: 'Maine' },
  { abbr: 'MD', name: 'Maryland' }, { abbr: 'MA', name: 'Massachusetts' }, { abbr: 'MI', name: 'Michigan' }, { abbr: 'MN', name: 'Minnesota' },
  { abbr: 'MS', name: 'Mississippi' }, { abbr: 'MO', name: 'Missouri' }, { abbr: 'MT', name: 'Montana' }, { abbr: 'NE', name: 'Nebraska' },
  { abbr: 'NV', name: 'Nevada' }, { abbr: 'NH', name: 'New Hampshire' }, { abbr: 'NJ', name: 'New Jersey' }, { abbr: 'NM', name: 'New Mexico' },
  { abbr: 'NY', name: 'New York' }, { abbr: 'NC', name: 'North Carolina' }, { abbr: 'ND', name: 'North Dakota' }, { abbr: 'OH', name: 'Ohio' },
  { abbr: 'OK', name: 'Oklahoma' }, { abbr: 'OR', name: 'Oregon' }, { abbr: 'PA', name: 'Pennsylvania' }, { abbr: 'RI', name: 'Rhode Island' },
  { abbr: 'SC', name: 'South Carolina' }, { abbr: 'SD', name: 'South Dakota' }, { abbr: 'TN', name: 'Tennessee' }, { abbr: 'TX', name: 'Texas' },
  { abbr: 'UT', name: 'Utah' }, { abbr: 'VT', name: 'Vermont' }, { abbr: 'VA', name: 'Virginia' }, { abbr: 'WA', name: 'Washington' },
  { abbr: 'WV', name: 'West Virginia' }, { abbr: 'WI', name: 'Wisconsin' }, { abbr: 'WY', name: 'Wyoming' },
];

const LOADING_MESSAGES = [
  'Scanning local news sources...',
  'Analyzing viral potential...',
  'Scoring stories by shareability...',
  'Writing green screen scripts...',
  'Crafting Instagram hooks...',
  'Compiling your briefing...',
  'Almost ready...',
];

const CATEGORY_COLORS: Record<string, string> = {
  'Restaurant Opening': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Business Closing': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Development': 'bg-[#e85d26]/20 text-[#e85d26] border-[#e85d26]/30',
  'Government': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Schools': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Community': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Safety': 'bg-red-600/20 text-red-300 border-red-600/30',
  'Real Estate': 'bg-[#e85d26]/20 text-[#e85d26] border-[#e85d26]/30',
  'Transportation': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'Entertainment': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
};

function viralScoreBadge(score: number) {
  if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/40';
  if (score >= 60) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
  return 'bg-[#f0ece4]0/20 text-[#666] border-gray-500/40';
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 px-2 py-0.5 text-xs rounded border border-[#d8d4cc] hover:border-[#e85d26] hover:text-[#e85d26] text-[#888] transition shrink-0"
    >
      {copied ? '✓ Copied!' : `Copy`}
    </button>
  );
}

export default function ContentBriefingPage() {
  const [state, setState] = useState('');
  const [area, setArea] = useState('');
  const [type, setType] = useState<'county' | 'city'>('county');
  const [loading, setLoading] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [error, setError] = useState('');
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [customLoadingMsg, setCustomLoadingMsg] = useState('');

  useEffect(() => {
    if (!loading) { setLoadingMsgIdx(0); setLoadingProgress(0); return; }
    // Only cycle generic messages if no custom SSE message
    const msgInterval = setInterval(() => {
      setLoadingMsgIdx(i => i === -1 ? -1 : (i + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => { clearInterval(msgInterval); };
  }, [loading]);

  const generateBriefing = async () => {
    if (!area.trim()) return;
    setLoading(true);
    setError('');
    setStories([]);
    setLoadingProgress(5);

    try {
      const res = await fetch('/api/content-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area: `${area.trim()}, ${state}`, type }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || 'Request failed');
      }

      // Parse SSE stream
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const block of events) {
          const lines = block.split('\n');
          let eventType = '';
          let eventData = '';
          for (const line of lines) {
            if (line.startsWith('event: ')) eventType = line.slice(7);
            if (line.startsWith('data: ')) eventData = line.slice(6);
          }
          if (!eventType || !eventData) continue;

          try {
            const parsed = JSON.parse(eventData);
            if (eventType === 'progress') {
              setLoadingProgress(parsed.pct || 0);
              // Update loading message to show real status
              setLoadingMsgIdx(-1); // signals custom msg
              setCustomLoadingMsg(parsed.msg || '');
            } else if (eventType === 'done') {
              setStories(parsed.stories || []);
              setLoadingProgress(100);
            } else if (eventType === 'error') {
              throw new Error(parsed.error);
            }
          } catch (e) {
            if (e instanceof Error && e.message.startsWith('Briefing failed')) throw e;
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
      setCustomLoadingMsg('');
    }
  };

  return (
    <div className="min-h-screen bg-[#e8e6e1] text-[#2a2a2a]">
      {/* Header */}
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">Agent<span className="text-[#e85d26]">AI</span>Brief</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-[#666] hover:text-[#2a2a2a]">Home</Link>
            <Link href="/tools" className="text-[#666] hover:text-[#2a2a2a]">AI Tools</Link>
            <Link href="/contract-analyzer" className="text-[#666] hover:text-[#2a2a2a]">Contract Analyzer</Link>
            <span className="text-[#e85d26] font-semibold">Content Briefing</span>
          </nav>
        </div>
      </header>

      <PaywallGate requiredTier="inner_circle" featureName="Content Briefing">
      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="inline-block px-3 py-1 bg-[#e85d26]/10 border border-[#e85d26]/30 rounded-full text-[#e85d26] text-xs font-medium mb-4">
            INNER CIRCLE FEATURE
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Content <span className="text-[#e85d26]">Briefing</span>
          </h1>
          <p className="text-[#666] max-w-lg mx-auto">
            Get 15 viral-potential local stories with ready-to-use green screen scripts, Instagram hooks, and hashtags.
          </p>
        </div>

        {/* Area Selector */}
        <div className="max-w-xl mx-auto bg-[#f0ece4] border border-[#e0dcd4] rounded-xl p-6 mb-8">
          {/* State Selector */}
          <p className="text-xs text-[#e85d26] mb-3">💡 We recommend searching by <strong>County</strong> for best results</p>
          <label className="block text-sm text-[#666] mb-2">State</label>
          <select
            value={state}
            onChange={(e) => { setState(e.target.value); setArea(''); }}
            className="w-full px-4 py-3 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] focus:outline-none focus:border-[#e85d26] text-lg mb-4 appearance-none cursor-pointer"
          >
            <option value="" disabled>Select a state...</option>
            {US_STATES.map(s => (
              <option key={s.abbr} value={s.abbr}>{s.name}</option>
            ))}
          </select>

          {/* County / City Toggle */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setType('county')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${type === 'county' ? 'bg-[#e85d26] text-white' : 'bg-[#f0ece4] text-[#666] hover:text-[#2a2a2a]'}`}
            >
              County
            </button>
            <button
              onClick={() => setType('city')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${type === 'city' ? 'bg-[#e85d26] text-white' : 'bg-[#f0ece4] text-[#666] hover:text-[#2a2a2a]'}`}
            >
              City
            </button>
          </div>

          <input
            type="text"
            placeholder={type === 'county' ? 'e.g. Fairfax County' : 'e.g. Arlington'}
            value={area}
            onChange={(e) => setArea(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generateBriefing()}
            disabled={!state}
            className="w-full px-4 py-3 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:outline-none focus:border-[#e85d26] text-lg mb-4 disabled:opacity-40"
          />

          <button
            onClick={generateBriefing}
            disabled={!area.trim() || !state || loading}
            className="w-full py-3 bg-[#e85d26] text-white font-bold rounded-lg hover:bg-[#e85d26]/80 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            🔍 Generate Briefing
          </button>
          <p className="text-xs text-[#888] text-center mt-2">⏱ Typically takes 2-3 minutes. Please don&apos;t leave or refresh the page while generating.</p>
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-xl mx-auto mb-8 bg-red-50 border border-red-300 rounded-lg p-4 text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {stories.length > 0 && (
          <div className="space-y-6">
            <p className="text-sm text-[#888] text-center">{stories.length} stories for {area}</p>
            {stories.map((story, i) => (
              <div key={i} className="bg-[#f0ece4] border border-[#e0dcd4] rounded-xl p-6 hover:border-[#d8d4cc] transition">
                {/* Top row: headline + badges */}
                <div className="flex flex-wrap items-start gap-3 mb-3">
                  <h3 className="text-lg font-bold text-[#2a2a2a] flex-1 min-w-0">{story.headline}</h3>
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full border shrink-0 ${viralScoreBadge(story.viralScore)}`}>
                    🔥 {story.viralScore}
                  </span>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-3 mb-3 text-xs">
                  <span className={`px-2 py-0.5 rounded border ${CATEGORY_COLORS[story.category] || 'bg-gray-700/30 text-[#666] border-gray-600/30'}`}>
                    {story.category}
                  </span>
                  <span className="text-[#888]">{story.county}</span>
                  <span className="text-[#666]">{story.date}</span>
                </div>

                {/* Summary */}
                <p className="text-[#555] text-sm mb-4 leading-relaxed">{story.summary}</p>

                {/* Green Screen Script */}
                <div className="bg-[#f0ece4]/50 rounded-lg p-4 mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#666]">🎬 Green Screen Script</span>
                    <CopyButton text={story.greenScreenScript} label="script" />
                  </div>
                  <p className="text-sm text-gray-200 leading-relaxed">{story.greenScreenScript}</p>
                </div>

                {/* Instagram Hook */}
                <div className="bg-[#f0ece4]/50 rounded-lg p-4 mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-[#666]">📱 Instagram Hook</span>
                    <CopyButton text={story.instagramHook} label="hook" />
                  </div>
                  <p className="text-sm text-gray-200 italic">{story.instagramHook}</p>
                </div>

                {/* Hashtags */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-[#888]">#️⃣</span>
                  <div className="flex gap-2">
                    {story.hashtags?.map((tag, j) => (
                      <span key={j} className="text-xs text-[#e85d26]">#{tag}</span>
                    ))}
                  </div>
                  <CopyButton text={story.hashtags?.map(t => `#${t}`).join(' ') || ''} label="hashtags" />
                </div>

                {/* Source URLs */}
                {story.sourceUrls?.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[#888]">🔗</span>
                    {story.sourceUrls.map((url, j) => {
                      let hostname = url;
                      try { hostname = new URL(url).hostname; } catch { /* use raw url */ }
                      return (
                        <a key={j} href={url} target="_blank" rel="noopener noreferrer" className="text-[#e85d26]/70 hover:text-[#e85d26] underline truncate max-w-[200px]">
                          {hostname}
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
      </PaywallGate>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-[#e8e6e1]/90 backdrop-blur-md z-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-[#e0dcd4]" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#e85d26] animate-spin" />
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-[#e85d26]/50 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-[#e85d26] rounded-full animate-pulse" />
              </div>
            </div>
            <p className="text-lg font-semibold text-[#2a2a2a] mb-2 transition-opacity duration-500">
              {customLoadingMsg || LOADING_MESSAGES[loadingMsgIdx] || LOADING_MESSAGES[0]}
            </p>
            <p className="text-sm text-[#888] mb-6">{area}</p>
            <div className="w-full bg-[#f0ece4] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#e85d26] to-[#e85d26]/60 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="text-xs text-[#666] mt-2">{Math.round(loadingProgress)}%</p>
          </div>
        </div>
      )}
    </div>
  );
}
