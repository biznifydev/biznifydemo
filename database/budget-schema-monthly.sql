-- Budget System Schema with Monthly Data Support
-- This replaces the old financial_accounts and financial_data tables

-- Budgets table
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'locked'
  fiscal_year INTEGER NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget sections (Revenue, Cost of Goods Sold, Expenses, Gross Profit, Net Profit)
-- These are global and shared across all budgets
CREATE TABLE budget_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, -- 'Revenue', 'Cost of Goods Sold', 'Expenses', 'Gross Profit', 'Net Profit'
  display_order INTEGER NOT NULL,
  is_calculated BOOLEAN DEFAULT FALSE, -- true for Gross Profit and Net Profit
  calculation_type TEXT, -- 'gross_profit', 'net_profit' for calculated sections
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name)
);

-- Budget categories (e.g., Sales, Marketing, etc.)
-- These are specific to each budget
CREATE TABLE budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
  section_id UUID REFERENCES budget_sections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(budget_id, section_id, name)
);

-- Budget subcategories (e.g., SAAS Sales, Consulting Sales, etc.)
-- These are specific to each budget
CREATE TABLE budget_subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
  category_id UUID REFERENCES budget_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(budget_id, category_id, name)
);

-- Budget items with monthly data
CREATE TABLE budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  section_id UUID REFERENCES budget_sections(id) ON DELETE CASCADE,
  category_id UUID REFERENCES budget_categories(id) ON DELETE CASCADE,
  subcategory_id UUID REFERENCES budget_subcategories(id) ON DELETE CASCADE,
  -- Monthly amounts
  jan_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  feb_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  mar_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  apr_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  may_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  jun_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  jul_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  aug_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  sep_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  oct_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  nov_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  dec_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  -- Legacy single amount field (for backward compatibility)
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(budget_id, subcategory_id)
);

-- Enable RLS on all budget tables
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;

-- Budgets policies
CREATE POLICY "Users can view budgets in their organizations" ON budgets
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Organization admins can manage budgets" ON budgets
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- Budget sections policies (global, but still need RLS for organization access)
CREATE POLICY "Users can view budget sections" ON budget_sections
  FOR SELECT USING (true);

CREATE POLICY "Organization admins can manage budget sections" ON budget_sections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM organization_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
    )
  );

-- Budget categories policies (budget-specific)
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

-- Budget subcategories policies (budget-specific)
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

-- Budget items policies
CREATE POLICY "Users can view budget items in their organizations" ON budget_items
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can update budget items in their organizations" ON budget_items
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can insert budget items in their organizations" ON budget_items
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_sections_updated_at BEFORE UPDATE ON budget_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_categories_updated_at BEFORE UPDATE ON budget_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_subcategories_updated_at BEFORE UPDATE ON budget_subcategories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON budget_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default budget sections (global)
INSERT INTO budget_sections (name, display_order, is_calculated, calculation_type) VALUES
  ('Revenue', 1, FALSE, NULL),
  ('Cost of Goods Sold', 2, FALSE, NULL),
  ('Expenses', 3, FALSE, NULL),
  ('Gross Profit', 4, TRUE, 'gross_profit'),
  ('Net Profit', 5, TRUE, 'net_profit'); 