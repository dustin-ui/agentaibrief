import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateNewsletterHTML } from '@/lib/newsletter-template';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('newsletter_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profile) return NextResponse.json({ error: 'No newsletter profile found' }, { status: 404 });

  const { data: stories } = await supabase
    .from('newsletter_saved_stories')
    .select('*')
    .eq('profile_id', profile.id)
    .is('used_in_edition', null)
    .order('viral_score', { ascending: false })
    .limit(10);

  const mapped = (stories || []).map((s: Record<string, string | number | null>) => ({
    headline: s.headline as string,
    summary: s.summary as string,
    sourceUrl: s.source_url as string,
    category: s.category as string,
  }));

  const html = generateNewsletterHTML(profile, mapped);
  return NextResponse.json({ html, storyCount: mapped.length });
}
