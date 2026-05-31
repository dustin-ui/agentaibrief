import type { Metadata } from 'next';
import Link from 'next/link';
import { PROMPTS } from '@/lib/prompts-data';
import { PromptLibrary } from './PromptLibrary';

export const metadata: Metadata = {
  title: 'AI Prompt Library for Real Estate Agents',
  description:
    'Copy-paste AI prompts for real estate agents — listing descriptions, follow-up emails, social posts, expired-listing scripts, and more. Built by agents, for agents, with fill-in fields for ChatGPT, Claude, Gemini, and Perplexity.',
  alternates: { canonical: 'https://agentaibrief.com/prompts' },
  openGraph: {
    title: 'AI Prompt Library for Real Estate Agents | AgentAIBrief',
    description:
      'Copy-paste AI prompts for real estate agents with fill-in fields for ChatGPT, Claude, Gemini, and Perplexity.',
    url: 'https://agentaibrief.com/prompts',
    type: 'website',
  },
};

export default function PromptLibraryPage() {
  const prompts = PROMPTS;
  const freeCount = prompts.filter((p) => p.isFree).length;
  const proCount = prompts.filter((p) => !p.isFree).length;

  return (
    <div className="min-h-screen bg-[#e8e6e1] text-[#2a2a2a]">
      {/* Header */}
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1]/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-2xl font-bold">Agent<span className="text-[#e85d26]">AI</span>Brief</span>
          </Link>
          <nav className="hidden md:flex items-center gap-5">
            <Link href="/" className="text-sm text-[#666] hover:text-[#2a2a2a] transition-colors">News</Link>
            <Link href="/blog" className="text-sm text-[#666] hover:text-[#2a2a2a] transition-colors">Blog</Link>
            <Link href="/tools" className="text-sm text-[#666] hover:text-[#2a2a2a] transition-colors">AI Tools</Link>
            <Link href="/prompts" className="text-sm text-[#2a2a2a] font-medium border-b-2 border-[#e85d26] pb-0.5">Prompts</Link>
            <Link href="/videos" className="text-sm text-[#666] hover:text-[#2a2a2a] transition-colors">Videos</Link>
            <Link href="/subscribe" className="text-sm bg-[#e85d26] text-white px-4 py-1.5 rounded-lg hover:bg-[#2d9db5] transition-colors font-medium">Subscribe</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">⚡</span>
            <div>
              <h1 className="text-4xl font-extrabold">AI Prompt Library</h1>
              <p className="text-[#e85d26] font-medium">for Real Estate Agents</p>
            </div>
          </div>
          <p className="text-lg text-[#666] max-w-2xl">
            {prompts.length} copy-paste prompts with fill-in fields. Built by agents, for agents.
            <span className="text-emerald-400"> {freeCount} free</span> · <span className="text-amber-400">{proCount} Pro</span>
          </p>
        </div>

        <PromptLibrary prompts={prompts} />

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-br from-[#e85d26]/20 to-gray-900 border border-[#e85d26]/30 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">Unlock Every Prompt</h2>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto text-lg">
            Inner Circle members get all {prompts.length}+ prompts, daily AI briefings, tool reviews, and implementation guides.
          </p>
          <Link href="/subscribe" className="inline-flex px-8 py-3.5 bg-[#e85d26] text-white font-semibold rounded-xl hover:bg-[#2d9db5] transition-colors text-lg">
            Join the Inner Circle →
          </Link>
          <p className="text-sm text-gray-400 mt-3">Cancel anytime · New prompts added weekly</p>
        </div>
      </main>

      <footer className="border-t border-[#e0dcd4] mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-sm text-[#666] text-center">© 2026 AgentAIBrief.com • Built for real estate professionals</p>
        </div>
      </footer>
    </div>
  );
}
