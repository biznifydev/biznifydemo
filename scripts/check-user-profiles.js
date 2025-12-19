const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkUserProfiles() {
  try {
    console.log('🔍 Checking user profiles...\n');

    // Get all user profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (profilesError) {
      console.error('Error fetching user profiles:', profilesError);
      return;
    }

    console.log(`📊 Found ${profiles.length} user profile(s):`);
    profiles.forEach((profile, index) => {
      console.log(`  ${index + 1}. ID: ${profile.id}`);
      console.log(`     Email: ${profile.email}`);
      console.log(`     First Name: "${profile.first_name || 'NULL'}"`);
      console.log(`     Last Name: "${profile.last_name || 'NULL'}"`);
      console.log(`     Created: ${profile.created_at}`);
      console.log('');
    });

    // Check organization members with user profiles
    console.log('👥 Organization Members with Profile Data:');
    
    const { data: members, error: membersError } = await supabase
      .from('organization_members')
      .select(`
        *,
        user_profiles (
          id,
          email,
          first_name,
          last_name
        )
      `)
      .eq('organization_id', '682405ba-4c6f-4415-b103-89fd64ff8ce4') // Test Org LTD
      .eq('status', 'active');

    if (membersError) {
      console.error('Error fetching members:', membersError);
      return;
    }

    members.forEach((member, index) => {
      const user = member.user_profiles;
      console.log(`  ${index + 1}. User ID: ${member.user_id}`);
      console.log(`     Email: ${user?.email || 'No email'}`);
      console.log(`     First Name: "${user?.first_name || 'NULL'}"`);
      console.log(`     Last Name: "${user?.last_name || 'NULL'}"`);
      console.log(`     Role: ${member.role}`);
      console.log(`     Display Name: ${user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.email || 'Unknown User'}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

checkUserProfiles(); 