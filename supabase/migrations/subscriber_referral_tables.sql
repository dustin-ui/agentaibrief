-- Subscribers table (replaces subscribers.json)
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL DEFAULT 'free',
  first_name TEXT,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);

-- Referrals table (replaces referrals.json)
CREATE TABLE IF NOT EXISTS referrals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  referred_by TEXT, -- referral code of referrer
  referrals TEXT[] NOT NULL DEFAULT '{}', -- emails of people they referred
  rewards_claimed TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referrals_email ON referrals(email);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code);

-- CC tokens table (replaces .cc-tokens.json)
CREATE TABLE IF NOT EXISTS cc_tokens (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- singleton row
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_type TEXT NOT NULL DEFAULT 'Bearer',
  expires_in INTEGER NOT NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
