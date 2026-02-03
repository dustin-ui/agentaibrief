// Cache for Agent Angles — uses Gemini API (Anthropic as fallback)

import { analyzeWithGemini, AnalysisResult } from './analyze-gemini';

interface CachedAngle {
  result: AnalysisResult;
  cachedAt: number;
}

const cache = new Map<string, CachedAngle>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const pendingAnalysis = new Map<string, Promise<AnalysisResult | null>>();

export async function getAgentAngle(
  id: string,
  headline: string,
  summary: string,
  source: string,
): Promise<AnalysisResult | null> {
  // Check cache
  const cached = cache.get(id);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
    return cached.result;
  }

  // Deduplicate concurrent requests
  if (pendingAnalysis.has(id)) {
    return pendingAnalysis.get(id)!;
  }

  const promise = analyzeWithGemini(headline, summary, source)
    .then(result => {
      if (result) {
        cache.set(id, { result, cachedAt: Date.now() });
      }
      pendingAnalysis.delete(id);
      return result;
    })
    .catch(err => {
      console.error(`Failed to analyze ${id}:`, err);
      pendingAnalysis.delete(id);
      return null;
    });

  pendingAnalysis.set(id, promise);
  return promise;
}

// Batch analyze top N stories
export async function batchAnalyze(
  items: Array<{ id: string; title: string; summary?: string; source: string }>,
  limit: number = 10,
): Promise<Map<string, AnalysisResult>> {
  const results = new Map<string, AnalysisResult>();
  
  // Return cached items, identify uncached
  const uncached = items.filter(item => {
    const cached = cache.get(item.id);
    if (cached && Date.now() - cached.cachedAt < CACHE_TTL) {
      results.set(item.id, cached.result);
      return false;
    }
    return true;
  }).slice(0, limit);

  // Analyze in parallel, 3 at a time
  const CONCURRENCY = 3;
  for (let i = 0; i < uncached.length; i += CONCURRENCY) {
    const batch = uncached.slice(i, i + CONCURRENCY);
    await Promise.allSettled(
      batch.map(async item => {
        const result = await getAgentAngle(
          item.id,
          item.title,
          item.summary || '',
          item.source,
        );
        if (result) {
          results.set(item.id, result);
        }
      })
    );
  }

  return results;
}
