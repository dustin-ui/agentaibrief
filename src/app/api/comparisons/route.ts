import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { address, offers, comparison, agent_notes } = body;
    if (!address || !offers) {
      return NextResponse.json({ error: 'address and offers are required' }, { status: 400 });
    }
    const db = supabaseAdmin();
    const { data, error } = await db
      .from('comparisons')
      .insert({ address, offers, comparison: comparison || null, agent_notes: agent_notes || '' })
      .select('id, share_id')
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error('POST /api/comparisons error:', err);
    return NextResponse.json({ error: 'Failed to save comparison' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const share = searchParams.get('share');
    const recent = searchParams.get('recent');
    const db = supabaseAdmin();

    if (id) {
      const { data, error } = await db.from('comparisons').select('*').eq('id', id).single();
      if (error) throw error;
      return NextResponse.json(data);
    }
    if (share) {
      const { data, error } = await db.from('comparisons').select('*').eq('share_id', share).single();
      if (error) throw error;
      return NextResponse.json(data);
    }
    if (recent) {
      const limit = Math.min(parseInt(recent) || 10, 50);
      const { data, error } = await db
        .from('comparisons')
        .select('id, address, offers, created_at, share_id')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return NextResponse.json(data);
    }
    return NextResponse.json({ error: 'Provide ?id=, ?share=, or ?recent=N' }, { status: 400 });
  } catch (err) {
    console.error('GET /api/comparisons error:', err);
    return NextResponse.json({ error: 'Failed to load comparison' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, agent_notes } = body;
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    const db = supabaseAdmin();
    const { error } = await db
      .from('comparisons')
      .update({ agent_notes, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PATCH /api/comparisons error:', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
