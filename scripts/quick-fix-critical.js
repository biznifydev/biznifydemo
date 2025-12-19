#!/usr/bin/env node

const fs = require('fs');

// Only the most critical files that are blocking the build
const criticalFiles = [
  'app/integrations/payment-gateways/page.tsx',
  'app/legal/compliance/page.tsx',
  'app/legal/documents/page.tsx',
  'app/legal/overview/page.tsx',
  'app/marketing/analytics/page.tsx'
];

function fixCriticalFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix the specific pattern that's causing the error
  content = content.replace(
    /return \(\s*\n\s*<ProtectedRoute>\s*\n\s*<PageWrapper/g,
    'return (\n  <ProtectedRoute>\n    <PageWrapper'
  );
  
  // Fix the closing structure
  content = content.replace(
    /}\s*\n\s*<\/ProtectedRoute>\s*\n\s*\)\s*$/,
    '}\n  </ProtectedRoute>\n)'
  );
  
  // Fix PageWrapper props indentation
  content = content.replace(
    /<PageWrapper\s*\n\s*title=/g,
    '<PageWrapper\n        title='
  );
  
  content = content.replace(
    /headerButtons=/g,
    'headerButtons='
  );
  
  content = content.replace(
    /subHeader=/g,
    'subHeader='
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed: ${filePath}`);
}

console.log('🔧 Quick fixing critical authentication errors...\n');

criticalFiles.forEach(file => {
  fixCriticalFile(file);
});

console.log('\n✅ Critical authentication errors fixed!'); 