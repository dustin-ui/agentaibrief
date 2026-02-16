'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PaywallGate } from '@/components/PaywallGate';

const INTEREST_LEVELS = ['Hot — Ready to make an offer', 'Warm — Interested but browsing', 'Cool — Just looking', 'Unknown — No clear signal'];
const FOLLOW_UP_CHANNELS = ['Email', 'Text', 'Both Email + Text'];

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

interface FollowUpSet {
  interestLevel: string;
  immediateFollowUp: { channel: string; subject?: string; body: string };
  dayThreeFollowUp: { channel: string; subject?: string; body: string };
  daySevenFollowUp: { channel: string; subject?: string; body: string };
  bonusTip: string;
}

export default function OpenHouseFollowUpPage() {
  const [propertyAddress, setPropertyAddress] = useState('');
  const [agentName, setAgentName] = useState('');
  const [agentPhone, setAgentPhone] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [interestLevel, setInterestLevel] = useState(INTEREST_LEVELS[1]);
  const [channel, setChannel] = useState(FOLLOW_UP_CHANNELS[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FollowUpSet | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!propertyAddress) { setError('Property address is required'); return; }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/open-house-followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyAddress, agentName, agentPhone, visitorName, interestLevel, channel, notes }),
      });
      if (!res.ok) throw new Error('Generation failed');
      setResult(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = (label: string, emoji: string, msg: { channel: string; subject?: string; body: string }) => (
    <div className="bg-[#e8e6e1] border border-[#e0dcd4] rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <h4 className="font-bold text-[#2a2a2a]">{label}</h4>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#f5f0ea] text-[#666]">{msg.channel}</span>
        </div>
        <CopyButton text={msg.subject ? `Subject: ${msg.subject}\n\n${msg.body}` : msg.body} />
      </div>
      {msg.subject && (
        <div className="mb-3 px-4 py-2 bg-[#f0ece4] rounded-lg">
          <span className="text-xs font-medium text-[#888]">Subject: </span>
          <span className="text-sm font-semibold text-[#2a2a2a]">{msg.subject}</span>
        </div>
      )}
      <div className="text-sm text-[#555] whitespace-pre-wrap leading-relaxed">{msg.body}</div>
    </div>
  );

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
            <Link href="/market-snapshot" className="text-sm text-[#666] hover:text-[#2a2a2a]">Market Snapshot</Link>
            <Link href="/open-house-followup" className="text-sm text-[#2a2a2a] font-medium border-b-2 border-[#e85d26] pb-0.5">Open House Follow-Up</Link>
          </nav>
        </div>
      </header>

      <PaywallGate requiredTier="pro" featureName="Open House Follow-Up Generator">
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-medium mb-4">
              🏠 Pro Tool
            </div>
            <h2 className="text-4xl font-extrabold text-[#2a2a2a] mb-3">Open House Follow-Up Generator</h2>
            <p className="text-lg text-[#666]">Generate a 3-touch follow-up sequence for every open house visitor. Personalized by interest level — send within minutes of your open house.</p>
          </div>

          <div className="bg-[#f0ece4] rounded-2xl p-8 mb-10 border border-[#e0dcd4]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#555] mb-2">Property Address</label>
                <input type="text" value={propertyAddress} onChange={e => setPropertyAddress(e.target.value)} placeholder="123 Main St, Arlington, VA 22201" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#e85d26] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#555] mb-2">Your Name</label>
                <input type="text" value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="Jane Smith" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#e85d26] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#555] mb-2">Phone</label>
                <input type="text" value={agentPhone} onChange={e => setAgentPhone(e.target.value)} placeholder="(703) 555-0123" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#e85d26] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#555] mb-2">Visitor Name <span className="text-[#666] font-normal">(optional)</span></label>
                <input type="text" value={visitorName} onChange={e => setVisitorName(e.target.value)} placeholder="John & Sarah" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#e85d26] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#555] mb-2">Interest Level</label>
                <select value={interestLevel} onChange={e => setInterestLevel(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#e85d26] outline-none">
                  {INTEREST_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#555] mb-2">Follow-Up Channel</label>
                <select value={channel} onChange={e => setChannel(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#e85d26] outline-none">
                  {FOLLOW_UP_CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#555] mb-2">Notes About Visitor <span className="text-[#666] font-normal">(optional)</span></label>
                <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Loved the kitchen, has a dog, moving from Reston" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#e85d26] outline-none" />
              </div>
            </div>
            <button onClick={handleGenerate} disabled={loading} className="mt-6 w-full py-4 bg-[#e85d26] text-white font-bold rounded-xl hover:bg-[#c44a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg">
              {loading ? '⏳ Generating Follow-Ups...' : '🏠 Generate Follow-Up Sequence'}
            </button>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}

          {result && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-[#2a2a2a]">Your 3-Touch Follow-Up Sequence</h3>
              {renderMessage('Same Day — Immediate Follow-Up', '⚡', result.immediateFollowUp)}
              {renderMessage('Day 3 — Value Add', '📬', result.dayThreeFollowUp)}
              {renderMessage('Day 7 — Soft Close', '🎯', result.daySevenFollowUp)}

              {result.bonusTip && (
                <div className="bg-[#f5f0ea] border border-[#d8d4cc] rounded-2xl p-6">
                  <h4 className="font-bold text-[#2a2a2a] mb-2">💡 Pro Tip</h4>
                  <p className="text-sm text-[#2a2a2a] leading-relaxed">{result.bonusTip}</p>
                </div>
              )}
            </div>
          )}
        </main>
      </PaywallGate>
    </div>
  );
}
