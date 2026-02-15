// Constant Contact V3 API integration — Supabase-backed token storage
import { supabaseAdmin } from './supabase';

const CC_API_BASE = 'https://api.cc.email/v3';

interface CCTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  saved_at: string;
}

async function loadTokens(): Promise<CCTokens | null> {
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb.from('cc_tokens').select('*').eq('id', 1).single();
    if (error || !data) return null;
    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      saved_at: data.saved_at,
    };
  } catch {
    return null;
  }
}

async function saveTokens(tokens: CCTokens): Promise<void> {
  const sb = supabaseAdmin();
  await sb.from('cc_tokens').upsert({
    id: 1,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    token_type: tokens.token_type,
    expires_in: tokens.expires_in,
    saved_at: new Date().toISOString(),
  });
}

async function refreshAccessToken(): Promise<string | null> {
  const tokens = await loadTokens();
  if (!tokens?.refresh_token) return null;

  const clientId = process.env.CC_CLIENT_ID;
  const clientSecret = process.env.CC_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const res = await fetch('https://authz.constantcontact.com/oauth2/default/v1/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        refresh_token: tokens.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const newTokens: CCTokens = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || tokens.refresh_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      saved_at: new Date().toISOString(),
    };
    await saveTokens(newTokens);
    return data.access_token;
  } catch {
    return null;
  }
}

async function getAccessToken(): Promise<string | null> {
  const tokens = await loadTokens();
  if (!tokens) return null;

  // Check if token is expired (with 5 min buffer)
  const savedAt = new Date(tokens.saved_at).getTime();
  const expiresAt = savedAt + (tokens.expires_in - 300) * 1000;

  if (Date.now() > expiresAt) {
    return refreshAccessToken();
  }

  return tokens.access_token;
}

async function ccFetch(path: string, options: RequestInit = {}): Promise<Response> {
  let token = await getAccessToken();
  if (!token) throw new Error('No Constant Contact access token');

  const res = await fetch(`${CC_API_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // If 401, try refreshing token
  if (res.status === 401) {
    token = await refreshAccessToken();
    if (!token) throw new Error('Failed to refresh CC token');

    return fetch(`${CC_API_BASE}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  }

  return res;
}

// Get all contact lists
export async function getContactLists(): Promise<Array<{ list_id: string; name: string; membership_count: number }>> {
  const res = await ccFetch('/contact_lists');
  if (!res.ok) throw new Error(`Failed to get lists: ${res.status}`);
  const data = await res.json();
  return data.lists || [];
}

// Create or update a contact (upsert by email)
export async function addSubscriber(
  email: string,
  listIds: string[],
  tags?: string[],
  firstName?: string,
): Promise<{ success: boolean; contactId?: string; action?: string }> {
  const body: Record<string, unknown> = {
    email_address: email,
    list_memberships: listIds,
    create_source: 'Account',
  };

  if (firstName) {
    body.first_name = firstName;
  }

  const res = await ccFetch('/contacts/sign_up_form', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('CC add subscriber failed:', err);
    throw new Error(`Failed to add subscriber: ${res.status}`);
  }

  const data = await res.json();
  return {
    success: true,
    contactId: data.contact_id,
    action: data.action,
  };
}

// Check if CC is configured and authorized
export async function isConfigured(): Promise<boolean> {
  const tokens = await loadTokens();
  return !!tokens?.access_token;
}
