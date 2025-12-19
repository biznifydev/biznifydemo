const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function tempRemoveMemberships() {
  try {
    console.log('🔍 Finding your organization memberships...\n');

    // Get your user ID
    const { data: users, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'biznifydev@gmail.com');

    if (userError || !users.length) {
      console.error('Error finding user:', userError);
      return;
    }

    const userId = users[0].id;
    console.log(`👤 Found user: ${users[0].email} (ID: ${userId})\n`);

    // Get your memberships
    const { data: memberships, error: membershipError } = await supabase
      .from('organization_members')
      .select(`
        *,
        organizations (
          name,
          slug
        )
      `)
      .eq('user_id', userId);

    if (membershipError) {
      console.error('Error fetching memberships:', membershipError);
      return;
    }

    if (memberships.length === 0) {
      console.log('✅ No memberships found - you can test the setup flow!');
      return;
    }

    console.log(`📋 Found ${memberships.length} membership(s):`);
    memberships.forEach((membership, index) => {
      console.log(`  ${index + 1}. ${membership.organizations.name} (${membership.role})`);
    });

    console.log('\n⚠️  To test the setup flow, I can temporarily remove these memberships.');
    console.log('   This will allow you to see the organization setup screen.');
    console.log('   You can restore them later using the restore script.\n');

    console.log('🔧 Run this command to remove memberships:');
    console.log('   node scripts/remove-memberships.js\n');

    console.log('🔄 Run this command to restore memberships:');
    console.log('   node scripts/restore-memberships.js');

  } catch (error) {
    console.error('Error:', error);
  }
}

tempRemoveMemberships(); 