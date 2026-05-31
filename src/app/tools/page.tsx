import type { Metadata } from 'next';
import Link from 'next/link';
import { AI_TOOLS } from '@/lib/ai-tools';
import { PaywallGate } from '@/components/PaywallGate';
import { ToolsExplorer } from './ToolsExplorer';

export const metadata: Metadata = {
  title: 'AI Tools Directory for Real Estate Agents',
  description:
    'The best AI tools for real estate agents — tested and reviewed by Dustin Fox. Compare staging, writing, video, analytics, CRM, and marketing tools with ratings and pricing.',
  alternates: { canonical: 'https://agentaibrief.com/tools' },
  openGraph: {
    title: 'AI Tools Directory for Real Estate Agents | AgentAIBrief',
    description:
      'The best AI tools for real estate agents — tested and reviewed by Dustin Fox.',
    url: 'https://agentaibrief.com/tools',
    type: 'website',
  },
};

export default function ToolsDirectory() {
  const tools = AI_TOOLS;

  return (
    <div className="min-h-screen bg-[#e8e6e1]">
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-2xl font-bold text-[#2a2a2a]">Agent<span className="text-[#e85d26]">AI</span>Brief</span>
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
          <h1 className="text-4xl font-extrabold text-[#2a2a2a] mb-3">AI Tools Directory</h1>
          <p className="text-lg text-[#666]">The best AI tools for real estate agents — tested and reviewed by Dustin Fox.</p>
        </div>

        <ToolsExplorer tools={tools} />

        <div className="mt-16 bg-[#f5f0ea] border border-[#e0dcd4] rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-[#2a2a2a] mb-3">Want Tool Reviews in Your Inbox?</h2>
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
