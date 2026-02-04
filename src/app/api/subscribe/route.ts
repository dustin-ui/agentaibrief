import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber, isConfigured } from '@/lib/constant-contact';

export async function POST(request: NextRequest) {
  try {
    const { email, firstName, tier } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    // Check if CC is configured
    const configured = await isConfigured();
    if (!configured) {
      // Fallback: just log it for now
      console.log(`[subscribe] New subscriber (CC not configured): ${email} (${tier || 'free'})`);
      return NextResponse.json({
        success: true,
        message: 'Subscribed! (email service connecting soon)',
        demo: true,
      });
    }

    // Default list ID — update with actual list ID after first auth
    const listId = process.env.CC_LIST_ID;
    if (!listId) {
      console.log(`[subscribe] CC_LIST_ID not set. Email: ${email}`);
      return NextResponse.json({
        success: true,
        message: 'Subscribed!',
        demo: true,
      });
    }

    const result = await addSubscriber(
      email,
      [listId],
      tier ? [`agentaibrief-${tier}`] : undefined,
      firstName,
    );

    return NextResponse.json({
      success: true,
      message: result.action === 'created' ? 'Welcome to AgentAIBrief!' : 'Subscription updated!',
      action: result.action,
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 },
    );
  }
}
