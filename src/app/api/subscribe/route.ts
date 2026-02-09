import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber, isConfigured } from '@/lib/constant-contact';
import { getOrCreateReferral } from '@/lib/referral';
import { promises as fs } from 'fs';
import { join } from 'path';

const FALLBACK_DB = join(process.cwd(), 'subscribers.json');

async function saveToFallbackDB(email: string, tier: string, firstName?: string) {
  let subscribers: Array<{ email: string; tier: string; firstName?: string; subscribedAt: string }> = [];
  try {
    const data = await fs.readFile(FALLBACK_DB, 'utf-8');
    subscribers = JSON.parse(data);
  } catch {
    // File doesn't exist yet
  }
  // Deduplicate
  if (!subscribers.some(s => s.email === email)) {
    subscribers.push({ email, tier, firstName, subscribedAt: new Date().toISOString() });
    await fs.writeFile(FALLBACK_DB, JSON.stringify(subscribers, null, 2));
  }
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
      // If form submission, redirect back
      const isFormSubmit = !(request.headers.get('content-type') || '').includes('application/json');
      if (isFormSubmit) {
        return NextResponse.redirect(new URL('/?subscribe=error', request.url));
      }
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Always save to fallback DB first so no emails are lost
    await saveToFallbackDB(email, tier || 'free', firstName);

    // Create/track referral
    const referral = await getOrCreateReferral(email, ref || undefined);

    // Check if CC is configured
    const configured = await isConfigured();
    if (!configured) {
      console.log(`[subscribe] Saved to fallback DB (CC not configured): ${email} (${tier || 'free'})`);
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
      console.log(`[subscribe] CC_LIST_ID not set. Email saved to fallback DB: ${email}`);
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
