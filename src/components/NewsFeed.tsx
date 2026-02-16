'use client';

import { useEffect, useState } from 'react';
import { NewsCard } from './NewsCard';

interface NewsItem {
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
}

interface NewsFeedProps {
  isPremium?: boolean;
}

export function NewsFeed({ isPremium = false }: NewsFeedProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        const res = await fetch('/api/news');
        const data = await res.json();
        
        if (data.success) {
          setNews(data.items);
          setLastUpdated(data.updatedAt);
        } else {
          setError('Failed to load news');
        }
      } catch (err) {
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
    // Refresh every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredNews = filter === 'all' 
    ? news 
    : news.filter(item => item.category === filter);

  const categories = [
    { id: 'all', label: 'All Stories' },
    { id: 'tech', label: 'Tech AI' },
    { id: 'company', label: 'AI Companies' },
    { id: 'research', label: 'Research' },
    { id: 'realestate', label: 'Real Estate' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e85d26]"></div>
        <span className="ml-3 text-[#666]">Loading latest AI news...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-[#e85d26] text-white rounded hover:bg-[#c44a1a]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === cat.id
                ? 'bg-[#e85d26] text-white'
                : 'bg-[#f5f0ea] text-[#666] hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <p className="text-xs text-[#666] mb-4">
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
        </p>
      )}

      {/* News Items */}
      <div className="divide-y divide-gray-200">
        {filteredNews.length === 0 ? (
          <p className="text-center py-8 text-[#888]">No stories found</p>
        ) : (
          filteredNews.map((item) => (
            <NewsCard key={item.id} {...item} isPremium={isPremium} />
          ))
        )}
      </div>

      {/* Load More / Stats */}
      <div className="text-center py-6">
        <p className="text-sm text-[#888]">
          Showing {filteredNews.length} of {news.length} stories
        </p>
      </div>
    </div>
  );
}
