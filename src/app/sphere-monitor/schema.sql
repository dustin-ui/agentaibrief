-- Sphere Seismograph Database Schema
-- Run against your Supabase project

CREATE TABLE IF NOT EXISTS sphere_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  birthday DATE,
  anniversary DATE,
  relationship_type TEXT DEFAULT 'sphere' CHECK (relationship_type IN ('past_client', 'sphere', 'lead')),
  home_purchase_date DATE,
  home_purchase_price NUMERIC,
  mortgage_rate NUMERIC,
  notes TEXT DEFAULT '',
  last_contacted TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sphere_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES sphere_contacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  action_taken BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sphere_contacts_user ON sphere_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_sphere_events_user ON sphere_events(user_id);
CREATE INDEX IF NOT EXISTS idx_sphere_events_contact ON sphere_events(contact_id);

-- RLS
ALTER TABLE sphere_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sphere_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own contacts" ON sphere_contacts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own events" ON sphere_events
  FOR ALL USING (auth.uid() = user_id);
