'use client';

import { formatDistanceToNow } from 'date-fns';
import { TrendingBadge } from './TrendingBadge';
import { ShareButtons } from './ShareButtons';
import { FREE_ACCESS_MODE } from '@/lib/site-mode';

interface NewsCardProps {
  id: string;
  title: string;
  link: string;
  source: string;
  category: string;
  publishedAt: string;
  summary?: string;
  agentAngle?: string;
  implementationTip?: string;
  trendingScore: number;
  isPremium?: boolean;
}

export function NewsCard({
  title,
  link,
  source,
  category,
  publishedAt,
  summary,
  agentAngle,
  implementationTip,
  trendingScore,
  isPremium = false,
}: NewsCardProps) {
  const timeAgo = formatDistanceToNow(new Date(publishedAt), { addSuffix: true });
  
  const categoryColors: Record<string, string> = {
    tech: 'bg-purple-100 text-purple-700',
    realestate: 'bg-green-100 text-green-700',
    company: 'bg-[#f0ece4] text-[#c44a1a]',
    research: 'bg-amber-100 text-amber-700',
  };

  return (
    <article className="group border-b border-[#e0dcd4] py-4 hover:bg-[#f0ece4] transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Trending + Category Row */}
          <div className="flex items-center gap-2 mb-2">
            <TrendingBadge score={trendingScore} />
            <span className={`text-xs px-2 py-0.5 rounded ${categoryColors[category] || 'bg-[#f5f0ea] text-[#666]'}`}>
              {source}
            </span>
            <span className="text-xs text-[#666]">{timeAgo}</span>
          </div>
          
          {/* Title */}
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block group"
          >
            <h2 className="text-lg font-semibold text-[#2a2a2a] group-hover:text-[#e85d26] transition-colors line-clamp-2">
              {title}
            </h2>
          </a>
          
          {/* Summary */}
          {summary && (
            <p className="mt-1 text-sm text-[#666] line-clamp-2">
              {summary}
            </p>
          )}
          
          {/* Agent Angle - Premium Content */}
          {agentAngle && (
            <div className="mt-3 p-3 bg-[#f5f0ea] rounded-lg border-l-4 border-[#e85d26]">
              <p className="text-xs font-semibold text-[#c44a1a] mb-1">🏠 AGENT ANGLE</p>
              <p className="text-sm text-[#2a2a2a]">{agentAngle}</p>
            </div>
          )}
          
          {/* Implementation Tip - Premium Content */}
          {implementationTip && (
            <div className="mt-2 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="text-xs font-semibold text-green-700 mb-1">💡 TRY TODAY</p>
              <p className="text-sm text-green-900">{implementationTip}</p>
            </div>
          )}
          
          {/* Share Buttons */}
          <div className="mt-2">
            <ShareButtons title={title} url={link} />
          </div>

          {/* Locked Content Placeholder — in free mode there is no paywall, so
              show a friendly newsletter nudge instead of a misleading lock. */}
          {!agentAngle && !isPremium && (
            <div className="mt-3 p-3 bg-[#f5f0ea] rounded-lg border border-dashed border-gray-300">
              {FREE_ACCESS_MODE ? (
                <p className="text-sm text-[#5a5a5a] text-center">
                  <a href="/subscribe" className="text-[#e85d26] hover:underline">More agent insights in the daily brief →</a>
                </p>
              ) : (
                <p className="text-sm text-[#5a5a5a] text-center">
                  🔒 <span className="font-medium">Agent Angle &amp; Implementation Tips</span> —
                  <a href="/subscribe" className="text-[#e85d26] hover:underline ml-1">Subscribe to unlock</a>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
