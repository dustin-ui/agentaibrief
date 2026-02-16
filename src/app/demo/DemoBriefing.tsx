'use client';

import { useState } from 'react';

const BRIEFING_DATE = 'Monday, February 9, 2026';

interface Story {
  id: number;
  title: string;
  source: string;
  time: string;
  summary: string;
  agentAngle: string;
  tip: string;
  score: number;
}

const stories: Story[] = [
  {
    id: 1,
    title: 'Short-Term Rentals Are Breaking the Appraisal Playbook — Lenders Can\'t Ignore It',
    source: 'HousingWire',
    time: '2h ago',
    summary: 'STR income doesn\'t behave like traditional rental income, yet lenders still evaluate it using tools designed for long-term leases. As DSCR lending grows, the old appraisal playbook is breaking down when faced with dynamic pricing, seasonality, and occupancy fluctuations.',
    agentAngle: 'If you have investor clients buying STR properties, this is critical intel. Appraisals on STR-focused properties are coming in wrong because appraisers are using long-term rental comps. The agents who understand DSCR lending and can guide clients to STR-savvy lenders will own this niche.',
    tip: 'Build a short list of 2-3 lenders in your market who specialize in DSCR loans for short-term rentals. Create a one-page guide for your investor clients explaining the difference.',
    score: 95,
  },
  {
    id: 2,
    title: 'Anthropic Says Claude Will Remain Ad-Free, Unlike ChatGPT',
    source: 'The Verge',
    time: '3h ago',
    summary: 'Anthropic announced Claude will remain ad-free — drawing a sharp contrast with OpenAI\'s ChatGPT, which has begun exploring advertising as a revenue stream.',
    agentAngle: 'If you\'re using AI to draft client emails or analyze contracts, you want a tool that works for YOU — not one subtly steering you toward advertisers. ChatGPT with ads means your "AI assistant" might start recommending specific lenders that paid for placement.',
    tip: 'Go to claude.ai and test it against ChatGPT on a real task: paste a property description and ask both to rewrite it. Compare outputs. Having two AI tools means you always have a backup.',
    score: 92,
  },
  {
    id: 3,
    title: 'Amazon Launches AI-Enhanced Alexa for Prime Subscribers',
    source: 'Bloomberg',
    time: '4h ago',
    summary: 'Amazon is rolling out upgraded Alexa with conversational AI, smart home integration improvements, and multi-step request handling for Prime subscribers.',
    agentAngle: 'Smart home just got a major upgrade — and your buyers care. The new Alexa handles complex routines like "set the house to away mode" in one command. For listing presentations, smart home compatibility is increasingly a selling point.',
    tip: 'Add "smart home ready" to your listing descriptions where applicable. During showings, demo smart features if the home has them. For your own use: set up Alexa routines for your workday.',
    score: 87,
  },
  {
    id: 4,
    title: 'Fibr AI Turns Static Websites Into Personalized Experiences',
    source: 'TechCrunch',
    time: '6h ago',
    summary: 'Fibr AI replaces engineering-heavy website personalization with autonomous systems. Show different content to different visitors based on intent, source, and behavior — without touching code.',
    agentAngle: 'Your website shows the same page to every visitor — whether they\'re a first-time buyer from Zillow or a luxury seller from Google. AI personalization means a seller sees testimonials and "What\'s my home worth?" while a buyer sees neighborhood guides. Same site, way more leads.',
    tip: 'Create 2 different landing pages: one for sellers (home value focus) and one for buyers (search focus). Run your next ad campaign split. Even basic segmentation lifts conversions 30-50%.',
    score: 85,
  },
  {
    id: 5,
    title: 'Software Stocks Slide as AI Disruption Fears Grow',
    source: 'Bloomberg',
    time: '5h ago',
    summary: 'Software makers and service firms caught in another sell-off as investors worry AI agents will replace significant portions of white-collar workflows.',
    agentAngle: 'The agents getting replaced aren\'t the ones using AI — they\'re the ones whose only value is access to listings. If a client can get that from an AI tool, what\'s left? Your irreplaceable value is local expertise, negotiation skill, and relationship trust.',
    tip: 'Ask yourself: "What do I do that AI literally cannot?" Write down 3 things. Those are your moat. Then: "What do I spend time on that AI COULD do?" Those are your automation targets.',
    score: 79,
  },
];

