import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateNewsletterHTML } from '@/lib/newsletter-template';

export const maxDuration = 180;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  try {
    const { profile_id } = await request.json();
    if (!profile_id) {
      return NextResponse.json({ error: 'profile_id required' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Load profile
    const { data: profile, error: profileError } = await supabase
      .from('newsletter_profiles')
      .select('*')
      .eq('id', profile_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Generate stories via internal call
    const baseUrl = request.nextUrl.origin;
    const storiesRes = await fetch(`${baseUrl}/api/newsletter/generate-stories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile_id }),
    });

    if (!storiesRes.ok) {
      const err = await storiesRes.text();
      return NextResponse.json({ error: 'Story generation failed' }, { status: 500 });
    }

    const { stories } = await storiesRes.json();

    // Generate HTML
    const editionDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const htmlContent = generateNewsletterHTML(
      {
        agent_name: profile.agent_name,
        brokerage: profile.brokerage,
        team_name: profile.team_name,
        phone: profile.phone,
        email: profile.email,
        headshot_url: profile.headshot_url,
        logo_url: profile.logo_url,
        brand_color: profile.brand_color,
      },
      stories,
      editionDate
    );

    // Calculate scheduled_for based on profile's send_day and send_time
    const scheduledFor = calculateScheduledDate(profile.send_day, profile.send_time);

    // Save edition
    const { data: edition, error: editionError } = await supabase
      .from('newsletter_editions')
      .insert({
        profile_id,
        stories,
        html_content: htmlContent,
        status: 'draft',
        scheduled_for: scheduledFor?.toISOString() || null,
      })
      .select()
      .single();

    if (editionError) {
      return NextResponse.json({ error: 'Failed to save edition' }, { status: 500 });
    }

    return NextResponse.json({ edition, story_count: stories.length });
  } catch (err) {
    console.error('Generate edition error:', err);
    return NextResponse.json({ error: 'Failed to generate edition', }, { status: 500 });
  }
}

function calculateScheduledDate(sendDay?: string, sendTime?: string): Date | null {
  if (!sendDay) return null;

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetDay = days.indexOf(sendDay.toLowerCase());
  if (targetDay === -1) return null;

  const now = new Date();
  const currentDay = now.getDay();
  let daysUntil = targetDay - currentDay;
  if (daysUntil <= 0) daysUntil += 7;

  const scheduled = new Date(now);
  scheduled.setDate(scheduled.getDate() + daysUntil);

  if (sendTime) {
    const [hours, minutes] = sendTime.split(':').map(Number);
    scheduled.setHours(hours || 9, minutes || 0, 0, 0);
  } else {
    scheduled.setHours(9, 0, 0, 0);
  }

  return scheduled;
}
