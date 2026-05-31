import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.response) return auth.response;
  const supabase = supabaseAdmin();
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
