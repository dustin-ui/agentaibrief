import { NextRequest, NextResponse } from 'next/server';
import { analyzeNewsForAgents, AnalysisInput } from '@/lib/analyze';
import { guardRoute } from '@/lib/route-guard';

export async function POST(request: NextRequest) {
  const guard = await guardRoute(request, { name: 'analyze' });
  if (!guard.ok) return guard.response;
  try {
    const body = (await request.json()) as AnalysisInput;

    if (!body.headline || !body.summary) {
      return NextResponse.json(
        { error: 'Missing required fields: headline and summary' },
        { status: 400 }
      );
    }

    const analysis = await analyzeNewsForAgents({
      headline: body.headline,
      summary: body.summary,
      source: body.source,
    });

    return NextResponse.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Unable to analyze this story right now' },
      { status: 500 }
    );
  }
}
