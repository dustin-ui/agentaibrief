'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow, format } from 'date-fns';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BriefingItem {
  id: string;
  title: string;
  source: string;
  link: string;
  category: 'tech' | 'realestate' | 'company' | 'research';
  publishedAt: string;
  summary: string;
  agentAngle: string;
  implementationTip: string;
  trendingScore: number;
}

/* ------------------------------------------------------------------ */
/*  Static sample briefing – always available, no API needed           */
/* ------------------------------------------------------------------ */

const today = new Date();
const BRIEFING_DATE = format(today, 'EEEE, MMMM d, yyyy');

const SAMPLE_BRIEFING: BriefingItem[] = [
  {
    id: 'demo-1',
    title: 'OpenAI Launches Operator Agent That Can Browse the Web and Complete Tasks Autonomously',
    source: 'TechCrunch AI',
    link: 'https://techcrunch.com/ai/',
    category: 'company',
    publishedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    summary:
      'OpenAI released Operator, an AI agent that can use a web browser to complete multi-step tasks like booking appointments, filling out forms, and researching products — all with natural language instructions.',
    agentAngle:
      "This changes your workflow overnight. Imagine telling an AI agent: 'Research the last 10 sales in Fairfax County over $1M, compile them in a spreadsheet, and draft a market update email.' Operator can chain those steps together. Agents who learn to delegate to AI agents will reclaim 5-10 hours per week — time they can spend on client relationships instead of data entry.",
    implementationTip:
      'Start with one repetitive task you do weekly — like pulling comp data or researching HOA docs. Write out the exact steps as if training an assistant. Then try giving those instructions to Operator. You\'ll be shocked how much it handles.',
    trendingScore: 97,
  },
  {
    id: 'demo-2',
    title: 'Zillow Expands AI-Powered "Listing Showcase" to All Markets — Virtual Staging Included',
    source: 'HousingWire',
    link: 'https://www.housingwire.com/',
    category: 'realestate',
    publishedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    summary:
      'Zillow\'s premium Listing Showcase now includes AI virtual staging, interactive floor plans, and room-by-room photo organization. Listings with Showcase get 69% more page views and 74% more saves.',
    agentAngle:
      "This is Zillow telling you: AI-enhanced listings are the new standard, not the exception. Those stats aren't subtle — 69% more views means significantly more buyer leads per listing. Agents who aren't using virtual staging and AI-enhanced photos are literally leaving eyeballs (and leads) on the table. The competitive advantage of early adoption is narrowing fast.",
    implementationTip:
      'Contact your Zillow rep about Listing Showcase availability in your market. In the meantime, start using AI staging tools like Apply Design AI ($0.20/image) on every vacant listing. A/B test one listing with traditional photos vs. AI-staged — track the view and save counts.',
    trendingScore: 94,
  },
  {
    id: 'demo-3',
    title: 'Google Gemini 2.5 Pro Launches with Native Document Analysis — Contract Review in Seconds',
    source: 'Google AI Blog',
    link: 'https://blog.google/technology/ai/',
    category: 'company',
    publishedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    summary:
      'Gemini 2.5 Pro can natively read and analyze PDFs up to 2,000 pages with near-perfect accuracy. Early testing shows it can extract key terms from real estate contracts, flag unusual clauses, and summarize HOA documents in under 30 seconds.',
    agentAngle:
      "This is the document review game-changer we've been waiting for. Upload a 200-page HOA document and get a 1-page summary of every rule your buyer needs to know — plus red flags about upcoming assessments, litigation, or rule changes. The agent who delivers this level of due diligence in a same-day turnaround becomes indispensable to their clients.",
    implementationTip:
      'Go to gemini.google.com right now. Upload an inspection report from your last closing. Ask: "Summarize the top 5 issues by severity and estimated repair cost." Then try it with an HOA document: "What are the key restrictions, upcoming assessments, and any pending litigation?" Save your best prompts as templates.',
    trendingScore: 92,
  },
  {
    id: 'demo-4',
    title: 'NAR Technology Survey: AI-Using Agents Now Earn 31% Higher GCI Than Non-Users',
    source: 'RealTrends',
    link: 'https://www.realtrends.com/',
    category: 'realestate',
    publishedAt: new Date(Date.now() - 7 * 3600000).toISOString(),
    summary:
      'The latest NAR tech survey reveals that agents regularly incorporating AI tools into their workflow closed 23% more transactions and earned 31% higher GCI in 2025. The gap has widened from 12% in 2024.',
    agentAngle:
      "This is the stat you print out and tape to your monitor. A 31% GCI difference isn't incremental — it's transformational. For an agent earning $150K, that's an extra $46,500/year. The gap is accelerating too, from 12% to 31% in just one year. Agents who haven't started adopting AI aren't just missing out — they're falling behind at an increasing rate.",
    implementationTip:
      'Share this stat in your next team meeting. Then do a team audit: which AI tools are your top producers using? Pick ONE tool to adopt as a team this month. The easiest starting points: AI listing descriptions (Claude/ChatGPT), AI-staged photos, or an AI follow-up tool.',
    trendingScore: 89,
  },
  {
    id: 'demo-5',
    title: 'Microsoft Copilot Gets Real Estate Plugin — Auto-Generate CMAs From MLS Data',
    source: 'The Verge AI',
    link: 'https://www.theverge.com/ai-artificial-intelligence',
    category: 'tech',
    publishedAt: new Date(Date.now() - 9 * 3600000).toISOString(),
    summary:
      'Microsoft\'s Copilot now integrates with major MLS systems through a new real estate plugin. Agents using Microsoft 365 can auto-pull comps and generate branded CMA reports in Word and PowerPoint.',
    agentAngle:
      "If your brokerage already pays for Microsoft 365 (and most do), you just got a free CMA generator. The real play here is speed: what used to take 45 minutes of pulling comps and formatting a presentation now takes 3 minutes. But here's the edge — the agents who supplement AI-generated CMAs with hyperlocal insights (street-level knowledge, upcoming developments, school boundary changes) will stand out from agents who just hit 'generate.'",
    implementationTip:
      'Check if your brokerage has Microsoft 365 with Copilot access. If so, try generating a CMA for your next listing appointment. Then add 3-5 hyperlocal insights the AI missed — this "AI + human expertise" combo is what wins the listing.',
    trendingScore: 86,
  },
  {
    id: 'demo-6',
    title: 'AI Voice Agents Hit 67% Lead Engagement Rate for After-Hours Calls',
    source: 'VentureBeat AI',
    link: 'https://venturebeat.com/ai/',
    category: 'tech',
    publishedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    summary:
      'Several top-producing teams are using AI voice agents as first-response systems for after-hours leads. Data from 50,000+ interactions shows a 67% engagement rate compared to 12% for traditional voicemail.',
    agentAngle:
      "Speed to lead is everything — and AI just made it 24/7. A 67% engagement rate vs. 12% for voicemail means you're converting 5x more after-hours leads. Think about how many 9pm inquiry calls go to voicemail right now. Every one of those is a potential client who calls the next agent on the list. AI voice agents don't sleep, don't take days off, and don't have bad days.",
    implementationTip:
      "Set up a simple after-hours flow this week: missed call → AI voice agent responds with 3 qualifying questions (timeline, price range, preferred area) → books a callback for the next morning. Start with Structurely or Ylopo's AI voice tools. Test it by calling your own line at 10pm.",
    trendingScore: 82,
  },
  {
    id: 'demo-7',
    title: 'Stanford Study: AI-Written Property Descriptions Get 34% More Clicks Than Human-Written',
    source: 'MIT Tech Review AI',
    link: 'https://www.technologyreview.com/',
    category: 'research',
    publishedAt: new Date(Date.now() - 15 * 3600000).toISOString(),
    summary:
      'Researchers analyzed 2.3 million property listings and found that AI-optimized descriptions — trained on click-through data — consistently outperform human-written descriptions in generating buyer engagement.',
    agentAngle:
      "Your listing descriptions are costing you clicks, and the data proves it. AI doesn't just write faster — it writes what buyers actually respond to, optimized across millions of data points. The ego hit is real (nobody wants to hear a machine writes better copy), but the numbers don't lie: 34% more clicks = more showings = faster sales = happier sellers.",
    implementationTip:
      "Take your last 3 listing descriptions. Paste each into Claude or ChatGPT with this prompt: 'Rewrite this property description to maximize click-through rate. Focus on the lifestyle the buyer gets, not just features. Keep it under 250 words.' Compare the output to your original. You'll see the difference immediately.",
    trendingScore: 78,
  },
];

