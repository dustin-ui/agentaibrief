'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PaywallGate } from '@/components/PaywallGate';

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="px-4 py-2 text-sm rounded-lg border border-[#d8d4cc] hover:border-[#e85d26] hover:text-[#e85d26] text-[#666] transition"
    >
      {copied ? '✓ Copied!' : label || '📋 Copy to Clipboard'}
    </button>
  );
}

export default function ListingDescriptionPage() {
  const [address, setAddress] = useState('');
  const [sqft, setSqft] = useState('');
  const [capitalImprovements, setCapitalImprovements] = useState('');
  const [subdivision, setSubdivision] = useState('');
  const [photoUrls, setPhotoUrls] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [description, setDescription] = useState('');
  const [charCount, setCharCount] = useState(0);

  const [postcardLoading, setPostcardLoading] = useState(false);
  const [postcardCopy, setPostcardCopy] = useState('');

  const canSubmit = address.trim() && sqft.trim() && subdivision.trim();

  const generate = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    setDescription('');
    setPostcardCopy('');

    try {
      const res = await fetch('/api/listing-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, sqft, capitalImprovements, subdivision, photoUrls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setDescription(data.description);
      setCharCount(data.characters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const generatePostcard = async () => {
    setPostcardLoading(true);
    try {
      const res = await fetch('/api/listing-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'postcard', previousDescription: description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setPostcardCopy(data.postcardCopy);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setPostcardLoading(false);
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
            <Link href="/listing-generator" className="text-[#666] hover:text-[#2a2a2a]">Content Factory</Link>
            <span className="text-[#e85d26] font-semibold">Listing Description</span>
          </nav>
        </div>
      </header>

      <PaywallGate requiredTier="inner_circle" featureName="AI Listing Description Generator">
        <section className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="inline-block px-3 py-1 bg-[#e85d26]/10 border border-[#e85d26]/30 rounded-full text-[#e85d26] text-xs font-medium mb-4">
              INNER CIRCLE FEATURE
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              AI Listing <span className="text-[#e85d26]">Description</span> Generator
            </h1>
            <p className="text-[#666] max-w-lg mx-auto">
              Generate a compelling, Fair Housing-compliant listing description (3,800–4,000 characters) with one click. Powered by the same prompts top producers use.
            </p>
          </div>

          {/* Input Form */}
          <div className="max-w-2xl mx-auto bg-[#f0ece4] border border-[#e0dcd4] rounded-xl p-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#666] mb-1">
                  Street Address <span className="text-[#666]">— internal use only, won&apos;t appear in description</span> *
                </label>
                <input
                  type="text" value={address} onChange={e => setAddress(e.target.value)}
                  placeholder="123 Main St, Arlington, VA 22201"
                  className="w-full px-4 py-3 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:outline-none focus:border-[#e85d26]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#666] mb-1">Total Finished Square Footage *</label>
                  <input
                    type="text" value={sqft} onChange={e => setSqft(e.target.value)}
                    placeholder="2,400"
                    className="w-full px-4 py-3 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:outline-none focus:border-[#e85d26]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#666] mb-1">Subdivision Name *</label>
                  <input
                    type="text" value={subdivision} onChange={e => setSubdivision(e.target.value)}
                    placeholder="Ashburn Village"
                    className="w-full px-4 py-3 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:outline-none focus:border-[#e85d26]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#666] mb-1">Capital Improvements with Years</label>
                <textarea
                  value={capitalImprovements} onChange={e => setCapitalImprovements(e.target.value)}
                  placeholder={"New roof (2023)\nKitchen renovation with quartz counters (2022)\nHVAC replaced (2021)\nHardwood floors refinished (2020)"}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:outline-none focus:border-[#e85d26] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-[#666] mb-1">Photo URLs <span className="text-[#666]">(optional, one per line)</span></label>
                <textarea
                  value={photoUrls} onChange={e => setPhotoUrls(e.target.value)}
                  placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
                  rows={2}
                  className="w-full px-4 py-3 bg-[#f0ece4] border border-[#d8d4cc] rounded-lg text-[#2a2a2a] placeholder-gray-500 focus:outline-none focus:border-[#e85d26] resize-none"
                />
              </div>
            </div>

            <button
              onClick={generate}
              disabled={!canSubmit || loading}
              className="w-full mt-6 py-3 bg-[#e85d26] text-white font-bold rounded-lg hover:bg-[#e85d26]/80 transition disabled:opacity-40 disabled:cursor-not-allowed text-lg"
            >
              {loading ? '✍️ Generating...' : '✨ Generate Listing Description'}
            </button>
            <p className="text-xs text-[#888] text-center mt-2">Takes about 15-30 seconds</p>
          </div>

          {/* Error */}
          {error && (
            <div className="max-w-2xl mx-auto mb-8 bg-red-50 border border-red-300 rounded-lg p-4 text-red-800 text-sm">
              {error}
            </div>
          )}

          {/* Result */}
          {description && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-[#f0ece4] border border-[#e0dcd4] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold">📝 Your Listing Description</h2>
                    <p className="text-sm text-[#888] mt-1">
                      <span className={charCount >= 3800 && charCount <= 4000 ? 'text-green-400' : 'text-yellow-400'}>
                        {charCount.toLocaleString()} characters
                      </span>
                      {' '}(target: 3,800–4,000)
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CopyButton text={description} />
                    <button
                      onClick={generate}
                      disabled={loading}
                      className="px-4 py-2 text-sm rounded-lg border border-[#d8d4cc] hover:border-[#e85d26] hover:text-[#e85d26] text-[#666] transition disabled:opacity-40"
                    >
                      🔄 Regenerate
                    </button>
                  </div>
                </div>
                <div className="bg-[#f0ece4]/50 rounded-lg p-6 text-gray-200 leading-relaxed whitespace-pre-wrap text-[15px]">
                  {description}
                </div>
              </div>

              {/* Postcard CTA */}
              {!postcardCopy && (
                <div className="bg-[#f0ece4] border border-[#e0dcd4] rounded-xl p-6 text-center">
                  <p className="text-[#555] mb-3">
                    🏠 Would you like a custom wide-landscape postcard featuring a headline styled to the era when the home was built?
                  </p>
                  <button
                    onClick={generatePostcard}
                    disabled={postcardLoading}
                    className="px-6 py-2.5 bg-[#e85d26]/20 border border-[#e85d26]/40 text-[#e85d26] font-semibold rounded-lg hover:bg-[#e85d26]/30 transition disabled:opacity-40"
                  >
                    {postcardLoading ? 'Generating Postcard Copy...' : '📬 Yes, Generate Postcard Copy'}
                  </button>
                </div>
              )}

              {/* Postcard Result */}
              {postcardCopy && (
                <div className="bg-[#f0ece4] border border-[#e0dcd4] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">📬 Postcard Copy</h2>
                    <CopyButton text={postcardCopy} />
                  </div>
                  <div className="bg-[#f0ece4]/50 rounded-lg p-6 text-gray-200 leading-relaxed whitespace-pre-wrap text-[15px]">
                    {postcardCopy}
                  </div>
                </div>
              )}
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
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 bg-[#e85d26] rounded-full animate-pulse" />
              </div>
            </div>
            <p className="text-lg font-semibold text-[#2a2a2a] mb-2">Crafting your listing description...</p>
            <p className="text-sm text-[#888]">Writing compelling, Fair Housing-compliant copy</p>
          </div>
        </div>
      )}
    </div>
  );
}
