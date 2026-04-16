import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { userId, email, fullName } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const admin = supabaseAdmin();

    const upsertData: Record<string, unknown> = {
      id: userId,
      subscription_tier: 'inner_circle',
      subscription_status: 'trialing',
      updated_at: new Date().toISOString(),
    };

    if (email) upsertData.email = email;
    if (fullName) upsertData.full_name = fullName;

    const { error } = await admin
      .from('profiles')
      .upsert(upsertData, { onConflict: 'id' });

    if (error) {
      console.error('grant-trial upsert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('grant-trial error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
