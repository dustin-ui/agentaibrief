import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 });
  }

  const body = await req.json();
  const { address, price, beds, baths, sqft, keyFeatures, targetBuyer, agentName, agentPhone } = body;

  if (!address || !price) {
    return NextResponse.json({ error: 'Address and price are required' }, { status: 400 });
  }

  const listingContext = `
Property: ${address}
Price: ${price}
Beds: ${beds || 'N/A'} | Baths: ${baths || 'N/A'} | SqFt: ${sqft || 'N/A'}
Key Features: ${keyFeatures || 'None specified'}
Target Buyer: ${targetBuyer || 'General'}
Agent: ${agentName || 'N/A'} | Phone: ${agentPhone || 'N/A'}
`.trim();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const client = new Anthropic({ apiKey });

        // BATCH 1: MLS Description, Email Blast, Schema Markup
        send('progress', { pct: 5, msg: 'Generating MLS description & email blast...' });

        const batch1Text = await runBatch(client, `You are an expert real estate copywriter. Generate content for this listing:

${listingContext}

Return ONLY a JSON object with these keys:
{
  "mlsDescription": "Professional MLS listing description, 200-300 words. Compelling, descriptive, highlights key features. No agent info.",
  "emailBlast": "HTML-ready email announcement. Include property photo placeholder, key details, CTA button. Use inline styles. Agent name: ${agentName || '[Agent Name]'}, phone: ${agentPhone || '[Phone]'}. Make it professional and exciting.",
  "schemaMarkup": "Valid JSON-LD schema.org/RealEstateListing markup for this property as a string (not nested JSON - provide the complete script tag content)"
}`);

        let batch1: Record<string, string>;
        try {
          batch1 = JSON.parse(cleanJSON(batch1Text));
        } catch {
          throw new Error('Failed to parse batch 1 response');
        }

        send('progress', { pct: 35, msg: 'Writing social media posts...' });
        send('partial', { sections: batch1 });

        // BATCH 2: Instagram, Facebook, LinkedIn, X/Twitter
        const batch2Text = await runBatch(client, `You are a social media expert for real estate. Create posts for this listing:

${listingContext}

MLS Description (for context): ${batch1.mlsDescription?.slice(0, 200)}...

Return ONLY a JSON object with these keys:
{
  "instagramCaption": "Engaging Instagram caption with line breaks, emojis, and 20-25 relevant hashtags at the end. Include call to action.",
  "facebookPost": "Facebook post, conversational tone, emoji-friendly, 150-250 words. Include call to action with agent contact info.",
  "linkedinPost": "Professional LinkedIn post about this new listing. Market-savvy tone, 150-200 words. Position the agent as knowledgeable.",
  "twitterPost": "X/Twitter post under 280 characters. Punchy, with key details and a hook. Include 2-3 hashtags."
}`);

        let batch2: Record<string, string>;
        try {
          batch2 = JSON.parse(cleanJSON(batch2Text));
        } catch {
          throw new Error('Failed to parse batch 2 response');
        }

        send('progress', { pct: 65, msg: 'Creating video scripts...' });
        send('partial', { sections: batch2 });

        // BATCH 3: TikTok/Reels Script, Video Walkthrough Script
        const batch3Text = await runBatch(client, `You are a real estate video content creator. Create video scripts for this listing:

${listingContext}

Return ONLY a JSON object with these keys:
{
  "tiktokScript": "60-second TikTok/Reels script. Format: each line is a new scene/cut. Start with a hook in the first 3 seconds. Include text overlay suggestions in [brackets]. Trendy, fast-paced, engaging.",
  "walkthroughScript": "2-minute video walkthrough script. Professional narration style. Include camera direction notes in [brackets]. Cover: exterior approach, entry, main living areas, kitchen, bedrooms, bathrooms, special features, outdoor spaces, closing with agent CTA."
}`);

        let batch3: Record<string, string>;
        try {
          batch3 = JSON.parse(cleanJSON(batch3Text));
        } catch {
          throw new Error('Failed to parse batch 3 response');
        }

        send('progress', { pct: 95, msg: 'Finalizing...' });

        const allSections = { ...batch1, ...batch2, ...batch3 };
        send('done', { sections: allSections });
        controller.close();
      } catch (error) {
        console.error('Listing generator error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        send('error', { error: `Generation failed: ${message}` });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

async function runBatch(client: Anthropic, prompt: string): Promise<string> {
  const res = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    messages: [{ role: 'user', content: prompt }],
  });
  return res.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('');
}

function cleanJSON(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  return cleaned.trim();
}
