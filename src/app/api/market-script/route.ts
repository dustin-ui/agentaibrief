import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { readFileSync } from 'fs';
import { join } from 'path';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const { city, state, duration, agent_name, team_name, marketData } = await req.json();

    if (!city || !state || !duration || !agent_name || !team_name || !marketData) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    let template: string;
    try {
      template = readFileSync(
        join(process.cwd(), 'market-update-script-template.md'),
        'utf-8'
      );
    } catch {
      // Fallback template inline
      template = `You are a real estate video script writer. Write two separate video scripts for a market update video.
Each script should be {duration} long, in teleprompter format with short lines (max 14 words per line).
Close with: "{agent_name}, {team_or_brokerage}, selling {city} one home at a time."`;
    }

    // Replace placeholders in template
    const systemPrompt = template
      .replace(/\{city\}/g, city)
      .replace(/\{state\}/g, state)
      .replace(/\{duration\}/g, `${duration} seconds`)
      .replace(/\{agent_name\}/g, agent_name)
      .replace(/\{team_or_brokerage\}/g, team_name);

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Here is the current market data for ${city}, ${state}. Use ONLY this data for your scripts:\n\n${marketData}`,
        },
      ],
      temperature: 0.8,
      max_tokens: 4000,
    });

    const scripts = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ scripts, city, state });
  } catch (err: unknown) {
    console.error('Market script error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
