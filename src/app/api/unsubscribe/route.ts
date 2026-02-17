import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Update subscriber status to unsubscribed
    const { error } = await supabase
      .from('subscribers')
      .update({ 
        subscribed: false, 
        unsubscribed_at: new Date().toISOString() 
      })
      .eq('email', email.toLowerCase());

    if (error) {
      console.error('Unsubscribe error:', error);
      // Still return success even if not found - don't reveal if email exists
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Unsubscribe error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
