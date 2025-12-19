const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAllMembers() {
  try {
    console.log('🔍 Checking ALL organization members (including inactive)...\n');

    // Test Org LTD ID
    const orgId = '682405ba-4c6f-4415-b103-89fd64ff8ce4';

    // Get ALL members (not just active)
    const { data: allMembers, error: membersError } = await supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', orgId);

    if (membersError) {
      console.error('Error fetching members:', membersError);
      return;
    }

    console.log(`📊 Found ${allMembers.length} total members:`);
    allMembers.forEach((member, index) => {
      console.log(`  ${index + 1}. User ID: ${member.user_id}`);
      console.log(`     Role: ${member.role}`);
      console.log(`     Status: ${member.status}`);
      console.log(`     Joined: ${member.joined_at}`);
      console.log('');
    });

    // Get user profiles for all members
    const userIds = allMembers.map(member => member.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }

    console.log('👥 Members with profile data:');
    allMembers.forEach((member, index) => {
      const user = profiles?.find(profile => profile.id === member.user_id);
      const displayName = user?.first_name && user?.last_name 
        ? `${user.first_name} ${user.last_name}`
        : user?.email || 'Unknown User';
      
      console.log(`  ${index + 1}. ${displayName} (${user?.email || 'No email'})`);
      console.log(`     Role: ${member.role}, Status: ${member.status}`);
      console.log(`     User Profile: ${user ? 'Found' : 'Missing'}`);
      console.log('');
    });

    // Check if there are any members without profiles
    const membersWithoutProfiles = allMembers.filter(member => 
      !profiles?.find(profile => profile.id === member.user_id)
    );

    if (membersWithoutProfiles.length > 0) {
      console.log('❌ Members without user profiles:');
      membersWithoutProfiles.forEach(member => {
        console.log(`  - User ID: ${member.user_id}, Role: ${member.role}, Status: ${member.status}`);
      });
    } else {
      console.log('✅ All members have corresponding user profiles');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkAllMembers(); 