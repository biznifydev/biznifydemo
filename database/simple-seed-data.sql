-- Simple seed data script - avoids variable assignment issues
-- This creates test budget data step by step without complex queries

-- First, clean up any existing test data
DELETE FROM budget_items WHERE organization_id = '682405ba-4c6f-4415-b103-89fd64ff8ce4';
DELETE FROM budget_subcategories WHERE budget_id IN (SELECT id FROM budgets WHERE organization_id = '682405ba-4c6f-4415-b103-89fd64ff8ce4');
DELETE FROM budget_categories WHERE budget_id IN (SELECT id FROM budgets WHERE organization_id = '682405ba-4c6f-4415-b103-89fd64ff8ce4');
DELETE FROM budgets WHERE organization_id = '682405ba-4c6f-4415-b103-89fd64ff8ce4';

-- Create a test budget
INSERT INTO budgets (organization_id, name, description, fiscal_year, status, created_by)
SELECT 
    '682405ba-4c6f-4415-b103-89fd64ff8ce4',
    '2024 Business Budget',
    'Main business budget for 2024 fiscal year',
    2024,
    'draft',
    (SELECT id FROM auth.users LIMIT 1);

-- Get the budget ID we just created
WITH new_budget AS (
    SELECT id FROM budgets 
    WHERE organization_id = '682405ba-4c6f-4415-b103-89fd64ff8ce4' 
    AND name = '2024 Business Budget'
    LIMIT 1
),
sections AS (
    SELECT id, name FROM budget_sections WHERE name IN ('Revenue', 'Cost of Goods Sold', 'Expenses')
)
-- Create all categories at once
INSERT INTO budget_categories (budget_id, section_id, name, display_order, is_active)
SELECT 
    nb.id,
    s.id,
    CASE 
        WHEN s.name = 'Revenue' THEN 'Sales'
        WHEN s.name = 'Revenue' THEN 'Consulting'
        WHEN s.name = 'Cost of Goods Sold' THEN 'Hosting & Infrastructure'
        WHEN s.name = 'Expenses' THEN 'Marketing'
        WHEN s.name = 'Expenses' THEN 'Administrative'
    END,
    CASE 
        WHEN s.name = 'Revenue' AND 'Sales' = 'Sales' THEN 1
        WHEN s.name = 'Revenue' AND 'Consulting' = 'Consulting' THEN 2
        WHEN s.name = 'Cost of Goods Sold' THEN 1
        WHEN s.name = 'Expenses' AND 'Marketing' = 'Marketing' THEN 1
        WHEN s.name = 'Expenses' AND 'Administrative' = 'Administrative' THEN 2
    END,
    true
FROM new_budget nb
CROSS JOIN sections s
WHERE (s.name = 'Revenue' AND 'Sales' = 'Sales')
   OR (s.name = 'Revenue' AND 'Consulting' = 'Consulting')
   OR (s.name = 'Cost of Goods Sold')
   OR (s.name = 'Expenses' AND 'Marketing' = 'Marketing')
   OR (s.name = 'Expenses' AND 'Administrative' = 'Administrative');

-- Create all subcategories at once
INSERT INTO budget_subcategories (budget_id, category_id, name, display_order, is_active)
SELECT 
    bc.budget_id,
    bc.id,
    CASE 
        WHEN bc.name = 'Sales' THEN 'SAAS Sales'
        WHEN bc.name = 'Consulting' THEN 'Project Consulting'
        WHEN bc.name = 'Hosting & Infrastructure' THEN 'Cloud Hosting'
        WHEN bc.name = 'Marketing' THEN 'Digital Marketing'
        WHEN bc.name = 'Administrative' THEN 'Office Supplies'
    END,
    1,
    true
FROM budget_categories bc
JOIN budgets b ON bc.budget_id = b.id
WHERE b.organization_id = '682405ba-4c6f-4415-b103-89fd64ff8ce4'
AND bc.name IN ('Sales', 'Consulting', 'Hosting & Infrastructure', 'Marketing', 'Administrative');

