import { NextRequest, NextResponse } from 'next/server';
import { discoverBreakingAINews } from '@/lib/perplexity';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || undefined;

    const result = await discoverBreakingAINews(query);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Discovery error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = body.query as string | undefined;

    const result = await discoverBreakingAINews(query);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Discovery error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
