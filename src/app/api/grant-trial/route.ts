import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAuth } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (auth.response) return auth.response;
    const user = auth.user;

    const admin = supabaseAdmin();

    // Only ever operate on the authenticated user's own id. Ignore any
    // userId/email/fullName supplied in the request body.
    const userId = user.id;

    // Enforce one-trial-per-user: if the profile already exists and has ever
    // had a non-free tier or a trial recorded, refuse.
    const { data: existing } = await admin
      .from('profiles')
      .select('id, subscription_tier, subscription_status, trial_used')
      .eq('id', userId)
      .maybeSingle();

    if (existing) {
      const alreadyTrialed =
        existing.trial_used === true ||
        existing.subscription_status === 'trialing' ||
        (existing.subscription_tier && existing.subscription_tier !== 'free');
      if (alreadyTrialed) {
        return NextResponse.json(
          { error: 'Trial already used for this account.' },
          { status: 409 }
        );
      }
    }

    const upsertData: Record<string, unknown> = {
      id: userId,
      subscription_tier: 'inner_circle',
      subscription_status: 'trialing',
      trial_used: true,
      updated_at: new Date().toISOString(),
    };
    if (user.email) upsertData.email = user.email;

    const { error } = await admin
      .from('profiles')
      .upsert(upsertData, { onConflict: 'id' });

    if (error) {
      console.error('grant-trial upsert error:', error);
      return NextResponse.json({ error: 'Could not activate trial.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('grant-trial error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
