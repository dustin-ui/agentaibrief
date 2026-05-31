import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin as getSupabaseAdmin } from '@/lib/supabase';
import { CC_OAUTH_COOKIE, verifyState } from '@/lib/cc-oauth';

const supabase = getSupabaseAdmin();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/?cc_error=' + encodeURIComponent(error), request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?cc_error=no_code', request.url));
  }

  // Validate the signed state against the one-time HttpOnly nonce cookie.
  // This binds the callback to the session that initiated the flow and
  // prevents CSRF / token-injection via an attacker-supplied state.
  const cookieNonce = request.cookies.get(CC_OAUTH_COOKIE)?.value ?? null;
  const payload = verifyState(state, cookieNonce);

  if (!payload) {
    return NextResponse.redirect(new URL('/?cc_error=invalid_state', request.url));
  }

  const clientId = process.env.CC_CLIENT_ID;
  const clientSecret = process.env.CC_CLIENT_SECRET;
  const redirectUri = 'https://agentaibrief.com/api/auth/callback/constantcontact';

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/?cc_error=not_configured', request.url));
  }

  try {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    let tokenData;

    // Try Basic Auth first
    const tokenResponse = await fetch('https://authz.constantcontact.com/oauth2/default/v1/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (tokenResponse.ok) {
      tokenData = await tokenResponse.json();
    } else {
      // Retry with credentials in body
      const retryResponse = await fetch('https://authz.constantcontact.com/oauth2/default/v1/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!retryResponse.ok) {
        return NextResponse.redirect(new URL('/?cc_error=token_exchange_failed', request.url));
      }
      tokenData = await retryResponse.json();
    }

    // Map the connection to the SESSION user (from the verified state), not to
    // an attacker-supplied value.
    if (payload.m === 'connect' && payload.u) {
      await supabase
        .from('newsletter_profiles')
        .update({
          cc_account_status: 'active',
          cc_access_token: tokenData.access_token,
          cc_refresh_token: tokenData.refresh_token,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', payload.u);
    }

    // admin_reauth updates the shared admin cc_tokens row. The signed state for
    // admin_reauth is only ever issued to an authenticated admin.
    if (payload.m === 'admin_reauth') {
      const { error: updateError } = await supabase
        .from('cc_tokens')
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_type: tokenData.token_type || 'Bearer',
          expires_in: tokenData.expires_in || 86400,
          saved_at: new Date().toISOString(),
        })
        .eq('id', 1);

      if (updateError) {
        console.error('cc_tokens update error:', JSON.stringify(updateError));
        // Try upsert as fallback
        const { error: upsertError } = await supabase.from('cc_tokens').upsert({
          id: 1,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_type: tokenData.token_type || 'Bearer',
          expires_in: tokenData.expires_in || 86400,
          saved_at: new Date().toISOString(),
        }, { onConflict: 'id' });
        if (upsertError) {
          console.error('cc_tokens upsert fallback error:', JSON.stringify(upsertError));
          return NextResponse.redirect(new URL('/?cc_error=db_save_failed', request.url));
        }
      }
    }

    // Redirect back with success and clear the one-time nonce cookie.
    const res = NextResponse.redirect(new URL('/?cc_success=true', request.url));
    res.cookies.set(CC_OAUTH_COOKIE, '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 });
    return res;

  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(new URL('/?cc_error=unknown', request.url));
  }
}
