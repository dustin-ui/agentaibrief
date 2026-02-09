import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.json({ error: `OAuth error: ${error} - ${searchParams.get('error_description')}` }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: 'No authorization code received' }, { status: 400 });
  }

  const clientId = process.env.CC_CLIENT_ID;
  const clientSecret = process.env.CC_CLIENT_SECRET;
  // Must match EXACTLY what was sent in the authorize request
  const redirectUri = 'https://agentaibrief.com/api/auth/callback/constantcontact';

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: `CC credentials not configured. ID: ${clientId ? 'set' : 'missing'}, Secret: ${clientSecret ? 'set' : 'missing'}` }, { status: 500 });
  }

  try {
    // Exchange auth code for access token using Basic Auth
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

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

    // If Basic Auth fails, try sending credentials in the body
    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      
      // Retry with client_id/secret in POST body
      const retryResponse = await fetch('https://authz.constantcontact.com/oauth2/default/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!retryResponse.ok) {
        const retryErr = await retryResponse.text();
        return NextResponse.json({ 
          error: `Token exchange failed both methods`,
          basicAuthError: errText,
          bodyParamError: retryErr,
        }, { status: 500 });
      }

      const tokenData = await retryResponse.json();
      return NextResponse.json({
        success: true,
        message: 'Constant Contact authorized! (body param method)',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_in: tokenData.expires_in,
      });
    }

    const tokenData = await tokenResponse.json();

    // Try to save tokens locally (will work on local dev, not on Vercel)
    try {
      const tokenPath = join(process.cwd(), '.cc-tokens.json');
      writeFileSync(tokenPath, JSON.stringify({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_type: tokenData.token_type,
        expires_in: tokenData.expires_in,
        saved_at: new Date().toISOString(),
      }, null, 2));
    } catch {
      // Expected to fail on Vercel's read-only filesystem
    }

    return NextResponse.json({
      success: true,
      message: 'Constant Contact authorized!',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json({ error: 'OAuth flow failed', details: String(error) }, { status: 500 });
  }
}
