import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state'); // user_id passed as state
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/newsletter-builder?cc_error=' + encodeURIComponent(error), request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/newsletter-builder?cc_error=no_code', request.url));
  }

  const clientId = process.env.CC_CLIENT_ID;
  const clientSecret = process.env.CC_CLIENT_SECRET;
  const redirectUri = 'https://agentaibrief.com/api/auth/callback/constantcontact';

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/newsletter-builder?cc_error=not_configured', request.url));
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
        return NextResponse.redirect(new URL('/newsletter-builder?cc_error=token_exchange_failed', request.url));
      }
      tokenData = await retryResponse.json();
    }

    // Save tokens to the user's newsletter profile if we have a state (user_id)
    if (state && state !== 'admin_reauth') {
      await supabase
        .from('newsletter_profiles')
        .update({
          cc_account_status: 'active',
          cc_access_token: tokenData.access_token,
          cc_refresh_token: tokenData.refresh_token,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', state);
    }

    // Only update the main cc_tokens table for admin reauth (not subscriber connections)
    if (state === 'admin_reauth') {
      await supabase.from('cc_tokens').upsert({
        id: 1,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_type: tokenData.token_type || 'Bearer',
        expires_in: tokenData.expires_in || 86400,
        saved_at: new Date().toISOString(),
      });
    }

    // Redirect back with success
    const redirectPath = state === 'admin_reauth' ? '/?cc_reauth=success' : '/newsletter-builder?cc_success=true';
    return NextResponse.redirect(new URL(redirectPath, request.url));

  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(new URL('/newsletter-builder?cc_error=unknown', request.url));
  }
}
