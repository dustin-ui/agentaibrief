import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber, isConfigured } from '@/lib/constant-contact';
import { getOrCreateReferral } from '@/lib/referral';
import { supabaseAdmin } from '@/lib/supabase';

async function saveSubscriber(email: string, tier: string, firstName?: string) {
  const sb = supabaseAdmin();
  await sb.from('subscribers').upsert(
    { email, tier, first_name: firstName, subscribed_at: new Date().toISOString() },
    { onConflict: 'email' }
  );
}

async function parseBody(request: NextRequest): Promise<{ email: string; firstName?: string; tier?: string; ref?: string }> {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return await request.json();
  }
  // Handle form-encoded POST (fallback when JS doesn't load)
  const formData = await request.formData();
  return {
    email: formData.get('email') as string || '',
    firstName: formData.get('firstName') as string || undefined,
    tier: formData.get('tier') as string || 'free',
    ref: formData.get('ref') as string || undefined,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, tier, ref } = await parseBody(request);

    if (!email || !email.includes('@')) {
      const isFormSubmit = !(request.headers.get('content-type') || '').includes('application/json');
      if (isFormSubmit) {
        return NextResponse.redirect(new URL('/?subscribe=error', request.url));
      }
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Save to Supabase first so no emails are lost
    await saveSubscriber(email, tier || 'free', firstName);

    // Create/track referral
    const referral = await getOrCreateReferral(email, ref || undefined);

    // Check if CC is configured
    const configured = await isConfigured();
    if (!configured) {
      console.log(`[subscribe] Saved to Supabase (CC not configured): ${email} (${tier || 'free'})`);
      const isFormSubmit = !(request.headers.get('content-type') || '').includes('application/json');
      if (isFormSubmit) {
        return NextResponse.redirect(new URL('/?subscribe=success', request.url));
      }
      return NextResponse.json({
        success: true,
        message: 'Subscribed! (email service connecting soon)',
        fallback: true,
        referralCode: referral.code,
      });
    }

    // Default list ID
    const listId = process.env.CC_LIST_ID;
    if (!listId) {
      console.log(`[subscribe] CC_LIST_ID not set. Email saved to Supabase: ${email}`);
      const isFormSubmit = !(request.headers.get('content-type') || '').includes('application/json');
      if (isFormSubmit) {
        return NextResponse.redirect(new URL('/?subscribe=success', request.url));
      }
      return NextResponse.json({
        success: true,
        message: 'Subscribed!',
        fallback: true,
        referralCode: referral.code,
      });
    }

    const result = await addSubscriber(
      email,
      [listId],
      tier ? [`agentaibrief-${tier}`] : undefined,
      firstName,
    );

    const isFormSubmit = !(request.headers.get('content-type') || '').includes('application/json');
    if (isFormSubmit) {
      return NextResponse.redirect(new URL('/?subscribe=success', request.url));
    }

    return NextResponse.json({
      success: true,
      message: result.action === 'created' ? 'Welcome to AgentAIBrief!' : 'Subscription updated!',
      action: result.action,
      referralCode: referral.code,
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    const isFormSubmit = !(request.headers.get('content-type') || '').includes('application/json');
    if (isFormSubmit) {
      return NextResponse.redirect(new URL('/?subscribe=error', request.url));
    }
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 },
    );
  }
}
