import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { fetchAllFeeds } from '@/lib/rss';
import { SAMPLE_NEWS } from '@/lib/sample-news';
import { batchAnalyze } from '@/lib/angle-cache';
import type { NewsItem } from '@/lib/feeds';

// Cache the computed news payload for 5 minutes so feeds + Gemini analysis
// are not recomputed on every request. NewsFeed.tsx polls every 5 min/tab;
// without this, each poll re-fetches 15 RSS feeds and re-runs Gemini.
export const revalidate = 300;

type NewsPayload = {
  success: boolean;
  degraded?: boolean;
  fallback?: boolean;
  count: number;
  updatedAt: string;
  items: NewsItem[];
};

function publishedTime(item: NewsItem): number {
  const time = new Date(item.publishedAt).getTime();
  return Number.isFinite(time) ? time : 0;
}

function orderNewsItems(items: NewsItem[]): NewsItem[] {
  if (items.length === 0) return [];

  let featuredIndex = 0;
  for (let index = 1; index < items.length; index += 1) {
    const candidate = items[index];
    const current = items[featuredIndex];

    if (
      candidate.trendingScore > current.trendingScore ||
      (candidate.trendingScore === current.trendingScore &&
        publishedTime(candidate) > publishedTime(current))
    ) {
      featuredIndex = index;
    }
  }

  const featured = items[featuredIndex];
  const latest = items
    .filter((_, index) => index !== featuredIndex)
    .sort((a, b) => publishedTime(b) - publishedTime(a) || a.id.localeCompare(b.id));

  return [featured, ...latest];
}

async function computeNews(): Promise<NewsPayload> {
  try {
    const news = await fetchAllFeeds();

    // Use real RSS items, supplement with sample if too few
    let items = news.length >= 5
      ? news
      : [...news, ...SAMPLE_NEWS.map(item => ({
          ...item,
          publishedAt: new Date(item.publishedAt),
        }))];

    // Keep one strongest story featured, then put every other story in
    // strict newest-to-oldest order.
    items = orderNewsItems(items);

    // Auto-generate Agent Angles for top stories via Gemini
    try {
      const needAngles = items
        .filter(item => !item.agentAngle)
        .slice(0, 10);

      if (needAngles.length > 0) {
        const angles = await batchAnalyze(
          needAngles.map(item => ({
            id: item.id,
            title: item.title,
            summary: item.summary || '',
            source: item.source,
          })),
          10,
        );

        items = items.map(item => {
          const angle = angles.get(item.id);
          if (angle) {
            return {
              ...item,
              agentAngle: angle.agentAngle,
              implementationTip: angle.implementationTip,
            };
          }
          return item;
        });
      }
    } catch (err) {
      console.error('Angle generation failed:', err);
    }

    return {
      success: true,
      count: items.length,
      updatedAt: new Date().toISOString(),
      items: items.slice(0, 30),
    };
  } catch (error) {
    console.error('Failed to fetch news:', error);
    const fallbackItems = orderNewsItems(
      SAMPLE_NEWS.map(item => ({
        ...item,
        publishedAt: new Date(item.publishedAt),
      })),
    );

    return {
      success: true,
      degraded: true,
      fallback: true,
      count: fallbackItems.length,
      updatedAt: new Date().toISOString(),
      items: fallbackItems,
    };
  }
}

// Wrap the heavy feed + analysis computation in the Next data cache.
// Revalidates every 5 minutes; all clients are served the cached JSON.
const getCachedNews = unstable_cache(computeNews, ['api-news-payload'], {
  revalidate: 300,
  tags: ['news'],
});

export async function GET() {
  const payload = await getCachedNews();
  return NextResponse.json(payload);
}
