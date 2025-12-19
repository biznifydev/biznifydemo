const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createTables() {
  try {
    console.log('Creating financial tables...')
    
    // Create financial_accounts table
    const createAccountsTable = `
      CREATE TABLE IF NOT EXISTS financial_accounts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        code TEXT,
        type TEXT NOT NULL CHECK (type IN ('revenue', 'expense', 'asset', 'liability', 'equity')),
        category TEXT NOT NULL,
        parent_id UUID REFERENCES financial_accounts(id),
        level INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        is_manual BOOLEAN DEFAULT true,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(organization_id, code)
      );
    `
    
    // Create financial_data table
    const createDataTable = `
      CREATE TABLE IF NOT EXISTS financial_data (
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
        UNIQUE(organization_id, account_id, year, month)
      );
    `
    
    // Try to execute the SQL using a different approach
    console.log('Attempting to create tables...')
    
    // Let's try to create the tables by inserting a dummy record and catching the error
    try {
      const { data, error } = await supabase
        .from('financial_accounts')
        .select('id')
        .limit(1)
      
      if (error && error.code === '42P01') {
        console.log('financial_accounts table does not exist, creating it...')
        // Table doesn't exist, we need to create it
        console.log('Please run the following SQL in your Supabase dashboard:')
        console.log(createAccountsTable)
        console.log(createDataTable)
        return
      }
      
      console.log('Tables already exist!')
      
    } catch (error) {
      console.log('Error checking tables:', error.message)
      console.log('Please run the following SQL in your Supabase dashboard:')
      console.log(createAccountsTable)
      console.log(createDataTable)
      return
    }
    
    // If we get here, tables exist, so let's create some data
    console.log('Creating sample budget data...')
    
    const { data: organizations } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)
    
    if (!organizations.length) {
      console.error('No organizations found')
      return
    }
    
    const organizationId = organizations[0].id
    
    // Create basic categories
    const { data: categories, error: categoriesError } = await supabase
      .from('financial_accounts')
      .insert([
        { organization_id: organizationId, name: 'Sales Revenue', type: 'revenue', category: 'income_statement', level: 0, sort_order: 1, is_active: true, is_manual: true },
        { organization_id: organizationId, name: 'Service Revenue', type: 'revenue', category: 'income_statement', level: 0, sort_order: 2, is_active: true, is_manual: true },
        { organization_id: organizationId, name: 'Cost of Goods Sold', type: 'expense', category: 'income_statement', level: 0, sort_order: 3, is_active: true, is_manual: true },
        { organization_id: organizationId, name: 'Marketing & Advertising', type: 'expense', category: 'income_statement', level: 0, sort_order: 4, is_active: true, is_manual: true },
        { organization_id: organizationId, name: 'Salaries & Wages', type: 'expense', category: 'income_statement', level: 0, sort_order: 5, is_active: true, is_manual: true },
        { organization_id: organizationId, name: 'Rent & Utilities', type: 'expense', category: 'income_statement', level: 0, sort_order: 6, is_active: true, is_manual: true }
      ])
      .select()
    
    if (categoriesError) {
      console.error('Error creating categories:', categoriesError)
      return
    }
    
    console.log(`✅ Created ${categories.length} categories`)
    
    // Add some sample data
    const financialData = []
    categories.forEach(category => {
      for (let month = 1; month <= 12; month++) {
        let amount = 0
        
        if (category.type === 'revenue') {
          amount = category.name.includes('Sales') ? 50000 + (month * 5000) : 30000 + (month * 3000)
        } else {
          if (category.name.includes('Marketing')) amount = 8000 + (month * 800)
          else if (category.name.includes('Salaries')) amount = 25000 + (month * 2500)
          else if (category.name.includes('Rent')) amount = 5000
          else if (category.name.includes('Cost of Goods')) amount = 20000 + (month * 2000)
        }
        
        financialData.push({
          organization_id: organizationId,
          account_id: category.id,
          year: 2025,
          month,
          amount,
          is_manual: true
        })
      }
    })
    
    const { error: dataError } = await supabase
      .from('financial_data')
      .insert(financialData)
    
    if (dataError) {
      console.error('Error inserting financial data:', dataError)
      return
    }
    
    console.log(`✅ Created ${financialData.length} financial data records`)
    console.log('🎉 Budget setup complete!')
    
  } catch (error) {
    console.error('Setup failed:', error)
  }
}

createTables() 