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
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql })
    
    if (error) {
      console.error('Error executing SQL:', error)
      return
    }
    
    console.log('✅ Investment tables created successfully!')
    console.log('\nTables created:')
    console.log('- investment_rounds')
    console.log('- investors')
    console.log('- round_investors')
    console.log('- cap_table')
    console.log('- investment_milestones')
    console.log('- investment_documents')
    console.log('- investment_notes')
    
  } catch (error) {
    console.error('Error setting up investment tables:', error)
  }
}

// Alternative method using direct SQL execution
async function setupInvestmentTablesDirect() {
  try {
    console.log('Setting up investment tables...')
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '../database/investment-schema.sql')
    const sql = fs.readFileSync(schemaPath, 'utf8')
    
    // Split SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0)
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...')
        const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' })
        
        if (error) {
          console.error('Error executing statement:', error)
          console.error('Statement:', statement)
        }
      }
    }
    
    console.log('✅ Investment tables created successfully!')
    
  } catch (error) {
    console.error('Error setting up investment tables:', error)
  }
}

// Run the setup
setupInvestmentTablesDirect() 