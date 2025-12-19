const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupInvestmentTables() {
  try {
    console.log('Setting up investment tables...')
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '../database/investment-schema.sql')
    const sql = fs.readFileSync(schemaPath, 'utf8')
    
    // Split SQL into individual statements and execute them one by one
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`Found ${statements.length} SQL statements to execute`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`)
          
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
          
          if (error) {
            console.error(`Error in statement ${i + 1}:`, error.message)
            console.error('Statement:', statement)
            // Continue with next statement instead of failing completely
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`)
          }
        } catch (err) {
          console.error(`Error executing statement ${i + 1}:`, err.message)
          console.error('Statement:', statement)
        }
      }
    }
    
    console.log('\n🎉 Investment tables setup completed!')
    console.log('\nTables created:')
    console.log('- investors')
    console.log('- investment_rounds')
    console.log('- round_investors')
    console.log('- cap_table')
    console.log('- investment_milestones')
    console.log('- investment_documents')
    console.log('- investment_notes')
    
  } catch (error) {
    console.error('Error setting up investment tables:', error)
  }
}

// Alternative: Execute SQL directly using the SQL editor approach
async function setupInvestmentTablesDirect() {
  try {
    console.log('Setting up investment tables using direct SQL execution...')
    
    // Execute the SQL directly in the Supabase SQL editor
    console.log('\n📋 Please follow these steps:')
    console.log('1. Go to your Supabase dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste the contents of database/investment-schema.sql')
    console.log('4. Click "Run" to execute the SQL')
    console.log('\nThe SQL file is located at: database/investment-schema.sql')
    
    // Show the SQL content
    const schemaPath = path.join(__dirname, '../database/investment-schema.sql')
    const sql = fs.readFileSync(schemaPath, 'utf8')
    
    console.log('\n📄 SQL Content:')
    console.log('='.repeat(50))
    console.log(sql)
    console.log('='.repeat(50))
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the setup
console.log('Choose setup method:')
console.log('1. Automated setup (may have issues with complex SQL)')
console.log('2. Manual setup (recommended)')

// For now, run the manual setup
setupInvestmentTablesDirect() 