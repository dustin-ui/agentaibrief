import { NextRequest, NextResponse } from 'next/server';
import { discoverBreakingAINews } from '@/lib/perplexity';
import { guardRoute } from '@/lib/route-guard';

export async function GET(request: NextRequest) {
  const guard = await guardRoute(request, { name: 'discover' });
  if (!guard.ok) return guard.response;
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
    return NextResponse.json(
      { error: 'Unable to discover news right now' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const guard = await guardRoute(request, { name: 'discover' });
  if (!guard.ok) return guard.response;
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
    return NextResponse.json(
      { error: 'Unable to discover news right now' },
      { status: 500 }
    );
  }
}
