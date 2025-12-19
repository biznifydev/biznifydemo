-- Test Budget Data
-- Run this after setting up the budget system tables
-- Make sure to replace 'YOUR_ORGANIZATION_ID' with your actual organization ID

-- First, get your organization ID and replace it in the queries below
-- SELECT id FROM organizations LIMIT 1;

-- Create organization-specific budget sections (copy from global sections)
INSERT INTO budget_sections (organization_id, name, display_order, is_calculated, calculation_type)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid, -- Replace with your actual organization ID
  name, 
  display_order, 
  is_calculated, 
  calculation_type
FROM budget_sections 
WHERE organization_id IS NULL;

-- Create a test budget
INSERT INTO budgets (organization_id, name, description, fiscal_year, status, created_by)
VALUES (
  'YOUR_ORGANIZATION_ID'::uuid, -- Replace with your actual organization ID
  '2025 Annual Budget',
  'Comprehensive test budget for 2025',
  2025,
  'draft',
  NULL
);

-- Get the budget ID for reference
-- SELECT id FROM budgets WHERE name = '2025 Annual Budget' AND organization_id = 'YOUR_ORGANIZATION_ID'::uuid;

-- Revenue Categories and Subcategories
INSERT INTO budget_categories (organization_id, section_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bs.id,
  'Product Sales',
  1
FROM budget_sections bs 
WHERE bs.organization_id = 'YOUR_ORGANIZATION_ID'::uuid AND bs.name = 'Revenue';

INSERT INTO budget_categories (organization_id, section_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bs.id,
  'Professional Services',
  2
FROM budget_sections bs 
WHERE bs.organization_id = 'YOUR_ORGANIZATION_ID'::uuid AND bs.name = 'Revenue';

INSERT INTO budget_categories (organization_id, section_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bs.id,
  'Other Revenue',
  3
FROM budget_sections bs 
WHERE bs.organization_id = 'YOUR_ORGANIZATION_ID'::uuid AND bs.name = 'Revenue';

-- COGS Categories
INSERT INTO budget_categories (organization_id, section_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bs.id,
  'Direct Labor',
  1
FROM budget_sections bs 
WHERE bs.organization_id = 'YOUR_ORGANIZATION_ID'::uuid AND bs.name = 'Cost of Goods Sold';

INSERT INTO budget_categories (organization_id, section_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bs.id,
  'Direct Materials',
  2
FROM budget_sections bs 
WHERE bs.organization_id = 'YOUR_ORGANIZATION_ID'::uuid AND bs.name = 'Cost of Goods Sold';

INSERT INTO budget_categories (organization_id, section_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bs.id,
  'Manufacturing Overhead',
  3
FROM budget_sections bs 
WHERE bs.organization_id = 'YOUR_ORGANIZATION_ID'::uuid AND bs.name = 'Cost of Goods Sold';

-- Expenses Categories
INSERT INTO budget_categories (organization_id, section_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bs.id,
  'Sales & Marketing',
  1
FROM budget_sections bs 
WHERE bs.organization_id = 'YOUR_ORGANIZATION_ID'::uuid AND bs.name = 'Expenses';

INSERT INTO budget_categories (organization_id, section_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bs.id,
  'Research & Development',
  2
FROM budget_sections bs 
WHERE bs.organization_id = 'YOUR_ORGANIZATION_ID'::uuid AND bs.name = 'Expenses';

INSERT INTO budget_categories (organization_id, section_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bs.id,
  'General & Administrative',
  3
FROM budget_sections bs 
WHERE bs.organization_id = 'YOUR_ORGANIZATION_ID'::uuid AND bs.name = 'Expenses';

INSERT INTO budget_categories (organization_id, section_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bs.id,
  'Human Resources',
  4
FROM budget_sections bs 
WHERE bs.organization_id = 'YOUR_ORGANIZATION_ID'::uuid AND bs.name = 'Expenses';

-- Revenue Subcategories
-- Product Sales subcategories
INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'SAAS Subscriptions',
  1
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Product Sales' 
  AND bs.name = 'Revenue';

INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'One-time Licenses',
  2
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Product Sales' 
  AND bs.name = 'Revenue';

INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Add-on Services',
  3
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Product Sales' 
  AND bs.name = 'Revenue';

-- Professional Services subcategories
INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Consulting',
  1
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Professional Services' 
  AND bs.name = 'Revenue';

INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Implementation',
  2
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Professional Services' 
  AND bs.name = 'Revenue';

INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Training',
  3
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Professional Services' 
  AND bs.name = 'Revenue';

-- Other Revenue subcategories
INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Interest Income',
  1
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Other Revenue' 
  AND bs.name = 'Revenue';

INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Rental Income',
  2
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Other Revenue' 
  AND bs.name = 'Revenue';

INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Miscellaneous',
  3
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Other Revenue' 
  AND bs.name = 'Revenue';

-- COGS Subcategories
-- Direct Labor subcategories
INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Development Team',
  1
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Direct Labor' 
  AND bs.name = 'Cost of Goods Sold';

INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Support Team',
  2
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Direct Labor' 
  AND bs.name = 'Cost of Goods Sold';

INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Implementation Team',
  3
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Direct Labor' 
  AND bs.name = 'Cost of Goods Sold';

-- Direct Materials subcategories
INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Server Costs',
  1
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Direct Materials' 
  AND bs.name = 'Cost of Goods Sold';

INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Third-party APIs',
  2
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Direct Materials' 
  AND bs.name = 'Cost of Goods Sold';

INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Software Licenses',
  3
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Direct Materials' 
  AND bs.name = 'Cost of Goods Sold';

-- Manufacturing Overhead subcategories
INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Infrastructure',
  1
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Manufacturing Overhead' 
  AND bs.name = 'Cost of Goods Sold';

INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Quality Assurance',
  2
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Manufacturing Overhead' 
  AND bs.name = 'Cost of Goods Sold';

INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'DevOps',
  3
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Manufacturing Overhead' 
  AND bs.name = 'Cost of Goods Sold';

-- Expenses Subcategories
-- Sales & Marketing subcategories
INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Digital Advertising',
  1
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Sales & Marketing' 
  AND bs.name = 'Expenses';

INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Content Marketing',
  2
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Sales & Marketing' 
  AND bs.name = 'Expenses';

INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Sales Commissions',
  3
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Sales & Marketing' 
  AND bs.name = 'Expenses';

INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Trade Shows',
  4
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Sales & Marketing' 
  AND bs.name = 'Expenses';

-- Research & Development subcategories
INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Product Development',
  1
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Research & Development' 
  AND bs.name = 'Expenses';

INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Research',
  2
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Research & Development' 
  AND bs.name = 'Expenses';

INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Prototyping',
  3
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Research & Development' 
  AND bs.name = 'Expenses';

-- General & Administrative subcategories
INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Office Rent',
  1
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'General & Administrative' 
  AND bs.name = 'Expenses';

INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Utilities',
  2
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'General & Administrative' 
  AND bs.name = 'Expenses';

INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Insurance',
  3
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'General & Administrative' 
  AND bs.name = 'Expenses';

INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Legal Fees',
  4
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'General & Administrative' 
  AND bs.name = 'Expenses';

-- Human Resources subcategories
INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Salaries',
  1
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Human Resources' 
  AND bs.name = 'Expenses';

INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Benefits',
  2
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Human Resources' 
  AND bs.name = 'Expenses';

INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Recruitment',
  3
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Human Resources' 
  AND bs.name = 'Expenses';

INSERT INTO budget_subcategories (organization_id, category_id, name, display_order)
SELECT 
  'YOUR_ORGANIZATION_ID'::uuid,
  bc.id,
  'Training',
  4
FROM budget_categories bc 
JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bc.organization_id = 'YOUR_ORGANIZATION_ID'::uuid 
  AND bc.name = 'Human Resources' 
  AND bs.name = 'Expenses';

-- Now insert budget items with realistic amounts
-- Get the budget ID first
-- SELECT id FROM budgets WHERE name = '2025 Annual Budget' AND organization_id = 'YOUR_ORGANIZATION_ID'::uuid;

-- Revenue Budget Items
INSERT INTO budget_items (budget_id, organization_id, section_id, category_id, subcategory_id, amount, notes)
SELECT 
  b.id,
  'YOUR_ORGANIZATION_ID'::uuid,
  bs.id,
  bc.id,
  bsc.id,
  CASE bsc.name
    WHEN 'SAAS Subscriptions' THEN 500000
    WHEN 'One-time Licenses' THEN 150000
    WHEN 'Add-on Services' THEN 75000
    WHEN 'Consulting' THEN 200000
    WHEN 'Implementation' THEN 300000
    WHEN 'Training' THEN 50000
    WHEN 'Interest Income' THEN 10000
    WHEN 'Rental Income' THEN 25000
    WHEN 'Miscellaneous' THEN 15000
    ELSE 50000
  END,
  'Test budget for ' || bsc.name
FROM budgets b
JOIN budget_sections bs ON bs.organization_id = b.organization_id AND bs.name IN ('Revenue')
JOIN budget_categories bc ON bc.section_id = bs.id AND bc.organization_id = b.organization_id
JOIN budget_subcategories bsc ON bsc.category_id = bc.id AND bsc.organization_id = b.organization_id
WHERE b.name = '2025 Annual Budget' 
  AND b.organization_id = 'YOUR_ORGANIZATION_ID'::uuid;

-- COGS Budget Items
INSERT INTO budget_items (budget_id, organization_id, section_id, category_id, subcategory_id, amount, notes)
SELECT 
  b.id,
  'YOUR_ORGANIZATION_ID'::uuid,
  bs.id,
  bc.id,
  bsc.id,
  CASE bsc.name
    WHEN 'Development Team' THEN 400000
    WHEN 'Support Team' THEN 150000
    WHEN 'Implementation Team' THEN 200000
    WHEN 'Server Costs' THEN 80000
    WHEN 'Third-party APIs' THEN 45000
    WHEN 'Software Licenses' THEN 60000
    WHEN 'Infrastructure' THEN 120000
    WHEN 'Quality Assurance' THEN 90000
    WHEN 'DevOps' THEN 110000
    ELSE 50000
  END,
  'Test budget for ' || bsc.name
FROM budgets b
JOIN budget_sections bs ON bs.organization_id = b.organization_id AND bs.name IN ('Cost of Goods Sold')
JOIN budget_categories bc ON bc.section_id = bs.id AND bc.organization_id = b.organization_id
JOIN budget_subcategories bsc ON bsc.category_id = bc.id AND bsc.organization_id = b.organization_id
WHERE b.name = '2025 Annual Budget' 
  AND b.organization_id = 'YOUR_ORGANIZATION_ID'::uuid;

-- Expenses Budget Items
INSERT INTO budget_items (budget_id, organization_id, section_id, category_id, subcategory_id, amount, notes)
SELECT 
  b.id,
  'YOUR_ORGANIZATION_ID'::uuid,
  bs.id,
  bc.id,
  bsc.id,
  CASE bsc.name
    WHEN 'Digital Advertising' THEN 120000
    WHEN 'Content Marketing' THEN 80000
    WHEN 'Sales Commissions' THEN 180000
    WHEN 'Trade Shows' THEN 60000
    WHEN 'Product Development' THEN 250000
    WHEN 'Research' THEN 100000
    WHEN 'Prototyping' THEN 75000
    WHEN 'Office Rent' THEN 180000
    WHEN 'Utilities' THEN 24000
    WHEN 'Insurance' THEN 36000
    WHEN 'Legal Fees' THEN 48000
    WHEN 'Salaries' THEN 800000
    WHEN 'Benefits' THEN 160000
    WHEN 'Recruitment' THEN 40000
    WHEN 'Training' THEN 30000
    ELSE 50000
  END,
  'Test budget for ' || bsc.name
FROM budgets b
JOIN budget_sections bs ON bs.organization_id = b.organization_id AND bs.name IN ('Expenses')
JOIN budget_categories bc ON bc.section_id = bs.id AND bc.organization_id = b.organization_id
JOIN budget_subcategories bsc ON bsc.category_id = bc.id AND bsc.organization_id = b.organization_id
WHERE b.name = '2025 Annual Budget' 
  AND b.organization_id = 'YOUR_ORGANIZATION_ID'::uuid; 