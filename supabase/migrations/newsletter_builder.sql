-- Newsletter profiles for agents
CREATE TABLE newsletter_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  agent_name TEXT NOT NULL,
  brokerage TEXT NOT NULL,
  team_name TEXT,
  phone TEXT,
  email TEXT NOT NULL,
  headshot_url TEXT,
  brand_color TEXT DEFAULT '#37b0c9',
  areas JSONB NOT NULL DEFAULT '[]',
  send_day TEXT NOT NULL DEFAULT 'Tuesday',
  send_time TEXT NOT NULL DEFAULT '09:00',
  cc_contact_list_id TEXT,
  cc_account_status TEXT DEFAULT 'pending',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter editions (generated weekly)
CREATE TABLE newsletter_editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES newsletter_profiles(id),
  stories JSONB NOT NULL DEFAULT '[]',
  html_content TEXT,
  status TEXT DEFAULT 'draft',
  scheduled_for TIMESTAMPTZ,
  preview_sent_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Saved stories (from "Add to My Newsletter" button)
CREATE TABLE newsletter_saved_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES newsletter_profiles(id),
  headline TEXT NOT NULL,
  summary TEXT,
  source_url TEXT,
  category TEXT,
  viral_score INTEGER,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  used_in_edition UUID REFERENCES newsletter_editions(id),
  UNIQUE(profile_id, headline)
);

-- RLS policies
ALTER TABLE newsletter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_saved_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own newsletter profile"
  ON newsletter_profiles FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own editions"
  ON newsletter_editions FOR ALL
  USING (profile_id IN (SELECT id FROM newsletter_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own saved stories"
  ON newsletter_saved_stories FOR ALL
  USING (profile_id IN (SELECT id FROM newsletter_profiles WHERE user_id = auth.uid()));
