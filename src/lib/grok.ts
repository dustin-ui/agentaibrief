// Grok/xAI trending topics client
// Uses grok-3-mini-fast via the xAI chat completions API

export interface TrendingTopic {
  label: string;
  description: string;
}

export interface TrendingData {
  realestate: TrendingTopic[];
  ai: TrendingTopic[];
}

const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';
const MODEL = 'grok-3-mini';

const SYSTEM_PROMPT = `You are a trend analyst. Return ONLY valid JSON, no markdown fences, no commentary.`;

const USER_PROMPT = `What are the top 5 trending topics right now at the intersection of AI and real estate? For each, give a 2-3 word label and a one-sentence description of why it's trending. Also give 5 trending general AI topics that real estate agents should know about. Return as JSON with this exact shape:
{
  "realestate": [{ "label": "...", "description": "..." }],
  "ai": [{ "label": "...", "description": "..." }]
}`;

export async function fetchTrendingTopics(): Promise<TrendingData> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error('XAI_API_KEY environment variable is not set');
  }

  const response = await fetch(XAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: USER_PROMPT },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`xAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content: string = data.choices?.[0]?.message?.content ?? '';

  // Strip markdown fences if present
  const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  const parsed = JSON.parse(cleaned) as TrendingData;

  // Validate structure
  if (!Array.isArray(parsed.realestate) || !Array.isArray(parsed.ai)) {
    throw new Error('Invalid response structure from Grok');
  }

  return {
    realestate: parsed.realestate.slice(0, 5),
    ai: parsed.ai.slice(0, 5),
  };
}
