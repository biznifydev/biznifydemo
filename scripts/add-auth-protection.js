#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Pages that need authentication protection
const pagesToProtect = [
  'app/ai/page.tsx',
  'app/home/page.tsx',
  'app/settings/page.tsx',
  'app/integrations/page.tsx',
  'app/legal/page.tsx',
  'app/legal/overview/page.tsx',
  'app/legal/compliance/page.tsx',
  'app/legal/contracts/page.tsx',
  'app/legal/documents/page.tsx',
  'app/marketing/page.tsx',
  'app/marketing/overview/page.tsx',
  'app/marketing/analytics/page.tsx',
  'app/marketing/campaigns/page.tsx',
  'app/marketing/content/page.tsx',
  'app/sales/page.tsx',
  'app/sales/overview/page.tsx',
  'app/finance/budget-forecast/page.tsx',
  'app/finance/expenses/page.tsx',
  'app/finance/invoices/page.tsx',
  'app/finance/reports/page.tsx',
  'app/hr/employees/page.tsx',
  'app/hr/recruitment/page.tsx',
  'app/hr/time-manager/page.tsx',
  'app/integrations/payment-gateways/page.tsx',
  'app/settings/profile/page.tsx'
];

function addProtectionToPage(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if already protected
  if (content.includes('ProtectedRoute')) {
    console.log(`✅ Already protected: ${filePath}`);
    return;
  }

  // Check if it's a client component
  const isClientComponent = content.includes('"use client"');
  
  // Add import
  if (!content.includes('import { ProtectedRoute }')) {
    const importStatement = 'import { ProtectedRoute } from "@/components/auth/ProtectedRoute"';
    
    if (isClientComponent) {
      // Add after "use client" and other imports
      const lines = content.split('\n');
      let insertIndex = 1; // After "use client"
      
      // Find the last import statement
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) {
          insertIndex = i + 1;
        } else if (lines[i].trim() && !lines[i].trim().startsWith('//')) {
          break;
        }
      }
      
      lines.splice(insertIndex, 0, importStatement);
      content = lines.join('\n');
    } else {
      // Add at the beginning for server components
      content = importStatement + '\n' + content;
    }
  }

  // Wrap the return statement
  const returnMatch = content.match(/(\s+)return\s*\(\s*<PageWrapper/);
  if (returnMatch) {
    const indent = returnMatch[1];
    content = content.replace(
      /(\s+)return\s*\(\s*<PageWrapper/g,
      `${indent}return (\n${indent}  <ProtectedRoute>\n${indent}    <PageWrapper`
    );
    
    // Find the closing PageWrapper and add closing ProtectedRoute
    const pageWrapperClose = content.lastIndexOf('</PageWrapper>');
    if (pageWrapperClose !== -1) {
      const beforeClose = content.substring(0, pageWrapperClose);
      const afterClose = content.substring(pageWrapperClose);
      
      // Find the indentation level
      const lines = beforeClose.split('\n');
      const lastLine = lines[lines.length - 1];
      const match = lastLine.match(/^(\s*)/);
      const indent = match ? match[1] : '';
      
      content = beforeClose + 
                afterClose + 
                `\n${indent}  </ProtectedRoute>\n${indent})`;
    }
  }

  fs.writeFileSync(filePath, content);
  console.log(`✅ Protected: ${filePath}`);
}

console.log('🔒 Adding authentication protection to pages...\n');

pagesToProtect.forEach(page => {
  addProtectionToPage(page);
});

console.log('\n✅ Authentication protection added!');
console.log('\n📝 Manual steps you may need to do:');
console.log('1. Check for any TypeScript errors in the protected pages');
console.log('2. Test that the login flow works correctly');
console.log('3. Verify that unauthorized users are redirected to /login');
console.log('4. Test that authenticated users can access the protected pages'); 