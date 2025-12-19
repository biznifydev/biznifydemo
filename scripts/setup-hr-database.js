const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupHrDatabase() {
  try {
    console.log('🚀 Setting up HR database schema...')
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '../database/hr-employees-schema.sql')
    const sqlSchema = fs.readFileSync(schemaPath, 'utf8')
    
    // Split the SQL into individual statements
    const statements = sqlSchema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Executing ${statements.length} SQL statements...`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          if (error) {
            console.warn(`⚠️  Warning on statement ${i + 1}:`, error.message)
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`)
          }
        } catch (err) {
          console.warn(`⚠️  Warning on statement ${i + 1}:`, err.message)
        }
      }
    }
    
    console.log('🎉 HR database setup completed!')
    console.log('\n📋 Next steps:')
    console.log('1. Update your organization_id in the database tables')
    console.log('2. Test the employee management functionality')
    console.log('3. Add more sample data as needed')
    
  } catch (error) {
    console.error('❌ Error setting up HR database:', error)
    process.exit(1)
  }
}

// Alternative approach using direct SQL execution
async function setupHrDatabaseDirect() {
  try {
    console.log('🚀 Setting up HR database schema (direct method)...')
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '../database/hr-employees-schema.sql')
    const sqlSchema = fs.readFileSync(schemaPath, 'utf8')
    
    // Execute the entire schema
    const { error } = await supabase.rpc('exec_sql', { sql: sqlSchema })
    
    if (error) {
      console.error('❌ Error executing schema:', error)
      process.exit(1)
    }
    
    console.log('🎉 HR database setup completed!')
    
  } catch (error) {
    console.error('❌ Error setting up HR database:', error)
    process.exit(1)
  }
}

// Check if we should use direct method
const useDirect = process.argv.includes('--direct')

if (useDirect) {
  setupHrDatabaseDirect()
} else {
  setupHrDatabase()
} 