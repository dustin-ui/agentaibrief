'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { AI_TOOLS, CATEGORY_LABELS, type AITool } from '@/lib/ai-tools';
import { PaywallGate } from '@/components/PaywallGate';

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
    <div className="min-h-screen bg-[#e8e6e1]">
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <h1 className="text-2xl font-bold text-[#2a2a2a]">Agent<span className="text-[#e85d26]">AI</span>Brief</h1>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-sm text-[#666] hover:text-[#2a2a2a]">News</Link>
            <Link href="/blog" className="text-sm text-[#666] hover:text-[#2a2a2a]">Blog</Link>
            <Link href="/tools" className="text-sm text-[#2a2a2a] font-medium border-b-2 border-[#e85d26] pb-0.5">AI Tools</Link>
            <Link href="/prompts" className="text-sm text-[#666] hover:text-[#2a2a2a]">Prompts</Link>
            <Link href="/videos" className="text-sm text-[#666] hover:text-[#2a2a2a]">Video Library</Link>
            <Link href="/subscribe" className="text-sm text-[#666] hover:text-[#2a2a2a]">Subscribe</Link>
          </nav>
        </div>
      </header>

      <PaywallGate requiredTier="pro" featureName="AI Tools Directory">
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h2 className="text-4xl font-extrabold text-[#2a2a2a] mb-3">AI Tools Directory</h2>
          <p className="text-lg text-[#666]">The best AI tools for real estate agents — tested and reviewed by Dustin Fox.</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search tools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#e85d26] focus:border-[#e85d26] outline-none"
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
                  category === cat ? 'bg-[#e85d26] text-white' : 'bg-[#f5f0ea] text-[#555] hover:bg-gray-200'
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
          <p className="text-center text-[#888] py-12">No tools found. Try a different search or category.</p>
        )}

        <div className="mt-16 bg-[#f5f0ea] border border-[#e0dcd4] rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-[#2a2a2a] mb-3">Want Tool Reviews in Your Inbox?</h3>
          <p className="text-[#666] mb-6">We test AI tools so you don&apos;t have to. Get our picks delivered daily.</p>
          <a href="/subscribe" className="inline-flex px-6 py-3 bg-[#e85d26] text-white font-semibold rounded-lg hover:bg-[#c44a1a] transition-colors">
            Subscribe Free →
          </a>
        </div>
      </main>
      </PaywallGate>

      <footer className="border-t border-[#e0dcd4] mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-sm text-[#888] text-center">© 2026 AgentAIBrief.com • Built for real estate professionals</p>
        </div>
      </footer>
    </div>
  );
}

function ToolCard({ tool, isDustinsPick }: { tool: AITool; isDustinsPick: boolean }) {
  return (
    <a href={tool.affiliateUrl || tool.url} target="_blank" rel="noopener noreferrer"
      className="block border border-[#e0dcd4] rounded-xl p-5 hover:border-[#e85d26] hover:shadow-md transition-all relative">
      {isDustinsPick && (
        <span className="absolute -top-2.5 right-3 bg-amber-400 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-sm">
          ⭐ Dustin&apos;s Pick
        </span>
      )}
      {tool.badge && !isDustinsPick && (
        <span className="absolute -top-2.5 right-3 bg-[#f0ece4] text-[#c44a1a] text-xs font-bold px-2.5 py-0.5 rounded-full">
          {tool.badge}
        </span>
      )}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-[#2a2a2a]">{tool.name}</h3>
        <span className="text-xs text-[#888] bg-[#f5f0ea] px-2 py-0.5 rounded capitalize">
          {CATEGORY_LABELS[tool.category]?.emoji} {CATEGORY_LABELS[tool.category]?.label || tool.category}
        </span>
      </div>
      <p className="text-sm text-[#666] mb-3 line-clamp-2">{tool.tagline}</p>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#2a2a2a]">{tool.pricing}</span>
        <div className="flex items-center gap-1">
          <span className="text-yellow-500 text-sm">★</span>
          <span className="text-sm text-[#555] font-medium">{tool.rating}</span>
        </div>
      </div>
    </a>
  );
}
