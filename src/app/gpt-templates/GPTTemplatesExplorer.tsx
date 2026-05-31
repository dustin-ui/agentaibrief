'use client';

import { useState, useMemo } from 'react';
import {
  TEMPLATES,
  CATEGORIES,
  platformColors,
  categoryIcons,
  type GPTTemplate,
} from './gpt-templates-data';

export function GPTTemplatesExplorer() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = TEMPLATES;
    if (category !== 'All') list = list.filter((t) => t.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      );
    }
    return list;
  }, [search, category]);

  const handleCopy = async (tpl: GPTTemplate) => {
    await navigator.clipboard.writeText(tpl.systemPrompt);
    setCopied(tpl.id);
    setTimeout(() => setCopied(null), 2500);
  };

  return (
    <>
      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-2.5 rounded-lg bg-[#f0ece4] border border-[#d8d4cc] text-[#2a2a2a] placeholder-gray-500 focus:outline-none focus:border-[#e85d26] focus:ring-1 focus:ring-[#e85d26] transition-colors"
        />
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              category === cat
                ? 'bg-[#e85d26] text-white'
                : 'bg-[#f0ece4] text-[#666] hover:bg-[#d8d4cc] hover:text-[#2a2a2a]'
            }`}
          >
            {cat !== 'All' && `${categoryIcons[cat] || ''} `}
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-[#888] mb-6">
        {filtered.length} template{filtered.length !== 1 && 's'}
        {category !== 'All' && ` in ${category}`}
        {search.trim() && ` matching "${search}"`}
      </p>

      {/* Template Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((tpl) => {
          const isExpanded = expanded === tpl.id;
          const isLocked = !tpl.isFree;

          return (
            <div
              key={tpl.id}
              className={`rounded-xl border transition-all ${
                isExpanded
                  ? 'border-[#e85d26]/50 bg-[#f0ece4] md:col-span-2'
                  : 'border-[#e0dcd4] bg-[#f0ece4]/60 hover:border-gray-600'
              }`}
            >
              {/* Card Header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : tpl.id)}
                className="w-full text-left p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs bg-[#f0ece4] text-[#666] px-2 py-0.5 rounded-full font-medium">
                        {categoryIcons[tpl.category] || ''} {tpl.category}
                      </span>
                      {tpl.isFree ? (
                        <span className="text-xs bg-green-50 text-green-800 px-2 py-0.5 rounded-full font-medium">
                          Free
                        </span>
                      ) : (
                        <span className="text-xs bg-amber-900/60 text-amber-400 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          🔒 Inner Circle
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-[#2a2a2a] text-lg">{tpl.name}</h3>
                    <p className="text-sm text-[#666] mt-1">{tpl.description}</p>
                    {/* Platforms */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {tpl.platforms.map((p) => (
                        <span
                          key={p}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${platformColors[p] || 'bg-[#f0ece4] text-[#666]'}`}
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-[#888] flex-shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-[#e0dcd4] p-5">
                  {/* Conversation Starters */}
                  <div className="mb-5">
                    <h4 className="text-sm font-semibold text-[#e85d26] uppercase tracking-wider mb-2">
                      Conversation Starters
                    </h4>
                    <ul className="space-y-1.5">
                      {tpl.conversationStarters.map((s, i) => (
                        <li key={i} className="text-sm text-[#666] flex items-start gap-2">
                          <span className="text-[#e85d26] mt-0.5">→</span> {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* System Prompt */}
                  {isLocked ? (
                    <div className="relative">
                      <pre className="whitespace-pre-wrap text-sm text-[#888] font-mono bg-[#e8e6e1] border border-[#e0dcd4] rounded-lg p-4 max-h-40 overflow-hidden blur-sm select-none">
                        {tpl.systemPrompt}
                      </pre>
                      <div className="absolute inset-0 flex items-center justify-center bg-[#e8e6e1]/80 rounded-lg">
                        <div className="text-center">
                          <div className="text-3xl mb-2">🔒</div>
                          <p className="font-semibold text-[#2a2a2a] mb-2">Inner Circle Template</p>
                          <p className="text-sm text-[#666] mb-4">
                            Join the Inner Circle to unlock all 16 GPT templates
                          </p>
                          <a
                            href="/subscribe"
                            className="inline-flex px-5 py-2.5 bg-[#e85d26] text-white text-sm font-semibold rounded-lg hover:bg-[#c44a1a] transition-colors"
                          >
                            Unlock All Templates →
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h4 className="text-sm font-semibold text-[#e85d26] uppercase tracking-wider mb-2">
                        System Prompt / Instructions
                      </h4>
                      <pre className="whitespace-pre-wrap text-sm text-[#555] font-mono bg-[#e8e6e1] border border-[#e0dcd4] rounded-lg p-4 mb-4 max-h-96 overflow-y-auto">
                        {tpl.systemPrompt}
                      </pre>
                      <button
                        onClick={() => handleCopy(tpl)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#e85d26] text-white text-sm font-semibold rounded-lg hover:bg-[#c44a1a] transition-colors"
                      >
                        {copied === tpl.id ? (
                          <>✓ Copied!</>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                            </svg>
                            Copy Instructions
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#888] text-lg">No templates found. Try a different search or category.</p>
        </div>
      )}
    </>
  );
}
