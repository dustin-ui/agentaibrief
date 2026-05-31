-- ============================================================================
-- referral_events: normalize the referrals.referrals TEXT[] array
-- ============================================================================
--
-- ⚠️ UNAPPLIED / FOR REVIEW ONLY — review against current prod schema before
-- applying. This migration introduces a normalized table to replace the
-- read-modify-write on referrals.referrals (a TEXT[] column), which had a race
-- condition (concurrent referrals from the same code lose writes) and allowed
-- double-counting (no uniqueness on referred emails).
--
-- src/lib/referral.ts has been updated to write/read this table.
-- The UNIQUE(referrer_code, referred_email) constraint guarantees a given
-- person is counted at most once per referrer. Counts are computed via
-- COUNT(*) / array length over query results instead of array mutation.
-- ============================================================================

CREATE TABLE IF NOT EXISTS referral_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_code TEXT NOT NULL,
  referred_email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_referral_events_code_email UNIQUE (referrer_code, referred_email)
);

CREATE INDEX IF NOT EXISTS idx_referral_events_referrer_code ON referral_events(referrer_code);

-- Optional FK to referrals(code) — left as a comment because referrals.code is
-- UNIQUE but verify the constraint name / existence in prod before enabling:
-- ALTER TABLE referral_events
--   ADD CONSTRAINT fk_referral_events_code
--   FOREIGN KEY (referrer_code) REFERENCES referrals(code) ON DELETE CASCADE;

ALTER TABLE referral_events ENABLE ROW LEVEL SECURITY;

-- Server-side only (service role). End users read their referral data via the
-- referrals row + server routes; no direct client access needed.
DROP POLICY IF EXISTS "Service role full access to referral_events" ON referral_events;
CREATE POLICY "Service role full access to referral_events"
  ON referral_events FOR ALL USING (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- OPTIONAL one-time backfill from the legacy referrals.referrals array.
-- Review and run manually if you want historical referrals preserved.
-- Idempotent via ON CONFLICT DO NOTHING against the UNIQUE constraint.
-- ---------------------------------------------------------------------------
-- INSERT INTO referral_events (referrer_code, referred_email)
-- SELECT r.code, unnest(r.referrals)
-- FROM referrals r
-- WHERE array_length(r.referrals, 1) > 0
-- ON CONFLICT (referrer_code, referred_email) DO NOTHING;

-- After backfill + verification, the legacy column can be dropped:
-- ALTER TABLE referrals DROP COLUMN IF EXISTS referrals;
