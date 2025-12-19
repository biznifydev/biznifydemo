const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function removeMemberships() {
  try {
    console.log('🗑️  Removing organization memberships...\n');

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

    // Remove all memberships
    const { error: deleteError } = await supabase
      .from('organization_members')
      .delete()
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error removing memberships:', deleteError);
      return;
    }

    console.log('✅ Successfully removed all organization memberships!');
    console.log('🔄 Now when you refresh the app, you should see the organization setup flow.');
    console.log('📝 To restore your memberships later, run: node scripts/restore-memberships.js');

  } catch (error) {
    console.error('Error:', error);
  }
}

removeMemberships(); 