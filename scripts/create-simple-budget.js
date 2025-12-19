const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createSimpleBudget() {
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

    // Check if we already have a budget period
    const { data: existingPeriods, error: periodsError } = await supabase
      .from('financial_periods')
      .select('*')
      .eq('organization_id', organizationId)

    if (periodsError) {
      console.error('Error checking periods:', periodsError)
      return
    }

    console.log('Existing periods:', existingPeriods)

    // Check if we already have financial accounts
    const { data: existingAccounts, error: accountsError } = await supabase
      .from('financial_accounts')
      .select('*')
      .eq('organization_id', organizationId)

    if (accountsError) {
      console.error('Error checking accounts:', accountsError)
      return
    }

    console.log('Existing accounts:', existingAccounts)

    // Try to create a single category to see the error
    const { data: category, error: categoryError } = await supabase
      .from('financial_accounts')
      .insert({
        organization_id: organizationId,
        name: 'Test Revenue',
        type: 'revenue',
        category: 'income_statement',
        level: 0,
        sort_order: 1,
        is_active: true,
        is_manual: true
      })
      .select()
      .single()

    if (categoryError) {
      console.error('Error creating single category:', categoryError)
      return
    }

    console.log('Successfully created category:', category)

  } catch (error) {
    console.error('Setup failed:', error)
  }
}

createSimpleBudget() 