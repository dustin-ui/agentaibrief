import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateForUser } from '../generate-for-user/route';

export const maxDuration = 300;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const baseUrl = new URL(request.url).origin;

  const results: { profile_id: string; agent_name: string; success: boolean; error?: string; campaign_id?: string }[] = [];

  try {
    // Get all active profiles with CC connected
    const { data: profiles, error } = await supabase
      .from('newsletter_profiles')
      .select('id, agent_name')
      .eq('cc_account_status', 'active')
      .not('cc_access_token', 'is', null);

    if (error || !profiles) {
      return NextResponse.json({ error: 'Failed to load profiles', details: error?.message }, { status: 500 });
    }

    for (const profile of profiles) {
      try {
        const result = await generateForUser(profile.id, baseUrl);
        results.push({
          profile_id: profile.id,
          agent_name: profile.agent_name,
          success: true,
          campaign_id: result.campaign_id,
        });
      } catch (err) {
        results.push({
          profile_id: profile.id,
          agent_name: profile.agent_name,
          success: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    const successes = results.filter(r => r.success).length;
    const failures = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      total: profiles.length,
      successes,
      failures,
      results,
    });
  } catch (err) {
    console.error('Generate all error:', err);
    return NextResponse.json({ error: 'Failed', details: String(err) }, { status: 500 });
  }
}

// Also support POST
export async function POST(request: NextRequest) {
  return GET(request);
}
