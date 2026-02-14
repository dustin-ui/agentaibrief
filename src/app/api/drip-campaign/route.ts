import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 });
  }

  const body = await req.json();
  const { campaignType, channel, sequenceLength, tone, agentName, agentPhone, marketArea, additionalContext } = body;

  if (!campaignType) {
    return NextResponse.json({ error: 'Campaign type is required' }, { status: 400 });
  }

  const numMessages = parseInt(sequenceLength) || 5;

  const prompt = `You are an expert real estate marketing copywriter who specializes in drip campaigns and lead nurturing.

Generate a complete drip campaign sequence with the following parameters:
- Campaign Type: ${campaignType}
- Channel: ${channel || 'Email Only'}
- Number of Messages: ${numMessages}
- Sequence Length: ${sequenceLength}
- Tone: ${tone || 'Professional & Warm'}
- Agent Name: ${agentName || '[Agent Name]'}
- Agent Phone: ${agentPhone || '[Phone]'}
- Market Area: ${marketArea || '[Market Area]'}
${additionalContext ? `- Additional Context: ${additionalContext}` : ''}

Rules:
- Each message should build on the previous one, creating a natural nurture flow
- Include clear calls to action in every message
- For emails: include compelling subject lines
- For texts: keep under 160 characters per message where possible, be conversational
- For combo: alternate between email and text appropriately
- Never use Fair Housing violating language (no "family-friendly", "great for families", etc.)
- Make each message feel personal, not templated
- Include the agent's name and phone naturally

Return ONLY a JSON object with this structure:
{
  "messages": [
    {
      "day": "Day 1",
      "subject": "Subject line (email only, omit for texts)",
      "channel": "Email" or "Text",
      "body": "The full message body"
    }
  ]
}`;

  try {
    const client = new Anthropic({ apiKey });
    const res = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = res.content
      .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('');

    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();

    const data = JSON.parse(cleaned);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Drip campaign error:', error);
    return NextResponse.json({ error: 'Failed to generate campaign' }, { status: 500 });
  }
}
