-- Fix orphaned categories and subcategories after section cleanup
-- This script reconnects existing categories to the new global sections

-- First, let's see what we have
SELECT 'Sections' as table_name, COUNT(*) as count FROM budget_sections
UNION ALL
SELECT 'Categories' as table_name, COUNT(*) as count FROM budget_categories
UNION ALL
SELECT 'Subcategories' as table_name, COUNT(*) as count FROM budget_subcategories;

-- Show orphaned categories (those without valid section_id)
SELECT 'Orphaned Categories' as issue, COUNT(*) as count 
FROM budget_categories bc
LEFT JOIN budget_sections bs ON bc.section_id = bs.id
WHERE bs.id IS NULL;

-- Show orphaned subcategories (those without valid category_id)
SELECT 'Orphaned Subcategories' as issue, COUNT(*) as count 
FROM budget_subcategories bsc
LEFT JOIN budget_categories bc ON bsc.category_id = bc.id
WHERE bc.id IS NULL;

-- Get the new section IDs
SELECT id, name FROM budget_sections ORDER BY display_order;

-- Update categories to use the correct section IDs
-- Revenue categories
UPDATE budget_categories 
SET section_id = (SELECT id FROM budget_sections WHERE name = 'Revenue')
WHERE section_id NOT IN (SELECT id FROM budget_sections)
AND name ILIKE '%sales%' OR name ILIKE '%revenue%' OR name ILIKE '%income%';

-- COGS categories  
UPDATE budget_categories 
SET section_id = (SELECT id FROM budget_sections WHERE name = 'Cost of Goods Sold')
WHERE section_id NOT IN (SELECT id FROM budget_sections)
AND (name ILIKE '%cost%' OR name ILIKE '%cogs%' OR name ILIKE '%goods%');

-- Expenses categories
UPDATE budget_categories 
SET section_id = (SELECT id FROM budget_sections WHERE name = 'Expenses')
WHERE section_id NOT IN (SELECT id FROM budget_sections)
AND (name ILIKE '%expense%' OR name ILIKE '%overhead%' OR name ILIKE '%admin%' OR name ILIKE '%marketing%');

-- For any remaining orphaned categories, default to Expenses
UPDATE budget_categories 
SET section_id = (SELECT id FROM budget_sections WHERE name = 'Expenses')
WHERE section_id NOT IN (SELECT id FROM budget_sections);

-- Delete any subcategories that are still orphaned (no valid category_id)
DELETE FROM budget_subcategories 
WHERE category_id NOT IN (SELECT id FROM budget_categories);

-- Verify the fix
SELECT 
  bs.name as section_name,
  COUNT(bc.id) as category_count,
  COUNT(bsc.id) as subcategory_count
FROM budget_sections bs
LEFT JOIN budget_categories bc ON bs.id = bc.section_id
LEFT JOIN budget_subcategories bsc ON bc.id = bsc.category_id
GROUP BY bs.id, bs.name
ORDER BY bs.display_order; 