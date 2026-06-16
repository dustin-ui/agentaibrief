import { supabaseAdmin } from './supabase';

export async function saveSubscriber(email: string, tier: string, firstName?: string) {
  const sb = supabaseAdmin();
  await sb.from('subscribers').upsert(
    { email, tier, first_name: firstName, subscribed_at: new Date().toISOString() },
    { onConflict: 'email' },
  );
}

