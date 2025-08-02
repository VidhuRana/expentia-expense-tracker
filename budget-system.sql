-- Budget System Setup
-- This file creates the proper budget system with category-wise and overall budgets

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category TEXT, -- NULL for overall budget, specific category name for category budgets
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on budgets table
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to manage their own budgets
CREATE POLICY "Users can manage own budgets" ON budgets
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);
CREATE INDEX IF NOT EXISTS idx_budgets_date_range ON budgets(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_budgets_active ON budgets(is_active);

-- Function to get budget usage for a user
CREATE OR REPLACE FUNCTION get_budget_usage(
  p_user_id UUID,
  p_start_date DATE DEFAULT NULL,
  p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  budget_id UUID,
  budget_name TEXT,
  budget_amount DECIMAL(10,2),
  budget_category TEXT,
  used_amount DECIMAL(10,2),
  remaining_amount DECIMAL(10,2),
  usage_percentage DECIMAL(5,2),
  start_date DATE,
  end_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.amount,
    b.category,
    COALESCE(SUM(e.amount), 0) as used_amount,
    b.amount - COALESCE(SUM(e.amount), 0) as remaining_amount,
    CASE 
      WHEN b.amount > 0 THEN (COALESCE(SUM(e.amount), 0) / b.amount) * 100
      ELSE 0 
    END as usage_percentage,
    b.start_date,
    b.end_date
  FROM budgets b
  LEFT JOIN expenses e ON (
    e.user_id = b.user_id 
    AND e.date >= b.start_date 
    AND e.date <= b.end_date
    AND (
      (b.category IS NULL AND e.category IS NOT NULL) -- Overall budget matches any category
      OR (b.category = e.category) -- Category budget matches specific category
    )
  )
  WHERE b.user_id = p_user_id 
    AND b.is_active = true
    AND (p_start_date IS NULL OR b.start_date >= p_start_date)
    AND (p_end_date IS NULL OR b.end_date <= p_end_date)
  GROUP BY b.id, b.name, b.amount, b.category, b.start_date, b.end_date
  ORDER BY b.category NULLS FIRST, b.start_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has exceeded budget
CREATE OR REPLACE FUNCTION check_budget_alerts(
  p_user_id UUID
)
RETURNS TABLE (
  budget_id UUID,
  budget_name TEXT,
  budget_category TEXT,
  budget_amount DECIMAL(10,2),
  used_amount DECIMAL(10,2),
  usage_percentage DECIMAL(5,2),
  alert_level TEXT -- 'warning_75', 'warning_90', 'exceeded'
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    usage.budget_id,
    usage.budget_name,
    usage.budget_category,
    usage.budget_amount,
    usage.used_amount,
    usage.usage_percentage,
    CASE 
      WHEN usage.usage_percentage >= 100 THEN 'exceeded'
      WHEN usage.usage_percentage >= 90 THEN 'warning_90'
      WHEN usage.usage_percentage >= 75 THEN 'warning_75'
      ELSE 'normal'
    END as alert_level
  FROM get_budget_usage(p_user_id) usage
  WHERE usage.usage_percentage >= 75;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add monthly_budget column to profiles table (for backward compatibility)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS monthly_budget DECIMAL(10,2);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_budgets_updated_at 
    BEFORE UPDATE ON budgets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 