/* ------------------------------------------------------------------ */
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 90
      ? 'bg-red-100 text-red-700 border-red-200'
      : score >= 75
      ? 'bg-orange-100 text-orange-700 border-orange-200'
      : 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${color}`}>
      🔥 {score}
    </span>
  );
}

const catColors: Record<string, string> = {
  tech: 'bg-purple-100 text-purple-700',
  realestate: 'bg-green-100 text-green-700',
  company: 'bg-blue-100 text-blue-700',
  research: 'bg-amber-100 text-amber-700',
};

function BriefingCard({ item, index }: { item: BriefingItem; index: number }) {
  return (
    <article className="py-6">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-sm font-bold text-gray-400 mr-1">#{index + 1}</span>
        <ScoreBadge score={item.trendingScore} />
        <span
          className={`text-xs px-2 py-0.5 rounded ${catColors[item.category] || 'bg-gray-100 text-gray-600'}`}
        >
          {item.source}
        </span>
        <span className="text-xs text-gray-400">
          {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}
        </span>
      </div>

      {/* Title */}
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
          {item.title}
        </h3>
      </a>

      {/* Summary */}
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.summary}</p>

      {/* Agent Angle */}
      <div className="mt-3 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
        <p className="text-xs font-bold text-blue-700 mb-1 tracking-wide">🏠 AGENT ANGLE</p>
        <p className="text-sm text-blue-900 leading-relaxed">{item.agentAngle}</p>
      </div>

      {/* Implementation Tip */}
      <div className="mt-2 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
        <p className="text-xs font-bold text-green-700 mb-1 tracking-wide">💡 TRY TODAY</p>
        <p className="text-sm text-green-900 leading-relaxed">{item.implementationTip}</p>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  Live news section — fetches from the API                           */
/* ------------------------------------------------------------------ */

interface LiveNewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  category: string;
  publishedAt: string;
  summary?: string;
  trendingScore: number;
}

function LiveNewsTicker() {
  const [items, setItems] = useState<LiveNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.items) {
          setItems(data.items.slice(0, 5));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400" />
        Loading live feed…
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
        </span>
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Live Feed — Just In
        </span>
      </div>
      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <a
            key={item.id}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <ScoreBadge score={item.trendingScore} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
              <p className="text-xs text-gray-400">
                {item.source} •{' '}
                {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function DemoBriefing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900">
              Agent<span className="text-blue-600">AI</span>Brief
            </h1>
          </a>
          <a
            href="/subscribe"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Daily Briefings →
          </a>
        </div>
      </header>

      {/* Briefing Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              📋 Sample Briefing
            </span>
            <span className="text-blue-200 text-sm">{BRIEFING_DATE}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Your Daily AI Briefing
          </h2>
          <p className="text-blue-200 text-sm max-w-xl">
            7 stories that matter for your real estate business today — each with an
            Agent Angle and an action you can take right now.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">7</p>
              <p className="text-xs text-gray-500">Stories Today</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">7</p>
              <p className="text-xs text-gray-500">Action Items</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">15</p>
              <p className="text-xs text-gray-500">Sources Scanned</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">4 min</p>
              <p className="text-xs text-gray-500">Read Time</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-2">
        <div className="divide-y divide-gray-200">
          {SAMPLE_BRIEFING.map((item, i) => (
            <BriefingCard key={item.id} item={item} index={i} />
          ))}
        </div>

        {/* Live feed section */}
        <LiveNewsTicker />

        {/* Bottom CTA */}
        <div className="my-12 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">
            Get this in your inbox every morning
          </h3>
          <p className="text-blue-200 mb-6 max-w-lg mx-auto">
            Join hundreds of forward-thinking agents who start their day with
            AgentAIBrief. Real news. Real angles. Real advantage.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/subscribe"
              className="px-8 py-3 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50 transition-colors"
            >
              Start with Pro — $19/mo
            </a>
            <span className="text-blue-300 text-sm">
              Use code <span className="font-bold text-white">LAUNCH25</span> for
              25% off
            </span>
          </div>
        </div>

        {/* Social Proof */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full px-6 py-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
              DF
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">Built by Dustin Fox</p>
              <p className="text-xs text-gray-500">
                Fox Homes Team • $277M Volume • 2,102 Five-Star Reviews
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-500">
            © 2026 AgentAIBrief.com • Built for real estate professionals •{' '}
            <a href="/" className="text-blue-600 hover:underline">
              Home
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
