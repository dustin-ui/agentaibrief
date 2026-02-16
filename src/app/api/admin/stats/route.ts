import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const [profilesRes, subscribersRes, ccRes] = await Promise.all([
      supabase.from('newsletter_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('newsletter_profiles').select('id', { count: 'exact', head: true }).eq('cc_account_status', 'active'),
    ]);

    return NextResponse.json({
      totalProfiles: profilesRes.count || 0,
      totalSubscribers: subscribersRes.count || 0,
      activeCC: ccRes.count || 0,
    });
  } catch {
    return NextResponse.json({ totalProfiles: 0, totalSubscribers: 0, activeCC: 0 });
  }
}
