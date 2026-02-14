'use client';

interface DeepDiveProps {
  isPremium: boolean;
}

const CURRENT_DEEP_DIVE = {
  title: 'AI Virtual Staging: The Complete Agent\'s Playbook for 2026',
  subtitle: 'How to save $50K/year on staging while getting better results',
  date: 'Week of Feb 3, 2026',
  readTime: '12 min read',
  preview: 'Virtual staging crossed the uncanny valley in late 2025. Buyers can no longer tell the difference between AI-staged and professionally photographed rooms in blind tests. This week, we break down the top 5 tools, compliance requirements by state, and the exact workflow top-producing teams are using to stage 10 listings per day at $25 per room.',
  sections: [
    'The tools: Side-by-side comparison of Apply Design AI, Stager AI, Virtual Staging AI, REimagineHome, and BoxBrownie',
    'Compliance watch: Which states require disclosure and what the NAR recommends',
    'The workflow: How Team Henderson stages 50 rooms/week in under 2 hours',
    'ROI calculator: What you\'re saving (and earning) by switching',
    'Advanced moves: Using AI staging for "style options" that let buyers choose their aesthetic',
  ],
  nextWeek: 'Next week: "AI Lead Scoring — Predicting Who\'s Ready to Sell Before They Know It"',
};

const UPCOMING_DEEP_DIVES = [
  {
    title: 'AI Lead Scoring — Predicting Who\'s Ready to Sell Before They Know It',
    date: 'Feb 10, 2026',
  },
  {
    title: 'ChatGPT Voice Mode: Building Your 24/7 Lead Response System',
    date: 'Feb 17, 2026',
  },
  {
    title: 'The AI-Powered Listing Presentation That Wins Every Time',
    date: 'Feb 24, 2026',
  },
];

export function WeeklyDeepDive({ isPremium }: DeepDiveProps) {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden mb-8">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="bg-[#e85d26] text-[#2a2a2a] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            🔬 Weekly Deep Dive
          </span>
          <span className="text-[#666] text-xs">{CURRENT_DEEP_DIVE.date}</span>
          <span className="text-[#888] text-xs">•</span>
          <span className="text-[#666] text-xs">{CURRENT_DEEP_DIVE.readTime}</span>
        </div>
        
        <h2 className="text-xl md:text-2xl font-bold text-[#2a2a2a] mb-2 leading-tight">
          {CURRENT_DEEP_DIVE.title}
        </h2>
        <p className="text-blue-300 text-sm font-medium">
          {CURRENT_DEEP_DIVE.subtitle}
        </p>
      </div>

      {/* Preview */}
      <div className="px-6 pb-4">
        <p className="text-[#555] text-sm leading-relaxed">
          {CURRENT_DEEP_DIVE.preview}
        </p>
      </div>

      {/* What's Inside */}
      <div className="px-6 pb-4">
        <p className="text-[#666] text-xs font-semibold uppercase tracking-wider mb-3">
          What&apos;s inside
        </p>
        <ul className="space-y-2">
          {CURRENT_DEEP_DIVE.sections.map((section, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <span className="text-[#e85d26] mt-0.5">→</span>
              <span className={isPremium ? 'text-[#555]' : 'text-[#888]'}>
                {isPremium ? section : (i < 2 ? section : '••••••••••••••••••••••')}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="px-6 pb-6">
        {isPremium ? (
          <button className="w-full py-3 bg-[#e85d26] text-[#2a2a2a] font-semibold rounded-lg hover:bg-[#c44a1a] transition-colors">
            Read Full Deep Dive →
          </button>
        ) : (
          <div className="bg-[#f0ece4]/50 border border-[#d8d4cc] rounded-lg p-4 text-center">
            <p className="text-[#666] text-sm mb-3">
              🔒 Deep Dives are exclusive to <span className="text-[#2a2a2a] font-semibold">Pro</span> and <span className="text-[#2a2a2a] font-semibold">Inner Circle</span> members
            </p>
            <a 
              href="/subscribe"
              className="inline-block px-6 py-2.5 bg-[#e85d26] text-[#2a2a2a] text-sm font-semibold rounded-lg hover:bg-[#c44a1a] transition-colors"
            >
              Unlock for $19/mo
            </a>
          </div>
        )}
      </div>

      {/* Upcoming */}
      <div className="bg-[#f0ece4]/50 border-t border-[#d8d4cc] px-6 py-4">
        <p className="text-[#666] text-xs font-semibold uppercase tracking-wider mb-3">
          Coming up
        </p>
        <div className="space-y-2">
          {UPCOMING_DEEP_DIVES.map((dd, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-[#555] text-sm">{dd.title}</span>
              <span className="text-[#888] text-xs whitespace-nowrap ml-4">{dd.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
