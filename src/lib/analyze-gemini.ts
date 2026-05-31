// Gemini-based Agent Angle analyzer (uses available API key)
import { AI_MODELS } from './config';

export interface AnalysisResult {
  agentAngle: string;
  implementationTip: string;
}

const SYSTEM_PROMPT = `You are a senior real estate technology strategist who deeply understands both cutting-edge AI developments and the day-to-day realities of residential real estate agents. 

Your job: Take any news story and translate it into practical, actionable insight for a real estate professional. Be specific — name tools, workflows, or actions an agent can take TODAY. Never give generic "AI will change everything" fluff.`;

export async function analyzeWithGemini(
  headline: string,
  summary: string,
  source: string,
): Promise<AnalysisResult | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `Analyze this news story for real estate agents:

**Headline:** ${headline}
**Summary:** ${summary}
**Source:** ${source}

Respond in this exact JSON format (no markdown, no code fences, just raw JSON):
{
  "agentAngle": "2-3 sentences explaining why this news matters to a real estate agent's business. Be specific about the impact on their daily work, income, or competitive position.",
  "implementationTip": "One specific, actionable thing an agent can do TODAY to take advantage of this. Include a tool name, workflow step, or concrete action."
}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODELS.gemini}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 512,
            responseMimeType: 'application/json',
          },
        }),
        signal: AbortSignal.timeout(60_000),
      },
    );

    if (!res.ok) {
      if (res.status === 429) {
        const retryAfter = res.headers.get('retry-after');
        console.error('Gemini API rate limited (429)', retryAfter ? `retry after ${retryAfter}s` : '');
        return null;
      }
      console.error('Gemini API error:', res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = JSON.parse(text);
    return {
      agentAngle: parsed.agentAngle || 'Analysis unavailable.',
      implementationTip: parsed.implementationTip || 'Check back for tips.',
    };
  } catch (err) {
    console.error('Gemini analysis failed:', err);
    return null;
  }
}
