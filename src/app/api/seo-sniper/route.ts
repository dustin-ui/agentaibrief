import { NextRequest, NextResponse } from 'next/server';

const SEMRUSH_KEY = 'a3fc492f4f3f6d6066f46f457f2bf02b';

function parseSemrushCSV(csv: string): Record<string, string>[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(';');
  return lines.slice(1).map(line => {
    const values = line.split(';');
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h.trim()] = (values[i] || '').trim(); });
    return obj;
  });
}

export async function POST(req: NextRequest) {
  try {
    const { marketArea } = await req.json();
    if (!marketArea || typeof marketArea !== 'string') {
      return NextResponse.json({ error: 'Market area is required' }, { status: 400 });
    }

    const area = marketArea.trim();
    const phraseRelated = encodeURIComponent(`${area} real estate`);
    const phraseQuestions = encodeURIComponent(`${area} homes`);

    const [relatedRes, questionsRes] = await Promise.all([
      fetch(`https://api.semrush.com/?type=phrase_related&key=${SEMRUSH_KEY}&export_columns=Ph,Nq,Cp,Co,Nr&phrase=${phraseRelated}&database=us&display_limit=20`),
      fetch(`https://api.semrush.com/?type=phrase_questions&key=${SEMRUSH_KEY}&export_columns=Ph,Nq,Cp,Co&phrase=${phraseQuestions}&database=us&display_limit=20`),
    ]);

    const relatedText = await relatedRes.text();
    const questionsText = await questionsRes.text();

    const relatedData = parseSemrushCSV(relatedText);
    const questionsData = parseSemrushCSV(questionsText);

    // Combine and normalize
    const allKeywords = [
      ...relatedData.map(r => ({
        keyword: r['Keyword'] || r['Ph'] || '',
        volume: parseInt(r['Search Volume'] || r['Nq'] || '0'),
        cpc: parseFloat(r['CPC'] || r['Cp'] || '0'),
        competition: parseFloat(r['Competition'] || r['Co'] || '0'),
        results: parseInt(r['Number of Results'] || r['Nr'] || '0'),
        type: 'related' as const,
      })),
      ...questionsData.map(r => ({
        keyword: r['Keyword'] || r['Ph'] || '',
        volume: parseInt(r['Search Volume'] || r['Nq'] || '0'),
        cpc: parseFloat(r['CPC'] || r['Cp'] || '0'),
        competition: parseFloat(r['Competition'] || r['Co'] || '0'),
        results: 0,
        type: 'question' as const,
      })),
    ];

    // Filter: volume > 100, competition < 0.5
    const filtered = allKeywords
      .filter(k => k.keyword && k.volume > 100 && k.competition < 0.5)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 15);

    return NextResponse.json({ keywords: filtered, marketArea: area });
  } catch (error: unknown) {
    console.error('SEO Sniper error:', error);
    return NextResponse.json({ error: 'Failed to fetch keyword data' }, { status: 500 });
  }
}
