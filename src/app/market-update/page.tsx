'use client';

import { useState, useEffect, useRef } from 'react';
import { PaywallGate } from '@/components/PaywallGate';

/* ───── Copy Button ───── */
function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy}
      className="px-4 py-2 text-sm rounded-lg border border-[#d8d4cc] hover:border-[#e85d26] hover:text-[#e85d26] text-[#666] transition">
      {copied ? '✓ Copied!' : label || '📋 Copy'}
    </button>
  );
}

/* ───── Loading Messages ───── */
const LOADING_MESSAGES = [
  'Crunching the numbers for {city}... 📊',
  'Analyzing market trends... 📈',
  'This takes a minute — good things take time 🏠',
  'Deep diving into {city} real estate data... 🔍',
  'Pulling the latest listings data... 🏡',
  'Comparing year-over-year trends... 📉',
  'Almost there — finalizing your report... ✨',
];

/* ───── Markdown Renderer (simple) ───── */
function RenderMarkdown({ text }: { text: string }) {
  const html = text
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-[#2a2a2a] mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-[#e85d26] mt-8 mb-3">$2</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-[#2a2a2a] mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#2a2a2a]">$1</strong>')
    .replace(/^\- (.+)$/gm, '<li class="ml-4 text-[#555]">• $1</li>')
    .replace(/^\* (.+)$/gm, '<li class="ml-4 text-[#555]">• $1</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
  return <div className="prose prose-invert max-w-none text-[#555] leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ───── Main Page ───── */
export default function MarketUpdatePage() {
  return (
    <div className="min-h-screen bg-[#e8e6e1] text-[#2a2a2a]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-[#e85d26]">Market Update</span> Generator
          </h1>
          <p className="text-[#666] text-lg">Get a comprehensive real estate market report + video scripts powered by AI</p>
        </div>

        <PaywallGate requiredTier="inner_circle" featureName="Market Update Generator">
          <MarketUpdateTool />
        </PaywallGate>
      </div>
    </div>
  );
}

/* ───── Tool Component ───── */
function MarketUpdateTool() {
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState('');
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  /* Phase 2 */
  const [duration, setDuration] = useState(60);
  const [agentName, setAgentName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [scriptLoading, setScriptLoading] = useState(false);
  const [scripts, setScripts] = useState('');
  const [scriptError, setScriptError] = useState('');
  const scriptRef = useRef<HTMLDivElement>(null);

  /* Rotate loading messages */
  useEffect(() => {
    if (!loading) return;
    const iv = setInterval(() => setMsgIndex(i => (i + 1) % LOADING_MESSAGES.length), 3000);
    return () => clearInterval(iv);
  }, [loading]);

  /* Progress bar */
  useEffect(() => {
    if (!loading) { setProgress(0); return; }
    const iv = setInterval(() => setProgress(p => Math.min(p + 1.5, 92)), 500);
    return () => clearInterval(iv);
  }, [loading]);

  async function handleGetReport() {
    setLoading(true);
    setError('');
    setReport('');
    setScripts('');
    setMsgIndex(0);
    try {
      const res = await fetch('/api/market-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, state }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch');
      setReport(data.report);
      setProgress(100);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateScripts() {
    setScriptLoading(true);
    setScriptError('');
    setScripts('');
    try {
      const res = await fetch('/api/market-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city, state, duration,
          agent_name: agentName,
          team_name: teamName,
          marketData: report,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate scripts');
      setScripts(data.scripts);
      setTimeout(() => scriptRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
    } catch (e: unknown) {
      setScriptError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setScriptLoading(false);
    }
  }

  const canSubmitReport = city.trim() && state.trim();
  const canSubmitScript = agentName.trim() && teamName.trim();
  const loadingMsg = LOADING_MESSAGES[msgIndex].replace(/\{city\}/g, city);

  /* ───── Phase 1: Form ───── */
  if (!report && !loading) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-[#f0ece4]/80 rounded-2xl border border-[#e0dcd4] p-8">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#555] mb-1.5">City</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)}
                placeholder="e.g. Arlington"
                className="w-full px-4 py-3 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:border-[#e85d26] focus:outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#555] mb-1.5">State</label>
              <input type="text" value={state} onChange={e => setState(e.target.value)}
                placeholder="e.g. Virginia"
                className="w-full px-4 py-3 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:border-[#e85d26] focus:outline-none transition" />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button onClick={handleGetReport} disabled={!canSubmitReport}
              className="w-full py-3 rounded-lg font-semibold text-[#2a2a2a] bg-[#e85d26] hover:bg-[#c44a1a] disabled:opacity-40 disabled:cursor-not-allowed transition">
              🏠 Get Market Update
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ───── Phase 1: Loading ───── */
  if (loading) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        {/* Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-[#e0dcd4]" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#e85d26] animate-spin" />
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-purple-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        {/* Message */}
        <p className="text-lg text-[#555] mb-6 min-h-[2em] transition-all duration-500">{loadingMsg}</p>
        {/* Progress bar */}
        <div className="w-full max-w-xs mx-auto bg-[#f0ece4] rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#e85d26] to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
        <p className="text-[#888] text-sm mt-3">{Math.round(progress)}%</p>
      </div>
    );
  }

  /* ───── Phase 1: Report + Phase 2 ───── */
  return (
    <div className="space-y-10">
      {/* Report */}
      <div className="bg-[#f0ece4]/80 rounded-2xl border border-[#e0dcd4] p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#2a2a2a]">📊 {city}, {state} Market Report</h2>
          <div className="flex gap-2">
            <CopyButton text={report} label="📋 Copy Report" />
            <button onClick={() => { setReport(''); setScripts(''); }}
              className="px-4 py-2 text-sm rounded-lg border border-[#d8d4cc] hover:border-[#e85d26] hover:text-[#e85d26] text-[#666] transition">
              🔄 New Search
            </button>
          </div>
        </div>
        <RenderMarkdown text={report} />
      </div>

      {/* Phase 2: Video Script Generator */}
      <div className="bg-[#f0ece4]/80 rounded-2xl border border-[#e0dcd4] p-8">
        <h2 className="text-2xl font-bold text-[#2a2a2a] mb-2">🎬 Need a Video Script?</h2>
        <p className="text-[#666] mb-6">Generate two teleprompter-ready video scripts from your market data</p>

        <div className="space-y-5">
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-[#555] mb-2">Duration</label>
            <div className="flex gap-2">
              {[30, 60, 90, 120].map(d => (
                <button key={d} onClick={() => setDuration(d)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition border ${
                    duration === d
                      ? 'bg-[#e85d26] border-[#e85d26] text-[#2a2a2a]'
                      : 'bg-[#f0ece4] border-[#d8d4cc] text-[#666] hover:border-gray-600'
                  }`}>
                  {d}s
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#555] mb-1.5">Agent Name</label>
              <input type="text" value={agentName} onChange={e => setAgentName(e.target.value)}
                placeholder="e.g. Dustin Fox"
                className="w-full px-4 py-3 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:border-[#e85d26] focus:outline-none transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#555] mb-1.5">Team / Brokerage</label>
              <input type="text" value={teamName} onChange={e => setTeamName(e.target.value)}
                placeholder="e.g. Fox Homes"
                className="w-full px-4 py-3 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:border-[#e85d26] focus:outline-none transition" />
            </div>
          </div>

          {scriptError && <p className="text-red-400 text-sm">{scriptError}</p>}

          <button onClick={handleGenerateScripts} disabled={!canSubmitScript || scriptLoading}
            className="w-full py-3 rounded-lg font-semibold text-[#2a2a2a] bg-[#2a2a2a] hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition">
            {scriptLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating Scripts...
              </span>
            ) : '🎬 Generate Scripts'}
          </button>
        </div>
      </div>

      {/* Scripts Output */}
      {scripts && (
        <div ref={scriptRef} className="bg-[#f0ece4]/80 rounded-2xl border border-[#e0dcd4] p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#2a2a2a]">📝 Video Scripts</h2>
            <div className="flex gap-2">
              <CopyButton text={scripts} label="📋 Copy All Scripts" />
              <button onClick={handleGenerateScripts} disabled={scriptLoading}
                className="px-4 py-2 text-sm rounded-lg border border-[#d8d4cc] hover:border-purple-500 hover:text-purple-400 text-[#666] transition">
                🔄 Regenerate
              </button>
            </div>
          </div>
          <div className="bg-[#e8e6e1] rounded-xl p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap text-[#555]">
            {scripts}
          </div>
        </div>
      )}
    </div>
  );
}