function ScoreDot({ score }: { score: number }) {
  const color = score >= 90 ? 'text-red-500' : score >= 80 ? 'text-orange-500' : 'text-yellow-500';
  return <span className={`text-xs font-bold ${color}`}>🔥 {score}</span>;
}

export function DemoBriefing() {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-[#f5f0ea]">
      {/* Top bar */}
      <div className="bg-[#e8e6e1] border-b border-[#e0dcd4] sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-lg font-bold text-[#2a2a2a]">
            Agent<span className="text-[#e85d26]">AI</span>Brief
          </a>
          <a href="/subscribe" className="px-4 py-2 bg-[#e85d26] text-white text-sm font-medium rounded-lg hover:bg-[#c44a1a]">
            Subscribe →
          </a>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 text-center">
          <p className="text-sm text-amber-800">
            📋 <strong>This is a sample briefing.</strong> The real one lands in your inbox every morning at 7 AM.{' '}
            <a href="/subscribe" className="text-[#e85d26] underline font-medium">Subscribe free →</a>
          </p>
        </div>

        {/* Email container */}
        <div className="bg-[#e8e6e1] rounded-xl shadow-lg border border-[#e0dcd4] overflow-hidden">
          {/* Email header */}
          <div className="bg-[#f0ece4] border-b border-[#e0dcd4] px-6 py-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#e85d26] flex items-center justify-center text-white font-bold text-sm shrink-0">AI</div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#2a2a2a]">AgentAIBrief <span className="font-normal text-[#666]">&lt;daily@agentaibrief.com&gt;</span></p>
                <p className="text-xs text-[#888]">to me</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#666]">{BRIEFING_DATE} • 7:00 AM EST</p>
              <div className="flex items-center gap-1 text-xs text-[#666]">
                <span>⭐</span>
                <span>↩️</span>
                <span>⋯</span>
              </div>
            </div>
          </div>

          {/* Email body */}
          <div className="px-6 py-6">
            {/* Greeting */}
            <div className="mb-6">
              <p className="text-[#555] text-sm leading-relaxed">
                Good morning! ☕
              </p>
              <p className="text-[#555] text-sm leading-relaxed mt-2">
                Here are today&apos;s <strong>5 AI stories</strong> that matter for your real estate business — plus what to do about each one.
              </p>
            </div>

            {/* Quick stats bar */}
            <div className="bg-[#f0ece4] rounded-lg p-4 mb-8 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-[#e85d26]">5</p>
                <p className="text-[11px] text-[#888]">Stories</p>
              </div>
              <div>
                <p className="text-lg font-bold text-green-600">5</p>
                <p className="text-[11px] text-[#888]">Action Items</p>
              </div>
              <div>
                <p className="text-lg font-bold text-purple-600">4 min</p>
                <p className="text-[11px] text-[#888]">Read Time</p>
              </div>
            </div>

            {/* Stories */}
            <div className="space-y-8">
              {stories.map((story, i) => (
                <div key={story.id}>
                  {/* Story header */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-[#666]">#{i + 1}</span>
                    <ScoreDot score={story.score} />
                    <span className="text-xs text-[#666]">{story.source} • {story.time}</span>
                  </div>

                  <h3 className="text-base font-semibold text-[#2a2a2a] mb-2 leading-snug">
                    {story.title}
                  </h3>

                  <p className="text-sm text-[#666] leading-relaxed mb-3">
                    {story.summary}
                  </p>

                  {/* Agent Angle - show first 2 clearly, blur rest for "free" */}
                  {i < 2 ? (
                    <>
                      <div className="bg-[#f5f0ea] border-l-4 border-[#e85d26] rounded-r-lg p-4 mb-2">
                        <p className="text-[11px] font-bold text-[#c44a1a] mb-1 tracking-wider uppercase">🏠 Agent Angle</p>
                        <p className="text-sm text-[#2a2a2a] leading-relaxed">{story.agentAngle}</p>
                      </div>
                      <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4">
                        <p className="text-[11px] font-bold text-green-700 mb-1 tracking-wider uppercase">💡 Try Today</p>
                        <p className="text-sm text-green-900 leading-relaxed">{story.tip}</p>
                      </div>
                    </>
                  ) : (
                    <div className="relative">
                      <div className="bg-[#f5f0ea] border-l-4 border-[#e85d26] rounded-r-lg p-4 mb-2 select-none" style={{ filter: 'blur(5px)' }}>
                        <p className="text-[11px] font-bold text-[#c44a1a] mb-1 tracking-wider uppercase">🏠 Agent Angle</p>
                        <p className="text-sm text-[#2a2a2a] leading-relaxed">{story.agentAngle}</p>
                      </div>
                      <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4 select-none" style={{ filter: 'blur(5px)' }}>
                        <p className="text-[11px] font-bold text-green-700 mb-1 tracking-wider uppercase">💡 Try Today</p>
                        <p className="text-sm text-green-900 leading-relaxed">{story.tip}</p>
                      </div>
                      {/* Lock overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-[#e8e6e1]/95 backdrop-blur-sm border border-[#e0dcd4] rounded-xl px-6 py-4 text-center shadow-lg max-w-xs">
                          <p className="text-2xl mb-2">🔒</p>
                          <p className="text-sm font-semibold text-[#2a2a2a] mb-1">Pro Members Only</p>
                          <p className="text-xs text-[#888] mb-3">Agent Angles & action items on every story</p>
                          <a href="/subscribe" className="inline-block px-4 py-2 bg-[#e85d26] text-white text-xs font-semibold rounded-lg hover:bg-[#c44a1a]">
                            Unlock for $19/mo →
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {i < stories.length - 1 && (
                    <hr className="mt-8 border-[#e0dcd4]" />
                  )}
                </div>
              ))}
            </div>

            {/* Email footer */}
            <div className="mt-10 pt-6 border-t border-[#e0dcd4]">
              <div className="bg-[#2a2a2a] rounded-xl p-6 text-center text-white">
                <h3 className="text-lg font-bold mb-2">Want this every morning?</h3>
                <p className="text-[#888] text-sm mb-4">
                  Free subscribers get headlines + summaries. Pro gets Agent Angles on every story.
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    window.location.href = `/subscribe`;
                  }}
                  className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto"
                >
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-lg text-[#2a2a2a] text-sm placeholder-gray-400 focus:outline-none"
                  />
                  <button type="submit" className="px-5 py-2.5 bg-[#e8e6e1] text-[#c44a1a] font-bold rounded-lg text-sm hover:bg-[#f5f0ea] whitespace-nowrap">
                    Start Free →
                  </button>
                </form>
              </div>

              {/* Dustin footer */}
              <div className="mt-6 flex items-center gap-3 justify-center">
                <img src="/dustin-fox.jpg" alt="Dustin Fox" className="w-10 h-10 rounded-full object-cover" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#2a2a2a]">Dustin Fox</p>
                  <p className="text-xs text-[#888]">Fox Homes Team • $277M Volume • 2,102 ⭐ Reviews</p>
                </div>
              </div>

              <p className="text-center text-[11px] text-[#666] mt-6">
                You received this because you subscribed to AgentAIBrief.com<br />
                <a href="#" className="underline">Unsubscribe</a> • <a href="#" className="underline">Manage preferences</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
