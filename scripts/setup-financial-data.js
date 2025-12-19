const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupFinancialData() {
  try {
    // First, let's check what organizations exist
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(5)

    if (orgError) {
      console.error('Error fetching organizations:', orgError)
      return
    }

    console.log('Available organizations:', organizations)

    if (organizations.length === 0) {
      console.log('No organizations found. Please create an organization first.')
      return
    }

    // Use the first organization (or you can specify which one)
    const organizationId = organizations[0].id
    console.log(`Using organization: ${organizations[0].name} (${organizationId})`)

    // Clear existing financial data for this organization
    console.log('Clearing existing financial data...')
    await supabase
      .from('financial_data')
      .delete()
      .eq('organization_id', organizationId)

    await supabase
      .from('financial_accounts')
      .delete()
      .eq('organization_id', organizationId)

    // Insert the hierarchical structure
    console.log('Inserting financial accounts...')
    
    // Insert sections and categories first
    const { data: accounts, error: accountsError } = await supabase
      .from('financial_accounts')
      .insert([
        // Revenue Section
        { organization_id: organizationId, name: 'Revenue', code: '4000', type: 'revenue', category: 'income_statement', level: 0, sort_order: 1, is_manual: true },
        { organization_id: organizationId, name: 'Product Sales', code: '4100', type: 'revenue', category: 'income_statement', level: 1, sort_order: 2, is_manual: true },
        { organization_id: organizationId, name: 'Service Revenue', code: '4200', type: 'revenue', category: 'income_statement', level: 1, sort_order: 3, is_manual: true },
        { organization_id: organizationId, name: 'Other Revenue', code: '4300', type: 'revenue', category: 'income_statement', level: 1, sort_order: 4, is_manual: true },

        // Cost of Goods Sold Section
        { organization_id: organizationId, name: 'Cost of Goods Sold', code: '5000', type: 'expense', category: 'income_statement', level: 0, sort_order: 5, is_manual: true },
        { organization_id: organizationId, name: 'Direct Materials', code: '5100', type: 'expense', category: 'income_statement', level: 1, sort_order: 6, is_manual: true },
        { organization_id: organizationId, name: 'Direct Labor', code: '5200', type: 'expense', category: 'income_statement', level: 1, sort_order: 7, is_manual: true },
        { organization_id: organizationId, name: 'Manufacturing Overhead', code: '5300', type: 'expense', category: 'income_statement', level: 1, sort_order: 8, is_manual: true },

        // Operating Expenses Section
        { organization_id: organizationId, name: 'Operating Expenses', code: '6000', type: 'expense', category: 'income_statement', level: 0, sort_order: 9, is_manual: true },
        { organization_id: organizationId, name: 'Sales & Marketing', code: '6100', type: 'expense', category: 'income_statement', level: 1, sort_order: 10, is_manual: true },
        { organization_id: organizationId, name: 'Research & Development', code: '6200', type: 'expense', category: 'income_statement', level: 1, sort_order: 11, is_manual: true },
        { organization_id: organizationId, name: 'General & Administrative', code: '6300', type: 'expense', category: 'income_statement', level: 1, sort_order: 12, is_manual: true }
      ])
      .select()

    if (accountsError) {
      console.error('Error inserting accounts:', accountsError)
      return
    }

    console.log('Inserted accounts:', accounts.length)

    // Now set up parent relationships
    const revenueSection = accounts.find(a => a.code === '4000')
    const cogsSection = accounts.find(a => a.code === '5000')
    const expensesSection = accounts.find(a => a.code === '6000')

    // Update parent relationships for categories
    await supabase
      .from('financial_accounts')
      .update({ parent_id: revenueSection.id })
      .in('code', ['4100', '4200', '4300'])
      .eq('organization_id', organizationId)

    await supabase
      .from('financial_accounts')
      .update({ parent_id: cogsSection.id })
      .in('code', ['5100', '5200', '5300'])
      .eq('organization_id', organizationId)

    await supabase
      .from('financial_accounts')
      .update({ parent_id: expensesSection.id })
      .in('code', ['6100', '6200', '6300'])
      .eq('organization_id', organizationId)

    // Now insert subcategories
    const { data: subcategories, error: subError } = await supabase
      .from('financial_accounts')
      .insert([
        // Subcategories for Sales & Marketing
        { organization_id: organizationId, name: 'Advertising', code: '6110', type: 'expense', category: 'income_statement', level: 2, sort_order: 13, is_manual: true },
        { organization_id: organizationId, name: 'Sales Commissions', code: '6120', type: 'expense', category: 'income_statement', level: 2, sort_order: 14, is_manual: true },
        { organization_id: organizationId, name: 'Marketing Tools', code: '6130', type: 'expense', category: 'income_statement', level: 2, sort_order: 15, is_manual: true },

        // Subcategories for R&D
        { organization_id: organizationId, name: 'Software Development', code: '6210', type: 'expense', category: 'income_statement', level: 2, sort_order: 16, is_manual: true },
        { organization_id: organizationId, name: 'Product Design', code: '6220', type: 'expense', category: 'income_statement', level: 2, sort_order: 17, is_manual: true },
        { organization_id: organizationId, name: 'Research Costs', code: '6230', type: 'expense', category: 'income_statement', level: 2, sort_order: 18, is_manual: true },

        // Subcategories for G&A
        { organization_id: organizationId, name: 'Office Rent', code: '6310', type: 'expense', category: 'income_statement', level: 2, sort_order: 19, is_manual: true },
        { organization_id: organizationId, name: 'Utilities', code: '6320', type: 'expense', category: 'income_statement', level: 2, sort_order: 20, is_manual: true },
        { organization_id: organizationId, name: 'Insurance', code: '6330', type: 'expense', category: 'income_statement', level: 2, sort_order: 21, is_manual: true },
        { organization_id: organizationId, name: 'Legal & Professional', code: '6340', type: 'expense', category: 'income_statement', level: 2, sort_order: 22, is_manual: true }
      ])
      .select()

    if (subError) {
      console.error('Error inserting subcategories:', subError)
      return
    }

    console.log('Inserted subcategories:', subcategories.length)

    // Set up parent relationships for subcategories
    const salesMarketing = accounts.find(a => a.code === '6100')
    const rnd = accounts.find(a => a.code === '6200')
    const gna = accounts.find(a => a.code === '6300')

    await supabase
      .from('financial_accounts')
      .update({ parent_id: salesMarketing.id })
      .in('code', ['6110', '6120', '6130'])
      .eq('organization_id', organizationId)

    await supabase
      .from('financial_accounts')
      .update({ parent_id: rnd.id })
      .in('code', ['6210', '6220', '6230'])
      .eq('organization_id', organizationId)

    await supabase
      .from('financial_accounts')
      .update({ parent_id: gna.id })
      .in('code', ['6310', '6320', '6330', '6340'])
      .eq('organization_id', organizationId)

    // Insert sample financial data
    console.log('Inserting sample financial data...')
    
    // Get all accounts for data insertion
    const { data: allAccounts, error: allAccountsError } = await supabase
      .from('financial_accounts')
      .select('id, code')
      .eq('organization_id', organizationId)
      .gte('level', 1) // Only categories and subcategories

    if (allAccountsError) {
      console.error('Error fetching accounts for data:', allAccountsError)
      return
    }

    const financialData = []
    const currentYear = new Date().getFullYear()

    allAccounts.forEach(account => {
      for (let month = 1; month <= 12; month++) {
        let amount = 0
        
        // Generate sample data based on account code
        switch (account.code) {
          case '4100': amount = 50000 + (month * 5000); break // Product Sales
          case '4200': amount = 30000 + (month * 3000); break // Service Revenue
          case '4300': amount = 5000 + (month * 500); break // Other Revenue
          case '5100': amount = 20000 + (month * 2000); break // Direct Materials
          case '5200': amount = 15000 + (month * 1500); break // Direct Labor
          case '5300': amount = 10000 + (month * 1000); break // Manufacturing Overhead
          case '6110': amount = 8000 + (month * 800); break // Advertising
          case '6120': amount = 12000 + (month * 1200); break // Sales Commissions
          case '6130': amount = 3000 + (month * 300); break // Marketing Tools
          case '6210': amount = 25000 + (month * 2500); break // Software Development
          case '6220': amount = 10000 + (month * 1000); break // Product Design
          case '6230': amount = 5000 + (month * 500); break // Research Costs
          case '6310': amount = 5000; break // Office Rent (fixed)
          case '6320': amount = 1000 + (month * 100); break // Utilities
          case '6330': amount = 2000; break // Insurance (fixed)
          case '6340': amount = 3000 + (month * 300); break // Legal & Professional
          default: amount = 1000 + (month * 100); break
        }

        financialData.push({
          organization_id: organizationId,
          account_id: account.id,
          year: currentYear,
          month,
          amount,
          is_manual: true
        })
      }
    })

    // Insert financial data in batches
    const batchSize = 100
    for (let i = 0; i < financialData.length; i += batchSize) {
      const batch = financialData.slice(i, i + batchSize)
      const { error: dataError } = await supabase
        .from('financial_data')
        .insert(batch)

      if (dataError) {
        console.error('Error inserting financial data batch:', dataError)
        return
      }
    }

    console.log('✅ Financial data setup complete!')
    console.log(`Organization: ${organizations[0].name}`)
    console.log(`Accounts created: ${accounts.length + subcategories.length}`)
    console.log(`Financial data records: ${financialData.length}`)

  } catch (error) {
    console.error('Setup failed:', error)
  }
}

setupFinancialData() 