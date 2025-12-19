-- Migration: Convert from organization-wide to budget-specific categories and subcategories
-- This script updates the existing schema to make categories and subcategories budget-specific

-- First, add the new columns to existing tables
ALTER TABLE budget_categories ADD COLUMN budget_id UUID;
ALTER TABLE budget_subcategories ADD COLUMN budget_id UUID;

-- Drop RLS policies that depend on organization_id before removing the column
DROP POLICY IF EXISTS "Users can view budget sections in their organizations" ON budget_sections;
DROP POLICY IF EXISTS "Organization admins can manage budget sections" ON budget_sections;
DROP POLICY IF EXISTS "Users can view budget categories in their organizations" ON budget_categories;
DROP POLICY IF EXISTS "Organization admins can manage budget categories" ON budget_categories;
DROP POLICY IF EXISTS "Users can view budget subcategories in their organizations" ON budget_subcategories;
DROP POLICY IF EXISTS "Organization admins can manage budget subcategories" ON budget_subcategories;

-- Clean up duplicate budget sections before removing organization_id
-- Delete all existing sections (we'll recreate them as global)
DELETE FROM budget_sections;

-- Remove organization_id from budget_sections (make them global)
ALTER TABLE budget_sections DROP COLUMN IF EXISTS organization_id;

-- Update budget_categories to link to budgets instead of organizations
-- This assumes each category should be linked to the first budget in the organization
UPDATE budget_categories 
SET budget_id = (
  SELECT b.id 
  FROM budgets b 
  WHERE b.organization_id = budget_categories.organization_id 
  LIMIT 1
);

-- Update budget_subcategories to link to budgets instead of organizations
-- This assumes each subcategory should be linked to the first budget in the organization
UPDATE budget_subcategories 
SET budget_id = (
  SELECT b.id 
  FROM budgets b 
  WHERE b.organization_id = budget_subcategories.organization_id 
  LIMIT 1
);

-- Make budget_id NOT NULL after populating it
ALTER TABLE budget_categories ALTER COLUMN budget_id SET NOT NULL;
ALTER TABLE budget_subcategories ALTER COLUMN budget_id SET NOT NULL;

-- Add foreign key constraints
ALTER TABLE budget_categories ADD CONSTRAINT fk_budget_categories_budget_id 
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE;

ALTER TABLE budget_subcategories ADD CONSTRAINT fk_budget_subcategories_budget_id 
  FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE;

-- Remove organization_id columns
ALTER TABLE budget_categories DROP COLUMN IF EXISTS organization_id;
ALTER TABLE budget_subcategories DROP COLUMN IF EXISTS organization_id;

-- Update unique constraints
DROP INDEX IF EXISTS budget_categories_organization_id_section_id_name_key;
DROP INDEX IF EXISTS budget_subcategories_organization_id_category_id_name_key;

ALTER TABLE budget_categories ADD CONSTRAINT budget_categories_budget_id_section_id_name_key 
  UNIQUE (budget_id, section_id, name);

ALTER TABLE budget_subcategories ADD CONSTRAINT budget_subcategories_budget_id_category_id_name_key 
  UNIQUE (budget_id, category_id, name);

-- Update budget_sections unique constraint
DROP INDEX IF EXISTS budget_sections_organization_id_name_key;
ALTER TABLE budget_sections ADD CONSTRAINT budget_sections_name_key UNIQUE (name);

-- Create new RLS policies for budget_sections (make them global)
CREATE POLICY "Users can view budget sections" ON budget_sections
  FOR SELECT USING (true);

CREATE POLICY "Organization admins can manage budget sections" ON budget_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- Create new RLS policies for budget_categories (make them budget-specific)
CREATE POLICY "Users can view budget categories in their organizations" ON budget_categories
  FOR SELECT USING (
    budget_id IN (
      SELECT b.id FROM budgets b
      JOIN organization_members om ON b.organization_id = om.organization_id
      WHERE om.user_id = auth.uid() AND om.status = 'active'
    )
  );

CREATE POLICY "Organization admins can manage budget categories" ON budget_categories
  FOR ALL USING (
    budget_id IN (
      SELECT b.id FROM budgets b
      JOIN organization_members om ON b.organization_id = om.organization_id
      WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin') AND om.status = 'active'
    )
  );

-- Create new RLS policies for budget_subcategories (make them budget-specific)
CREATE POLICY "Users can view budget subcategories in their organizations" ON budget_subcategories
  FOR SELECT USING (
    budget_id IN (
      SELECT b.id FROM budgets b
      JOIN organization_members om ON b.organization_id = om.organization_id
      WHERE om.user_id = auth.uid() AND om.status = 'active'
    )
  );

CREATE POLICY "Organization admins can manage budget subcategories" ON budget_subcategories
  FOR ALL USING (
    budget_id IN (
      SELECT b.id FROM budgets b
      JOIN organization_members om ON b.organization_id = om.organization_id
      WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin') AND om.status = 'active'
    )
  );

-- Insert the default global sections (only once, after cleaning up)
INSERT INTO budget_sections (name, display_order, is_calculated, calculation_type) VALUES
  ('Revenue', 1, FALSE, NULL),
  ('Cost of Goods Sold', 2, FALSE, NULL),
  ('Expenses', 3, FALSE, NULL),
  ('Gross Profit', 4, TRUE, 'gross_profit'),
  ('Net Profit', 5, TRUE, 'net_profit'); 