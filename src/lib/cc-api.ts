// Constant Contact V3 API helper — per-profile token management
import { createClient } from '@supabase/supabase-js';

const CC_API_BASE = 'https://api.cc.email/v3';
const CC_CLIENT_ID = process.env.CC_CLIENT_ID || '';
const CC_CLIENT_SECRET = process.env.CC_CLIENT_SECRET || '';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function refreshCCToken(profileId: string): Promise<string | null> {
  const supabase = getSupabase();
  const { data: profile } = await supabase
    .from('newsletter_profiles')
    .select('cc_refresh_token')
    .eq('id', profileId)
    .single();

  if (!profile?.cc_refresh_token) return null;

  const basicAuth = Buffer.from(`${CC_CLIENT_ID}:${CC_CLIENT_SECRET}`).toString('base64');

  try {
    const res = await fetch('https://authz.constantcontact.com/oauth2/default/v1/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: profile.cc_refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!res.ok) {
      console.error('CC token refresh failed:', res.status, await res.text());
      await supabase
        .from('newsletter_profiles')
        .update({ cc_account_status: 'error' })
        .eq('id', profileId);
      return null;
    }

    const data = await res.json();
    await supabase
      .from('newsletter_profiles')
      .update({
        cc_access_token: data.access_token,
        cc_refresh_token: data.refresh_token || profile.cc_refresh_token,
        cc_account_status: 'active',
      })
      .eq('id', profileId);

    return data.access_token;
  } catch (err) {
    console.error('CC token refresh error:', err);
    await supabase
      .from('newsletter_profiles')
      .update({ cc_account_status: 'error' })
      .eq('id', profileId);
    return null;
  }
}

async function ccFetchForProfile(
  profileId: string,
  accessToken: string,
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  let res = await fetch(`${CC_API_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (res.status === 401) {
    const newToken = await refreshCCToken(profileId);
    if (!newToken) throw new Error('Failed to refresh CC token');

    res = await fetch(`${CC_API_BASE}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${newToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  return res;
}

export async function getContactLists(profileId: string, accessToken: string) {
  const res = await ccFetchForProfile(profileId, accessToken, '/contact_lists');
  if (!res.ok) throw new Error(`Failed to get lists: ${res.status}`);
  const data = await res.json();
  return data.lists || [];
}

export async function createEmailCampaign(
  profileId: string,
  accessToken: string,
  opts: {
    name: string;
    subject: string;
    fromName: string;
    fromEmail: string;
    replyTo: string;
    htmlContent: string;
  }
) {
  // Step 1: Create the campaign
  const campaignRes = await ccFetchForProfile(profileId, accessToken, '/emails', {
    method: 'POST',
    body: JSON.stringify({
      name: opts.name,
      email_campaign_activities: [
        {
          format_type: 5, // Custom HTML
          from_name: opts.fromName,
          from_email: opts.fromEmail,
          reply_to_email: opts.replyTo,
          subject: opts.subject,
          html_content: opts.htmlContent,
        },
      ],
    }),
  });

  if (!campaignRes.ok) {
    const errText = await campaignRes.text();
    throw new Error(`Failed to create CC campaign: ${campaignRes.status} - ${errText}`);
  }

  const campaign = await campaignRes.json();
  return campaign;
}

export async function scheduleCampaignSend(
  profileId: string,
  accessToken: string,
  campaignActivityId: string,
  scheduledDate?: string // ISO 8601
) {
  const body: Record<string, unknown> = {};
  if (scheduledDate) {
    body.scheduled_date = scheduledDate;
  }

  // Use the schedule endpoint
  const res = await ccFetchForProfile(
    profileId,
    accessToken,
    `/emails/activities/${campaignActivityId}/schedules`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to schedule CC send: ${res.status} - ${errText}`);
  }

  return await res.json();
}

export async function sendPreviewEmail(
  profileId: string,
  accessToken: string,
  campaignActivityId: string,
  emailAddresses: string[]
) {
  const res = await ccFetchForProfile(
    profileId,
    accessToken,
    `/emails/activities/${campaignActivityId}/tests`,
    {
      method: 'POST',
      body: JSON.stringify({
        email_addresses: emailAddresses,
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to send CC preview: ${res.status} - ${errText}`);
  }

  return await res.json();
}
