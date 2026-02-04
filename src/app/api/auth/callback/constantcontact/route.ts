import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No authorization code received' }, { status: 400 });
  }

  const clientId = process.env.CC_CLIENT_ID;
  const clientSecret = process.env.CC_CLIENT_SECRET;
  const redirectUri = process.env.CC_REDIRECT_URI || 'https://localhost:3000/api/auth/callback/constantcontact';

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'CC credentials not configured' }, { status: 500 });
  }

  try {
    // Exchange auth code for access token
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

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text();
      return NextResponse.json({ error: `Token exchange failed: ${err}` }, { status: 500 });
    }

    const tokenData = await tokenResponse.json();

    // Save tokens to a local file for persistence
    const tokenPath = join(process.cwd(), '.cc-tokens.json');
    writeFileSync(tokenPath, JSON.stringify({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      saved_at: new Date().toISOString(),
    }, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Constant Contact authorized! Tokens saved.',
      expires_in: tokenData.expires_in,
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.json({ error: 'OAuth flow failed' }, { status: 500 });
  }
}
