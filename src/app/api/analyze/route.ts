import { NextRequest, NextResponse } from 'next/server';
import { analyzeNewsForAgents, AnalysisInput } from '@/lib/analyze';

export async function POST(request: NextRequest) {
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
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
