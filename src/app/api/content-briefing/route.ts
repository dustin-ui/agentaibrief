import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const maxDuration = 300;

// Fetch real news from Google News RSS
async function fetchGoogleNews(query: string): Promise<string[]> {
  const encoded = encodeURIComponent(query);
  const url = `https://news.google.com/rss/search?q=${encoded}+when:30d&hl=en-US&gl=US&ceid=US:en`;
  
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(10000) });
    const xml = await res.text();
    
    const items: string[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(xml)) !== null && items.length < 30) {
      const item = match[1];
      const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') || '';
      const link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || '';
      const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1] || '';
      const desc = item.match(/<description>([\s\S]*?)<\/description>/)?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')?.replace(/<[^>]+>/g, '') || '';
      
      if (title) {
        items.push(`TITLE: ${title}\nLINK: ${link}\nDATE: ${pubDate}\nSNIPPET: ${desc.slice(0, 200)}`);
      }
    }
    
    return items;
  } catch (err) {
    console.error('Google News fetch error:', err);
    return [];
  }
}

function repairJSON(text: string): unknown {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
  else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
  cleaned = cleaned.trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Find last complete object and close array
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace > 0) {
      try { return JSON.parse(cleaned.slice(0, lastBrace + 1) + ']'); } catch { /* continue */ }
      const secondLast = cleaned.lastIndexOf('},');
      if (secondLast > 0) {
        try { return JSON.parse(cleaned.slice(0, secondLast + 1) + ']'); } catch { /* continue */ }
      }
    }
    throw new Error('Could not parse AI response');
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Anthropic API key not configured' }, { status: 500 });
  }

  const { area, type } = await req.json();
  if (!area) {
    return NextResponse.json({ error: 'Area is required' }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        send('progress', { step: 'news', pct: 10, msg: 'Searching local news sources...' });

        // Step 1: Fetch news (fewer, more targeted queries)
        const searches = [
          `${area} new restaurant opening 2026`,
          `${area} business closing`,
          `${area} development construction`,
          `${area} local news this week`,
          `${area} real estate housing`,
          `${area} schools government community`,
        ];

        const allArticles = await Promise.all(searches.map(q => fetchGoogleNews(q)));
        const flatArticles = allArticles.flat();

        const seen = new Set<string>();
        const uniqueArticles = flatArticles.filter(a => {
          const title = a.split('\n')[0].toLowerCase().slice(0, 50);
          if (seen.has(title)) return false;
          seen.add(title);
          return true;
        });

        const newsContext = uniqueArticles.slice(0, 40).join('\n\n---\n\n');
        send('progress', { step: 'select', pct: 30, msg: `Found ${uniqueArticles.length} articles. Selecting top stories...` });

        const client = new Anthropic({ apiKey });

        // PHASE 1: Quick selection — pick 15 stories, minimal output
        const selectPrompt = `Select the 15 best local news stories from ${area} for a real estate agent's social media content. Return ONLY a JSON array.

PRIORITY: restaurant/bar openings > business closings > development > schools > government > community > real estate > transportation

For each story return ONLY:
{"h":"headline","s":"2 sentence summary","v":score_1_to_100,"d":"YYYY-MM-DD","c":"category","u":"source_url"}

Categories: Restaurant Opening, Business Closing, Development, Government, Schools, Community, Safety, Real Estate, Transportation, Entertainment

ONLY use stories from these articles. Do NOT invent any.

ARTICLES:
${newsContext}`;

        const selectRes = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{ role: 'user', content: selectPrompt }],
        });

        const selectText = selectRes.content
          .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
          .map(b => b.text).join('');

        const selected = repairJSON(selectText) as Array<{h:string;s:string;v:number;d:string;c:string;u:string}>;
        
        send('progress', { step: 'scripts', pct: 50, msg: `Selected ${selected.length} stories. Writing scripts (batch 1)...` });

        const scriptPromptBase = (batch: unknown[]) => `For each story below, add a greenScreenScript (80 words max, punchy hook, conversational, end with question), an instagramHook (one punchy line), and 3 hashtags.

Return a JSON array with these fields per story:
{"headline":"...","summary":"...","viralScore":N,"date":"...","county":"${area}","category":"...","greenScreenScript":"...","instagramHook":"...","hashtags":["t1","t2","t3"],"sourceUrls":["url"]}

Stories:
${JSON.stringify(batch)}`;

        // PHASE 2A: Scripts for first batch
        const mid = Math.ceil(selected.length / 2);
        const batch1 = selected.slice(0, mid);
        const batch2 = selected.slice(mid);

        async function runScriptBatch(batch: unknown[], batchNum: number, pctBase: number): Promise<unknown[]> {
          let text = '';
          const s = await client.messages.stream({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 6000,
            messages: [{ role: 'user', content: scriptPromptBase(batch) }],
          });

          let lastPing = Date.now();
          for await (const ev of s) {
            if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') {
              text += ev.delta.text;
            }
            if (Date.now() - lastPing > 4000) {
              const pct = pctBase + Math.min(20, Math.floor(text.length / 200));
              send('progress', { step: 'scripts', pct, msg: `Writing scripts (batch ${batchNum})...` });
              lastPing = Date.now();
            }
          }
          return repairJSON(text) as unknown[];
        }

        const stories1 = await runScriptBatch(batch1, 1, 50);
        send('progress', { step: 'scripts', pct: 75, msg: `Batch 1 done (${stories1.length} stories). Writing batch 2...` });
        
        const stories2 = await runScriptBatch(batch2, 2, 75);
        send('progress', { step: 'format', pct: 97, msg: 'Formatting results...' });

        const stories = [...stories1, ...stories2];
        send('done', { area, type, stories, articleCount: uniqueArticles.length });
        controller.close();
      } catch (error) {
        console.error('Content briefing error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        send('error', { error: `Briefing failed: ${message}` });
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
