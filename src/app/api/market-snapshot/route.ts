import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 });
  }

  const { zipCode } = await req.json();
  if (!zipCode || zipCode.length !== 5) {
    return NextResponse.json({ error: 'Valid 5-digit zip code required' }, { status: 400 });
  }

  const prompt = `You are a real estate market analyst. Generate a comprehensive market snapshot for zip code ${zipCode}.

Use your training data to provide the most accurate and recent market statistics you can for this area. Be specific with numbers. If you must estimate, use realistic ranges based on known data for this region.

Return ONLY a JSON object with this structure:
{
  "areaName": "City/Neighborhood name",
  "zipCode": "${zipCode}",
  "generatedAt": "Current date string",
  "summary": "2-3 sentence market overview",
  "stats": {
    "medianPrice": "$XXX,XXX",
    "priceChange": "+X.X% YoY",
    "avgDaysOnMarket": "XX days",
    "domChange": "+/- X days YoY",
    "activeListings": "XXX",
    "inventoryChange": "+/- X% YoY",
    "soldLastMonth": "XX",
    "listToSaleRatio": "XX.X%",
    "monthsOfSupply": "X.X",
    "marketType": "Seller's Market / Buyer's Market / Balanced"
  },
  "trends": ["trend 1", "trend 2", "trend 3", "trend 4"],
  "agentTalkingPoints": ["point 1 for client conversations", "point 2", "point 3", "point 4"],
  "buyerAdvice": "Specific advice for buyers in this market",
  "sellerAdvice": "Specific advice for sellers in this market",
  "socialPost": "Ready-to-post Instagram/Facebook caption with emojis and hashtags about this market (200-250 words)"
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
    console.error('Market snapshot error:', error);
    return NextResponse.json({ error: 'Failed to generate market snapshot' }, { status: 500 });
  }
}
