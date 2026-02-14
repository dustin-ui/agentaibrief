import { NextRequest, NextResponse } from 'next/server';

const SEMRUSH_API_KEY = process.env.SEMRUSH_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

function parseSemrushCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(';');
  return lines.slice(1).map(line => {
    const values = line.split(';');
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h.trim()] = (values[i] || '').trim(); });
    return obj;
  });
}

async function fetchSemrush(url: string): Promise<string> {
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const text = await res.text();
  if (text.startsWith('ERROR')) throw new Error(`SemRush: ${text}`);
  return text;
}

function extractNeighborhood(address: string): string {
  const parts = address.split(',').map(s => s.trim());
  if (parts.length >= 2) {
    return parts[1].replace(/\s+(VA|MD|DC|CA|NY|TX|FL|NC|SC|GA|PA|OH|IL|NJ|CT|MA)\s*\d*/i, '').trim();
  }
  return address.trim();
}

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();
    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const neighborhood = extractNeighborhood(address);

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Fetch SemRush data in parallel
    let relatedKeywords: Record<string, string>[] = [];
    let homeSearchKeywords: Record<string, string>[] = [];

    if (SEMRUSH_API_KEY) {
      try {
        const [relatedText, homeSearchText] = await Promise.all([
          fetchSemrush(`https://api.semrush.com/?type=phrase_related&key=${SEMRUSH_API_KEY}&export_columns=Ph,Nq,Cp&phrase=${encodeURIComponent(neighborhood + ' real estate')}&database=us&display_limit=10`),
          fetchSemrush(`https://api.semrush.com/?type=phrase_all&key=${SEMRUSH_API_KEY}&export_columns=Ph,Nq,Cp&phrase=${encodeURIComponent(neighborhood + ' homes for sale')}&database=us&display_limit=5`),
        ]);
        relatedKeywords = parseSemrushCSV(relatedText);
        homeSearchKeywords = parseSemrushCSV(homeSearchText);
      } catch (e) {
        console.error('SemRush fetch error:', e);
      }
    }

    const semrushContext = {
      relatedKeywords: relatedKeywords.map(kw => ({
        keyword: kw['Keyword'] || kw['Ph'] || '',
        volume: kw['Search Volume'] || kw['Nq'] || '0',
        cpc: kw['CPC'] || kw['Cp'] || '0',
      })),
      homeSearchKeywords: homeSearchKeywords.map(kw => ({
        keyword: kw['Keyword'] || kw['Ph'] || '',
        volume: kw['Search Volume'] || kw['Nq'] || '0',
        cpc: kw['CPC'] || kw['Cp'] || '0',
      })),
    };

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const prompt = `Generate a comprehensive Neighborhood Intelligence Brief for a real estate listing agent. The agent will use this to win listing appointments. Use CURRENT, REAL data from your knowledge and grounding. Do NOT make up statistics.

ADDRESS: ${address}
NEIGHBORHOOD: ${neighborhood}
DATE: ${today}

SEMRUSH SEARCH DEMAND DATA:
Related keywords: ${JSON.stringify(semrushContext.relatedKeywords)}
Home search keywords: ${JSON.stringify(semrushContext.homeSearchKeywords)}

Return ONLY a valid JSON object with this EXACT structure (no markdown, no code fences, just JSON):
{
  "neighborhood": "${neighborhood}",
  "address": "${address}",
  "generatedDate": "${new Date().toISOString()}",
  "marketSnapshot": {
    "medianHomePrice": "$XXX,XXX",
    "avgDaysOnMarket": XX,
    "priceTrend": "up|down|stable",
    "priceTrendDetail": "brief explanation with real data",
    "inventoryLevel": "low|balanced|high",
    "inventoryDetail": "brief explanation with real data",
    "marketType": "seller's|buyer's|balanced",
    "marketTypeDetail": "brief explanation"
  },
  "searchDemand": {
    "primarySearchVolume": XXX,
    "primaryKeyword": "neighborhood homes for sale",
    "searchTrend": "growing|declining|stable",
    "searchTrendDetail": "explanation",
    "relatedSearches": [{"keyword": "...", "volume": XXX, "cpc": X.XX}],
    "buyerSearchInsight": "What buyers are searching for in this area"
  },
  "neighborhoodHighlights": {
    "schoolRatings": "paragraph about schools/districts with real ratings",
    "commuteTimes": [{"destination": "...", "time": "XX min", "method": "drive|metro"}],
    "amenities": "paragraph about parks, restaurants, shopping",
    "recentDevelopments": "paragraph about recent news/developments"
  },
  "competitiveAnalysis": {
    "agentActivity": "paragraph about agent competition",
    "contentGaps": ["gap1", "gap2", "gap3"],
    "competitiveInsight": "paragraph"
  },
  "aiRecommendations": {
    "suggestedPriceRange": "$XXX,XXX - $XXX,XXX",
    "bestTimeToList": "month/season recommendation",
    "keySellingPoints": ["point1", "point2", "point3", "point4"],
    "potentialChallenges": ["challenge1", "challenge2", "challenge3"]
  }
}

Use REAL, CURRENT market data. Be specific to this exact neighborhood. This should feel like a professional market report with accurate numbers.`;

    // Call Gemini with thinking enabled and Google Search grounding
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp:generateContent?key=${GEMINI_API_KEY}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8000,
        },
      }),
    });

    if (!geminiRes.ok) {
      // Fallback to regular Gemini Flash if thinking model fails
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 8000,
          },
        }),
      });

      if (!fallbackRes.ok) {
        const errText = await fallbackRes.text();
        console.error('Gemini error:', errText);
        return NextResponse.json({ error: 'AI service error' }, { status: 500 });
      }

      const fallbackData = await fallbackRes.json();
      const fallbackText = fallbackData.candidates?.[0]?.content?.parts
        ?.filter((p: { text?: string; thought?: boolean }) => p.text && !p.thought)
        ?.map((p: { text: string }) => p.text)
        ?.join('') || '';

      const jsonMatch = fallbackText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });

      try {
        const brief = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ success: true, brief });
      } catch {
        return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
      }
    }

    const geminiData = await geminiRes.json();

    // Extract text from non-thought parts only (thinking models return thought: true on reasoning parts)
    const allText = geminiData.candidates?.[0]?.content?.parts
      ?.filter((p: { text?: string; thought?: boolean }) => p.text && !p.thought)
      ?.map((p: { text: string }) => p.text)
      ?.join('') || '';

    // Parse JSON from response
    const jsonMatch = allText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON in Gemini response:', allText.slice(0, 500));
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    try {
      const brief = JSON.parse(jsonMatch[0]);
      return NextResponse.json({ success: true, brief });
    } catch {
      console.error('JSON parse error on Gemini response:', jsonMatch[0].slice(0, 500));
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

  } catch (error) {
    console.error('Neighborhood brief error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
