import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { keyword, marketArea } = await req.json();
    if (!keyword || !marketArea) {
      return NextResponse.json({ error: 'Keyword and market area are required' }, { status: 400 });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Write a 1500-2000 word SEO-optimized blog post for a real estate agent targeting the keyword "${keyword}" in the ${marketArea} market.

Requirements:
- Start with a compelling H1 title (as # heading)
- Include 4-6 H2 subheadings (as ## headings)
- End with an FAQ section (3-5 questions using ### for each question)
- Include a meta description at the very top in this format: **Meta Description:** [description]
- Include 3 internal link suggestions at the bottom in this format: **Internal Links:** [list]
- Tone: authoritative local expert, conversational but professional
- Naturally weave in the target keyword 5-8 times
- Include local knowledge, neighborhood details, and market insights specific to ${marketArea}
- Add statistics and data points where relevant
- Make it genuinely useful for someone searching this keyword

Format the entire article in Markdown.`,
        },
      ],
    });

    const article = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ article, keyword, marketArea });
  } catch (error: unknown) {
    console.error('Article generation error:', error);
    return NextResponse.json({ error: 'Failed to generate article' }, { status: 500 });
  }
}
