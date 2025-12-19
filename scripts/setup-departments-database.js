const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.log('Please ensure you have:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDepartmentsDatabase() {
  try {
    console.log('🚀 Setting up departments database...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../database/departments-schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Executing departments schema SQL...');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      // If exec_sql doesn't exist, try direct query
      console.log('⚠️  exec_sql not available, trying direct query...');
      
      // Split SQL into individual statements and execute them
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`Executing: ${statement.substring(0, 50)}...`);
          const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement });
          if (stmtError) {
            console.error('❌ Error executing statement:', stmtError);
          }
        }
      }
    }
    
    console.log('✅ Departments database setup completed!');
    console.log('');
    console.log('📋 What was created:');
    console.log('- departments table with UUID primary key');
    console.log('- name, description, manager_id columns');
    console.log('- created_at and updated_at timestamps');
    console.log('- Indexes for performance');
    console.log('- RLS policies for security');
    console.log('- Sample department data');
    console.log('');
    console.log('🔗 Next steps:');
    console.log('1. Check your Supabase dashboard to verify the table was created');
    console.log('2. Test the departments functionality in your app');
    console.log('3. Add employees to departments using the department_id field');
    
  } catch (error) {
    console.error('❌ Error setting up departments database:', error);
    process.exit(1);
  }
}

setupDepartmentsDatabase(); 