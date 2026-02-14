'use client';

import { useState } from 'react';
import { AI_TOOLS, CATEGORY_LABELS, getFeaturedTools, type AITool } from '@/lib/ai-tools';

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`text-xs ${i < full ? 'text-yellow-400' : i === full && half ? 'text-yellow-300' : 'text-[#555]'}`}>
          ★
        </span>
      ))}
      <span className="text-xs text-[#888] ml-1">{rating}</span>
    </div>
  );
}

function ToolCard({ tool, compact = false }: { tool: AITool; compact?: boolean }) {
  const linkUrl = tool.affiliateUrl || tool.url;

  if (compact) {
    return (
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 rounded-lg border border-[#e0dcd4] hover:border-[#e85d26] hover:shadow-sm transition-all group"
      >
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-[#2a2a2a] font-bold text-sm shrink-0">
          {tool.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-[#2a2a2a] group-hover:text-[#e85d26] transition-colors">
              {tool.name}
            </span>
            {tool.badge && (
              <span className="text-[10px] bg-[#f0ece4] text-[#c44a1a] px-1.5 py-0.5 rounded font-medium">
                {tool.badge}
              </span>
            )}
          </div>
          <p className="text-xs text-[#888] truncate">{tool.tagline}</p>
        </div>
        <span className="text-xs text-[#666] whitespace-nowrap shrink-0">{tool.pricing}</span>
      </a>
    );
  }

  return (
    <a
      href={linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 rounded-xl border border-[#e0dcd4] hover:border-[#e85d26] hover:shadow-md transition-all group bg-[#e8e6e1]"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-[#2a2a2a] font-bold text-lg shrink-0">
            {tool.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-[#2a2a2a] group-hover:text-[#e85d26] transition-colors">
                {tool.name}
              </h4>
              {tool.badge && (
                <span className="text-[10px] bg-[#f0ece4] text-[#c44a1a] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
                  {tool.badge}
                </span>
              )}
            </div>
            <StarRating rating={tool.rating} />
          </div>
        </div>
        <span className="text-sm font-semibold text-[#e85d26] whitespace-nowrap">{tool.pricing}</span>
      </div>
      <p className="text-sm text-[#666] leading-relaxed">{tool.tagline}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-[#666]">
          {CATEGORY_LABELS[tool.category]?.emoji} {CATEGORY_LABELS[tool.category]?.label}
        </span>
        <span className="text-xs text-[#e85d26] group-hover:underline font-medium">
          Learn more →
        </span>
      </div>
    </a>
  );
}

interface AIToolsSectionProps {
  isPremium?: boolean;
}

export function AIToolsSection({ isPremium = false }: AIToolsSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showAll, setShowAll] = useState(false);

  const featured = getFeaturedTools();
  const categories = Object.entries(CATEGORY_LABELS);

  const filteredTools = activeCategory === 'all'
    ? AI_TOOLS
    : AI_TOOLS.filter(t => t.category === activeCategory);

  const displayTools = showAll ? filteredTools : filteredTools.slice(0, 8);

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-orange-500 text-[#2a2a2a] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              🛠️ AI Tools Directory
            </span>
            <span className="text-xs text-[#666]">Updated weekly</span>
          </div>
          <h2 className="text-xl font-bold text-[#2a2a2a]">
            Top AI Tools for Real Estate Agents
          </h2>
          <p className="text-sm text-[#888]">
            The tools top-producing agents are using right now to win more deals.
          </p>
        </div>
      </div>

      {/* Featured Tools - Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {featured.slice(0, 3).map(tool => (
          <ToolCard key={tool.name} tool={tool} />
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => { setActiveCategory('all'); setShowAll(false); }}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
            activeCategory === 'all'
              ? 'bg-[#f0ece4] text-[#2a2a2a]'
              : 'bg-[#f5f0ea] text-[#666] hover:bg-gray-200'
          }`}
        >
          All Tools
        </button>
        {categories.map(([key, { label, emoji }]) => (
          <button
            key={key}
            onClick={() => { setActiveCategory(key); setShowAll(false); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === key
                ? 'bg-[#f0ece4] text-[#2a2a2a]'
                : 'bg-[#f5f0ea] text-[#666] hover:bg-gray-200'
            }`}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      {/* Tool List */}
      <div className="space-y-2">
        {displayTools.map(tool => (
          <ToolCard key={tool.name} tool={tool} compact />
        ))}
      </div>

      {/* Show More */}
      {filteredTools.length > 8 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-4 w-full py-2 text-sm text-[#e85d26] hover:text-[#c44a1a] font-medium hover:bg-[#f5f0ea] rounded-lg transition-colors"
        >
          Show all {filteredTools.length} tools →
        </button>
      )}

      {/* Affiliate Disclosure */}
      <p className="mt-4 text-[11px] text-[#666] text-center">
        Some links may be affiliate links. We only recommend tools we&apos;ve tested and trust.
      </p>
    </div>
  );
}
