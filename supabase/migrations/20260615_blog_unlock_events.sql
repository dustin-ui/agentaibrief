CREATE TABLE IF NOT EXISTS blog_unlock_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  slug TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manychat',
  campaign TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_unlock_events_email ON blog_unlock_events(email);
CREATE INDEX IF NOT EXISTS idx_blog_unlock_events_slug ON blog_unlock_events(slug);
CREATE INDEX IF NOT EXISTS idx_blog_unlock_events_created_at ON blog_unlock_events(created_at);

ALTER TABLE blog_unlock_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access to blog unlock events" ON blog_unlock_events;
CREATE POLICY "Service role full access to blog unlock events"
  ON blog_unlock_events FOR ALL USING (auth.role() = 'service_role');

