const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createSampleBudget() {
  console.log('Creating sample budget data...');

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

    // Create a sample budget
    const { data: budget, error: budgetError } = await supabase
      .from('budgets')
      .insert({
        organization_id: organizationId,
        name: '2025 Annual Budget',
        description: 'Sample budget for 2025',
        fiscal_year: 2025,
        status: 'draft',
        created_by: null, // We'll set this to null for sample data
      })
      .select()
      .single();

    if (budgetError) {
      console.log('Error creating budget:', budgetError);
      return;
    }
    console.log('Created budget:', budget.id);

    // Get budget sections (they were created with NULL organization_id, so we need to copy them)
    const { data: globalSections, error: globalSectionsError } = await supabase
      .from('budget_sections')
      .select('*')
      .is('organization_id', null)
      .order('display_order');

    if (globalSectionsError) {
      console.log('Error getting global sections:', globalSectionsError);
      return;
    }

    if (!globalSections || globalSections.length === 0) {
      console.log('No global budget sections found');
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

    // Create sample categories for each section
    const sampleCategories = [
      // Revenue categories
      { section_name: 'Revenue', name: 'Sales' },
      { section_name: 'Revenue', name: 'Services' },
      { section_name: 'Revenue', name: 'Other Income' },
      
      // COGS categories
      { section_name: 'Cost of Goods Sold', name: 'Direct Materials' },
      { section_name: 'Cost of Goods Sold', name: 'Direct Labor' },
      { section_name: 'Cost of Goods Sold', name: 'Manufacturing Overhead' },
      
      // Expense categories
      { section_name: 'Expenses', name: 'Marketing' },
      { section_name: 'Expenses', name: 'Sales' },
      { section_name: 'Expenses', name: 'Administrative' },
      { section_name: 'Expenses', name: 'Research & Development' },
    ];

    for (const categoryData of sampleCategories) {
      const section = sections.find(s => s.name === categoryData.section_name);
      if (!section) continue;

      const { data: category, error: categoryError } = await supabase
        .from('budget_categories')
        .insert({
          organization_id: organizationId,
          section_id: section.id,
          name: categoryData.name,
          display_order: 1,
        })
        .select()
        .single();

      if (categoryError) {
        console.log('Error creating category:', categoryError);
        continue;
      }

      console.log('Created category:', category.name);

      // Create sample subcategories
      const subcategoryNames = categoryData.name === 'Sales' ? ['Product Sales', 'Consulting'] :
                              categoryData.name === 'Services' ? ['Support', 'Training'] :
                              categoryData.name === 'Marketing' ? ['Digital Ads', 'Events', 'Content'] :
                              categoryData.name === 'Administrative' ? ['Office Supplies', 'Software', 'Insurance'] :
                              ['General'];

      for (let i = 0; i < subcategoryNames.length; i++) {
        const { data: subcategory, error: subcategoryError } = await supabase
          .from('budget_subcategories')
          .insert({
            organization_id: organizationId,
            category_id: category.id,
            name: subcategoryNames[i],
            display_order: i + 1,
          })
          .select()
          .single();

        if (subcategoryError) {
          console.log('Error creating subcategory:', subcategoryError);
          continue;
        }

        console.log('Created subcategory:', subcategory.name);

        // Create sample budget item
        const { data: budgetItem, error: itemError } = await supabase
          .from('budget_items')
          .insert({
            budget_id: budget.id,
            organization_id: organizationId,
            section_id: section.id,
            category_id: category.id,
            subcategory_id: subcategory.id,
            amount: Math.floor(Math.random() * 100000) + 10000, // Random amount between 10k and 110k
            notes: `Sample budget for ${subcategory.name}`,
            created_by: null,
          })
          .select()
          .single();

        if (itemError) {
          console.log('Error creating budget item:', itemError);
        } else {
          console.log('Created budget item for:', subcategory.name);
        }
      }
    }

    console.log('✅ Sample budget created successfully!');
  } catch (error) {
    console.error('❌ Error creating sample budget:', error);
  }
}

createSampleBudget(); 