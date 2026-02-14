import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { scheduleCampaignSend, refreshCCToken } from '@/lib/cc-api';

export const maxDuration = 300;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export async function GET(request: Request) {
  // Verify cron secret for Vercel Cron (optional but recommended)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabase();
  const results: { profile_id: string; agent_name: string; action: string; success: boolean; error?: string }[] = [];

  try {
    // Get all active profiles
    const { data: profiles, error } = await supabase
      .from('newsletter_profiles')
      .select('*')
      .eq('active', true);

    if (error || !profiles) {
      return NextResponse.json({ error: 'Failed to load profiles', details: error?.message }, { status: 500 });
    }

    const today = new Date();
    const todayDay = DAYS[today.getDay()];
    // Preview day = one day before send_day
    const tomorrowDay = DAYS[(today.getDay() + 1) % 7];

    const baseUrl = new URL(request.url).origin;

    // PART 1: Generate editions for profiles whose send_day is tomorrow (preview today)
    for (const profile of profiles) {
      if (!profile.send_day || profile.send_day.toLowerCase() !== tomorrowDay) continue;
      if (!profile.cc_access_token || profile.cc_account_status === 'error') {
        results.push({ profile_id: profile.id, agent_name: profile.agent_name, action: 'skip', success: false, error: 'CC not connected or in error state' });
        continue;
      }

      try {
        // Step 1+2: Generate edition
        const editionRes = await fetch(`${baseUrl}/api/newsletter/generate-edition`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile_id: profile.id }),
        });

        if (!editionRes.ok) {
          const errText = await editionRes.text();
          results.push({ profile_id: profile.id, agent_name: profile.agent_name, action: 'generate', success: false, error: errText });
          continue;
        }

        const { edition } = await editionRes.json();

        // Step 3: Push to CC
        const ccRes = await fetch(`${baseUrl}/api/newsletter/push-to-cc`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ edition_id: edition.id }),
        });

        if (!ccRes.ok) {
          const errText = await ccRes.text();
          results.push({ profile_id: profile.id, agent_name: profile.agent_name, action: 'push-to-cc', success: false, error: errText });
          continue;
        }

        // Step 4: Send preview
        const previewRes = await fetch(`${baseUrl}/api/newsletter/send-preview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ edition_id: edition.id }),
        });

        if (!previewRes.ok) {
          results.push({ profile_id: profile.id, agent_name: profile.agent_name, action: 'preview', success: false, error: 'Preview send failed' });
          continue;
        }

        results.push({ profile_id: profile.id, agent_name: profile.agent_name, action: 'generated+previewed', success: true });
      } catch (err) {
        results.push({ profile_id: profile.id, agent_name: profile.agent_name, action: 'error', success: false, error: String(err) });
      }
    }

    // PART 2: Send approved/ready editions whose scheduled_for is now or past
    const { data: readyEditions } = await supabase
      .from('newsletter_editions')
      .select('*, newsletter_profiles(*)')
      .eq('status', 'preview_sent')
      .lte('scheduled_for', today.toISOString());

    if (readyEditions?.length) {
      for (const edition of readyEditions) {
        const profile = edition.newsletter_profiles;
        if (!profile?.cc_access_token) continue;

        try {
          let accessToken = profile.cc_access_token;
          const freshToken = await refreshCCToken(profile.id);
          if (freshToken) accessToken = freshToken;

          if (edition.cc_campaign_activity_id) {
            await scheduleCampaignSend(profile.id, accessToken, edition.cc_campaign_activity_id);
          }

          await supabase
            .from('newsletter_editions')
            .update({ status: 'sent', sent_at: new Date().toISOString() })
            .eq('id', edition.id);

          results.push({ profile_id: profile.id, agent_name: profile.agent_name, action: 'sent', success: true });
        } catch (err) {
          await supabase
            .from('newsletter_editions')
            .update({ status: 'failed' })
            .eq('id', edition.id);

          results.push({ profile_id: profile.id, agent_name: profile.agent_name, action: 'send-failed', success: false, error: String(err) });
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      today: todayDay,
      preview_for: tomorrowDay,
      results,
    });
  } catch (err) {
    console.error('Weekly cron error:', err);
    return NextResponse.json({ error: 'Cron failed', details: String(err) }, { status: 500 });
  }
}
