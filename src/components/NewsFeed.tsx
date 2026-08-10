'use client';

import { useEffect, useMemo, useState } from 'react';
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

  useEffect(() => {
    async function fetchNews() {
      try {
        setLoading(true);
        const res = await fetch('/api/news');
        const data = await res.json();
        
        if (data.success && Array.isArray(data.items)) {
          setNews(data.items);
          setLastUpdated(data.updatedAt);
        } else {
          setError('Failed to load news');
        }
      } catch {
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

  const orderedNews = useMemo(() => {
    if (news.length === 0) return [];

    let featuredIndex = 0;
    for (let index = 1; index < news.length; index += 1) {
      const candidate = news[index];
      const current = news[featuredIndex];
      const candidateTime = new Date(candidate.publishedAt).getTime() || 0;
      const currentTime = new Date(current.publishedAt).getTime() || 0;

      if (
        candidate.trendingScore > current.trendingScore ||
        (candidate.trendingScore === current.trendingScore && candidateTime > currentTime)
      ) {
        featuredIndex = index;
      }
    }

    const featured = news[featuredIndex];
    const latest = news
      .filter((_, index) => index !== featuredIndex)
      .sort((a, b) => {
        const dateDifference =
          (new Date(b.publishedAt).getTime() || 0) -
          (new Date(a.publishedAt).getTime() || 0);

        return dateDifference || a.id.localeCompare(b.id);
      });

    return [featured, ...latest];
  }, [news]);

  const featuredStory = orderedNews[0];
  const latestStories = orderedNews.slice(1);

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
      {/* Last Updated */}
      {lastUpdated && (
        <p className="mb-5 text-xs text-[#666]">
          Last updated: {new Date(lastUpdated).toLocaleTimeString()}
        </p>
      )}

      {featuredStory ? (
        <>
          <section aria-labelledby="featured-story-heading">
            <h2
              id="featured-story-heading"
              className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[#e85d26]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Featured Story
            </h2>
            <div className="overflow-hidden rounded-2xl border-2 border-[#d4d0c8] bg-[#f5f0ea] px-5 sm:px-7">
              <NewsCard {...featuredStory} isPremium={isPremium} />
            </div>
          </section>

          <section className="mt-12" aria-labelledby="latest-stories-heading">
            <h2
              id="latest-stories-heading"
              className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[#555]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Latest Stories
            </h2>
            <div className="divide-y divide-[#d4d0c8]">
              {latestStories.map((item) => (
                <NewsCard key={item.id} {...item} isPremium={isPremium} />
              ))}
            </div>
          </section>
        </>
      ) : (
        <p className="py-8 text-center text-[#888]">No stories found</p>
      )}

      {orderedNews.length > 0 && (
        <div className="py-6 text-center">
          <p className="text-sm text-[#888]">
            Showing {orderedNews.length} {orderedNews.length === 1 ? 'story' : 'stories'}
          </p>
        </div>
      )}
    </div>
  );
}
