import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const SEMRUSH_API_KEY = process.env.SEMRUSH_API_KEY || 'a3fc492f4f3f6d6066f46f457f2bf02b';

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
  // Try to extract neighborhood/city from address
  const parts = address.split(',').map(s => s.trim());
  if (parts.length >= 2) {
    // Return city/neighborhood (second part usually)
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

    // Fetch SemRush data in parallel
    let relatedKeywords: Record<string, string>[] = [];
    let homeSearchKeywords: Record<string, string>[] = [];

    try {
      const [relatedText, homeSearchText] = await Promise.all([
        fetchSemrush(`https://api.semrush.com/?type=phrase_related&key=${SEMRUSH_API_KEY}&export_columns=Ph,Nq,Cp&phrase=${encodeURIComponent(neighborhood + ' real estate')}&database=us&display_limit=10`),
        fetchSemrush(`https://api.semrush.com/?type=phrase_all&key=${SEMRUSH_API_KEY}&export_columns=Ph,Nq,Cp&phrase=${encodeURIComponent(neighborhood + ' homes for sale')}&database=us&display_limit=5`),
      ]);
      relatedKeywords = parseSemrushCSV(relatedText);
      homeSearchKeywords = parseSemrushCSV(homeSearchText);
    } catch (e) {
      console.error('SemRush fetch error:', e);
      // Continue without SemRush data
    }

    // Build SemRush context for Claude
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

    // Generate brief with Claude
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 });
    }

    const client = new Anthropic({ apiKey });

    const prompt = `Generate a comprehensive Neighborhood Intelligence Brief for a real estate listing agent. The agent will use this to win listing appointments.

ADDRESS: ${address}
NEIGHBORHOOD: ${neighborhood}
DATE: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

SEMRUSH SEARCH DEMAND DATA:
Related keywords: ${JSON.stringify(semrushContext.relatedKeywords)}
Home search keywords: ${JSON.stringify(semrushContext.homeSearchKeywords)}

Return a JSON object with this EXACT structure (no markdown, just valid JSON):
{
  "neighborhood": "${neighborhood}",
  "address": "${address}",
  "generatedDate": "${new Date().toISOString()}",
  "marketSnapshot": {
    "medianHomePrice": "$XXX,XXX",
    "avgDaysOnMarket": XX,
    "priceTrend": "up|down|stable",
    "priceTrendDetail": "brief explanation",
    "inventoryLevel": "low|balanced|high",
    "inventoryDetail": "brief explanation",
    "marketType": "seller's|buyer's|balanced",
    "marketTypeDetail": "brief explanation"
  },
  "searchDemand": {
    "primarySearchVolume": XXX,
    "primaryKeyword": "neighborhood homes for sale",
    "searchTrend": "growing|declining|stable",
    "searchTrendDetail": "explanation",
    "relatedSearches": [{"keyword": "...", "volume": XXX, "cpc": X.XX}],
    "buyerSearchInsight": "What buyers are searching for in this area - paragraph"
  },
  "neighborhoodHighlights": {
    "schoolRatings": "paragraph about schools/districts",
    "commuteTimes": [{"destination": "...", "time": "XX min", "method": "drive|metro"}],
    "amenities": "paragraph about parks, restaurants, shopping",
    "recentDevelopments": "paragraph about recent news/developments"
  },
  "competitiveAnalysis": {
    "agentActivity": "paragraph about how many agents market here",
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

Use the SemRush data provided to inform the search demand section. For market data, use your training knowledge to provide realistic estimates for this specific area. Be specific and data-driven. This should feel like a professional market report, not generic advice.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'AI returned no text' }, { status: 500 });
    }

    // Parse JSON from response
    let brief;
    try {
      // Try to extract JSON from the response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        brief = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    return NextResponse.json({ success: true, brief });
  } catch (error) {
    console.error('Neighborhood brief error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
