import type { Metadata } from 'next';
import Link from 'next/link';
import { GPTTemplatesExplorer } from './GPTTemplatesExplorer';

export const metadata: Metadata = {
  title: 'Custom GPT Templates for Real Estate Agents',
  description:
    'Ready-to-deploy AI assistant configurations for real estate agents. Copy the system prompts and conversation starters into ChatGPT Custom GPTs, Claude Projects, or Gemini Gems — live in 60 seconds.',
  alternates: { canonical: 'https://agentaibrief.com/gpt-templates' },
  openGraph: {
    title: 'Custom GPT Templates for Real Estate Agents | AgentAIBrief',
    description:
      'Ready-to-deploy AI assistant configurations for real estate agents — ChatGPT, Claude, and Gemini.',
    url: 'https://agentaibrief.com/gpt-templates',
    type: 'website',
  },
};

export default function GPTTemplatesPage() {
  return (
    <div className="min-h-screen bg-[#e8e6e1] text-[#2a2a2a]">
      {/* Header */}
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-2xl font-bold text-[#2a2a2a]">
              Agent<span className="text-[#e85d26]">AI</span>Brief
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-sm text-[#666] hover:text-[#2a2a2a]">News</Link>
            <Link href="/blog" className="text-sm text-[#666] hover:text-[#2a2a2a]">Blog</Link>
            <Link href="/tools" className="text-sm text-[#666] hover:text-[#2a2a2a]">AI Tools</Link>
            <Link href="/prompts" className="text-sm text-[#666] hover:text-[#2a2a2a]">Prompts</Link>
            <Link href="/gpt-templates" className="text-sm text-[#2a2a2a] font-medium border-b-2 border-[#e85d26] pb-0.5">GPT Templates</Link>
            <Link href="/videos" className="text-sm text-[#666] hover:text-[#2a2a2a]">Video Library</Link>
            <Link href="/subscribe" className="text-sm text-[#666] hover:text-[#2a2a2a]">Subscribe</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-[#2a2a2a] mb-3">
            Custom GPT Templates
          </h1>
          <p className="text-lg text-[#666] max-w-2xl">
            Ready-to-deploy AI assistant configurations for real estate agents. Copy the instructions, paste into ChatGPT&apos;s &ldquo;Create a GPT,&rdquo; and you&apos;re live in 60 seconds.
          </p>
        </div>

        <GPTTemplatesExplorer />

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-br from-[#e85d26] to-[#2880a0] rounded-2xl p-8 text-center text-[#2a2a2a]">
          <h2 className="text-2xl font-bold mb-3">Unlock Every GPT Template</h2>
          <p className="text-[#2a2a2a]/80 mb-6 max-w-xl mx-auto">
            Inner Circle members get all 16 custom GPT configurations, plus daily AI briefings, the full prompt library, and premium tool reviews.
          </p>
          <a
            href="/subscribe"
            className="inline-flex px-6 py-3 bg-[#e8e6e1] text-[#e85d26] font-semibold rounded-lg hover:bg-[#f5f0ea] transition-colors"
          >
            Join the Inner Circle →
          </a>
        </div>
      </main>

      <footer className="border-t border-[#e0dcd4] mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-sm text-[#666] text-center">
            © 2026 AgentAIBrief.com • Built for real estate professionals
          </p>
        </div>
      </footer>
    </div>
  );
}
