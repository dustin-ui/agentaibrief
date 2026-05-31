import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { fetchAllFeeds } from '@/lib/rss';
import { SAMPLE_NEWS } from '@/lib/sample-news';
import { batchAnalyze } from '@/lib/angle-cache';

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
  items: unknown[];
};

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

    // Sort by trending score
    items.sort((a, b) => b.trendingScore - a.trendingScore);

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
    return {
      success: false,
      degraded: true,
      fallback: true,
      count: SAMPLE_NEWS.length,
      updatedAt: new Date().toISOString(),
      items: SAMPLE_NEWS.map(item => ({
        ...item,
        publishedAt: new Date(item.publishedAt),
      })),
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
