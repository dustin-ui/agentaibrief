import Parser from 'rss-parser';
import { AI_NEWS_FEEDS, NewsItem } from './feeds';
import { createHash } from 'crypto';

const parser = new Parser({
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; AgentAIBrief/1.0; +https://agentaibrief.com)',
    'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml',
  },
});

function generateId(title: string, link: string): string {
  return createHash('md5').update(`${title}${link}`).digest('hex').slice(0, 12);
}

function calculateBaseTrendingScore(item: any, source: string): number {
  // Base score from recency (0-50 points)
  const pubDate = new Date(item.pubDate || item.isoDate || Date.now());
  const hoursAgo = (Date.now() - pubDate.getTime()) / (1000 * 60 * 60);
  const recencyScore = Math.max(0, 50 - hoursAgo * 2);
  
  // Source authority bonus (0-30 points)
  const authorityScores: Record<string, number> = {
    'TechCrunch AI': 25,
    'The Verge AI': 25,
    'OpenAI Blog': 30,
    'MIT Tech Review AI': 28,
    'VentureBeat AI': 22,
    'Wired AI': 23,
    'Google AI Blog': 30,
    'ZDNet AI': 20,
    'HousingWire': 18,
    'The Real Deal': 18,
    'RealTrends': 16,
    'The Information AI': 24,
    'The Register AI': 18,
    'Bloomberg Tech': 26,
    'Ars Technica AI': 22,
  };
  const authorityScore = authorityScores[source] || 15;
  
  // Random variance for now (will be replaced by actual signals)
  const variance = Math.random() * 20;
  
  return Math.min(100, Math.round(recencyScore + authorityScore + variance));
}

export async function fetchAllFeeds(): Promise<NewsItem[]> {
  const allItems: NewsItem[] = [];
  
  const feedPromises = AI_NEWS_FEEDS.map(async (feed) => {
    try {
      const result = await parser.parseURL(feed.url);
      return result.items.slice(0, 10).map((item) => ({
        id: generateId(item.title || '', item.link || ''),
        title: item.title || 'Untitled',
        link: item.link || '',
        source: feed.name,
        category: feed.category,
        publishedAt: new Date(item.pubDate || item.isoDate || Date.now()),
        summary: item.contentSnippet?.slice(0, 200) || item.content?.slice(0, 200),
        trendingScore: calculateBaseTrendingScore(item, feed.name),
      }));
    } catch (error) {
      console.error(`Failed to fetch ${feed.name}:`, error);
      return [];
    }
  });
  
  const results = await Promise.allSettled(feedPromises);
  
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value);
    }
  });
  
  // Sort by trending score, then by date
  return allItems.sort((a, b) => {
    if (b.trendingScore !== a.trendingScore) {
      return b.trendingScore - a.trendingScore;
    }
    return b.publishedAt.getTime() - a.publishedAt.getTime();
  });
}
