const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupBudgetSystem() {
  console.log('Setting up new budget system...');

  try {
    // Drop old financial tables
    console.log('Dropping old financial tables...');
    const dropTables = `
      DROP TABLE IF EXISTS financial_data CASCADE;
      DROP TABLE IF EXISTS financial_accounts CASCADE;
      DROP TABLE IF EXISTS budget_categories CASCADE;
      DROP TABLE IF EXISTS budget_items CASCADE;
      DROP TABLE IF EXISTS budgets CASCADE;
      DROP TABLE IF EXISTS financial_periods CASCADE;
    `;
    
    const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropTables });
    if (dropError) {
      console.log('Drop error:', dropError);
    }

    // Create new budget tables
    console.log('Creating new budget tables...');
    const createTables = `
      -- Budgets table
      CREATE TABLE budgets (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'draft',
        fiscal_year INTEGER NOT NULL,
        created_by UUID REFERENCES auth.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Budget sections
      CREATE TABLE budget_sections (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        display_order INTEGER NOT NULL,
        is_calculated BOOLEAN DEFAULT FALSE,
        calculation_type TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(organization_id, name)
      );

      -- Budget categories
      CREATE TABLE budget_categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        section_id UUID REFERENCES budget_sections(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        display_order INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(organization_id, section_id, name)
      );

      -- Budget subcategories
      CREATE TABLE budget_subcategories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        category_id UUID REFERENCES budget_categories(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        display_order INTEGER NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(organization_id, category_id, name)
      );

      -- Budget items
      CREATE TABLE budget_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        section_id UUID REFERENCES budget_sections(id) ON DELETE CASCADE,
        category_id UUID REFERENCES budget_categories(id) ON DELETE CASCADE,
        subcategory_id UUID REFERENCES budget_subcategories(id) ON DELETE CASCADE,
        amount DECIMAL(15,2) NOT NULL DEFAULT 0,
        notes TEXT,
        created_by UUID REFERENCES auth.users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(budget_id, subcategory_id)
      );
    `;

    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTables });
    if (createError) {
      console.log('Create error:', createError);
    }

    // Enable RLS
    console.log('Enabling RLS...');
    const rlsSetup = `
      ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
      ALTER TABLE budget_sections ENABLE ROW LEVEL SECURITY;
      ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
      ALTER TABLE budget_subcategories ENABLE ROW LEVEL SECURITY;
      ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
    `;
    
    const { error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsSetup });
    if (rlsError) {
      console.log('RLS error:', rlsError);
    }

    // Create RLS policies
    console.log('Creating RLS policies...');
    const policies = `
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

      -- Budget sections policies
      CREATE POLICY "Users can view budget sections in their organizations" ON budget_sections
        FOR SELECT USING (
          organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
          )
        );

      CREATE POLICY "Organization admins can manage budget sections" ON budget_sections
        FOR ALL USING (
          organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
          )
        );

      -- Budget categories policies
      CREATE POLICY "Users can view budget categories in their organizations" ON budget_categories
        FOR SELECT USING (
          organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
          )
        );

      CREATE POLICY "Organization admins can manage budget categories" ON budget_categories
        FOR ALL USING (
          organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
          )
        );

      -- Budget subcategories policies
      CREATE POLICY "Users can view budget subcategories in their organizations" ON budget_subcategories
        FOR SELECT USING (
          organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
          )
        );

      CREATE POLICY "Organization admins can manage budget subcategories" ON budget_subcategories
        FOR ALL USING (
          organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
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
    `;
    
    const { error: policiesError } = await supabase.rpc('exec_sql', { sql: policies });
    if (policiesError) {
      console.log('Policies error:', policiesError);
    }

    // Create triggers
    console.log('Creating triggers...');
    const triggers = `
      CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_budget_sections_updated_at BEFORE UPDATE ON budget_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_budget_categories_updated_at BEFORE UPDATE ON budget_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_budget_subcategories_updated_at BEFORE UPDATE ON budget_subcategories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON budget_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;
    
    const { error: triggersError } = await supabase.rpc('exec_sql', { sql: triggers });
    if (triggersError) {
      console.log('Triggers error:', triggersError);
    }

    // Insert default budget sections
    console.log('Inserting default budget sections...');
    const defaultSections = `
      INSERT INTO budget_sections (organization_id, name, display_order, is_calculated, calculation_type) VALUES
        (NULL, 'Revenue', 1, FALSE, NULL),
        (NULL, 'Cost of Goods Sold', 2, FALSE, NULL),
        (NULL, 'Expenses', 3, FALSE, NULL),
        (NULL, 'Gross Profit', 4, TRUE, 'gross_profit'),
        (NULL, 'Net Profit', 5, TRUE, 'net_profit');
    `;
    
    const { error: sectionsError } = await supabase.rpc('exec_sql', { sql: defaultSections });
    if (sectionsError) {
      console.log('Sections error:', sectionsError);
    }

    console.log('✅ Budget system setup complete!');
  } catch (error) {
    console.error('❌ Error setting up budget system:', error);
  }
}

setupBudgetSystem(); 