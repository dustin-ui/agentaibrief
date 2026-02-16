import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateNewsletterHTML } from '@/lib/newsletter-template';
import { createEmailCampaign, scheduleCampaignSend, refreshCCToken } from '@/lib/cc-api';

export const maxDuration = 180;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function calculateScheduledUTC(sendDay?: string, sendTime?: string): string | null {
  if (!sendDay) return null;

  const targetDay = DAYS.indexOf(sendDay.toLowerCase());
  if (targetDay === -1) return null;

  const now = new Date();
  const currentDay = now.getUTCDay();
  let daysUntil = targetDay - currentDay;
  if (daysUntil <= 0) daysUntil += 7;

  const scheduled = new Date(now);
  scheduled.setUTCDate(scheduled.getUTCDate() + daysUntil);

  // Parse send_time (assumed Eastern) and convert to UTC (+5 EST / +4 EDT)
  const [hours, minutes] = (sendTime || '09:00').split(':').map(Number);
  // Approximate: assume EST (+5h to UTC)
  const utcHours = (hours || 9) + 5;
  scheduled.setUTCHours(utcHours % 24, minutes || 0, 0, 0);
  if (utcHours >= 24) scheduled.setUTCDate(scheduled.getUTCDate() + 1);

  // Don't schedule in the past
  if (scheduled <= now) {
    scheduled.setUTCDate(scheduled.getUTCDate() + 7);
  }

  return scheduled.toISOString();
}

export async function generateForUser(profileId: string, baseUrl: string) {
  const supabase = getSupabase();

  // Load profile
  const { data: profile, error: profileError } = await supabase
    .from('newsletter_profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (profileError || !profile) {
    throw new Error('Profile not found');
  }

  if (!profile.cc_access_token) {
    throw new Error('Constant Contact not connected');
  }

  // Ensure token is fresh
  let accessToken = profile.cc_access_token;
  try {
    const freshToken = await refreshCCToken(profileId);
    if (freshToken) accessToken = freshToken;
  } catch {
    // Will retry on 401 inside cc-api
  }

  // Generate stories
  const storiesRes = await fetch(`${baseUrl}/api/newsletter/generate-stories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile_id: profileId }),
  });

  if (!storiesRes.ok) {
    throw new Error(`Story generation failed: ${await storiesRes.text()}`);
  }

  const { stories } = await storiesRes.json();

  // Generate HTML
  const editionDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const htmlContent = generateNewsletterHTML(
    {
      agent_name: profile.agent_name,
      brokerage: profile.brokerage,
      team_name: profile.team_name,
      phone: profile.phone,
      email: profile.email,
      headshot_url: profile.headshot_url,
      logo_url: profile.logo_url,
      brand_color: profile.brand_color,
    },
    stories,
    editionDate
  );

  // Save edition
  const scheduledFor = calculateScheduledUTC(profile.send_day, profile.send_time);

  const { data: edition, error: editionError } = await supabase
    .from('newsletter_editions')
    .insert({
      profile_id: profileId,
      stories,
      html_content: htmlContent,
      status: 'draft',
      scheduled_for: scheduledFor,
    })
    .select()
    .single();

  if (editionError) {
    throw new Error(`Failed to save edition: ${editionError.message}`);
  }

  // Create CC campaign
  const campaignDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const subject = `Your AI & Real Estate Briefing — ${campaignDate}`;

  const campaign = await createEmailCampaign(profileId, accessToken, {
    name: `Newsletter - ${profile.agent_name} - ${campaignDate}`,
    subject,
    fromName: profile.agent_name,
    fromEmail: profile.email,
    replyTo: profile.email,
    htmlContent,
  });

  const campaignId = campaign.campaign_id || campaign.campaign_activity_id;
  const activityId = campaign.campaign_activities?.[0]?.campaign_activity_id || campaignId;

  // Schedule if we have a date
  let scheduleResult = null;
  if (scheduledFor && activityId) {
    try {
      scheduleResult = await scheduleCampaignSend(profileId, accessToken, activityId, scheduledFor);
    } catch (err) {
      console.error('Schedule failed (campaign created but not scheduled):', err);
    }
  }

  // Update edition with campaign info
  await supabase
    .from('newsletter_editions')
    .update({
      cc_campaign_activity_id: activityId,
      status: scheduleResult ? 'scheduled' : 'preview_sent',
    })
    .eq('id', edition.id);

  // Update profile tracking
  await supabase
    .from('newsletter_profiles')
    .update({
      last_campaign_id: campaignId,
      last_campaign_at: new Date().toISOString(),
    })
    .eq('id', profileId);

  return {
    edition_id: edition.id,
    campaign_id: campaignId,
    activity_id: activityId,
    scheduled_for: scheduledFor,
    scheduled: !!scheduleResult,
    story_count: stories.length,
    subject,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { profile_id } = await request.json();
    if (!profile_id) {
      return NextResponse.json({ error: 'profile_id required' }, { status: 400 });
    }

    const baseUrl = request.nextUrl.origin;
    const result = await generateForUser(profile_id, baseUrl);

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error('Generate for user error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to generate newsletter' },
      { status: 500 }
    );
  }
}