-- Create all budget items at once
INSERT INTO budget_items (
    budget_id, 
    organization_id, 
    section_id, 
    category_id, 
    subcategory_id, 
    amount,
    jan_amount, feb_amount, mar_amount, apr_amount, may_amount, jun_amount,
    jul_amount, aug_amount, sep_amount, oct_amount, nov_amount, dec_amount,
    notes,
    created_by
)
SELECT 
    bsc.budget_id,
    '682405ba-4c6f-4415-b103-89fd64ff8ce4',
    bc.section_id,
    bc.id,
    bsc.id,
    CASE 
        WHEN bsc.name = 'SAAS Sales' THEN 120000
        WHEN bsc.name = 'Project Consulting' THEN 60000
        WHEN bsc.name = 'Cloud Hosting' THEN 24000
        WHEN bsc.name = 'Digital Marketing' THEN 36000
        WHEN bsc.name = 'Office Supplies' THEN 12000
    END,
    CASE 
        WHEN bsc.name = 'SAAS Sales' THEN 10000
        WHEN bsc.name = 'Project Consulting' THEN 5000
        WHEN bsc.name = 'Cloud Hosting' THEN 2000
        WHEN bsc.name = 'Digital Marketing' THEN 3000
        WHEN bsc.name = 'Office Supplies' THEN 1000
    END,
    CASE 
        WHEN bsc.name = 'SAAS Sales' THEN 10000
        WHEN bsc.name = 'Project Consulting' THEN 5000
        WHEN bsc.name = 'Cloud Hosting' THEN 2000
        WHEN bsc.name = 'Digital Marketing' THEN 3000
        WHEN bsc.name = 'Office Supplies' THEN 1000
    END,
    CASE 
        WHEN bsc.name = 'SAAS Sales' THEN 10000
        WHEN bsc.name = 'Project Consulting' THEN 5000
        WHEN bsc.name = 'Cloud Hosting' THEN 2000
        WHEN bsc.name = 'Digital Marketing' THEN 3000
        WHEN bsc.name = 'Office Supplies' THEN 1000
    END,
    CASE 
        WHEN bsc.name = 'SAAS Sales' THEN 10000
        WHEN bsc.name = 'Project Consulting' THEN 5000
        WHEN bsc.name = 'Cloud Hosting' THEN 2000
        WHEN bsc.name = 'Digital Marketing' THEN 3000
        WHEN bsc.name = 'Office Supplies' THEN 1000
    END,
    CASE 
        WHEN bsc.name = 'SAAS Sales' THEN 10000
        WHEN bsc.name = 'Project Consulting' THEN 5000
        WHEN bsc.name = 'Cloud Hosting' THEN 2000
        WHEN bsc.name = 'Digital Marketing' THEN 3000
        WHEN bsc.name = 'Office Supplies' THEN 1000
    END,
    CASE 
        WHEN bsc.name = 'SAAS Sales' THEN 10000
        WHEN bsc.name = 'Project Consulting' THEN 5000
        WHEN bsc.name = 'Cloud Hosting' THEN 2000
        WHEN bsc.name = 'Digital Marketing' THEN 3000
        WHEN bsc.name = 'Office Supplies' THEN 1000
    END,
    CASE 
        WHEN bsc.name = 'SAAS Sales' THEN 10000
        WHEN bsc.name = 'Project Consulting' THEN 5000
        WHEN bsc.name = 'Cloud Hosting' THEN 2000
        WHEN bsc.name = 'Digital Marketing' THEN 3000
        WHEN bsc.name = 'Office Supplies' THEN 1000
    END,
    CASE 
        WHEN bsc.name = 'SAAS Sales' THEN 10000
        WHEN bsc.name = 'Project Consulting' THEN 5000
        WHEN bsc.name = 'Cloud Hosting' THEN 2000
        WHEN bsc.name = 'Digital Marketing' THEN 3000
        WHEN bsc.name = 'Office Supplies' THEN 1000
    END,
    CASE 
        WHEN bsc.name = 'SAAS Sales' THEN 10000
        WHEN bsc.name = 'Project Consulting' THEN 5000
        WHEN bsc.name = 'Cloud Hosting' THEN 2000
        WHEN bsc.name = 'Digital Marketing' THEN 3000
        WHEN bsc.name = 'Office Supplies' THEN 1000
    END,
    CASE 
        WHEN bsc.name = 'SAAS Sales' THEN 10000
        WHEN bsc.name = 'Project Consulting' THEN 5000
        WHEN bsc.name = 'Cloud Hosting' THEN 2000
        WHEN bsc.name = 'Digital Marketing' THEN 3000
        WHEN bsc.name = 'Office Supplies' THEN 1000
    END,
    CASE 
        WHEN bsc.name = 'SAAS Sales' THEN 10000
        WHEN bsc.name = 'Project Consulting' THEN 5000
        WHEN bsc.name = 'Cloud Hosting' THEN 2000
        WHEN bsc.name = 'Digital Marketing' THEN 3000
        WHEN bsc.name = 'Office Supplies' THEN 1000
    END,
    CASE 
        WHEN bsc.name = 'SAAS Sales' THEN 10000
        WHEN bsc.name = 'Project Consulting' THEN 5000
        WHEN bsc.name = 'Cloud Hosting' THEN 2000
        WHEN bsc.name = 'Digital Marketing' THEN 3000
        WHEN bsc.name = 'Office Supplies' THEN 1000
    END,
    CASE 
        WHEN bsc.name = 'SAAS Sales' THEN 10000
        WHEN bsc.name = 'Project Consulting' THEN 5000
        WHEN bsc.name = 'Cloud Hosting' THEN 2000
        WHEN bsc.name = 'Digital Marketing' THEN 3000
        WHEN bsc.name = 'Office Supplies' THEN 1000
    END,
    CASE 
        WHEN bsc.name = 'SAAS Sales' THEN 'Monthly SAAS subscription revenue'
        WHEN bsc.name = 'Project Consulting' THEN 'Consulting project revenue'
        WHEN bsc.name = 'Cloud Hosting' THEN 'Monthly cloud hosting costs'
        WHEN bsc.name = 'Digital Marketing' THEN 'Monthly digital marketing spend'
        WHEN bsc.name = 'Office Supplies' THEN 'Monthly office supplies and admin costs'
    END,
    (SELECT id FROM auth.users LIMIT 1)
FROM budget_subcategories bsc
JOIN budget_categories bc ON bsc.category_id = bc.id
JOIN budgets b ON bc.budget_id = b.id
WHERE b.organization_id = '682405ba-4c6f-4415-b103-89fd64ff8ce4';

-- Verify the data was created
SELECT 
    bs.name as section_name,
    bc.name as category_name,
    bsc.name as subcategory_name,
    bi.amount as total_amount
FROM budget_sections bs
JOIN budget_categories bc ON bs.id = bc.section_id
JOIN budget_subcategories bsc ON bc.id = bsc.category_id
JOIN budget_items bi ON bsc.id = bi.subcategory_id
ORDER BY bs.display_order, bc.display_order, bsc.display_order; 