// AI News RSS Feeds for Agent AI Brief

export const AI_NEWS_FEEDS = [
  // Major Tech AI Coverage
  { name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', category: 'tech' },
  { name: 'The Verge AI', url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml', category: 'tech' },
  { name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/', category: 'tech' },
  { name: 'Wired AI', url: 'https://www.wired.com/feed/tag/ai/latest/rss', category: 'tech' },
  { name: 'MIT Tech Review AI', url: 'https://www.technologyreview.com/feed/', category: 'research' },
  { name: 'Ars Technica AI', url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', category: 'tech' },
  { name: 'ZDNet AI', url: 'https://www.zdnet.com/topic/artificial-intelligence/rss.xml', category: 'tech' },
  
  // Real Estate
  { name: 'HousingWire', url: 'https://www.housingwire.com/feed/', category: 'realestate' },
  { name: 'The Real Deal', url: 'https://therealdeal.com/feed/', category: 'realestate' },
  { name: 'RealTrends', url: 'https://www.realtrends.com/feed/', category: 'realestate' },
  
  // AI Company Blogs (verified working URLs)
  { name: 'OpenAI Blog', url: 'https://openai.com/news/rss.xml', category: 'company' },
  { name: 'Google AI Blog', url: 'https://blog.google/technology/ai/rss/', category: 'company' },
  
  // Additional AI/Tech Sources
  { name: 'The Information AI', url: 'https://www.theinformation.com/feed', category: 'tech' },
  { name: 'The Register AI', url: 'https://www.theregister.com/software/ai_ml/headlines.atom', category: 'tech' },
  { name: 'Bloomberg Tech', url: 'https://feeds.bloomberg.com/technology/news.rss', category: 'tech' },
];

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  category: string;
  publishedAt: Date;
  summary?: string;
  agentAngle?: string;
  implementationTip?: string;
  trendingScore: number;
}
