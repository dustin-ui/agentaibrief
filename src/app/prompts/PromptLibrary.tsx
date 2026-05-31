'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { PROMPT_CATEGORIES, AI_TOOL_COLORS } from '@/lib/prompts-data';
import type { Prompt, AiTool } from '@/lib/prompts-data';

const AI_TOOLS: AiTool[] = ['ChatGPT', 'Claude', 'Gemini', 'Perplexity'];

function PromptCard({ prompt }: { prompt: Prompt }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const filledPrompt = useMemo(() => {
    let text = prompt.fullPrompt;
    for (const v of prompt.variables) {
      text = text.replaceAll(`[${v.key}]`, fieldValues[v.key] || `[${v.key}]`);
    }
    return text;
  }, [prompt, fieldValues]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(filledPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filledCount = prompt.variables.filter(v => fieldValues[v.key]?.trim()).length;

  return (
    <div className="border border-[#e0dcd4] rounded-xl overflow-hidden hover:border-[#e85d26]/50 transition-all bg-[#f0ece4]/50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-5 flex items-start justify-between gap-4"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs bg-[#f0ece4] text-[#666] px-2.5 py-1 rounded-full font-medium">{prompt.category}</span>
            {prompt.isFree ? (
              <span className="text-xs bg-emerald-900/50 text-emerald-400 border border-emerald-700/50 px-2.5 py-1 rounded-full font-medium">Free</span>
            ) : (
              <span className="text-xs bg-amber-900/40 text-amber-400 border border-amber-600/40 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
                Pro
              </span>
            )}
            {prompt.aiTools.map(tool => (
              <span key={tool} className={`text-xs px-2 py-0.5 rounded-full border font-medium ${AI_TOOL_COLORS[tool]}`}>
                {tool}
              </span>
            ))}
          </div>
          <h3 className="font-bold text-[#2a2a2a] text-lg">{prompt.title}</h3>
          <p className="text-sm text-[#666] mt-1">{prompt.preview}</p>
        </div>
        <svg className={`w-5 h-5 text-[#888] flex-shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {isExpanded && (
        <div className="border-t border-[#e0dcd4] p-5">
          {prompt.isFree ? (
            <>
              {/* Fill-in Fields */}
              {prompt.variables.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-[#e85d26]">
                      ✏️ Fill in your details ({filledCount}/{prompt.variables.length})
                    </h4>
                    {filledCount > 0 && (
                      <button onClick={() => setFieldValues({})} className="text-xs text-[#888] hover:text-[#555]">Clear all</button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {prompt.variables.map(v => (
                      <div key={v.key}>
                        <label className="text-xs text-[#666] mb-1 block">{v.label}</label>
                        <input
                          type="text"
                          placeholder={v.placeholder}
                          value={fieldValues[v.key] || ''}
                          onChange={e => setFieldValues(prev => ({ ...prev, [v.key]: e.target.value }))}
                          className="w-full bg-[#f0ece4] border border-[#d8d4cc] rounded-lg px-3 py-2 text-sm text-[#2a2a2a] placeholder-gray-600 focus:border-[#e85d26] focus:outline-none focus:ring-1 focus:ring-[#e85d26]/50 transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prompt Text */}
              <pre className="whitespace-pre-wrap text-sm text-[#555] font-mono bg-[#e8e6e1] border border-[#e0dcd4] rounded-lg p-4 mb-4 max-h-96 overflow-y-auto leading-relaxed">
                {filledPrompt}
              </pre>

              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e85d26] text-white text-sm font-semibold rounded-lg hover:bg-[#2d9db5] transition-colors"
              >
                {copied ? (
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
              <div className="whitespace-pre-wrap text-sm text-[#888] font-mono bg-[#e8e6e1] border border-[#e0dcd4] rounded-lg p-4 max-h-40 overflow-hidden blur-sm select-none pointer-events-none">
                {prompt.fullPrompt.slice(0, 500)}
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-[#f0ece4]/80 rounded-lg backdrop-blur-sm">
                <div className="text-center px-6">
                  <div className="text-4xl mb-3">🔒</div>
                  <p className="font-bold text-[#2a2a2a] text-lg mb-1">Inner Circle Prompt</p>
                  <p className="text-sm text-[#666] mb-5">Join the Inner Circle to unlock all prompts</p>
                  <Link href="/subscribe" className="inline-flex px-6 py-2.5 bg-[#e85d26] text-white text-sm font-semibold rounded-lg hover:bg-[#2d9db5] transition-colors">
                    Unlock All Prompts →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PromptLibrary({ prompts }: { prompts: Prompt[] }) {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [toolFilter, setToolFilter] = useState<AiTool | null>(null);
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  const filtered = useMemo(() => {
    let results = prompts;
    if (category !== 'All') results = results.filter(p => p.category === category);
    if (toolFilter) results = results.filter(p => p.aiTools.includes(toolFilter));
    if (showFreeOnly) results = results.filter(p => p.isFree);
    if (search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.preview.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return results;
  }, [category, search, toolFilter, showFreeOnly, prompts]);

  return (
    <>
      {/* Search & Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search prompts... (e.g., listing, email, TikTok, expired)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#f0ece4] border border-[#e0dcd4] rounded-xl pl-12 pr-4 py-3.5 text-[#2a2a2a] placeholder-gray-600 focus:border-[#e85d26] focus:outline-none focus:ring-1 focus:ring-[#e85d26]/50 transition-colors"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {PROMPT_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat
                  ? 'bg-[#e85d26] text-white'
                  : 'bg-[#f0ece4] text-[#666] hover:bg-[#f0ece4] hover:text-[#2a2a2a] border border-[#e0dcd4]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary filters */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-[#888] uppercase tracking-wide">Filter:</span>
          <button
            onClick={() => setShowFreeOnly(!showFreeOnly)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              showFreeOnly ? 'bg-emerald-900/50 text-emerald-400 border-emerald-700/50' : 'text-[#888] border-[#e0dcd4] hover:text-[#555]'
            }`}
          >
            Free Only
          </button>
          {AI_TOOLS.map(tool => (
            <button
              key={tool}
              onClick={() => setToolFilter(toolFilter === tool ? null : tool)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                toolFilter === tool ? AI_TOOL_COLORS[tool] : 'text-[#888] border-[#e0dcd4] hover:text-[#555]'
              }`}
            >
              {tool}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-[#888] mb-4">
        Showing {filtered.length} of {prompts.length} prompts
      </p>

      {/* Prompts */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-[#888]">
            <p className="text-2xl mb-2">🔍</p>
            <p>No prompts match your filters. Try adjusting your search.</p>
          </div>
        ) : (
          filtered.map(prompt => <PromptCard key={prompt.id} prompt={prompt} />)
        )}
      </div>
    </>
  );
}
