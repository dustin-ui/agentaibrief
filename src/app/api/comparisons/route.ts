import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 30;

// Get user from auth header
async function getUserFromRequest(req: NextRequest): Promise<{ id: string; email: string } | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  
  const token = authHeader.split(' ')[1];
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return { id: user.id, email: user.email || '' };
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const body = await req.json();
    const { address, offers, comparison, agent_notes } = body;
    if (!address || !offers) {
      return NextResponse.json({ error: 'address and offers are required' }, { status: 400 });
    }
    const db = supabaseAdmin();
    const insertData: Record<string, unknown> = { 
      address, 
      offers, 
      comparison: comparison || null, 
      agent_notes: agent_notes || '' 
    };
    
    // Try to add user_id if available (column might not exist yet)
    if (user) {
      insertData.user_id = user.id;
    }
    
    let result = await db
      .from('comparisons')
      .insert(insertData)
      .select('id, share_id')
      .single();
    
    // If user_id column doesn't exist, retry without it
    if (result.error?.code === '42703') {
      delete insertData.user_id;
      result = await db
        .from('comparisons')
        .insert(insertData)
        .select('id, share_id')
        .single();
    }
    
    if (result.error) throw result.error;
    return NextResponse.json(result.data);
  } catch (err) {
    console.error('POST /api/comparisons error:', err);
    return NextResponse.json({ error: 'Failed to save comparison' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const share = searchParams.get('share');
    const recent = searchParams.get('recent');
    const db = supabaseAdmin();

    // Load by ID - allow if user owns it or it's a share link
    if (id) {
      const { data, error } = await db.from('comparisons').select('*').eq('id', id).single();
      if (error) throw error;
      // Only return if user owns it or user_id is null (legacy)
      if (data.user_id && user?.id !== data.user_id) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }
      return NextResponse.json(data);
    }
    
    // Load by share_id - public access allowed
    if (share) {
      const { data, error } = await db.from('comparisons').select('*').eq('share_id', share).single();
      if (error) throw error;
      return NextResponse.json(data);
    }
    
    // Load recent - only user's own comparisons
    if (recent) {
      const limit = Math.min(parseInt(recent) || 10, 50);
      
      // Try to filter by user_id (column might not exist yet)
      try {
        let query = db
          .from('comparisons')
          .select('id, address, offers, created_at, share_id, user_id')
          .order('created_at', { ascending: false })
          .limit(limit);
        
        // Filter by user_id if user is logged in
        if (user) {
          query = query.eq('user_id', user.id);
        } else {
          // If not logged in, only show comparisons without user_id (legacy/demo)
          query = query.is('user_id', null);
        }
        
        const { data, error } = await query;
        if (error?.code === '42703') {
          // user_id column doesn't exist, fall back to no filtering
          throw new Error('column_missing');
        }
        if (error) throw error;
        return NextResponse.json(data);
      } catch (e) {
        // Fallback: return all comparisons (column doesn't exist yet)
        const { data, error } = await db
          .from('comparisons')
          .select('id, address, offers, created_at, share_id')
          .order('created_at', { ascending: false })
          .limit(limit);
        if (error) throw error;
        return NextResponse.json(data);
      }
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

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    
    const db = supabaseAdmin();
    
    // First check if user owns this comparison
    const { data: existing } = await db.from('comparisons').select('user_id').eq('id', id).single();
    if (existing?.user_id && user?.id !== existing.user_id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    
    const { error } = await db
      .from('comparisons')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/comparisons error:', err);
    return NextResponse.json({ error: 'Failed to delete comparison' }, { status: 500 });
  }
}
