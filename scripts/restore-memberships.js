const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function restoreMemberships() {
  try {
    console.log('🔄 Restoring organization memberships...\n');

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

    // Get all organizations
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('*');

    if (orgError) {
      console.error('Error fetching organizations:', orgError);
      return;
    }

    console.log(`🏢 Found ${organizations.length} organization(s):`);
    organizations.forEach(org => {
      console.log(`  - ${org.name} (${org.slug})`);
    });

    // Restore memberships
    for (const org of organizations) {
      const { error: insertError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: userId,
          role: 'owner',
          status: 'active',
          joined_at: org.created_at
        })
        .select();

      if (insertError) {
        console.error(`Error restoring membership for ${org.name}:`, insertError);
      } else {
        console.log(`✅ Restored membership for ${org.name}`);
      }
    }

    console.log('\n🎉 Successfully restored all organization memberships!');
    console.log('🔄 Refresh the app to see your organizations again.');

  } catch (error) {
    console.error('Error:', error);
  }
}

restoreMemberships(); 