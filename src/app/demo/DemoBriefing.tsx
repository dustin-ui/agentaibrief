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
    title: 'Short-Term Rentals Are Breaking the Appraisal Playbook — Lenders Can\'t Afford to Ignore It',
    source: 'HousingWire',
    link: 'https://www.housingwire.com/articles/short-term-rentals-are-breaking-the-appraisal-playbook-lenders-cant-afford-to-ignore-it/',
    category: 'realestate',
    publishedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    summary:
      'STR income doesn\'t behave like traditional rental income, yet lenders still evaluate it using tools designed for long-term leases. As DSCR lending grows and investors get more sophisticated, the old appraisal playbook — built on stable market rent assumptions — is breaking down when faced with dynamic pricing, seasonality, and occupancy fluctuations.',
    agentAngle:
      "If you have investor clients buying STR properties (and in the DC metro, that\'s a growing segment), this is critical intel. Appraisals on STR-focused properties are coming in wrong because appraisers are using long-term rental comps. That means your investor clients could be getting denied for loans — or worse, overpaying — based on flawed income assumptions. The agents who understand DSCR lending and can guide clients to STR-savvy lenders will own this niche.",
    implementationTip:
      'Build a short list of 2-3 lenders in your market who specialize in DSCR loans for short-term rentals. Ask them: "How do you underwrite STR income vs. traditional rentals?" Then create a one-page guide for your investor clients explaining the difference. This positions you as the go-to agent for investment properties.',
    trendingScore: 95,
  },
  {
    id: 'demo-2',
    title: 'Anthropic Says Claude Will Remain Ad-Free, Unlike ChatGPT',
    source: 'The Verge AI',
    link: 'https://www.theverge.com/ai-artificial-intelligence',
    category: 'company',
    publishedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    summary:
      'Anthropic has announced that Claude, its AI assistant, will remain ad-free — drawing a sharp contrast with OpenAI\'s ChatGPT, which has begun exploring advertising as a revenue stream. The announcement comes as AI assistants become daily-use tools for professionals across industries.',
    agentAngle:
      "This matters more than you think. If you\'re using AI to draft client emails, analyze contracts, or write listing descriptions, you want a tool that works for YOU — not one that\'s subtly steering you toward advertisers. ChatGPT with ads means your \"AI assistant\" might start recommending specific lenders, title companies, or services that paid for placement. Claude staying ad-free means your AI outputs stay neutral and client-focused.",
    implementationTip:
      'If you haven\'t tried Claude yet, go to claude.ai and test it against ChatGPT on a real task: paste a property description and ask both to "rewrite this to maximize buyer engagement." Compare the outputs. Then try uploading an HOA document and asking for a summary. Having two AI tools in your belt means you always have a backup — and can pick the best output.',
    trendingScore: 92,
  },
  {
    id: 'demo-3',
    title: 'Software Stocks Slide Again as AI Threats Rattle Investors',
    source: 'Bloomberg Tech',
    link: 'https://www.bloomberg.com/technology',
    category: 'tech',
    publishedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    summary:
      'Software makers, advertising agencies, and investment firms were caught in another wave of selling as investors worried about AI disruption threatening traditional business models. The sell-off reflects growing consensus that AI agents will replace significant portions of white-collar workflows.',
    agentAngle:
      "Wall Street is betting that AI will replace traditional software — and traditional service providers. Real estate isn\'t immune. The agents getting replaced aren\'t the ones using AI; they\'re the ones who ARE the software — meaning agents whose only value is access to listings or basic transaction coordination. If a client can get that from an AI tool, what\'s left? Your irreplaceable value is local expertise, negotiation skill, and relationship trust. Double down on those.",
    implementationTip:
      'Ask yourself: "What do I do that AI literally cannot?" Write down 3 things. Those are your competitive moat. Now ask: "What do I spend time on that AI COULD do?" Those are your automation targets. The goal: spend less time on what AI can handle, more time on what only you can deliver.',
    trendingScore: 89,
  },
  {
    id: 'demo-4',
    title: 'Amazon Launches AI-Enhanced Alexa for Prime Subscribers in US',
    source: 'Bloomberg Tech',
    link: 'https://www.bloomberg.com/technology',
    category: 'tech',
    publishedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    summary:
      'Amazon is rolling out its upgraded Alexa in the US, offering the AI-enhanced digital assistant to paid Prime subscribers. The new Alexa features conversational AI, smart home integration improvements, and the ability to handle complex multi-step requests.',
    agentAngle:
      "Smart home just got a major upgrade — and your buyers care. The new Alexa can handle complex routines like \"set the house to away mode\" (locks doors, adjusts thermostat, arms security, turns off lights) in one command. For listing presentations, mentioning smart home compatibility is increasingly a selling point. For buyer tours, pointing out Alexa/smart home readiness adds perceived value. And for your own productivity: \"Alexa, add a showing at 123 Main St at 3pm\" just got way more reliable.",
    implementationTip:
      'Add "smart home ready" or "smart home equipped" to your listing descriptions where applicable. During showings, demo the smart features if the home has them. For your own use: set up Alexa routines for your workday — morning market brief, calendar review, and commute traffic check. Small efficiencies compound.',
    trendingScore: 87,
  },
  {
    id: 'demo-5',
    title: 'Fibr AI Raises New Round as Agents Turn Static Websites Into Personalized Experiences',
    source: 'TechCrunch AI',
    link: 'https://techcrunch.com/ai/',
    category: 'tech',
    publishedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    summary:
      'Fibr AI replaces marketing agency– and engineering-heavy website personalization with autonomous systems designed for enterprise marketers. The platform lets businesses show different content to different visitors based on their intent, source, and behavior — without touching code.',
    agentAngle:
      "Your real estate website shows the same page to every visitor — whether they\'re a first-time buyer from Zillow, a luxury seller from Google, or a relocating family from Facebook. That\'s leaving conversions on the table. AI personalization means a seller clicking your Google ad sees testimonials, sold stats, and a \"What\'s my home worth?\" CTA — while a buyer from Instagram sees neighborhood guides and new listings. Same site, different experience, way more leads.",
    implementationTip:
      'You don\'t need Fibr AI specifically — but test the concept. Create 2 different landing pages: one for sellers (home value focus) and one for buyers (search focus). Run your next ad campaign with each audience going to their specific page. Compare conversion rates against your generic homepage. Even this basic segmentation typically lifts conversions 30-50%.',
    trendingScore: 85,
  },
  {
    id: 'demo-6',
    title: 'Sen. Warren Presses Google on What Gemini\'s Built-In Checkout Means for Consumers',
    source: 'The Verge AI',
    link: 'https://www.theverge.com/ai-artificial-intelligence',
    category: 'tech',
    publishedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    summary:
      'Sen. Elizabeth Warren is pressing Google for details on plans to build checkout directly into Gemini AI, raising questions about data privacy, competition, and whether AI recommendations will favor Google\'s paying partners over the best options for consumers.',
    agentAngle:
      "Pay attention to this trend: AI assistants are becoming the new front door for consumer decisions. If Google Gemini can recommend a lender, a home inspector, or even a real estate agent — and complete the transaction without the user ever visiting your website — the SEO game changes entirely. Your digital presence needs to be optimized not just for Google Search, but for AI assistants that might recommend (or skip) you based on your online reputation and data footprint.",
    implementationTip:
      'Make sure your Google Business Profile is fully optimized with current reviews, photos, and service descriptions. AI assistants pull from structured data. Update your website\'s schema markup for LocalBusiness and RealEstateAgent types. The agents who show up in AI recommendations will be the ones with the richest, most structured online presence.',
    trendingScore: 82,
  },
  {
    id: 'demo-7',
    title: 'Microsoft\'s Deal With OpenAI Now Viewed as a Risk, Not Reward',
    source: 'Bloomberg Tech',
    link: 'https://www.bloomberg.com/technology',
    category: 'tech',
    publishedAt: new Date(Date.now() - 7 * 3600000).toISOString(),
    summary:
      'The Microsoft-OpenAI partnership, once applauded by Wall Street, is now facing skepticism as investors question the massive capital expenditure required and whether the AI investment will translate to proportional returns.',
    agentAngle:
      "Here\'s the meta-lesson for agents: even Big Tech isn\'t sure AI investments will pay off at scale. But that uncertainty is exactly why NOW is the time to experiment cheaply. While corporations pour billions into AI infrastructure, you can test AI tools for $0-20/month and find what works for YOUR business before the market settles. The agents experimenting today will have a 2-year head start when AI tools become industry standard — and they\'ll have figured out what actually moves the needle vs. what\'s hype.",
    implementationTip:
      'Set an \"AI experiment budget\" of $50/month. Each month, try one new AI tool for your business. This month: test an AI listing description writer. Next month: try AI-powered lead follow-up. Track which ones actually save time or generate leads. Cancel what doesn\'t work. By year-end, you\'ll have a proven AI toolkit while competitors are still deciding whether to start.',
    trendingScore: 79,
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
