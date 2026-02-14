import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Dustin Fox',
  description: 'How a solo agent used AI to build a $277M real estate team with 2,102+ five-star reviews.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#e8e6e1]">
      {/* Header */}
      <header className="border-b border-[#e0dcd4] bg-[#e8e6e1]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#2a2a2a]">
            Agent<span className="text-[#e85d26]">AI</span>Brief
          </Link>
          <Link href="/subscribe" className="px-4 py-2 bg-[#e85d26] text-[#2a2a2a] text-sm font-medium rounded-lg hover:bg-[#c44a1a]">
            Subscribe
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 text-[#2a2a2a]">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img
              src="/dustin-fox.jpg"
              alt="Dustin Fox"
              className="w-36 h-36 rounded-full object-cover border-4 border-[#e85d26] shadow-xl shrink-0"
            />
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Dustin Fox</h1>
              <p className="text-[#555] text-lg mb-4">Team Lead, Fox Homes • Fairfax, VA</p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="bg-[#e8e6e1]/10 rounded-lg px-4 py-2 text-center">
                  <p className="text-xl font-bold text-[#e85d26]">$277M</p>
                  <p className="text-xs text-[#666]">2025 Volume</p>
                </div>
                <div className="bg-[#e8e6e1]/10 rounded-lg px-4 py-2 text-center">
                  <p className="text-xl font-bold text-[#e85d26]">2,102+</p>
                  <p className="text-xs text-[#666]">5-Star Reviews</p>
                </div>
                <div className="bg-[#e8e6e1]/10 rounded-lg px-4 py-2 text-center">
                  <p className="text-xl font-bold text-[#e85d26]">36</p>
                  <p className="text-xs text-[#666]">Agents</p>
                </div>
                <div className="bg-[#e8e6e1]/10 rounded-lg px-4 py-2 text-center">
                  <p className="text-xl font-bold text-[#e85d26]">115%</p>
                  <p className="text-xs text-[#666]">Growth Since AI</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <article className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-[#2a2a2a] mb-6">From Solo Agent to $277M Team — Powered by AI</h2>

          <p className="text-[#555] leading-relaxed mb-6">
            I started in real estate the same way most people do — alone. One agent, a laptop, and a whole lot of cold calling. For years, I ground it out the traditional way. I built a good business, earned great reviews, and slowly grew the Fox Homes Team in the DC metro market.
          </p>

          <p className="text-[#555] leading-relaxed mb-6">
            But the real inflection point came in late 2022, when I started experimenting with AI.
          </p>

          {/* Growth timeline */}
          <div className="bg-[#f0ece4] rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold text-[#2a2a2a] mb-4">📈 The Numbers Tell the Story</h3>
            <div className="space-y-4">
              {[
                { year: 'Pre-ChatGPT', vol: '$129M', note: 'Solid team, traditional methods', color: 'bg-gray-300' },
                { year: '2023', vol: '$179M', note: 'First year with AI — 39% jump', color: 'bg-[#e85d26]' },
                { year: '2024', vol: '$221M', note: 'AI in every workflow — 23% growth', color: 'bg-[#e85d26]' },
                { year: '2025', vol: '$277M', note: 'Full AI integration — 25% growth', color: 'bg-[#e85d26]' },
              ].map((row) => (
                <div key={row.year} className="flex items-center gap-4">
                  <div className="w-28 shrink-0">
                    <p className="text-sm font-bold text-[#2a2a2a]">{row.year}</p>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 rounded-full ${row.color}`} style={{ width: `${(parseInt(row.vol.replace(/\D/g, '')) / 277) * 100}%` }} />
                      <span className="text-sm font-bold text-[#2a2a2a] whitespace-nowrap">{row.vol}</span>
                    </div>
                    <p className="text-xs text-[#888] mt-0.5">{row.note}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-[#666] mt-4 pt-4 border-t border-[#e0dcd4]">
              That&apos;s <strong>115% growth</strong> from pre-ChatGPT to 2025. Same market. Same team structure. The difference was AI.
            </p>
          </div>

          <h3 className="text-xl font-bold text-[#2a2a2a] mb-4">What Changed?</h3>

          <p className="text-[#555] leading-relaxed mb-6">
            AI didn&apos;t replace my team — it multiplied us. We started using AI for listing descriptions, then market analysis, then lead follow-up, then content creation. Every month we found a new workflow to automate or enhance. Each one freed up time that went straight into client relationships and deal-making.
          </p>

          <p className="text-[#555] leading-relaxed mb-6">
            Today, Fox Homes is a team of 36 agents operating in Fairfax, Virginia and across the DC metro area. We have <strong>2,102+ five-star Google reviews</strong> — not because of AI, but because AI let us spend more time doing what actually matters: taking care of people.
          </p>

          <h3 className="text-xl font-bold text-[#2a2a2a] mb-4">Why I Built AgentAIBrief</h3>

          <p className="text-[#555] leading-relaxed mb-6">
            Here&apos;s the problem: AI moves fast. Insanely fast. I was spending 2-3 hours a day just reading AI news and figuring out what mattered for real estate. Most agents don&apos;t have that time. They know AI is important, but they don&apos;t know where to start or what actually matters for their business.
          </p>

          <p className="text-[#555] leading-relaxed mb-6">
            That&apos;s AgentAIBrief. Every morning, you get the AI stories that matter for real estate — filtered, analyzed, and translated into action. Not by some tech blogger who&apos;s never held an open house, but by someone who uses AI every single day to run a $277M operation.
          </p>

          <p className="text-[#555] leading-relaxed mb-8">
            Every &ldquo;Agent Angle&rdquo; comes from real experience. Every implementation tip has been tested in actual production. This isn&apos;t theory — it&apos;s what&apos;s working right now.
          </p>

          {/* CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-center text-[#2a2a2a]">
            <h3 className="text-2xl font-bold mb-3">The agents who adopt AI first will win.</h3>
            <p className="text-[#888] mb-6">
              I&apos;m sharing everything I&apos;ve learned — the tools, the workflows, the strategies. Let me help you stay ahead.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/subscribe" className="px-8 py-3 bg-[#e8e6e1] text-[#c44a1a] font-bold rounded-lg hover:bg-[#f5f0ea]">
                Get the Free Daily Brief →
              </Link>
              <Link href="/demo" className="px-8 py-3 bg-[#e85d26] text-[#2a2a2a] font-semibold rounded-lg hover:bg-[#e85d26] border border-[#e85d26]">
                See a Sample First →
              </Link>
            </div>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e0dcd4] bg-[#f0ece4] mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="text-sm text-[#888] text-center">
            © 2026 AgentAIBrief.com • Built for real estate professionals •{' '}
            <Link href="/" className="text-[#e85d26] hover:underline">Home</Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
