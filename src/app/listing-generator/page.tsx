'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PaywallGate } from '@/components/PaywallGate';

const TARGET_BUYERS = [
  'General / All Buyers',
  'First-Time Home Buyers',
  'Move-Up Buyers',
  'Downsizers / Empty Nesters',
  'Luxury Buyers',
  'Investors',
  'Military / VA Buyers',
  'Young Professionals',
  'Families with Kids',
  'Retirees',
];

const SECTION_META: Record<string, { label: string; icon: string }> = {
  mlsDescription: { label: 'MLS Listing Description', icon: '📝' },
  emailBlast: { label: 'Email Blast (HTML)', icon: '📧' },
  instagramCaption: { label: 'Instagram Caption', icon: '📸' },
  facebookPost: { label: 'Facebook Post', icon: '👍' },
  tiktokScript: { label: 'TikTok / Reels Script (60s)', icon: '🎵' },
  linkedinPost: { label: 'LinkedIn Post', icon: '💼' },
  twitterPost: { label: 'X / Twitter Post', icon: '𝕏' },
  walkthroughScript: { label: 'Video Walkthrough Script (2 min)', icon: '🎬' },
  schemaMarkup: { label: 'Schema Markup (JSON-LD)', icon: '🔧' },
};

const SECTION_ORDER = [
  'mlsDescription', 'emailBlast', 'instagramCaption', 'facebookPost',
  'tiktokScript', 'linkedinPost', 'twitterPost', 'walkthroughScript', 'schemaMarkup',
];

const LOADING_MESSAGES = [
  'Crafting your MLS description...',
  'Writing compelling copy...',
  'Generating social media content...',
  'Creating video scripts...',
  'Building schema markup...',
  'Almost done...',
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1 text-xs rounded border border-[#d8d4cc] hover:border-[#e85d26] hover:text-[#e85d26] text-[#888] transition shrink-0"
    >
      {copied ? '✓ Copied!' : 'Copy'}
    </button>
  );
}

