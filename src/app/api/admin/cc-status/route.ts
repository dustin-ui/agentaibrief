import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;
  const supabase = supabaseAdmin();
  try {
    const { data } = await supabase.from('cc_tokens').select('access_token,refresh_token,saved_at').eq('id', 1).single();
    
    if (!data?.access_token) {
      return NextResponse.json({ status: 'missing', account: '' });
    }

    // Decode JWT to check which account
    const parts = data.access_token.split('.');
    if (parts.length !== 3) {
      return NextResponse.json({ status: 'invalid', account: '' });
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    const account = payload.sub || 'unknown';
    
    // Check if it's the admin account
    if (account !== 'dustin@foxhomesteam.com') {
      return NextResponse.json({ status: 'wrong_account', account });
    }

    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      // Try to refresh
      if (data.refresh_token) {
        return NextResponse.json({ status: 'expired_refreshable', account });
      }
      return NextResponse.json({ status: 'expired', account });
    }

    return NextResponse.json({ status: 'active', account });
  } catch {
    return NextResponse.json({ status: 'error', account: '' });
  }
}
