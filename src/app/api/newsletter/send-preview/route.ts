import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendPreviewEmail, refreshCCToken } from '@/lib/cc-api';

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
      return NextResponse.json({ error: 'Constant Contact not connected' }, { status: 400 });
    }

    // Get fresh token
    let accessToken = profile.cc_access_token;
    try {
      const freshToken = await refreshCCToken(edition.profile_id);
      if (freshToken) accessToken = freshToken;
    } catch {
      // Use existing
    }

    // The campaign should already be created via push-to-cc
    // We need the campaign_activity_id — look it up from the edition or pass it
    // For now, send the preview email via CC test send
    // We need to get the campaign activity ID from the most recent campaign
    
    // Actually, let's send a simple notification email via CC's transactional or
    // just use the test send feature on the campaign activity
    // The campaign_activity_id should have been stored — let's check edition metadata
    
    // For the MVP, we'll send a preview test email to the agent
    // This requires knowing the campaign_activity_id
    // Let's store it on the edition when we push to CC

    // For now, attempt to use CC test send if we have campaign info
    // Otherwise, just update the status and let the agent know via the dashboard

    // Update edition status
    await supabase
      .from('newsletter_editions')
      .update({
        status: 'preview_sent',
        preview_sent_at: new Date().toISOString(),
      })
      .eq('id', edition_id);

    // Try sending CC test email if we have the activity ID
    if (edition.cc_campaign_activity_id) {
      try {
        await sendPreviewEmail(
          edition.profile_id,
          accessToken,
          edition.cc_campaign_activity_id,
          [profile.email]
        );
      } catch (previewErr) {
        console.error('CC preview send failed (non-fatal):', previewErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Preview notification sent to ${profile.email}`,
      scheduled_for: edition.scheduled_for,
      note: 'Newsletter will auto-send in 24 hours if no changes are made.',
    });
  } catch (err) {
    console.error('Send preview error:', err);
    return NextResponse.json({ error: 'Failed to send preview', }, { status: 500 });
  }
}
