'use client';

import { formatDistanceToNow } from 'date-fns';
import { TrendingBadge } from './TrendingBadge';

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
    company: 'bg-blue-100 text-blue-700',
    research: 'bg-amber-100 text-amber-700',
  };

  return (
    <article className="border-b border-gray-200 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Trending + Category Row */}
          <div className="flex items-center gap-2 mb-2">
            <TrendingBadge score={trendingScore} />
            <span className={`text-xs px-2 py-0.5 rounded ${categoryColors[category] || 'bg-gray-100 text-gray-600'}`}>
              {source}
            </span>
            <span className="text-xs text-gray-400">{timeAgo}</span>
          </div>
          
          {/* Title */}
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block group"
          >
            <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
              {title}
            </h2>
          </a>
          
          {/* Summary */}
          {summary && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
              {summary}
            </p>
          )}
          
          {/* Agent Angle - Premium Content */}
          {agentAngle && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <p className="text-xs font-semibold text-blue-700 mb-1">🏠 AGENT ANGLE</p>
              <p className="text-sm text-blue-900">{agentAngle}</p>
            </div>
          )}
          
          {/* Implementation Tip - Premium Content */}
          {implementationTip && (
            <div className="mt-2 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
              <p className="text-xs font-semibold text-green-700 mb-1">💡 TRY TODAY</p>
              <p className="text-sm text-green-900">{implementationTip}</p>
            </div>
          )}
          
          {/* Locked Content Placeholder */}
          {!agentAngle && !isPremium && (
            <div className="mt-3 p-3 bg-gray-100 rounded-lg border border-dashed border-gray-300">
              <p className="text-sm text-gray-500 text-center">
                🔒 <span className="font-medium">Agent Angle & Implementation Tips</span> — 
                <a href="/subscribe" className="text-blue-600 hover:underline ml-1">Subscribe to unlock</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
