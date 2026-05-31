-- ============================================================================
-- Core tables baseline: profiles, comparisons, sphere_contacts, sphere_events
-- ============================================================================
--
-- ⚠️ UNAPPLIED / FOR REVIEW ONLY ⚠️
-- These CREATE TABLE statements were reverse-engineered from the application
-- code's usage (selects/inserts/updates) because the base tables were never
-- committed to migrations (only ALTER/ENABLE RLS migrations existed). The
-- production database ALREADY contains these tables. Therefore:
--
--   * DO NOT run this blindly against prod. It is written with
--     `CREATE TABLE IF NOT EXISTS` + `ADD COLUMN IF NOT EXISTS` so it is
--     idempotent and safe-ish, but column types/defaults here are INFERRED
--     and MUST be diffed against the live schema before applying.
--   * Review every column type, default, and constraint against the current
--     prod schema (Supabase dashboard / `pg_dump --schema-only`) first.
--   * RLS policies use `CREATE POLICY` (no IF NOT EXISTS in older PG) guarded
--     by DROP POLICY IF EXISTS to be re-runnable.
--
-- Purpose of committing this: make the schema reproducible, guarantee the
-- indexes on profiles(email), profiles(stripe_customer_id),
-- profiles(stripe_subscription_id) exist (the Stripe<->Supabase sync hot path),
-- and document the source-of-truth columns the webhook/sync code relies on.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles: the Stripe <-> Supabase subscription source of truth.
-- id == auth.users.id (1:1). Columns inferred from:
--   webhooks/stripe, sync-subscription, admin/sync-subscriptions,
--   verify-access, grant-trial, trial-checkout.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free',          -- 'free' | 'pro' | 'inner_circle'
  subscription_status TEXT NOT NULL DEFAULT 'inactive',    -- 'active' | 'inactive' | 'trialing' | 'past_due'
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  trial_used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Defensive: add any columns that may be missing on an older prod schema.
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'inactive';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_used BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Indexes for the subscription sync / webhook lookups (prevents full scans).
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON profiles(stripe_subscription_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Service role full access to profiles" ON profiles;
CREATE POLICY "Service role full access to profiles" ON profiles FOR ALL USING (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- comparisons: offer-comparison tool. Columns inferred from
--   src/app/api/comparisons/route.ts (address, offers, comparison, agent_notes,
--   share_id, user_id, created_at, updated_at).
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  address TEXT NOT NULL,
  offers JSONB NOT NULL,
  comparison JSONB,
  agent_notes TEXT DEFAULT '',
  share_id UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE comparisons ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE comparisons ADD COLUMN IF NOT EXISTS comparison JSONB;
ALTER TABLE comparisons ADD COLUMN IF NOT EXISTS agent_notes TEXT DEFAULT '';
ALTER TABLE comparisons ADD COLUMN IF NOT EXISTS share_id UUID DEFAULT gen_random_uuid();
ALTER TABLE comparisons ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_comparisons_user_id ON comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_comparisons_share_id ON comparisons(share_id);

ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own comparisons" ON comparisons;
CREATE POLICY "Users can manage own comparisons" ON comparisons FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Anyone can view shared comparisons" ON comparisons;
CREATE POLICY "Anyone can view shared comparisons" ON comparisons FOR SELECT USING (share_id IS NOT NULL);
DROP POLICY IF EXISTS "Service role full access to comparisons" ON comparisons;
CREATE POLICY "Service role full access to comparisons" ON comparisons FOR ALL USING (auth.role() = 'service_role');

-- ----------------------------------------------------------------------------
-- sphere_contacts / sphere_events: per-user CRM data referenced by the
-- 20260304_fix_rls.sql migration (ALTER ... ENABLE RLS) but never CREATEd here.
-- Columns below are a CONSERVATIVE inference — verify against prod before apply.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sphere_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  last_contacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sphere_contacts_user_id ON sphere_contacts(user_id);

ALTER TABLE sphere_contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own sphere contacts" ON sphere_contacts;
CREATE POLICY "Users can manage own sphere contacts" ON sphere_contacts FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service role full access to sphere_contacts" ON sphere_contacts;
CREATE POLICY "Service role full access to sphere_contacts" ON sphere_contacts FOR ALL USING (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS sphere_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES sphere_contacts(id) ON DELETE CASCADE,
  event_type TEXT,
  event_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sphere_events_user_id ON sphere_events(user_id);
CREATE INDEX IF NOT EXISTS idx_sphere_events_contact_id ON sphere_events(contact_id);

ALTER TABLE sphere_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage own sphere events" ON sphere_events;
CREATE POLICY "Users can manage own sphere events" ON sphere_events FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Service role full access to sphere_events" ON sphere_events;
CREATE POLICY "Service role full access to sphere_events" ON sphere_events FOR ALL USING (auth.role() = 'service_role');
