'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { AI_TOOLS, CATEGORY_LABELS, type AITool } from '@/lib/ai-tools';

const DUSTINS_PICKS = ['Apply Design AI', 'ChatGPT', 'HeyGen', 'Canva AI', 'HouseCanary', 'Claude'];

const FILTER_CATEGORIES = ['All', 'staging', 'writing', 'video', 'analytics', 'marketing', 'crm', 'chatbot', 'photography'];

export default function ToolsDirectory() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    let tools = AI_TOOLS;
    if (category !== 'All') tools = tools.filter((t) => t.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      tools = tools.filter((t) => t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    }
    return tools.sort((a, b) => {
      const aP = DUSTINS_PICKS.includes(a.name) ? 0 : 1;
      const bP = DUSTINS_PICKS.includes(b.name) ? 0 : 1;
      return aP - bP || b.rating - a.rating;
    });
  }, [search, category]);

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
            <Link href="/tools" className="text-sm text-gray-900 font-medium border-b-2 border-blue-600 pb-0.5">AI Tools</Link>
            <Link href="/prompts" className="text-sm text-gray-600 hover:text-gray-900">Prompts</Link>
            <Link href="/videos" className="text-sm text-gray-600 hover:text-gray-900">Video Library</Link>
            <Link href="/subscribe" className="text-sm text-gray-600 hover:text-gray-900">Subscribe</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-3">AI Tools Directory</h2>
          <p className="text-lg text-gray-600">The best AI tools for real estate agents — tested and reviewed by Dustin Fox.</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {FILTER_CATEGORIES.map((cat) => {
            const label = cat === 'All' ? 'All Tools' : `${CATEGORY_LABELS[cat]?.emoji || ''} ${CATEGORY_LABELS[cat]?.label || cat}`;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  category === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Tools Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => (
            <ToolCard key={tool.name} tool={tool} isDustinsPick={DUSTINS_PICKS.includes(tool.name)} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-12">No tools found. Try a different search or category.</p>
        )}

        <div className="mt-16 bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Want Tool Reviews in Your Inbox?</h3>
          <p className="text-gray-600 mb-6">We test AI tools so you don&apos;t have to. Get our picks delivered daily.</p>
          <a href="/subscribe" className="inline-flex px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Subscribe Free →
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

function ToolCard({ tool, isDustinsPick }: { tool: AITool; isDustinsPick: boolean }) {
  return (
    <a href={tool.affiliateUrl || tool.url} target="_blank" rel="noopener noreferrer"
      className="block border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all relative">
      {isDustinsPick && (
        <span className="absolute -top-2.5 right-3 bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
          ⭐ Dustin&apos;s Pick
        </span>
      )}
      {tool.badge && !isDustinsPick && (
        <span className="absolute -top-2.5 right-3 bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
          {tool.badge}
        </span>
      )}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-gray-900">{tool.name}</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded capitalize">
          {CATEGORY_LABELS[tool.category]?.emoji} {CATEGORY_LABELS[tool.category]?.label || tool.category}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tool.tagline}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-900">{tool.pricing}</span>
        <div className="flex items-center gap-1">
          <span className="text-yellow-500 text-sm">★</span>
          <span className="text-sm text-gray-700 font-medium">{tool.rating}</span>
        </div>
      </div>
    </a>
  );
}
