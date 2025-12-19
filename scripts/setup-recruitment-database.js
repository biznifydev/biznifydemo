const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlFilePath = path.join(__dirname, '../database/recruitment-schema.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

console.log('Recruitment Database Schema:');
console.log('============================');
console.log(sqlContent);

console.log('\nTo set up the recruitment database:');
console.log('1. Copy the SQL content above');
console.log('2. Go to your Supabase dashboard');
console.log('3. Navigate to SQL Editor');
console.log('4. Paste and run the SQL script');
console.log('5. The recruitment system will be ready to use!');

console.log('\nAfter running the SQL:');
console.log('- Job postings, candidates, interviews, and pipeline stages will be created');
console.log('- Sample data will be inserted');
console.log('- All relationships and triggers will be set up');
console.log('- Row Level Security will be enabled'); 