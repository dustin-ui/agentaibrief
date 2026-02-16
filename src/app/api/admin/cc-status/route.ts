import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
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
