const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function runSchema() {
  try {
    console.log('Running database schema...')
    
    // Read and run the financial schema
    const schemaPath = path.join(__dirname, '../database/financial-schema.sql')
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('Executing financial schema...')
    const { error: schemaError } = await supabase.rpc('exec_sql', { sql: schemaSQL })
    
    if (schemaError) {
      console.error('Error running schema:', schemaError)
      // Try running it as a query instead
      console.log('Trying alternative approach...')
      const { error: altError } = await supabase.from('_exec_sql').select('*').eq('sql', schemaSQL)
      if (altError) {
        console.error('Alternative approach also failed:', altError)
        return
      }
    }
    
    console.log('✅ Schema executed successfully!')
    
    // Now let's create some basic categories
    console.log('Creating basic budget categories...')
    
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

runSchema() 