// Constant Contact V3 API integration
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const TOKEN_PATH = join(process.cwd(), '.cc-tokens.json');
const CC_API_BASE = 'https://api.cc.email/v3';

interface CCTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  saved_at: string;
}

function loadTokens(): CCTokens | null {
  try {
    if (!existsSync(TOKEN_PATH)) return null;
    return JSON.parse(readFileSync(TOKEN_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const tokens = loadTokens();
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
    writeFileSync(TOKEN_PATH, JSON.stringify({
      access_token: data.access_token,
      refresh_token: data.refresh_token || tokens.refresh_token,
      token_type: data.token_type,
      expires_in: data.expires_in,
      saved_at: new Date().toISOString(),
    }, null, 2));

    return data.access_token;
  } catch {
    return null;
  }
}

async function getAccessToken(): Promise<string | null> {
  const tokens = loadTokens();
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

  // Use create-or-update endpoint (upsert by email)
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
    action: data.action, // 'created' or 'updated'
  };
}

// Check if CC is configured and authorized
export async function isConfigured(): Promise<boolean> {
  const tokens = loadTokens();
  return !!tokens?.access_token;
}
