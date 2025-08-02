-- Add monthly_budget column to profiles table (no default value)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_budget DECIMAL(10,2);

-- No default budget - users will set their own budget 