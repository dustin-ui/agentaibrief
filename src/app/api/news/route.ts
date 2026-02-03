import { NextResponse } from 'next/server';
import { fetchAllFeeds } from '@/lib/rss';
import { SAMPLE_NEWS } from '@/lib/sample-news';
import { batchAnalyze } from '@/lib/angle-cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
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

    return NextResponse.json({ 
      success: true, 
      count: items.length,
      updatedAt: new Date().toISOString(),
      items: items.slice(0, 30),
    });
  } catch (error) {
    console.error('Failed to fetch news:', error);
    return NextResponse.json({ 
      success: true, 
      count: SAMPLE_NEWS.length,
      updatedAt: new Date().toISOString(),
      items: SAMPLE_NEWS,
    });
  }
}
