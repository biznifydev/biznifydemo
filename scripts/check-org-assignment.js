const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkOrganizations() {
  try {
    console.log('🔍 Checking organizations and members...\n');

    // Get all organizations
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: true });

    if (orgError) {
      console.error('Error fetching organizations:', orgError);
      return;
    }

    console.log(`📊 Found ${organizations.length} organization(s):`);
    organizations.forEach((org, index) => {
      console.log(`  ${index + 1}. ${org.name} (${org.slug}) - Created: ${org.created_at}`);
    });

    console.log('\n👥 Organization Members:');
    
    for (const org of organizations) {
      const { data: members, error: memberError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', org.id);

      if (memberError) {
        console.error(`Error fetching members for ${org.name}:`, memberError);
        continue;
      }

      console.log(`\n  🏢 ${org.name}:`);
      if (members.length === 0) {
        console.log('    No members');
      } else {
        for (const member of members) {
          // Get user profile separately
          const { data: user, error: userError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', member.user_id)
            .single();

          if (userError) {
            console.log(`    - User ID: ${member.user_id} - Role: ${member.role} - Joined: ${member.joined_at}`);
          } else {
            console.log(`    - ${user.first_name || 'Unknown'} ${user.last_name || ''} (${user.email}) - Role: ${member.role} - Joined: ${member.joined_at}`);
          }
        }
      }
    }

    // Check if there are any users without organizations
    const { data: allUsers, error: userError } = await supabase
      .from('user_profiles')
      .select('*');

    if (userError) {
      console.error('Error fetching users:', userError);
      return;
    }

    console.log('\n🔍 Users without organizations:');
    for (const user of allUsers) {
      const { data: userMemberships, error: membershipError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id);

      if (membershipError) {
        console.error(`Error checking memberships for ${user.email}:`, membershipError);
        continue;
      }

      if (userMemberships.length === 0) {
        console.log(`  - ${user.email} (${user.first_name} ${user.last_name})`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkOrganizations(); 