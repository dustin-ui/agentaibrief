import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createEmailCampaign, refreshCCToken } from '@/lib/cc-api';

export const maxDuration = 60;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const { edition_id } = await request.json();
    if (!edition_id) {
      return NextResponse.json({ error: 'edition_id required' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Load edition
    const { data: edition, error: editionError } = await supabase
      .from('newsletter_editions')
      .select('*')
      .eq('id', edition_id)
      .single();

    if (editionError || !edition) {
      return NextResponse.json({ error: 'Edition not found' }, { status: 404 });
    }

    // Load profile
    const { data: profile, error: profileError } = await supabase
      .from('newsletter_profiles')
      .select('*')
      .eq('id', edition.profile_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (!profile.cc_access_token) {
      return NextResponse.json({ error: 'Constant Contact not connected for this profile' }, { status: 400 });
    }

    // Ensure token is fresh
    let accessToken = profile.cc_access_token;
    try {
      const freshToken = await refreshCCToken(edition.profile_id);
      if (freshToken) accessToken = freshToken;
    } catch {
      // Use existing token, will retry on 401 in cc-api
    }

    // Create campaign
    const editionDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const campaign = await createEmailCampaign(edition.profile_id, accessToken, {
      name: `Newsletter - ${profile.agent_name} - ${editionDate}`,
      subject: `Your Local News Update - ${editionDate}`,
      fromName: profile.agent_name,
      fromEmail: profile.email,
      replyTo: profile.email,
      htmlContent: edition.html_content,
    });

    // Update edition status
    await supabase
      .from('newsletter_editions')
      .update({
        status: 'preview_sent',
        preview_sent_at: new Date().toISOString(),
      })
      .eq('id', edition_id);

    const campaignId = campaign.campaign_id || campaign.campaign_activity_id;

    return NextResponse.json({
      success: true,
      campaign_id: campaignId,
      cc_link: `https://app.constantcontact.com/pages/campaigns/email-details/${campaignId}`,
    });
  } catch (err) {
    console.error('Push to CC error:', err);
    return NextResponse.json({ error: 'Failed to push to CC', }, { status: 500 });
  }
}
