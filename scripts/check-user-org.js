const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUserOrganization() {
  try {
    console.log('Checking user organization memberships...')
    
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('*')
    
    if (usersError) {
      console.error('Error fetching users:', usersError)
      return
    }
    
    console.log(`Found ${users.length} users:`)
    
    for (const user of users) {
      console.log(`\nUser: ${user.email} (${user.id})`)
      
      // Get organization memberships for this user
      const { data: memberships, error: membershipsError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('user_id', user.id)
      
      if (membershipsError) {
        console.error(`Error fetching memberships for ${user.email}:`, membershipsError)
        continue
      }
      
      if (memberships && memberships.length > 0) {
        console.log(`  Active memberships: ${memberships.length}`)
        for (const membership of memberships) {
          console.log(`    - Organization ID: ${membership.organization_id}`)
          console.log(`    - Role: ${membership.role}`)
          console.log(`    - Status: ${membership.status}`)
        }
      } else {
        console.log('  No organization memberships found')
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkUserOrganization() 