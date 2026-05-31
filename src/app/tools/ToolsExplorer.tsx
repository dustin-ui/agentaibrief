'use client';

import { useState, useMemo } from 'react';
import { CATEGORY_LABELS, type AITool } from '@/lib/ai-tools';

const DUSTINS_PICKS = ['Apply Design AI', 'ChatGPT', 'HeyGen', 'Canva AI', 'HouseCanary', 'Claude'];

const FILTER_CATEGORIES = ['All', 'staging', 'writing', 'video', 'analytics', 'marketing', 'crm', 'chatbot', 'photography'];

export function ToolsExplorer({ tools }: { tools: AITool[] }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    let list = tools;
    if (category !== 'All') list = list.filter((t) => t.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => {
      const aP = DUSTINS_PICKS.includes(a.name) ? 0 : 1;
      const bP = DUSTINS_PICKS.includes(b.name) ? 0 : 1;
      return aP - bP || b.rating - a.rating;
    });
  }, [search, category, tools]);

  return (
    <>
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
    </>
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
