const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestBudgetData() {
  console.log('Creating test budget data...');

  try {
    // Get the first organization
    const { data: organizations } = await supabase
      .from('organizations')
      .select('id')
      .limit(1);

    if (!organizations || organizations.length === 0) {
      console.log('No organizations found. Please create an organization first.');
      return;
    }

    const organizationId = organizations[0].id;
    console.log('Using organization:', organizationId);

    // Create organization-specific budget sections
    const { data: globalSections } = await supabase
      .from('budget_sections')
      .select('*')
      .is('organization_id', null)
      .order('display_order');

    if (!globalSections || globalSections.length === 0) {
      console.log('No global budget sections found. Please run the budget setup SQL first.');
      return;
    }

    console.log('Found global sections:', globalSections.map(s => s.name));

    // Create organization-specific sections
    const sections = [];
    for (const globalSection of globalSections) {
      const { data: section, error: sectionError } = await supabase
        .from('budget_sections')
        .insert({
          organization_id: organizationId,
          name: globalSection.name,
          display_order: globalSection.display_order,
          is_calculated: globalSection.is_calculated,
          calculation_type: globalSection.calculation_type,
        })
        .select()
        .single();

      if (sectionError) {
        console.log('Error creating section:', sectionError);
        continue;
      }

      sections.push(section);
      console.log('Created section:', section.name);
    }

    // Create test budget
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .insert({
        organization_id: organizationId,
        name: '2025 Annual Budget',
        description: 'Comprehensive test budget for 2025',
        fiscal_year: 2025,
        status: 'draft',
        created_by: null,
      })
      .select()
      .single();

    if (budgetError) {
      console.log('Error creating budget:', budgetError);
      return;
    }
    console.log('Created budget:', budget.name);

    // Define test data structure
    const testData = {
      'Revenue': {
        'Product Sales': ['SAAS Subscriptions', 'One-time Licenses', 'Add-on Services'],
        'Professional Services': ['Consulting', 'Implementation', 'Training'],
        'Other Revenue': ['Interest Income', 'Rental Income', 'Miscellaneous']
      },
      'Cost of Goods Sold': {
        'Direct Labor': ['Development Team', 'Support Team', 'Implementation Team'],
        'Direct Materials': ['Server Costs', 'Third-party APIs', 'Software Licenses'],
        'Manufacturing Overhead': ['Infrastructure', 'Quality Assurance', 'DevOps']
      },
      'Expenses': {
        'Sales & Marketing': ['Digital Advertising', 'Content Marketing', 'Sales Commissions', 'Trade Shows'],
        'Research & Development': ['Product Development', 'Research', 'Prototyping'],
        'General & Administrative': ['Office Rent', 'Utilities', 'Insurance', 'Legal Fees'],
        'Human Resources': ['Salaries', 'Benefits', 'Recruitment', 'Training']
      }
    };

    // Create categories and subcategories for each section
    for (const [sectionName, categories] of Object.entries(testData)) {
      const section = sections.find(s => s.name === sectionName);
      if (!section) continue;

      console.log(`\nProcessing section: ${sectionName}`);

      for (const [categoryName, subcategoryNames] of Object.entries(categories)) {
        // Create category
        const { data: category, error: categoryError } = await supabase
          .from('budget_categories')
          .insert({
            organization_id: organizationId,
            section_id: section.id,
            name: categoryName,
            display_order: 1,
          })
          .select()
          .single();

        if (categoryError) {
          console.log(`Error creating category ${categoryName}:`, categoryError);
          continue;
        }

        console.log(`  Created category: ${categoryName}`);

        // Create subcategories
        for (let i = 0; i < subcategoryNames.length; i++) {
          const subcategoryName = subcategoryNames[i];
          
          const { data: subcategory, error: subcategoryError } = await supabase
            .from('budget_subcategories')
            .insert({
              organization_id: organizationId,
              category_id: category.id,
              name: subcategoryName,
              display_order: i + 1,
            })
            .select()
            .single();

          if (subcategoryError) {
            console.log(`Error creating subcategory ${subcategoryName}:`, subcategoryError);
            continue;
          }

          console.log(`    Created subcategory: ${subcategoryName}`);

          // Create budget item with realistic amounts
          const baseAmount = getBaseAmount(sectionName, categoryName, subcategoryName);
          const { data: budgetItem, error: itemError } = await supabase
            .from('budget_items')
            .insert({
              budget_id: budget.id,
              organization_id: organizationId,
              section_id: section.id,
              category_id: category.id,
              subcategory_id: subcategory.id,
              amount: baseAmount,
              notes: `Test budget for ${subcategoryName}`,
              created_by: null,
            })
            .select()
            .single();

          if (itemError) {
            console.log(`Error creating budget item for ${subcategoryName}:`, itemError);
          } else {
            console.log(`      Created budget item: $${baseAmount.toLocaleString()}`);
          }
        }
      }
    }

    console.log('\n✅ Test budget data created successfully!');
    console.log(`Budget ID: ${budget.id}`);
    console.log('You can now view the budget in the application.');

  } catch (error) {
    console.error('❌ Error creating test budget data:', error);
  }
}

function getBaseAmount(sectionName, categoryName, subcategoryName) {
  // Define realistic base amounts for different types of items
  const amountMap = {
    'Revenue': {
      'Product Sales': {
        'SAAS Subscriptions': 500000,
        'One-time Licenses': 150000,
        'Add-on Services': 75000
      },
      'Professional Services': {
        'Consulting': 200000,
        'Implementation': 300000,
        'Training': 50000
      },
      'Other Revenue': {
        'Interest Income': 10000,
        'Rental Income': 25000,
        'Miscellaneous': 15000
      }
    },
    'Cost of Goods Sold': {
      'Direct Labor': {
        'Development Team': 400000,
        'Support Team': 150000,
        'Implementation Team': 200000
      },
      'Direct Materials': {
        'Server Costs': 80000,
        'Third-party APIs': 45000,
        'Software Licenses': 60000
      },
      'Manufacturing Overhead': {
        'Infrastructure': 120000,
        'Quality Assurance': 90000,
        'DevOps': 110000
      }
    },
    'Expenses': {
      'Sales & Marketing': {
        'Digital Advertising': 120000,
        'Content Marketing': 80000,
        'Sales Commissions': 180000,
        'Trade Shows': 60000
      },
      'Research & Development': {
        'Product Development': 250000,
        'Research': 100000,
        'Prototyping': 75000
      },
      'General & Administrative': {
        'Office Rent': 180000,
        'Utilities': 24000,
        'Insurance': 36000,
        'Legal Fees': 48000
      },
      'Human Resources': {
        'Salaries': 800000,
        'Benefits': 160000,
        'Recruitment': 40000,
        'Training': 30000
      }
    }
  };

  return amountMap[sectionName]?.[categoryName]?.[subcategoryName] || 50000;
}

createTestBudgetData(); 