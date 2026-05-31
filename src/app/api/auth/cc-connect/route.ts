import { NextRequest, NextResponse } from 'next/server';
import { getAuthedUser, isAdminEmail } from '@/lib/api-auth';
import { CC_OAUTH_COOKIE, newNonce, signState, type CcStatePayload } from '@/lib/cc-oauth';

const REDIRECT_URI = 'https://agentaibrief.com/api/auth/callback/constantcontact';
const AUTHORIZE_BASE = 'https://authz.constantcontact.com/oauth2/default/v1/authorize';
const SCOPE = 'contact_data campaign_data offline_access';

/**
 * POST /api/auth/cc-connect
 * Body: { mode: 'connect' | 'admin_reauth' }
 * Requires an authenticated user. admin_reauth additionally requires an admin.
 * Issues a signed OAuth state bound to a one-time HttpOnly nonce cookie and
 * returns the Constant Contact authorize URL for the client to redirect to.
 */
export async function POST(request: NextRequest) {
  const user = await getAuthedUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let mode: 'connect' | 'admin_reauth' = 'connect';
  try {
    const body = await request.json();
    if (body?.mode === 'admin_reauth') mode = 'admin_reauth';
  } catch {
    // default 'connect'
  }

  if (mode === 'admin_reauth' && !isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const clientId = process.env.CC_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: 'Constant Contact not configured' }, { status: 503 });
  }

  const nonce = newNonce();
  const payload: CcStatePayload = {
    n: nonce,
    u: mode === 'admin_reauth' ? null : user.id,
    m: mode,
    t: Date.now(),
  };
  const state = signState(payload);

  const authorizeUrl =
    `${AUTHORIZE_BASE}?client_id=${encodeURIComponent(clientId)}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(SCOPE)}` +
    `&state=${encodeURIComponent(state)}` +
    `&prompt=consent`;

  const res = NextResponse.json({ url: authorizeUrl });
  res.cookies.set(CC_OAUTH_COOKIE, nonce, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });
  return res;
}
