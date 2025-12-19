-- Cleanup: Remove duplicate budget sections and ensure only one set of global sections
-- This script fixes the duplicate key error by cleaning up the budget_sections table

-- First, let's see what we have
SELECT name, COUNT(*) as count FROM budget_sections GROUP BY name HAVING COUNT(*) > 1;

-- Delete all existing sections (we'll recreate them)
DELETE FROM budget_sections;

-- Reset the sequence if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname = 'budget_sections_id_seq') THEN
        ALTER SEQUENCE budget_sections_id_seq RESTART WITH 1;
    END IF;
END $$;

-- Insert the default global sections (only once)
INSERT INTO budget_sections (name, display_order, is_calculated, calculation_type) VALUES
  ('Revenue', 1, FALSE, NULL),
  ('Cost of Goods Sold', 2, FALSE, NULL),
  ('Expenses', 3, FALSE, NULL),
  ('Gross Profit', 4, TRUE, 'gross_profit'),
  ('Net Profit', 5, TRUE, 'net_profit');

-- Verify we have the correct sections
SELECT * FROM budget_sections ORDER BY display_order; 