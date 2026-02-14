import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const maxDuration = 60;

// GET — Fetch user's contacts + events
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('user_id');
  if (!userId) {
    return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
  }

  const supabase = supabaseAdmin();

  const [{ data: contacts, error: cErr }, { data: events, error: eErr }] = await Promise.all([
    supabase.from('sphere_contacts').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('sphere_events').select('*').eq('user_id', userId).order('detected_at', { ascending: false }).limit(50),
  ]);

  if (cErr || eErr) {
    return NextResponse.json({ error: cErr?.message || eErr?.message }, { status: 500 });
  }

  return NextResponse.json({ contacts: contacts || [], events: events || [] });
}

// POST — Add or bulk-import contacts
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { user_id, contacts } = body as { user_id: string; contacts: Record<string, unknown>[] };

  if (!user_id || !contacts || !Array.isArray(contacts) || contacts.length === 0) {
    return NextResponse.json({ error: 'user_id and contacts[] are required' }, { status: 400 });
  }

  const supabase = supabaseAdmin();

  const rows = contacts.map((c) => ({
    user_id,
    name: c.name || 'Unknown',
    email: c.email || '',
    phone: c.phone || '',
    address: c.address || '',
    birthday: c.birthday || null,
    anniversary: c.anniversary || null,
    relationship_type: c.relationship_type || 'sphere',
    home_purchase_date: c.home_purchase_date || null,
    home_purchase_price: c.home_purchase_price || null,
    mortgage_rate: c.mortgage_rate || null,
    notes: c.notes || '',
    last_contacted: c.last_contacted || null,
  }));

  const { data, error } = await supabase.from('sphere_contacts').insert(rows).select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Generate initial events for imported contacts (birthday/anniversary within 30 days, purchase milestones)
  const newEvents: Record<string, unknown>[] = [];
  const now = new Date();

  for (const contact of data || []) {
    // Birthday check
    if (contact.birthday) {
      const bd = new Date(contact.birthday);
      const next = new Date(now.getFullYear(), bd.getMonth(), bd.getDate());
      if (next < now) next.setFullYear(next.getFullYear() + 1);
      const days = Math.ceil((next.getTime() - now.getTime()) / 86400000);
      if (days <= 30) {
        newEvents.push({
          contact_id: contact.id,
          user_id,
          event_type: 'birthday',
          description: `${contact.name}'s birthday is in ${days} days — Send a gift?`,
          detected_at: now.toISOString(),
          action_taken: false,
        });
      }
    }

    // Anniversary check
    if (contact.anniversary) {
      const an = new Date(contact.anniversary);
      const next = new Date(now.getFullYear(), an.getMonth(), an.getDate());
      if (next < now) next.setFullYear(next.getFullYear() + 1);
      const days = Math.ceil((next.getTime() - now.getTime()) / 86400000);
      if (days <= 30) {
        newEvents.push({
          contact_id: contact.id,
          user_id,
          event_type: 'anniversary',
          description: `${contact.name}'s anniversary is in ${days} days`,
          detected_at: now.toISOString(),
          action_taken: false,
        });
      }
    }

    // Time since purchase milestones (5yr, 7yr, 10yr)
    if (contact.home_purchase_date) {
      const purchased = new Date(contact.home_purchase_date);
      const years = (now.getTime() - purchased.getTime()) / (365.25 * 86400000);
      for (const milestone of [5, 7, 10]) {
        if (years >= milestone - 0.5 && years <= milestone + 0.5) {
          newEvents.push({
            contact_id: contact.id,
            user_id,
            event_type: 'time_since_purchase',
            description: `${contact.name} bought ~${milestone} years ago — Common time for a move`,
            detected_at: now.toISOString(),
            action_taken: false,
          });
          break;
        }
      }
    }
  }

  if (newEvents.length > 0) {
    await supabase.from('sphere_events').insert(newEvents);
  }

  return NextResponse.json({ inserted: data?.length || 0, events_generated: newEvents.length });
}
