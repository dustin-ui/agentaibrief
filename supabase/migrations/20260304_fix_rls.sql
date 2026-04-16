-- Fix RLS: Enable Row Level Security on all public tables that were missing it
-- Applied 2026-03-04 to address Supabase Security Advisor warnings

-- ============================================================
-- PROFILES table (user subscription data)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Service role can do anything (for webhook/server-side updates)
CREATE POLICY "Service role full access to profiles"
  ON profiles FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- SUBSCRIBERS table (admin-managed, server-side only)
-- ============================================================
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Only service role can access subscribers (no end-user access needed)
CREATE POLICY "Service role full access to subscribers"
  ON subscribers FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- REFERRALS table (admin-managed, server-side only)
-- ============================================================
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Users can view their own referral record (matched by email via auth)
CREATE POLICY "Users can view own referral"
  ON referrals FOR SELECT USING (email = auth.email());

-- Service role full access for server-side operations
CREATE POLICY "Service role full access to referrals"
  ON referrals FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- COMPARISONS table (per-user data)
-- ============================================================
ALTER TABLE comparisons ENABLE ROW LEVEL SECURITY;

-- Users can manage their own comparisons
CREATE POLICY "Users can manage own comparisons"
  ON comparisons FOR ALL USING (auth.uid() = user_id);

-- Allow reading shared comparisons by share_id (public share link)
CREATE POLICY "Anyone can view shared comparisons"
  ON comparisons FOR SELECT USING (share_id IS NOT NULL);

-- Service role full access
CREATE POLICY "Service role full access to comparisons"
  ON comparisons FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- CC_TOKENS table (singleton admin row - server only)
-- ============================================================
ALTER TABLE cc_tokens ENABLE ROW LEVEL SECURITY;

-- Only service role can access CC tokens (these are API credentials)
CREATE POLICY "Service role full access to cc_tokens"
  ON cc_tokens FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- SPHERE_CONTACTS table (per-user CRM data)
-- ============================================================
ALTER TABLE sphere_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sphere contacts"
  ON sphere_contacts FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to sphere_contacts"
  ON sphere_contacts FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- SPHERE_EVENTS table (per-user CRM events)
-- ============================================================
ALTER TABLE sphere_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own sphere events"
  ON sphere_events FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to sphere_events"
  ON sphere_events FOR ALL USING (auth.role() = 'service_role');
