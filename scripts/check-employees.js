const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkEmployees() {
  try {
    console.log('Checking employees in database...')
    
    // Get all employees
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
    
    if (employeesError) {
      console.error('Error fetching employees:', employeesError)
      return
    }
    
    console.log(`Found ${employees.length} employees:`)
    
    for (const employee of employees) {
      console.log(`\nEmployee: ${employee.first_name} ${employee.last_name}`)
      console.log(`  - ID: ${employee.id}`)
      console.log(`  - Employee ID: ${employee.employee_id}`)
      console.log(`  - Email: ${employee.email}`)
      console.log(`  - Organization ID: ${employee.organization_id || 'NULL'}`)
      console.log(`  - User ID: ${employee.user_id || 'NULL'}`)
      console.log(`  - Status: ${employee.status}`)
    }
    
    // Check organizations
    console.log('\n\nChecking organizations...')
    const { data: organizations, error: orgsError } = await supabase
      .from('organizations')
      .select('*')
    
    if (orgsError) {
      console.error('Error fetching organizations:', orgsError)
      return
    }
    
    console.log(`Found ${organizations.length} organizations:`)
    
    for (const org of organizations) {
      console.log(`\nOrganization: ${org.name}`)
      console.log(`  - ID: ${org.id}`)
      console.log(`  - Slug: ${org.slug}`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkEmployees() 