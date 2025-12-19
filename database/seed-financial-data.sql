-- Seed Financial Data for P&L
-- Replace 'your-organization-id' with your actual organization ID

-- Insert sample financial accounts for P&L
INSERT INTO financial_accounts (organization_id, name, code, type, category, level, sort_order, is_manual) VALUES
-- Revenue Section
('your-organization-id', 'Revenue', '4000', 'revenue', 'income_statement', 0, 1, true),
('your-organization-id', 'Product Sales', '4100', 'revenue', 'income_statement', 1, 2, true),
('your-organization-id', 'Service Revenue', '4200', 'revenue', 'income_statement', 1, 3, true),
('your-organization-id', 'Other Revenue', '4300', 'revenue', 'income_statement', 1, 4, true),

-- Cost of Goods Sold Section
('your-organization-id', 'Cost of Goods Sold', '5000', 'expense', 'income_statement', 0, 5, true),
('your-organization-id', 'Direct Materials', '5100', 'expense', 'income_statement', 1, 6, true),
('your-organization-id', 'Direct Labor', '5200', 'expense', 'income_statement', 1, 7, true),
('your-organization-id', 'Manufacturing Overhead', '5300', 'expense', 'income_statement', 1, 8, true),

-- Operating Expenses Section
('your-organization-id', 'Operating Expenses', '6000', 'expense', 'income_statement', 0, 9, true),
('your-organization-id', 'Sales & Marketing', '6100', 'expense', 'income_statement', 1, 10, true),
('your-organization-id', 'Research & Development', '6200', 'expense', 'income_statement', 1, 11, true),
('your-organization-id', 'General & Administrative', '6300', 'expense', 'income_statement', 1, 12, true),

-- Subcategories for Sales & Marketing
('your-organization-id', 'Advertising', '6110', 'expense', 'income_statement', 2, 13, true),
('your-organization-id', 'Sales Commissions', '6120', 'expense', 'income_statement', 2, 14, true),
('your-organization-id', 'Marketing Tools', '6130', 'expense', 'income_statement', 2, 15, true),

-- Subcategories for R&D
('your-organization-id', 'Software Development', '6210', 'expense', 'income_statement', 2, 16, true),
('your-organization-id', 'Product Design', '6220', 'expense', 'income_statement', 2, 17, true),
('your-organization-id', 'Research Costs', '6230', 'expense', 'income_statement', 2, 18, true),

-- Subcategories for G&A
('your-organization-id', 'Office Rent', '6310', 'expense', 'income_statement', 2, 19, true),
('your-organization-id', 'Utilities', '6320', 'expense', 'income_statement', 2, 20, true),
('your-organization-id', 'Insurance', '6330', 'expense', 'income_statement', 2, 21, true),
('your-organization-id', 'Legal & Professional', '6340', 'expense', 'income_statement', 2, 22, true);

-- Update parent relationships
UPDATE financial_accounts SET parent_id = (SELECT id FROM financial_accounts WHERE code = '4000' AND organization_id = 'your-organization-id') WHERE code IN ('4100', '4200', '4300') AND organization_id = 'your-organization-id';
UPDATE financial_accounts SET parent_id = (SELECT id FROM financial_accounts WHERE code = '5000' AND organization_id = 'your-organization-id') WHERE code IN ('5100', '5200', '5300') AND organization_id = 'your-organization-id';
UPDATE financial_accounts SET parent_id = (SELECT id FROM financial_accounts WHERE code = '6000' AND organization_id = 'your-organization-id') WHERE code IN ('6100', '6200', '6300') AND organization_id = 'your-organization-id';
UPDATE financial_accounts SET parent_id = (SELECT id FROM financial_accounts WHERE code = '6100' AND organization_id = 'your-organization-id') WHERE code IN ('6110', '6120', '6130') AND organization_id = 'your-organization-id';
UPDATE financial_accounts SET parent_id = (SELECT id FROM financial_accounts WHERE code = '6200' AND organization_id = 'your-organization-id') WHERE code IN ('6210', '6220', '6230') AND organization_id = 'your-organization-id';
UPDATE financial_accounts SET parent_id = (SELECT id FROM financial_accounts WHERE code = '6300' AND organization_id = 'your-organization-id') WHERE code IN ('6310', '6320', '6330', '6340') AND organization_id = 'your-organization-id';

-- Insert sample financial data for 2025 (replace with your organization ID)
INSERT INTO financial_data (organization_id, account_id, year, month, amount, is_manual) 
SELECT 
  'your-organization-id',
  fa.id,
  2025,
  m.month,
  CASE 
    WHEN fa.code = '4100' THEN 50000 + (m.month * 5000) -- Product Sales growing
    WHEN fa.code = '4200' THEN 30000 + (m.month * 3000) -- Service Revenue growing
    WHEN fa.code = '4300' THEN 5000 + (m.month * 500)   -- Other Revenue growing
    WHEN fa.code = '5100' THEN 20000 + (m.month * 2000) -- Direct Materials
    WHEN fa.code = '5200' THEN 15000 + (m.month * 1500) -- Direct Labor
    WHEN fa.code = '5300' THEN 10000 + (m.month * 1000) -- Manufacturing Overhead
    WHEN fa.code = '6110' THEN 8000 + (m.month * 800)   -- Advertising
    WHEN fa.code = '6120' THEN 12000 + (m.month * 1200) -- Sales Commissions
    WHEN fa.code = '6130' THEN 3000 + (m.month * 300)   -- Marketing Tools
    WHEN fa.code = '6210' THEN 25000 + (m.month * 2500) -- Software Development
    WHEN fa.code = '6220' THEN 10000 + (m.month * 1000) -- Product Design
    WHEN fa.code = '6230' THEN 5000 + (m.month * 500)   -- Research Costs
    WHEN fa.code = '6310' THEN 5000                     -- Office Rent (fixed)
    WHEN fa.code = '6320' THEN 1000 + (m.month * 100)   -- Utilities
    WHEN fa.code = '6330' THEN 2000                     -- Insurance (fixed)
    WHEN fa.code = '6340' THEN 3000 + (m.month * 300)   -- Legal & Professional
    ELSE 0
  END,
  true
FROM financial_accounts fa
CROSS JOIN (SELECT generate_series(1, 12) as month) m
WHERE fa.organization_id = 'your-organization-id' 
  AND fa.level >= 1 -- Only insert data for categories and subcategories, not sections
  AND fa.is_active = true; 