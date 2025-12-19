const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addUserIdToEmployees() {
  try {
    console.log('Adding user_id and organization_id fields to employees table...')
    
    // Add organization_id column
    console.log('Adding organization_id column...')
    const { error: orgError } = await supabase.rpc('sql', {
      query: 'ALTER TABLE employees ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;'
    })
    
    if (orgError) {
      console.error('Error adding organization_id:', orgError)
    } else {
      console.log('✅ Added organization_id column')
    }
    
    // Add user_id column
    console.log('Adding user_id column...')
    const { error: userError } = await supabase.rpc('sql', {
      query: 'ALTER TABLE employees ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;'
    })
    
    if (userError) {
      console.error('Error adding user_id:', userError)
    } else {
      console.log('✅ Added user_id column')
    }
    
    // Create indexes
    console.log('Creating indexes...')
    const { error: index1Error } = await supabase.rpc('sql', {
      query: 'CREATE INDEX IF NOT EXISTS idx_employees_organization_id ON employees(organization_id);'
    })
    
    const { error: index2Error } = await supabase.rpc('sql', {
      query: 'CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);'
    })
    
    if (index1Error || index2Error) {
      console.error('Error creating indexes:', index1Error || index2Error)
    } else {
      console.log('✅ Created indexes')
    }
    
    // Add unique constraint
    console.log('Adding unique constraint...')
    const { error: constraintError } = await supabase.rpc('sql', {
      query: 'ALTER TABLE employees ADD CONSTRAINT IF NOT EXISTS employees_user_org_unique UNIQUE (user_id, organization_id);'
    })
    
    if (constraintError) {
      console.error('Error adding unique constraint:', constraintError)
    } else {
      console.log('✅ Added unique constraint')
    }
    
    console.log('✅ Successfully updated employees table')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

addUserIdToEmployees() 