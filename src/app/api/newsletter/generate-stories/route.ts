import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 120;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function fetchGoogleNews(query: string): Promise<{ title: string; link: string; pubDate: string; snippet: string }[]> {
  const encoded = encodeURIComponent(query);
  const url = `https://news.google.com/rss/search?q=${encoded}+local+news&hl=en-US&gl=US&ceid=US:en`;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000),
    });
    const xml = await res.text();
    const items: { title: string; link: string; pubDate: string; snippet: string }[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) !== null && items.length < 15) {
      const item = match[1];
      const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') || '';
      const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
      const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
      const desc = item.match(/<description>([\s\S]*?)<\/description>/)?.[1]
        ?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
        ?.replace(/<[^>]+>/g, '') || '';

      if (title) items.push({ title, link, pubDate, snippet: desc.slice(0, 200) });
    }
    return items;
  } catch (err) {
    console.error(`Google News fetch error for "${query}":`, err);
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { profile_id } = await request.json();
    if (!profile_id) {
      return NextResponse.json({ error: 'profile_id required' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Load profile
    const { data: profile, error: profileError } = await supabase
      .from('newsletter_profiles')
      .select('*')
      .eq('id', profile_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Fetch news for each area
    const areas: { city: string; state: string; county?: string }[] = profile.areas || [];
    const allRawStories: { title: string; link: string; pubDate: string; snippet: string; area: string }[] = [];

    for (const area of areas) {
      const query = area.county
        ? `${area.city} ${area.county} ${area.state}`
        : `${area.city} ${area.state}`;
      const stories = await fetchGoogleNews(query);
      for (const s of stories) {
        allRawStories.push({ ...s, area: `${area.city}, ${area.state}` });
      }
    }

    // If no areas or no stories found, try a broader search
    if (allRawStories.length === 0 && areas.length > 0) {
      const broadQuery = areas.map(a => a.city).join(' OR ');
      const stories = await fetchGoogleNews(broadQuery);
      for (const s of stories) {
        allRawStories.push({ ...s, area: 'General' });
      }
    }

    // Load saved stories
    const { data: savedStories } = await supabase
      .from('newsletter_saved_stories')
      .select('*')
      .eq('profile_id', profile_id)
      .order('created_at', { ascending: false })
      .limit(5);

    // Deduplicate by title
    const seen = new Set<string>();
    const uniqueStories = allRawStories.filter(s => {
      const key = s.title.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 20);

    // Use Claude to curate and summarize
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const savedSection = savedStories?.length
      ? `\n\nMANUALLY SAVED STORIES (always include these):\n${savedStories.map((s: { headline?: string; title?: string; url?: string; summary?: string }) =>
          `- ${s.headline || s.title || 'Untitled'} (${s.url || 'no url'}): ${s.summary || 'no summary'}`
        ).join('\n')}`
      : '';

    const coverageAreas = areas.map(a => `${a.city}, ${a.state}`).join('; ');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `You are a local real estate newsletter editor. Select the best 8-10 stories from these raw news items for a real estate agent's weekly newsletter. Coverage areas: ${coverageAreas}.

RAW STORIES:
${uniqueStories.map((s, i) => `${i + 1}. ${s.title} (${s.area})\n   Link: ${s.link}\n   ${s.snippet}`).join('\n\n')}
${savedSection}

For each selected story, write a 2-3 sentence summary with a local angle that would interest homeowners and home buyers. Make it conversational and informative.

Return JSON array:
[
  {
    "headline": "short catchy headline",
    "summary": "2-3 sentence summary with local angle",
    "sourceUrl": "original link",
    "category": "one of: Development, Community, Market, Lifestyle, Government, Business, Events"
  }
]

Return ONLY the JSON array, no other text.`,
        },
      ],
    });

    const textContent = response.content.find(c => c.type === 'text');
    let stories;
    try {
      let jsonStr = textContent?.text || '[]';
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
      }
      stories = JSON.parse(jsonStr);
    } catch {
      // Try to extract JSON array
      const match = textContent?.text?.match(/\[[\s\S]*\]/);
      stories = match ? JSON.parse(match[0]) : [];
    }

    return NextResponse.json({ stories, raw_count: uniqueStories.length, areas_searched: areas.length });
  } catch (err) {
    console.error('Generate stories error:', err);
    return NextResponse.json({ error: 'Failed to generate stories' }, { status: 500 });
  }
}
