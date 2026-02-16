-- Add user_id column to comparisons table
ALTER TABLE comparisons ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Create index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_comparisons_user_id ON comparisons(user_id);
