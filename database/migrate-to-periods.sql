-- Migration: Convert budget_items from monthly columns to normalized periods table
-- This migration converts the current schema with jan_amount, feb_amount, etc. columns
-- to a more scalable design with a separate budget_item_periods table

-- Step 1: Create the new budget_item_periods table
CREATE TABLE budget_item_periods (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  budget_item_id uuid NOT NULL REFERENCES budget_items(id) ON DELETE CASCADE,
  period_year integer NOT NULL,
  period_month integer NOT NULL CHECK (period_month BETWEEN 1 AND 12),
  amount numeric(15, 2) NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Ensure unique combination
  UNIQUE(budget_item_id, period_year, period_month)
);

-- Step 2: Create indexes for performance
CREATE INDEX idx_budget_item_periods_budget_item ON budget_item_periods(budget_item_id);
CREATE INDEX idx_budget_item_periods_period ON budget_item_periods(period_year, period_month);
CREATE INDEX idx_budget_item_periods_budget_item_period ON budget_item_periods(budget_item_id, period_year, period_month);

-- Step 3: Add trigger for updated_at
CREATE TRIGGER update_budget_item_periods_updated_at 
  BEFORE UPDATE ON budget_item_periods 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Step 4: Migrate existing data from monthly columns to periods table
-- We'll migrate all non-zero amounts for the current year (2025)
INSERT INTO budget_item_periods (budget_item_id, period_year, period_month, amount)
SELECT 
  id as budget_item_id,
  2025 as period_year,
  1 as period_month,
  jan_amount as amount
FROM budget_items 
WHERE jan_amount != 0

UNION ALL

SELECT 
  id as budget_item_id,
  2025 as period_year,
  2 as period_month,
  feb_amount as amount
FROM budget_items 
WHERE feb_amount != 0

UNION ALL

SELECT 
  id as budget_item_id,
  2025 as period_year,
  3 as period_month,
  mar_amount as amount
FROM budget_items 
WHERE mar_amount != 0

UNION ALL

SELECT 
  id as budget_item_id,
  2025 as period_year,
  4 as period_month,
  apr_amount as amount
FROM budget_items 
WHERE apr_amount != 0

UNION ALL

SELECT 
  id as budget_item_id,
  2025 as period_year,
  5 as period_month,
  may_amount as amount
FROM budget_items 
WHERE may_amount != 0

UNION ALL

SELECT 
  id as budget_item_id,
  2025 as period_year,
  6 as period_month,
  jun_amount as amount
FROM budget_items 
WHERE jun_amount != 0

UNION ALL

SELECT 
  id as budget_item_id,
  2025 as period_year,
  7 as period_month,
  jul_amount as amount
FROM budget_items 
WHERE jul_amount != 0

UNION ALL

SELECT 
  id as budget_item_id,
  2025 as period_year,
  8 as period_month,
  aug_amount as amount
FROM budget_items 
WHERE aug_amount != 0

UNION ALL

SELECT 
  id as budget_item_id,
  2025 as period_year,
  9 as period_month,
  sep_amount as amount
FROM budget_items 
WHERE sep_amount != 0

UNION ALL

SELECT 
  id as budget_item_id,
  2025 as period_year,
  10 as period_month,
  oct_amount as amount
FROM budget_items 
WHERE oct_amount != 0

UNION ALL

SELECT 
  id as budget_item_id,
  2025 as period_year,
  11 as period_month,
  nov_amount as amount
FROM budget_items 
WHERE nov_amount != 0

UNION ALL

SELECT 
  id as budget_item_id,
  2025 as period_year,
  12 as period_month,
  dec_amount as amount
FROM budget_items 
WHERE dec_amount != 0;

-- Step 5: Remove the old monthly columns from budget_items
ALTER TABLE budget_items DROP COLUMN jan_amount;
ALTER TABLE budget_items DROP COLUMN feb_amount;
ALTER TABLE budget_items DROP COLUMN mar_amount;
ALTER TABLE budget_items DROP COLUMN apr_amount;
ALTER TABLE budget_items DROP COLUMN may_amount;
ALTER TABLE budget_items DROP COLUMN jun_amount;
ALTER TABLE budget_items DROP COLUMN jul_amount;
ALTER TABLE budget_items DROP COLUMN aug_amount;
ALTER TABLE budget_items DROP COLUMN sep_amount;
ALTER TABLE budget_items DROP COLUMN oct_amount;
ALTER TABLE budget_items DROP COLUMN nov_amount;
ALTER TABLE budget_items DROP COLUMN dec_amount;

-- Step 6: Update the amount column to be calculated from periods
-- We'll create a function to calculate the total amount from periods
CREATE OR REPLACE FUNCTION calculate_budget_item_total(budget_item_uuid uuid)
RETURNS numeric AS $$
BEGIN
  RETURN COALESCE(
    (SELECT SUM(amount) FROM budget_item_periods WHERE budget_item_id = budget_item_uuid),
    0
  );
END;
$$ LANGUAGE plpgsql;

-- Step 7: Create a trigger to automatically update the amount column when periods change
CREATE OR REPLACE FUNCTION update_budget_item_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE budget_items 
    SET amount = calculate_budget_item_total(OLD.budget_item_id)
    WHERE id = OLD.budget_item_id;
    RETURN OLD;
  ELSE
    UPDATE budget_items 
    SET amount = calculate_budget_item_total(NEW.budget_item_id)
    WHERE id = NEW.budget_item_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_budget_item_amount
  AFTER INSERT OR UPDATE OR DELETE ON budget_item_periods
  FOR EACH ROW
  EXECUTE FUNCTION update_budget_item_amount();

-- Step 8: Update all existing budget_items to have correct total amounts
UPDATE budget_items 
SET amount = calculate_budget_item_total(id);

-- Step 9: Add RLS policies for the new table
ALTER TABLE budget_item_periods ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see periods for budget items in their organization
CREATE POLICY "Users can view budget item periods for their organization" ON budget_item_periods
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM budget_items bi
      JOIN budgets b ON bi.budget_id = b.id
      JOIN organization_members om ON b.organization_id = om.organization_id
      WHERE bi.id = budget_item_periods.budget_item_id
      AND om.user_id = auth.uid()
    )
  );

-- Policy to allow users to insert periods for budget items in their organization
CREATE POLICY "Users can insert budget item periods for their organization" ON budget_item_periods
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM budget_items bi
      JOIN budgets b ON bi.budget_id = b.id
      JOIN organization_members om ON b.organization_id = om.organization_id
      WHERE bi.id = budget_item_periods.budget_item_id
      AND om.user_id = auth.uid()
    )
  );

-- Policy to allow users to update periods for budget items in their organization
CREATE POLICY "Users can update budget item periods for their organization" ON budget_item_periods
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM budget_items bi
      JOIN budgets b ON bi.budget_id = b.id
      JOIN organization_members om ON b.organization_id = om.organization_id
      WHERE bi.id = budget_item_periods.budget_item_id
      AND om.user_id = auth.uid()
    )
  );

-- Policy to allow users to delete periods for budget items in their organization
CREATE POLICY "Users can delete budget item periods for their organization" ON budget_item_periods
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM budget_items bi
      JOIN budgets b ON bi.budget_id = b.id
      JOIN organization_members om ON b.organization_id = om.organization_id
      WHERE bi.id = budget_item_periods.budget_item_id
      AND om.user_id = auth.uid()
    )
  ); 