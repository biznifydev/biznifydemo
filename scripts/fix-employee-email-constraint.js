const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixEmployeeEmailConstraint() {
  try {
    console.log('Fixing employee email constraint...')

    // Drop the existing unique constraint on email
    const { error: dropError } = await supabase
      .from('employees')
      .select('*')
      .limit(1) // This is just to test the connection, we'll run the actual SQL manually

    if (dropError) {
      console.error('Error testing connection:', dropError)
      return
    }

    console.log('Connection successful. Please run the following SQL in your Supabase dashboard:')
    console.log('')
    console.log('-- Drop the existing unique constraint on email')
    console.log('ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_email_key;')
    console.log('')
    console.log('-- Create a new unique constraint on (email, organization_id)')
    console.log('ALTER TABLE employees ADD CONSTRAINT employees_email_org_unique UNIQUE (email, organization_id);')
    console.log('')
    console.log('-- Add a comment explaining the constraint')
    console.log("COMMENT ON CONSTRAINT employees_email_org_unique ON employees IS 'Email must be unique within each organization, but can be reused across different organizations';")
    console.log('')

  } catch (error) {
    console.error('Error:', error)
  }
}

fixEmployeeEmailConstraint() 