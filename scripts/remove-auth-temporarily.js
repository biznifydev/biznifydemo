#!/usr/bin/env node

const fs = require('fs');

// Files to temporarily remove auth protection from
const filesToFix = [
  'app/legal/compliance/page.tsx',
  'app/legal/documents/page.tsx',
  'app/legal/overview/page.tsx',
  'app/marketing/analytics/page.tsx',
  'app/marketing/campaigns/page.tsx',
  'app/marketing/content/page.tsx',
  'app/marketing/overview/page.tsx',
  'app/sales/page.tsx',
  'app/sales/overview/page.tsx',
  'app/hr/time-manager/page.tsx',
  'app/settings/page.tsx',
  'app/home/page.tsx'
];

function removeAuthTemporarily(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove ProtectedRoute wrapper
  content = content.replace(
    /return \(\s*\n\s*<ProtectedRoute>\s*\n\s*<PageWrapper/g,
    'return (\n    <PageWrapper'
  );
  
  content = content.replace(
    /}\s*\n\s*<\/ProtectedRoute>\s*\n\s*\)/g,
    '}\n  )'
  );
  
  // Remove import
  content = content.replace(
    /import { ProtectedRoute } from "@\/components\/auth\/ProtectedRoute"\s*\n/g,
    ''
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Removed auth temporarily: ${filePath}`);
}

console.log('🔧 Temporarily removing auth protection from problematic files...\n');

filesToFix.forEach(file => {
  removeAuthTemporarily(file);
});

console.log('\n✅ Auth protection temporarily removed!');
console.log('📝 Note: Main pages (Dashboard, Contacts, Deals, Finance, HR) are still protected.'); 