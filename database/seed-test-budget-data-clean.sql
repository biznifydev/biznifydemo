-- Clean seed test budget data for organization: 682405ba-4c6f-4415-b103-89fd64ff8ce4
-- This script first cleans up any existing test data, then creates fresh sample data

-- First, clean up any existing test data for this organization
DELETE FROM budget_items WHERE organization_id = '682405ba-4c6f-4415-b103-89fd64ff8ce4';
DELETE FROM budget_subcategories WHERE budget_id IN (SELECT id FROM budgets WHERE organization_id = '682405ba-4c6f-4415-b103-89fd64ff8ce4');
DELETE FROM budget_categories WHERE budget_id IN (SELECT id FROM budgets WHERE organization_id = '682405ba-4c6f-4415-b103-89fd64ff8ce4');
DELETE FROM budgets WHERE organization_id = '682405ba-4c6f-4415-b103-89fd64ff8ce4';

-- Now create fresh test data
DO $$
DECLARE
    revenue_section_id UUID;
    cogs_section_id UUID;
    expenses_section_id UUID;
    test_budget_id UUID;
    sales_category_id UUID;
    consulting_category_id UUID;
    hosting_category_id UUID;
    marketing_category_id UUID;
    admin_category_id UUID;
    user_id UUID;
BEGIN
    -- Get section IDs
    SELECT id INTO revenue_section_id FROM budget_sections WHERE name = 'Revenue';
    SELECT id INTO cogs_section_id FROM budget_sections WHERE name = 'Cost of Goods Sold';
    SELECT id INTO expenses_section_id FROM budget_sections WHERE name = 'Expenses';

    -- Get the first user ID
    SELECT id INTO user_id FROM auth.users LIMIT 1;

    -- Create a test budget
    INSERT INTO budgets (organization_id, name, description, fiscal_year, status, created_by)
    VALUES (
        '682405ba-4c6f-4415-b103-89fd64ff8ce4',
        '2024 Business Budget',
        'Main business budget for 2024 fiscal year',
        2024,
        'draft',
        user_id
    ) RETURNING id INTO test_budget_id;

    -- Create Revenue categories
    INSERT INTO budget_categories (budget_id, section_id, name, display_order, is_active)
    VALUES 
        (test_budget_id, revenue_section_id, 'Sales', 1, true),
        (test_budget_id, revenue_section_id, 'Consulting', 2, true)
    RETURNING id INTO sales_category_id;

    -- Get the consulting category ID
    SELECT id INTO consulting_category_id 
    FROM budget_categories 
    WHERE budget_id = test_budget_id AND name = 'Consulting' AND section_id = revenue_section_id;

    -- Create Revenue subcategories
    INSERT INTO budget_subcategories (budget_id, category_id, name, display_order, is_active)
    VALUES 
        (test_budget_id, sales_category_id, 'SAAS Sales', 1, true),
        (test_budget_id, consulting_category_id, 'Project Consulting', 1, true);

    -- Create COGS categories
    INSERT INTO budget_categories (budget_id, section_id, name, display_order, is_active)
    VALUES 
        (test_budget_id, cogs_section_id, 'Hosting & Infrastructure', 1, true)
    RETURNING id INTO hosting_category_id;

    -- Create COGS subcategories
    INSERT INTO budget_subcategories (budget_id, category_id, name, display_order, is_active)
    VALUES 
        (test_budget_id, hosting_category_id, 'Cloud Hosting', 1, true);

    -- Create Expenses categories
    INSERT INTO budget_categories (budget_id, section_id, name, display_order, is_active)
    VALUES 
        (test_budget_id, expenses_section_id, 'Marketing', 1, true),
        (test_budget_id, expenses_section_id, 'Administrative', 2, true)
    RETURNING id INTO marketing_category_id;

    -- Get the admin category ID
    SELECT id INTO admin_category_id 
    FROM budget_categories 
    WHERE budget_id = test_budget_id AND name = 'Administrative' AND section_id = expenses_section_id;

    -- Create Expenses subcategories
    INSERT INTO budget_subcategories (budget_id, category_id, name, display_order, is_active)
    VALUES 
        (test_budget_id, marketing_category_id, 'Digital Marketing', 1, true),
        (test_budget_id, admin_category_id, 'Office Supplies', 1, true);

    -- Create budget items with monthly breakdowns
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
        test_budget_id,
        '682405ba-4c6f-4415-b103-89fd64ff8ce4',
        revenue_section_id,
        sales_category_id,
        bsc.id,
        120000,
        10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000,
        'Monthly SAAS subscription revenue',
        user_id
    FROM budget_subcategories bsc 
    WHERE bsc.budget_id = test_budget_id AND bsc.name = 'SAAS Sales'
    
    UNION ALL
    
    SELECT 
        test_budget_id,
        '682405ba-4c6f-4415-b103-89fd64ff8ce4',
        revenue_section_id,
        consulting_category_id,
        bsc.id,
        60000,
        5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000, 5000,
        'Consulting project revenue',
        user_id
    FROM budget_subcategories bsc 
    WHERE bsc.budget_id = test_budget_id AND bsc.name = 'Project Consulting'
    
    UNION ALL
    
    SELECT 
        test_budget_id,
        '682405ba-4c6f-4415-b103-89fd64ff8ce4',
        cogs_section_id,
        hosting_category_id,
        bsc.id,
        24000,
        2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000,
        'Monthly cloud hosting costs',
        user_id
    FROM budget_subcategories bsc 
    WHERE bsc.budget_id = test_budget_id AND bsc.name = 'Cloud Hosting'
    
    UNION ALL
    
    SELECT 
        test_budget_id,
        '682405ba-4c6f-4415-b103-89fd64ff8ce4',
        expenses_section_id,
        marketing_category_id,
        bsc.id,
        36000,
        3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000, 3000,
        'Monthly digital marketing spend',
        user_id
    FROM budget_subcategories bsc 
    WHERE bsc.budget_id = test_budget_id AND bsc.name = 'Digital Marketing'
    
    UNION ALL
    
    SELECT 
        test_budget_id,
        '682405ba-4c6f-4415-b103-89fd64ff8ce4',
        expenses_section_id,
        admin_category_id,
        bsc.id,
        12000,
        1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000,
        'Monthly office supplies and admin costs',
        user_id
    FROM budget_subcategories bsc 
    WHERE bsc.budget_id = test_budget_id AND bsc.name = 'Office Supplies';

    RAISE NOTICE 'Test budget created with ID: %', test_budget_id;
END $$;

-- Verify the data was created
SELECT 
    bs.name as section_name,
    bc.name as category_name,
    bsc.name as subcategory_name,
    bi.amount as total_amount,
    bi.jan_amount,
    bi.feb_amount,
    bi.mar_amount
FROM budget_sections bs
JOIN budget_categories bc ON bs.id = bc.section_id
JOIN budget_subcategories bsc ON bc.id = bsc.category_id
JOIN budget_items bi ON bsc.id = bi.subcategory_id
ORDER BY bs.display_order, bc.display_order, bsc.display_order; 