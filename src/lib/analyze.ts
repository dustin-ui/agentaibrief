import Anthropic from '@anthropic-ai/sdk';

export interface AnalysisInput {
  headline: string;
  summary: string;
  source?: string;
}

export interface AnalysisResult {
  agentAngle: string;
  implementationTip: string;
}

const SYSTEM_PROMPT = `You are a senior real estate technology strategist who deeply understands both cutting-edge AI developments and the day-to-day realities of residential real estate agents. You've closed hundreds of deals, managed teams, and now advise top-producing agents on how to leverage AI to win more listings, close faster, and deliver better client experiences.

Your job: Take any AI news story and translate it into practical, actionable insight for a real estate professional. You understand:
- Lead generation, nurturing, and conversion
- Listing presentations and CMAs
- Open houses, showings, and client communication
- MLS systems, CRMs (Sierra, Follow Up Boss, KvCORE), and transaction management
- Marketing (social media, email drips, farming, direct mail)
- Compliance, fair housing, and NAR settlement implications
- The competitive landscape between brokerages and teams

Always be specific. Never give generic "AI will change everything" fluff. Name specific tools, workflows, or actions an agent can take TODAY.`;

export async function analyzeNewsForAgents(input: AnalysisInput): Promise<AnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  const client = new Anthropic({ apiKey });

  const userPrompt = `Analyze this AI news story for real estate agents:

**Headline:** ${input.headline}
**Summary:** ${input.summary}
${input.source ? `**Source:** ${input.source}` : ''}

Respond in this exact JSON format (no markdown, no code fences, just raw JSON):
{
  "agentAngle": "2-3 sentences explaining why this AI news matters to a real estate agent's business. Be specific about the impact on their daily work, income, or competitive position.",
  "implementationTip": "One specific, actionable thing an agent can do TODAY to take advantage of this development. Include a tool name, workflow step, or concrete action."
}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  try {
    const parsed = JSON.parse(text) as AnalysisResult;
    return {
      agentAngle: parsed.agentAngle || 'Analysis unavailable.',
      implementationTip: parsed.implementationTip || 'No tip available.',
    };
  } catch {
    // If JSON parsing fails, try to extract from the response
    return {
      agentAngle: text.slice(0, 500),
      implementationTip: 'Check the full analysis for actionable steps.',
    };
  }
}
