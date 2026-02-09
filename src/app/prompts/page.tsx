'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PROMPTS, PROMPT_CATEGORIES } from '@/lib/prompts-data';

export default function PromptLibrary() {
  const [category, setCategory] = useState('All');
  const [copied, setCopied] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (category === 'All') return PROMPTS;
    return PROMPTS.filter((p) => p.category === category);
  }, [category]);

  const handleCopy = async (prompt: typeof PROMPTS[0]) => {
    if (!prompt.isFree) return;
    await navigator.clipboard.writeText(prompt.fullPrompt);
    setCopied(prompt.id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-gray-900">Agent<span className="text-blue-600">AI</span>Brief</h1>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">News</Link>
            <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900">Blog</Link>
            <Link href="/tools" className="text-sm text-gray-600 hover:text-gray-900">AI Tools</Link>
            <Link href="/prompts" className="text-sm text-gray-900 font-medium border-b-2 border-blue-600 pb-0.5">Prompts</Link>
            <Link href="/videos" className="text-sm text-gray-600 hover:text-gray-900">Video Library</Link>
            <Link href="/subscribe" className="text-sm text-gray-600 hover:text-gray-900">Subscribe</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Prompt Library</h2>
          <p className="text-lg text-gray-600">
            Copy-paste AI prompts built for real estate agents. Free prompts available — unlock all with Pro.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {PROMPT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Prompts */}
        <div className="space-y-4">
          {filtered.map((prompt) => {
            const isExpanded = expanded === prompt.id;
            return (
              <div key={prompt.id} className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-200 transition-colors">
                <button
                  onClick={() => setExpanded(isExpanded ? null : prompt.id)}
                  className="w-full text-left p-5 flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{prompt.category}</span>
                      {!prompt.isFree && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          🔒 Pro
                        </span>
                      )}
                      {prompt.isFree && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Free</span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900">{prompt.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{prompt.preview}</p>
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 flex-shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200 p-5 bg-gray-50">
                    {prompt.isFree ? (
                      <>
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono bg-white border border-gray-200 rounded-lg p-4 mb-4 max-h-80 overflow-y-auto">
                          {prompt.fullPrompt}
                        </pre>
                        <button
                          onClick={() => handleCopy(prompt)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {copied === prompt.id ? (
                            <>✓ Copied!</>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                              </svg>
                              Copy Prompt
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <div className="relative">
                        <div className="whitespace-pre-wrap text-sm text-gray-800 font-mono bg-white border border-gray-200 rounded-lg p-4 max-h-40 overflow-hidden blur-sm select-none">
                          {prompt.fullPrompt}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                          <div className="text-center">
                            <div className="text-3xl mb-2">🔒</div>
                            <p className="font-semibold text-gray-900 mb-2">Pro Prompt</p>
                            <p className="text-sm text-gray-600 mb-4">Upgrade to Pro to unlock all 20+ prompts</p>
                            <a href="/subscribe" className="inline-flex px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                              Get Pro for Full Access →
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">Unlock Every Prompt + Daily AI Briefings</h3>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            Pro members get access to all prompts, premium tool reviews, and daily Agent Angles delivered to their inbox.
          </p>
          <a href="/subscribe" className="inline-flex px-6 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
            Get Pro Access →
          </a>
        </div>
      </main>

      <footer className="border-t border-gray-200 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-sm text-gray-500 text-center">© 2026 AgentAIBrief.com • Built for real estate professionals</p>
        </div>
      </footer>
    </div>
  );
}
