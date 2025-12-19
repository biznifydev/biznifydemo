-- Enhanced Financial Accounts Structure
-- Drop existing tables if they exist
DROP TABLE IF EXISTS financial_data CASCADE;
DROP TABLE IF EXISTS financial_accounts CASCADE;

-- Financial Accounts (Chart of Accounts)
CREATE TABLE financial_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT, -- Account code like "1000", "2000", etc.
  type TEXT NOT NULL CHECK (type IN ('revenue', 'expense', 'asset', 'liability', 'equity')),
  category TEXT NOT NULL, -- 'income_statement', 'balance_sheet', 'cash_flow'
  parent_id UUID REFERENCES financial_accounts(id),
  level INTEGER NOT NULL DEFAULT 0, -- 0=section, 1=category, 2=subcategory, 3=detail
  sort_order INTEGER DEFAULT 0, -- For ordering accounts
  is_active BOOLEAN DEFAULT true,
  is_manual BOOLEAN DEFAULT true, -- Can be manually edited
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique account codes within organization
  UNIQUE(organization_id, code)
);

-- Financial Data (Monthly values)
CREATE TABLE financial_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  account_id UUID REFERENCES financial_accounts(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  is_manual BOOLEAN DEFAULT true,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one value per account per month
  UNIQUE(organization_id, account_id, year, month)
);

-- Financial Periods (for managing fiscal years)
CREATE TABLE financial_periods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- "2025", "Q1 2025", etc.
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX idx_financial_accounts_org ON financial_accounts(organization_id);
CREATE INDEX idx_financial_accounts_parent ON financial_accounts(parent_id);
CREATE INDEX idx_financial_accounts_type ON financial_accounts(type);
CREATE INDEX idx_financial_accounts_level ON financial_accounts(level);
CREATE INDEX idx_financial_accounts_sort ON financial_accounts(sort_order);

CREATE INDEX idx_financial_data_org ON financial_data(organization_id);
CREATE INDEX idx_financial_data_account ON financial_data(account_id);
CREATE INDEX idx_financial_data_period ON financial_data(year, month);
CREATE INDEX idx_financial_data_org_period ON financial_data(organization_id, year, month);

-- RLS Policies
ALTER TABLE financial_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_periods ENABLE ROW LEVEL SECURITY;

-- Financial accounts policies
CREATE POLICY "Users can view accounts in their organizations" ON financial_accounts
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can manage accounts in their organizations" ON financial_accounts
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Financial data policies
CREATE POLICY "Users can view data in their organizations" ON financial_data
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can manage data in their organizations" ON financial_data
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Financial periods policies
CREATE POLICY "Users can view periods in their organizations" ON financial_periods
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can manage periods in their organizations" ON financial_periods
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Functions for calculations
CREATE OR REPLACE FUNCTION get_account_balance(
  p_organization_id UUID,
  p_account_id UUID,
  p_year INTEGER,
  p_month INTEGER
) RETURNS DECIMAL AS $$
DECLARE
  v_amount DECIMAL(15,2) := 0;
  v_parent_amount DECIMAL(15,2) := 0;
BEGIN
  -- Get direct amount for this account
  SELECT COALESCE(amount, 0) INTO v_amount
  FROM financial_data
  WHERE organization_id = p_organization_id 
    AND account_id = p_account_id 
    AND year = p_year 
    AND month = p_month;
  
  -- If this is a parent account, sum all children
  IF EXISTS (SELECT 1 FROM financial_accounts WHERE parent_id = p_account_id) THEN
    SELECT COALESCE(SUM(get_account_balance(p_organization_id, id, p_year, p_month)), 0)
    INTO v_parent_amount
    FROM financial_accounts
    WHERE parent_id = p_account_id AND is_active = true;
    
    RETURN v_amount + v_parent_amount;
  END IF;
  
  RETURN v_amount;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_financial_accounts_updated_at 
  BEFORE UPDATE ON financial_accounts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_data_updated_at 
  BEFORE UPDATE ON financial_data 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_periods_updated_at 
  BEFORE UPDATE ON financial_periods 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 