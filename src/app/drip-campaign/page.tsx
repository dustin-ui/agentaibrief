'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PaywallGate } from '@/components/PaywallGate';

const CAMPAIGN_TYPES = [
  'New Lead Nurture',
  'Buyer Follow-Up',
  'Seller Follow-Up',
  'Past Client Re-Engagement',
  'Open House Follow-Up',
  'Expired Listing Outreach',
  'FSBO Outreach',
  'Sphere of Influence',
  'Just Listed / Just Sold',
  'Holiday / Seasonal Check-In',
];

const CHANNELS = ['Email Only', 'Text Only', 'Email + Text Combo'];
const SEQUENCE_LENGTHS = ['3 messages (1 week)', '5 messages (2 weeks)', '8 messages (30 days)', '12 messages (90 days)'];
const TONES = ['Professional & Warm', 'Casual & Friendly', 'Urgency-Driven', 'Educational / Value-First', 'Luxury / High-End'];

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

export default function DripCampaignPage() {
  const [campaignType, setCampaignType] = useState(CAMPAIGN_TYPES[0]);
  const [channel, setChannel] = useState(CHANNELS[0]);
  const [sequenceLength, setSequenceLength] = useState(SEQUENCE_LENGTHS[1]);
  const [tone, setTone] = useState(TONES[0]);
  const [agentName, setAgentName] = useState('');
  const [agentPhone, setAgentPhone] = useState('');
  const [marketArea, setMarketArea] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ day: string; subject?: string; channel: string; body: string }>>([]);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setMessages([]);
    try {
      const res = await fetch('/api/drip-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignType, channel, sequenceLength, tone, agentName, agentPhone, marketArea, additionalContext }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      setMessages(data.messages);
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
            <Link href="/drip-campaign" className="text-sm text-[#2a2a2a] font-medium border-b-2 border-[#e85d26] pb-0.5">Drip Campaigns</Link>
            <Link href="/market-snapshot" className="text-sm text-[#666] hover:text-[#2a2a2a]">Market Snapshot</Link>
            <Link href="/open-house-followup" className="text-sm text-[#666] hover:text-[#2a2a2a]">Open House Follow-Up</Link>
          </nav>
        </div>
      </header>

      <PaywallGate requiredTier="pro" featureName="AI Drip Campaign Writer">
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#f5f0ea] text-[#c44a1a] rounded-full text-xs font-medium mb-4">
              ✉️ Pro Tool
            </div>
            <h2 className="text-4xl font-extrabold text-[#2a2a2a] mb-3">AI Drip Campaign Writer</h2>
            <p className="text-lg text-[#666]">Generate complete email & text nurture sequences in seconds. Just pick your campaign type and let AI do the rest.</p>
          </div>

          <div className="bg-[#f0ece4] rounded-2xl p-8 mb-10 border border-[#e0dcd4]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#555] mb-2">Campaign Type</label>
                <select value={campaignType} onChange={e => setCampaignType(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#e85d26] outline-none">
                  {CAMPAIGN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#555] mb-2">Channel</label>
                <select value={channel} onChange={e => setChannel(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#e85d26] outline-none">
                  {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#555] mb-2">Sequence Length</label>
                <select value={sequenceLength} onChange={e => setSequenceLength(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#e85d26] outline-none">
                  {SEQUENCE_LENGTHS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#555] mb-2">Tone</label>
                <select value={tone} onChange={e => setTone(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#e85d26] outline-none">
                  {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#555] mb-2">Your Name</label>
                <input type="text" value={agentName} onChange={e => setAgentName(e.target.value)} placeholder="Jane Smith" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#e85d26] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#555] mb-2">Phone</label>
                <input type="text" value={agentPhone} onChange={e => setAgentPhone(e.target.value)} placeholder="(703) 555-0123" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#e85d26] outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#555] mb-2">Market Area</label>
                <input type="text" value={marketArea} onChange={e => setMarketArea(e.target.value)} placeholder="Northern Virginia, DC Metro" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#e85d26] outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#555] mb-2">Additional Context <span className="text-[#666] font-normal">(optional)</span></label>
                <textarea value={additionalContext} onChange={e => setAdditionalContext(e.target.value)} placeholder="Any specific details, value props, or talking points to include..." rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#e85d26] outline-none resize-none" />
              </div>
            </div>
            <button onClick={handleGenerate} disabled={loading} className="mt-6 w-full py-4 bg-[#e85d26] text-white font-bold rounded-xl hover:bg-[#c44a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg">
              {loading ? '⏳ Generating Campaign...' : '✨ Generate Drip Campaign'}
            </button>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
          )}

          {messages.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-[#2a2a2a]">Your {messages.length}-Message Campaign</h3>
              {messages.map((msg, i) => (
                <div key={i} className="bg-[#e8e6e1] border border-[#e0dcd4] rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#f0ece4] text-[#c44a1a] font-bold text-sm">{i + 1}</span>
                      <div>
                        <span className="text-sm font-semibold text-[#2a2a2a]">{msg.day}</span>
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[#f5f0ea] text-[#666]">{msg.channel}</span>
                      </div>
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
              ))}
            </div>
          )}
        </main>
      </PaywallGate>
    </div>
  );
}