export default function ListingGeneratorPage() {
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [beds, setBeds] = useState('');
  const [baths, setBaths] = useState('');
  const [sqft, setSqft] = useState('');
  const [keyFeatures, setKeyFeatures] = useState('');
  const [targetBuyer, setTargetBuyer] = useState(TARGET_BUYERS[0]);
  const [agentName, setAgentName] = useState('');
  const [agentPhone, setAgentPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sections, setSections] = useState<Record<string, string>>({});
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx(i => (i + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  const generate = async () => {
    if (!address.trim() || !price.trim()) return;
    setLoading(true);
    setError('');
    setSections({});
    setLoadingProgress(5);
    setLoadingMsg('');

    try {
      const res = await fetch('/api/listing-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, price, beds, baths, sqft, keyFeatures, targetBuyer, agentName, agentPhone }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || 'Request failed');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

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
              setLoadingMsg(parsed.msg || '');
            } else if (eventType === 'partial') {
              setSections(prev => ({ ...prev, ...parsed.sections }));
            } else if (eventType === 'done') {
              setSections(parsed.sections);
              setLoadingProgress(100);
            } else if (eventType === 'error') {
              throw new Error(parsed.error);
            }
          } catch (e) {
            if (e instanceof Error && e.message.startsWith('Generation failed')) throw e;
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  };

  const hasSections = Object.keys(sections).length > 0;

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
            <Link href="/content-briefing" className="text-[#666] hover:text-[#2a2a2a]">Content Briefing</Link>
            <span className="text-[#e85d26] font-semibold">Listing Generator</span>
          </nav>
        </div>
      </header>

      <PaywallGate requiredTier="inner_circle" featureName="Listing Content Generator">
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="inline-block px-3 py-1 bg-[#e85d26]/10 border border-[#e85d26]/30 rounded-full text-[#e85d26] text-xs font-medium mb-4">
              INNER CIRCLE FEATURE
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              Listing Content <span className="text-[#e85d26]">Factory</span>
            </h1>
            <p className="text-[#666] max-w-lg mx-auto">
              One click generates your MLS description, email blast, social media posts, video scripts, and schema markup — all from a single listing.
            </p>
          </div>

          {/* Input Form */}
          <div className="max-w-2xl mx-auto bg-[#f0ece4] border border-[#e0dcd4] rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="sm:col-span-2">
                <label className="block text-sm text-[#666] mb-1">Property Address *</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="123 Main St, Arlington, VA 22201"
                  className="w-full px-4 py-3 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:outline-none focus:border-[#e85d26]" />
              </div>
              <div>
                <label className="block text-sm text-[#666] mb-1">List Price *</label>
                <input type="text" value={price} onChange={e => setPrice(e.target.value)}
                  placeholder="$750,000"
                  className="w-full px-4 py-3 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:outline-none focus:border-[#e85d26]" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-sm text-[#666] mb-1">Beds</label>
                  <input type="text" value={beds} onChange={e => setBeds(e.target.value)} placeholder="4"
                    className="w-full px-3 py-3 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:outline-none focus:border-[#e85d26] text-center" />
                </div>
                <div>
                  <label className="block text-sm text-[#666] mb-1">Baths</label>
                  <input type="text" value={baths} onChange={e => setBaths(e.target.value)} placeholder="3"
                    className="w-full px-3 py-3 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:outline-none focus:border-[#e85d26] text-center" />
                </div>
                <div>
                  <label className="block text-sm text-[#666] mb-1">SqFt</label>
                  <input type="text" value={sqft} onChange={e => setSqft(e.target.value)} placeholder="2,400"
                    className="w-full px-3 py-3 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:outline-none focus:border-[#e85d26] text-center" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-[#666] mb-1">Key Features</label>
                <textarea value={keyFeatures} onChange={e => setKeyFeatures(e.target.value)}
                  placeholder="Renovated kitchen, hardwood floors, fenced yard, walk to Metro..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:outline-none focus:border-[#e85d26] resize-none" />
              </div>
              <div>
                <label className="block text-sm text-[#666] mb-1">Target Buyer</label>
                <select value={targetBuyer} onChange={e => setTargetBuyer(e.target.value)}
                  className="w-full px-4 py-3 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] focus:outline-none focus:border-[#e85d26] appearance-none cursor-pointer">
                  {TARGET_BUYERS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#666] mb-1">Agent Name</label>
                <input type="text" value={agentName} onChange={e => setAgentName(e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-4 py-3 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:outline-none focus:border-[#e85d26]" />
              </div>
              <div className="sm:col-span-2 sm:max-w-[50%]">
                <label className="block text-sm text-[#666] mb-1">Agent Phone</label>
                <input type="text" value={agentPhone} onChange={e => setAgentPhone(e.target.value)}
                  placeholder="(703) 555-1234"
                  className="w-full px-4 py-3 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:outline-none focus:border-[#e85d26]" />
              </div>
            </div>

            <button
              onClick={generate}
              disabled={!address.trim() || !price.trim() || loading}
              className="w-full py-3 bg-[#e85d26] text-white font-bold rounded-lg hover:bg-[#e85d26]/80 transition disabled:opacity-40 disabled:cursor-not-allowed text-lg"
            >
              🚀 Generate All Content
            </button>
            <p className="text-xs text-[#888] text-center mt-2">⏱ Takes about 30-60 seconds. Don&apos;t leave the page.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="max-w-2xl mx-auto mb-8 bg-red-50 border border-red-300 rounded-lg p-4 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Results */}
          {hasSections && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold">Content for <span className="text-[#e85d26]">{address}</span></h2>
                <p className="text-sm text-[#888] mt-1">{SECTION_ORDER.filter(k => sections[k]).length} of 9 sections generated</p>
              </div>

              {SECTION_ORDER.map(key => {
                const content = sections[key];
                if (!content) return null;
                const meta = SECTION_META[key];
                const isCode = key === 'schemaMarkup' || key === 'emailBlast';

                return (
                  <div key={key} className="bg-[#f0ece4] border border-[#e0dcd4] rounded-xl p-6 hover:border-[#d8d4cc] transition">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold">
                        <span className="mr-2">{meta.icon}</span>
                        {meta.label}
                      </h3>
                      <CopyButton text={content} />
                    </div>
                    {isCode ? (
                      <pre className="bg-[#f0ece4]/50 rounded-lg p-4 text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                        {content}
                      </pre>
                    ) : (
                      <div className="bg-[#f0ece4]/50 rounded-lg p-4 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {content}
                      </div>
                    )}
                  </div>
                );
              })}
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
              {loadingMsg || LOADING_MESSAGES[loadingMsgIdx]}
            </p>
            <p className="text-sm text-[#888] mb-6">{address}</p>
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
