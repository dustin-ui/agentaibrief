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

interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  contentSnippet?: string;
  content?: string;
  creator?: string;
  categories?: string[];
}

// Max age: articles older than this are filtered out entirely
const MAX_AGE_HOURS = 72; // 3 days

function getArticleAgeHours(item: RSSItem): number {
  const pubDate = new Date(item.pubDate || item.isoDate || Date.now());
  return (Date.now() - pubDate.getTime()) / (1000 * 60 * 60);
}

function calculateBaseTrendingScore(item: RSSItem, source: string): number {
  const hoursAgo = getArticleAgeHours(item);
  
  // Hard filter: skip anything older than MAX_AGE_HOURS
  if (hoursAgo > MAX_AGE_HOURS) return -1;
  
  // Recency score (0-60 points) — steeper decay
  // Fresh (<6h) = 48-60 pts, same day (<24h) = 12-48 pts, older = 0-12 pts
  const recencyScore = Math.max(0, 60 - hoursAgo * 2.5);
  
  // Source authority bonus (0-25 points)
  const authorityScores: Record<string, number> = {
    'TechCrunch AI': 22,
    'The Verge AI': 22,
    'OpenAI Blog': 25,
    'MIT Tech Review AI': 23,
    'VentureBeat AI': 18,
    'Wired AI': 20,
    'Google AI Blog': 25,
    'ZDNet AI': 16,
    'HousingWire': 20,
    'The Real Deal': 18,
    'RealTrends': 16,
    'The Information AI': 22,
    'The Register AI': 15,
    'Bloomberg Tech': 22,
    'Ars Technica AI': 18,
  };
  const authorityScore = authorityScores[source] || 12;
  
  // Small deterministic variance based on title hash (consistent, not random)
  let hash = 0;
  const title = item.title || '';
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash) + title.charCodeAt(i);
    hash |= 0;
  }
  const variance = Math.abs(hash % 15);
  
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
  
  // Filter out articles older than MAX_AGE_HOURS (scored as -1)
  const freshItems = allItems.filter(item => item.trendingScore >= 0);
  
  // Sort by trending score, then by date
  return freshItems.sort((a, b) => {
    if (b.trendingScore !== a.trendingScore) {
      return b.trendingScore - a.trendingScore;
    }
    return b.publishedAt.getTime() - a.publishedAt.getTime();
  });
}
