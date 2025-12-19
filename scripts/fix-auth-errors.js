#!/usr/bin/env node

const fs = require('fs');

// Files that need fixing
const filesToFix = [
  'app/finance/expenses/page.tsx',
  'app/finance/invoices/page.tsx',
  'app/finance/reports/page.tsx'
];

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix the malformed return statement structure
  content = content.replace(
    /return \(\s*\n\s*\n\s*<ProtectedRoute>\s*\n\s*\n\s*<PageWrapper/g,
    'return (\n  <ProtectedRoute>\n    <PageWrapper'
  );
  
  // Fix the closing structure
  content = content.replace(
    /}\s*\n\s*<\/ProtectedRoute>\s*\n\s*\)/g,
    '}\n  </ProtectedRoute>\n)'
  );
  
  // Remove any extra closing tags at the end
  content = content.replace(
    /}\s*\n\s*<\/ProtectedRoute>\s*\n\s*\)\s*$/,
    '}'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed: ${filePath}`);
}

console.log('🔧 Fixing authentication protection errors...\n');

filesToFix.forEach(file => {
  fixFile(file);
});

console.log('\n✅ Authentication errors fixed!'); 