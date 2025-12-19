#!/usr/bin/env node

const fs = require('fs');

// All files that need fixing
const filesToFix = [
  'app/integrations/page.tsx',
  'app/integrations/payment-gateways/page.tsx',
  'app/legal/compliance/page.tsx',
  'app/legal/documents/page.tsx',
  'app/legal/overview/page.tsx',
  'app/marketing/page.tsx',
  'app/marketing/overview/page.tsx',
  'app/marketing/analytics/page.tsx',
  'app/marketing/campaigns/page.tsx',
  'app/marketing/content/page.tsx',
  'app/sales/page.tsx',
  'app/sales/overview/page.tsx',
  'app/hr/time-manager/page.tsx',
  'app/settings/page.tsx',
  'app/home/page.tsx'
];

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix the malformed return statement structure - multiple patterns
  content = content.replace(
    /return \(\s*\n\s*\n\s*<ProtectedRoute>\s*\n\s*\n\s*<PageWrapper/g,
    'return (\n  <ProtectedRoute>\n    <PageWrapper'
  );
  
  content = content.replace(
    /return \(\s*\n\s*<ProtectedRoute>\s*\n\s*\n\s*<PageWrapper/g,
    'return (\n  <ProtectedRoute>\n    <PageWrapper'
  );
  
  content = content.replace(
    /return \(\s*\n\s*<ProtectedRoute>\s*\n\s*<PageWrapper/g,
    'return (\n  <ProtectedRoute>\n    <PageWrapper'
  );
  
  // Fix the closing structure - multiple patterns
  content = content.replace(
    /}\s*\n\s*<\/ProtectedRoute>\s*\n\s*\)/g,
    '}\n  </ProtectedRoute>\n)'
  );
  
  content = content.replace(
    /}\s*\n\s*<\/ProtectedRoute>\s*\n\s*\)\s*$/,
    '}'
  );
  
  // Remove any extra closing tags at the end
  content = content.replace(
    /}\s*\n\s*<\/ProtectedRoute>\s*\n\s*\)\s*$/,
    '}'
  );
  
  // Fix indentation for PageWrapper props
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

console.log('🔧 Fixing all authentication protection errors...\n');

filesToFix.forEach(file => {
  fixFile(file);
});

console.log('\n✅ All authentication errors fixed!'); 