const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugMemberDisplay() {
  try {
    console.log('🔍 Debugging member display issue...\n');

    // Test Org LTD ID
    const orgId = '682405ba-4c6f-4415-b103-89fd64ff8ce4';

    // Step 1: Get organization members
    console.log('📋 Step 1: Getting organization members...');
    const { data: members, error: membersError } = await supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', orgId)
      .eq('status', 'active');

    if (membersError) {
      console.error('Error fetching members:', membersError);
      return;
    }

    console.log(`Found ${members.length} members:`);
    members.forEach((member, index) => {
      console.log(`  ${index + 1}. User ID: ${member.user_id}, Role: ${member.role}`);
    });

    // Step 2: Get user profiles for these members
    console.log('\n📋 Step 2: Getting user profiles...');
    const userIds = members.map(member => member.user_id);
    console.log('User IDs to fetch:', userIds);

    const { data: profiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .in('id', userIds);

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return;
    }

    console.log(`Found ${profiles.length} profiles:`);
    profiles.forEach((profile, index) => {
      console.log(`  ${index + 1}. ID: ${profile.id}`);
      console.log(`     Email: ${profile.email}`);
      console.log(`     First Name: "${profile.first_name || 'NULL'}"`);
      console.log(`     Last Name: "${profile.last_name || 'NULL'}"`);
    });

    // Step 3: Simulate the combination logic
    console.log('\n📋 Step 3: Simulating combination logic...');
    const combinedMembers = members.map(member => {
      const user = profiles?.find(profile => profile.id === member.user_id);
      return {
        ...member,
        user: user
      };
    });

    console.log('Combined members:');
    combinedMembers.forEach((member, index) => {
      const user = member.user;
      const displayName = user?.first_name && user?.last_name 
        ? `${user.first_name} ${user.last_name}`
        : user?.email || 'Unknown User';
      
      console.log(`  ${index + 1}. Display Name: "${displayName}"`);
      console.log(`     User object:`, user ? 'Found' : 'NULL');
      console.log(`     First Name: "${user?.first_name || 'NULL'}"`);
      console.log(`     Last Name: "${user?.last_name || 'NULL'}"`);
      console.log(`     Email: "${user?.email || 'NULL'}"`);
    });

    // Step 4: Check if there are any mismatched IDs
    console.log('\n📋 Step 4: Checking for ID mismatches...');
    const memberUserIds = new Set(members.map(m => m.user_id));
    const profileUserIds = new Set(profiles.map(p => p.id));
    
    console.log('Member User IDs:', Array.from(memberUserIds));
    console.log('Profile User IDs:', Array.from(profileUserIds));
    
    const missingProfiles = Array.from(memberUserIds).filter(id => !profileUserIds.has(id));
    if (missingProfiles.length > 0) {
      console.log('❌ Missing profiles for user IDs:', missingProfiles);
    } else {
      console.log('✅ All member user IDs have corresponding profiles');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

debugMemberDisplay(); 