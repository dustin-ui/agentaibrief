import { readFileSync } from 'fs';
import { join } from 'path';

export interface DiscoveredNewsItem {
  title: string;
  summary: string;
  source: string;
  url: string;
  relevanceScore: number;
}

export interface DiscoverResult {
  items: DiscoveredNewsItem[];
  query: string;
  timestamp: string;
}

function getPerplexityApiKey(): string {
  // First check environment variable
  if (process.env.PERPLEXITY_API_KEY) {
    return process.env.PERPLEXITY_API_KEY;
  }
  // Fall back to config file
  try {
    const keyPath = join(process.env.HOME || '~', '.config', 'perplexity', 'api_key');
    return readFileSync(keyPath, 'utf-8').trim();
  } catch {
    throw new Error(
      'Perplexity API key not found. Set PERPLEXITY_API_KEY env var or create ~/.config/perplexity/api_key'
    );
  }
}

const DISCOVERY_PROMPT = `You are an AI news researcher focused on finding the latest AI developments that are relevant to real estate professionals. Search for the most recent and impactful AI news stories from the past 24-48 hours.

Focus on:
- New AI tools or features that could help real estate agents (CRM, marketing, lead gen, virtual staging, etc.)
- Major AI model releases or updates (GPT, Claude, Gemini, etc.) and how they affect business workflows
- AI regulation or policy changes that impact real estate
- PropTech companies launching AI features
- AI in mortgage, appraisal, or title industries
- Notable AI partnerships with real estate platforms (Zillow, Realtor.com, Redfin, etc.)

Return your findings as a JSON array with exactly this structure (no markdown, no code fences, just raw JSON):
[
  {
    "title": "Concise headline of the news story",
    "summary": "2-3 sentence summary of what happened and why it matters",
    "source": "Publication or company name",
    "url": "URL if available, otherwise empty string",
    "relevanceScore": 85
  }
]

Return 5-10 items, sorted by relevance score (0-100) descending. The relevance score should reflect how directly useful this news is to a practicing real estate agent.`;

export async function discoverBreakingAINews(
  customQuery?: string
): Promise<DiscoverResult> {
  const apiKey = getPerplexityApiKey();

  const query =
    customQuery ||
    'latest AI news relevant to real estate agents and the real estate industry in the past 48 hours';

  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        { role: 'system', content: DISCOVERY_PROMPT },
        { role: 'user', content: query },
      ],
      max_tokens: 2048,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Perplexity API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content: string = data.choices?.[0]?.message?.content || '[]';

  let items: DiscoveredNewsItem[];
  try {
    // Try to extract JSON from the response (handle markdown fences)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    items = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch {
    console.error('Failed to parse Perplexity response:', content);
    items = [];
  }

  // Validate and sanitize items
  items = items
    .filter((item) => item.title && item.summary)
    .map((item) => ({
      title: String(item.title),
      summary: String(item.summary),
      source: String(item.source || 'Unknown'),
      url: String(item.url || ''),
      relevanceScore: Math.min(100, Math.max(0, Number(item.relevanceScore) || 50)),
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  return {
    items,
    query,
    timestamp: new Date().toISOString(),
  };
}
