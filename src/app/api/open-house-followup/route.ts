import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 });
  }

  const body = await req.json();
  const { propertyAddress, agentName, agentPhone, visitorName, interestLevel, channel, notes } = body;

  if (!propertyAddress) {
    return NextResponse.json({ error: 'Property address is required' }, { status: 400 });
  }

  const prompt = `You are an expert real estate agent who converts open house visitors into clients. Generate a 3-touch follow-up sequence.

Context:
- Property: ${propertyAddress}
- Agent: ${agentName || '[Agent Name]'} | Phone: ${agentPhone || '[Phone]'}
- Visitor: ${visitorName || '[Visitor]'}
- Interest Level: ${interestLevel}
- Channel: ${channel}
- Notes: ${notes || 'None'}

Rules:
- Personalize based on the interest level and any notes provided
- For "Hot" leads: be more direct about next steps, scheduling showings
- For "Warm" leads: provide value, suggest similar properties
- For "Cool/Unknown" leads: be helpful without pushy, offer market info
- For emails: include subject lines
- For texts: keep concise and conversational
- Never use Fair Housing violating language
- Include the agent's contact info naturally
- Reference the specific property they visited

Return ONLY a JSON object:
{
  "interestLevel": "${interestLevel}",
  "immediateFollowUp": {
    "channel": "Email" or "Text",
    "subject": "Subject (email only)",
    "body": "Message body"
  },
  "dayThreeFollowUp": {
    "channel": "Email" or "Text",
    "subject": "Subject (email only)",
    "body": "Message body"
  },
  "daySevenFollowUp": {
    "channel": "Email" or "Text",
    "subject": "Subject (email only)",
    "body": "Message body"
  },
  "bonusTip": "A specific pro tip for converting this type of lead"
}`;

  try {
    const client = new Anthropic({ apiKey });
    const res = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
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
    console.error('Open house followup error:', error);
    return NextResponse.json({ error: 'Failed to generate follow-ups' }, { status: 500 });
  }
}
