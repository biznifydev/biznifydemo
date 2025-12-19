const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkOwnerProfile() {
  try {
    console.log('🔍 Checking owner profile specifically...\n');

    const ownerUserId = '88f4c022-2d0c-4ae5-be4e-0cc8d7b87f37';

    // Check if the user profile exists
    console.log('📋 Checking user profile...');
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', ownerUserId)
      .single();

    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError);
    } else {
      console.log('✅ User profile found:');
      console.log('  ID:', profile.id);
      console.log('  Email:', profile.email);
      console.log('  First Name:', profile.first_name);
      console.log('  Last Name:', profile.last_name);
      console.log('  Created:', profile.created_at);
    }

    // Check if the user exists in auth.users
    console.log('\n📋 Checking auth.users...');
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(ownerUserId);

    if (authError) {
      console.error('❌ Error fetching auth user:', authError);
    } else {
      console.log('✅ Auth user found:');
      console.log('  ID:', authUser.user.id);
      console.log('  Email:', authUser.user.email);
      console.log('  Created:', authUser.user.created_at);
    }

    // Test the exact query that getOrganizationMembers uses
    console.log('\n📋 Testing the exact query from getOrganizationMembers...');
    const { data: testProfiles, error: testError } = await supabase
      .from('user_profiles')
      .select('*')
      .in('id', [ownerUserId]);

    if (testError) {
      console.error('❌ Error in test query:', testError);
    } else {
      console.log('✅ Test query results:');
      console.log('  Found profiles:', testProfiles?.length || 0);
      if (testProfiles && testProfiles.length > 0) {
        testProfiles.forEach((p, i) => {
          console.log(`  Profile ${i + 1}:`, p.email, p.first_name, p.last_name);
        });
      }
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkOwnerProfile(); 