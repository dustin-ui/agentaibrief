ALTER TABLE newsletter_profiles ADD COLUMN IF NOT EXISTS last_campaign_id text;
ALTER TABLE newsletter_profiles ADD COLUMN IF NOT EXISTS last_campaign_at timestamptz;
