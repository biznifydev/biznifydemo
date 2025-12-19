const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testConnection() {
  console.log('Testing Leave Management System connection...')

  try {
    // Test 1: Check if tables exist
    console.log('\n1. Testing table existence...')
    
    const { data: leaveTypes, error: typesError } = await supabase
      .from('leave_types')
      .select('count')
      .limit(1)

    if (typesError) {
      console.error('❌ Leave types table error:', typesError)
    } else {
      console.log('✅ Leave types table accessible')
    }

    const { data: leaveBalances, error: balancesError } = await supabase
      .from('leave_balances')
      .select('count')
      .limit(1)

    if (balancesError) {
      console.error('❌ Leave balances table error:', balancesError)
    } else {
      console.log('✅ Leave balances table accessible')
    }

    const { data: leaveRequests, error: requestsError } = await supabase
      .from('leave_requests')
      .select('count')
      .limit(1)

    if (requestsError) {
      console.error('❌ Leave requests table error:', requestsError)
    } else {
      console.log('✅ Leave requests table accessible')
    }

    // Test 2: Get actual data
    console.log('\n2. Testing data retrieval...')
    
    const { data: types, error: typesDataError } = await supabase
      .from('leave_types')
      .select('*')
      .limit(5)

    if (typesDataError) {
      console.error('❌ Error getting leave types data:', typesDataError)
    } else {
      console.log(`✅ Found ${types?.length || 0} leave types`)
      types?.forEach(type => console.log(`   - ${type.name} (${type.color})`))
    }

    const { data: balances, error: balancesDataError } = await supabase
      .from('leave_balances')
      .select('*')
      .limit(5)

    if (balancesDataError) {
      console.error('❌ Error getting leave balances data:', balancesDataError)
    } else {
      console.log(`✅ Found ${balances?.length || 0} leave balances`)
    }

    const { data: requests, error: requestsDataError } = await supabase
      .from('leave_requests')
      .select('*')
      .limit(5)

    if (requestsDataError) {
      console.error('❌ Error getting leave requests data:', requestsDataError)
    } else {
      console.log(`✅ Found ${requests?.length || 0} leave requests`)
    }

    console.log('\n✅ All tests completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testConnection() 