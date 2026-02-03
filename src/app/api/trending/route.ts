import { NextResponse } from 'next/server';
import { fetchTrendingTopics, type TrendingData } from '@/lib/grok';

// In-memory cache
let cache: { data: TrendingData; updatedAt: string } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function isCacheValid(): boolean {
  if (!cache) return false;
  const age = Date.now() - new Date(cache.updatedAt).getTime();
  return age < CACHE_TTL_MS;
}

export async function GET() {
  try {
    if (isCacheValid() && cache) {
      return NextResponse.json({
        success: true,
        realestate: cache.data.realestate,
        ai: cache.data.ai,
        updatedAt: cache.updatedAt,
        cached: true,
      });
    }

    const data = await fetchTrendingTopics();
    const updatedAt = new Date().toISOString();

    cache = { data, updatedAt };

    return NextResponse.json({
      success: true,
      realestate: data.realestate,
      ai: data.ai,
      updatedAt,
      cached: false,
    });
  } catch (error) {
    console.error('[trending] Error fetching trending topics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
