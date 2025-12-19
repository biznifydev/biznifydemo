const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createBudget() {
  try {
    // Get the organization ID
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(1)

    if (orgError || !organizations.length) {
      console.error('Error fetching organizations:', orgError)
      return
    }

    const organizationId = organizations[0].id
    console.log(`Using organization: ${organizations[0].name} (${organizationId})`)

    // Create a budget period for 2025
    const { data: period, error: periodError } = await supabase
      .from('financial_periods')
      .insert({
        organization_id: organizationId,
        name: '2025 Budget',
        start_date: '2025-01-01',
        end_date: '2025-12-31',
        is_active: true,
        is_closed: false
      })
      .select()
      .single()

    if (periodError) {
      console.error('Error creating period:', periodError)
      return
    }

    console.log('Created budget period:', period)

    // Create basic budget categories
    const { data: categories, error: categoriesError } = await supabase
      .from('financial_accounts')
      .insert([
        // Revenue categories
        { organization_id: organizationId, name: 'Sales Revenue', type: 'revenue', category: 'income_statement', level: 0, sort_order: 1, is_active: true, is_manual: true },
        { organization_id: organizationId, name: 'Service Revenue', type: 'revenue', category: 'income_statement', level: 0, sort_order: 2, is_active: true, is_manual: true },
        
        // COGS categories
        { organization_id: organizationId, name: 'Cost of Goods Sold', type: 'expense', category: 'income_statement', level: 0, sort_order: 3, is_active: true, is_manual: true },
        { organization_id: organizationId, name: 'Direct Labor', type: 'expense', category: 'income_statement', level: 0, sort_order: 4, is_active: true, is_manual: true },
        
        // Expense categories
        { organization_id: organizationId, name: 'Marketing & Advertising', type: 'expense', category: 'income_statement', level: 0, sort_order: 5, is_active: true, is_manual: true },
        { organization_id: organizationId, name: 'Salaries & Wages', type: 'expense', category: 'income_statement', level: 0, sort_order: 6, is_active: true, is_manual: true },
        { organization_id: organizationId, name: 'Rent & Utilities', type: 'expense', category: 'income_statement', level: 0, sort_order: 7, is_active: true, is_manual: true },
        { organization_id: organizationId, name: 'Office Supplies', type: 'expense', category: 'income_statement', level: 0, sort_order: 8, is_active: true, is_manual: true }
      ])
      .select()

    if (categoriesError) {
      console.error('Error creating categories:', categoriesError)
      return
    }

    console.log('Created categories:', categories.length)

    // Add some sample budget data
    const financialData = []
    categories.forEach(category => {
      for (let month = 1; month <= 12; month++) {
        let amount = 0
        
        // Generate sample data based on category type and name
        if (category.type === 'revenue') {
          amount = category.name.includes('Sales') ? 50000 + (month * 5000) : 30000 + (month * 3000)
        } else if (category.type === 'expense') {
          if (category.name.includes('Marketing')) {
            amount = 8000 + (month * 800)
          } else if (category.name.includes('Salaries')) {
            amount = 25000 + (month * 2500)
          } else if (category.name.includes('Rent')) {
            amount = 5000 // Fixed
          } else if (category.name.includes('Office')) {
            amount = 1000 + (month * 100)
          } else if (category.name.includes('Cost of Goods')) {
            amount = 20000 + (month * 2000)
          } else if (category.name.includes('Direct Labor')) {
            amount = 15000 + (month * 1500)
          }
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

    // Insert financial data
    const { error: dataError } = await supabase
      .from('financial_data')
      .insert(financialData)

    if (dataError) {
      console.error('Error inserting financial data:', dataError)
      return
    }

    console.log('✅ Budget setup complete!')
    console.log(`Budget period: ${period.name}`)
    console.log(`Categories created: ${categories.length}`)
    console.log(`Financial data records: ${financialData.length}`)

  } catch (error) {
    console.error('Setup failed:', error)
  }
}

createBudget() 