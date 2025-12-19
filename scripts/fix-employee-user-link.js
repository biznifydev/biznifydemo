const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixEmployeeUserLink() {
  try {
    console.log('Fixing employee user link...')
    
    // Find the employee record for Mark Giblin
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('email', 'biznifydev@gmail.com')
      .single()
    
    if (employeeError) {
      console.error('Error fetching employee:', employeeError)
      return
    }
    
    console.log('Found employee:', employee)
    
    // Find the user profile for this email
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'biznifydev@gmail.com')
      .single()
    
    if (userError) {
      console.error('Error fetching user profile:', userError)
      return
    }
    
    console.log('Found user profile:', userProfile)
    
    // Update the employee record to link it to the user
    const { data: updatedEmployee, error: updateError } = await supabase
      .from('employees')
      .update({ user_id: userProfile.id })
      .eq('id', employee.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating employee:', updateError)
      return
    }
    
    console.log('Successfully updated employee:', updatedEmployee)
    
  } catch (error) {
    console.error('Error:', error)
  }
}

fixEmployeeUserLink() 