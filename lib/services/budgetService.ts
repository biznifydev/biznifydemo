import { supabase } from '../supabase';
import {
  Budget,
  BudgetSection,
  BudgetCategory,
  BudgetSubcategory,
  BudgetItem,
  BudgetItemPeriod,
  BudgetWithData,
  BudgetSectionWithCategories,
  BudgetCategoryWithSubcategories,
  BudgetSubcategoryWithItem,
  CreateBudgetForm,
  CreateCategoryForm,
  CreateSubcategoryForm,
  UpdateBudgetItemForm,
  UpdateBudgetItemPeriodForm,
  UpdateBudgetItemPeriodsForm,
} from '../types/budget';

export class BudgetService {
  // Budget CRUD operations
  static async createBudget(organizationId: string, data: CreateBudgetForm): Promise<Budget> {
    const { data: budget, error } = await supabase
      .from('budgets')
      .insert({
        organization_id: organizationId,
        name: data.name,
        description: data.description,
        fiscal_year: data.fiscal_year,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return budget;
  }

  static async getBudgets(organizationId: string): Promise<Budget[]> {
    const { data: budgets, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return budgets;
  }

  static async getBudget(budgetId: string): Promise<Budget> {
    const { data: budget, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('id', budgetId)
      .single();

    if (error) throw error;
    return budget;
  }

  static async updateBudget(budgetId: string, updates: Partial<Budget>): Promise<Budget> {
    const { data: budget, error } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', budgetId)
      .select()
      .single();

    if (error) throw error;
    return budget;
  }

  static async updateBudgetStatus(budgetId: string, status: 'draft' | 'live'): Promise<Budget> {
    const { data: budget, error } = await supabase
      .from('budgets')
      .update({ status })
      .eq('id', budgetId)
      .select()
      .single();

    if (error) throw error;
    return budget;
  }

  static async deleteBudget(budgetId: string): Promise<void> {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId);

    if (error) throw error;
  }

  // Budget sections operations
  static async getBudgetSections(): Promise<BudgetSection[]> {
    const { data: sections, error } = await supabase
      .from('budget_sections')
      .select('*')
      .order('display_order');

    if (error) throw error;
    return sections;
  }

  // Budget categories operations
  static async createCategory(budgetId: string, data: CreateCategoryForm): Promise<BudgetCategory> {
    // Get the next display order for this section in this budget
    const { data: existingCategories } = await supabase
      .from('budget_categories')
      .select('display_order')
      .eq('budget_id', budgetId)
      .eq('section_id', data.section_id)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = existingCategories?.[0]?.display_order + 1 || 1;

    const { data: category, error } = await supabase
      .from('budget_categories')
      .insert({
        budget_id: budgetId,
        section_id: data.section_id,
        name: data.name,
        display_order: nextOrder,
      })
      .select()
      .single();

    if (error) throw error;
    return category;
  }

  static async getCategories(budgetId: string, sectionId?: string): Promise<BudgetCategory[]> {
    let query = supabase
      .from('budget_categories')
      .select('*')
      .eq('budget_id', budgetId)
      .eq('is_active', true);

    if (sectionId) {
      query = query.eq('section_id', sectionId);
    }

    const { data: categories, error } = await query.order('display_order');

    if (error) throw error;
    return categories;
  }

  static async updateCategory(categoryId: string, updates: { name?: string }): Promise<BudgetCategory> {
    const { data: category, error } = await supabase
      .from('budget_categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;
    return category;
  }

  static async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('budget_categories')
      .update({ is_active: false })
      .eq('id', categoryId);

    if (error) throw error;
  }

  // Budget subcategories operations
  static async createSubcategory(budgetId: string, data: CreateSubcategoryForm): Promise<BudgetSubcategory> {
    // Get the next display order for this category in this budget
    const { data: existingSubcategories } = await supabase
      .from('budget_subcategories')
      .select('display_order')
      .eq('budget_id', budgetId)
      .eq('category_id', data.category_id)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder = existingSubcategories?.[0]?.display_order + 1 || 1;

    const { data: subcategory, error } = await supabase
      .from('budget_subcategories')
      .insert({
        budget_id: budgetId,
        category_id: data.category_id,
        name: data.name,
        display_order: nextOrder,
      })
      .select()
      .single();

    if (error) throw error;
    return subcategory;
  }

  static async getSubcategories(budgetId: string, categoryId?: string): Promise<BudgetSubcategory[]> {
    let query = supabase
      .from('budget_subcategories')
      .select('*')
      .eq('budget_id', budgetId)
      .eq('is_active', true);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    const { data: subcategories, error } = await query.order('display_order');

    if (error) throw error;
    return subcategories;
  }

  static async updateSubcategory(subcategoryId: string, updates: { name?: string }): Promise<BudgetSubcategory> {
    const { data: subcategory, error } = await supabase
      .from('budget_subcategories')
      .update(updates)
      .eq('id', subcategoryId)
      .select()
      .single();

    if (error) throw error;
    return subcategory;
  }

  static async deleteSubcategory(subcategoryId: string): Promise<void> {
    const { error } = await supabase
      .from('budget_subcategories')
      .update({ is_active: false })
      .eq('id', subcategoryId);

    if (error) throw error;
  }

  // Budget items operations
  static async createBudgetItem(budgetId: string, organizationId: string, data: {
    section_id: string;
    category_id: string;
    subcategory_id: string;
    amount: number;
    notes?: string;
  }): Promise<BudgetItem> {
    const { data: item, error } = await supabase
      .from('budget_items')
      .insert({
        budget_id: budgetId,
        organization_id: organizationId,
        section_id: data.section_id,
        category_id: data.category_id,
        subcategory_id: data.subcategory_id,
        amount: data.amount,
        notes: data.notes,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .select()
      .single();

    if (error) throw error;
    return item;
  }

  static async updateBudgetItem(itemId: string, data: UpdateBudgetItemForm): Promise<BudgetItem> {
    const { data: item, error } = await supabase
      .from('budget_items')
      .update({
        amount: data.amount,
        notes: data.notes,
      })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return item;
  }

  static async updateBudgetItemPeriods(itemId: string, data: UpdateBudgetItemPeriodsForm): Promise<BudgetItem> {
    // First, update or insert each period
    for (const period of data.periods) {
      // Check if period already exists
      const { data: existingPeriod, error: selectError } = await supabase
        .from('budget_item_periods')
        .select('id')
        .eq('budget_item_id', itemId)
        .eq('period_year', period.period_year)
        .eq('period_month', period.period_month)
        .single();

      if (selectError && selectError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw selectError;
      }

      if (existingPeriod) {
        // Update existing period
        const { error: updateError } = await supabase
          .from('budget_item_periods')
          .update({ amount: period.amount })
          .eq('id', existingPeriod.id);

        if (updateError) throw updateError;
      } else {
        // Insert new period
        const { error: insertError } = await supabase
          .from('budget_item_periods')
          .insert({
            budget_item_id: itemId,
            period_year: period.period_year,
            period_month: period.period_month,
            amount: period.amount
          });

        if (insertError) throw insertError;
      }
    }

    // Update notes if provided
    if (data.notes !== undefined) {
      const { error: updateError } = await supabase
        .from('budget_items')
        .update({ notes: data.notes })
        .eq('id', itemId);

      if (updateError) throw updateError;
    }

    // Return the updated budget item (amount will be automatically calculated by trigger)
    const { data: item, error } = await supabase
      .from('budget_items')
      .select()
      .eq('id', itemId)
      .single();

    if (error) throw error;
    return item;
  }

  static async getBudgetItemPeriods(itemId: string, year?: number): Promise<BudgetItemPeriod[]> {
    let query = supabase
      .from('budget_item_periods')
      .select('*')
      .eq('budget_item_id', itemId)
      .order('period_year', { ascending: true })
      .order('period_month', { ascending: true });

    if (year) {
      query = query.eq('period_year', year);
    }

    const { data: periods, error } = await query;

    if (error) throw error;
    return periods;
  }

  static async getBudgetItems(budgetId: string): Promise<BudgetItem[]> {
    const { data: items, error } = await supabase
      .from('budget_items')
      .select('*')
      .eq('budget_id', budgetId);

    if (error) throw error;
    return items;
  }

  // Complex queries for UI
  static async getBudgetWithData(budgetId: string, year: number = 2025): Promise<BudgetWithData> {
    // Get the budget
    const budget = await this.getBudget(budgetId);
    
    // Get all sections for the organization
    const sections = await this.getBudgetSections();
    
    // Get all categories for the organization
    const categories = await this.getCategories(budgetId);
    
    // Get all subcategories for the organization
    const subcategories = await this.getSubcategories(budgetId);
    
    // Get all budget items for this budget
    const budgetItems = await this.getBudgetItems(budgetId);

    // Get all periods for this budget and year
    const { data: periods, error: periodsError } = await supabase
      .from('budget_item_periods')
      .select('*')
      .in('budget_item_id', budgetItems.map(item => item.id))
      .eq('period_year', year)
      .order('period_month');

    if (periodsError) throw periodsError;

    // Create a map for quick lookup of periods by budget_item_id and month
    const periodsMap = new Map<string, Map<number, number>>();
    periods.forEach(period => {
      if (!periodsMap.has(period.budget_item_id)) {
        periodsMap.set(period.budget_item_id, new Map());
      }
      periodsMap.get(period.budget_item_id)!.set(period.period_month, period.amount);
    });

    // Helper function to get monthly totals for a budget item
    const getMonthlyTotals = (budgetItemId: string) => {
      const itemPeriods = periodsMap.get(budgetItemId);
      return {
        jan: itemPeriods?.get(1) || 0,
        feb: itemPeriods?.get(2) || 0,
        mar: itemPeriods?.get(3) || 0,
        apr: itemPeriods?.get(4) || 0,
        may: itemPeriods?.get(5) || 0,
        jun: itemPeriods?.get(6) || 0,
        jul: itemPeriods?.get(7) || 0,
        aug: itemPeriods?.get(8) || 0,
        sep: itemPeriods?.get(9) || 0,
        oct: itemPeriods?.get(10) || 0,
        nov: itemPeriods?.get(11) || 0,
        dec: itemPeriods?.get(12) || 0,
      };
    };

    // Build the nested structure
    const sectionsWithData: BudgetSectionWithCategories[] = sections.map(section => {
      const sectionCategories = categories.filter(cat => cat.section_id === section.id);
      
      const categoriesWithData: BudgetCategoryWithSubcategories[] = sectionCategories.map(category => {
        const categorySubcategories = subcategories.filter(sub => sub.category_id === category.id);
        
        const subcategoriesWithData: BudgetSubcategoryWithItem[] = categorySubcategories.map(subcategory => {
          const budgetItem = budgetItems.find(item => item.subcategory_id === subcategory.id);
          const monthly_totals = budgetItem ? getMonthlyTotals(budgetItem.id) : {
            jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
            jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
          };

          const total_amount = budgetItem?.amount || 0;

          return {
            ...subcategory,
            budget_item: budgetItem,
            total_amount,
            monthly_totals,
          };
        });

        // Calculate category totals
        const total_amount = subcategoriesWithData.reduce((sum, sub) => sum + sub.total_amount, 0);
        const monthly_totals = {
          jan: subcategoriesWithData.reduce((sum, sub) => sum + sub.monthly_totals.jan, 0),
          feb: subcategoriesWithData.reduce((sum, sub) => sum + sub.monthly_totals.feb, 0),
          mar: subcategoriesWithData.reduce((sum, sub) => sum + sub.monthly_totals.mar, 0),
          apr: subcategoriesWithData.reduce((sum, sub) => sum + sub.monthly_totals.apr, 0),
          may: subcategoriesWithData.reduce((sum, sub) => sum + sub.monthly_totals.may, 0),
          jun: subcategoriesWithData.reduce((sum, sub) => sum + sub.monthly_totals.jun, 0),
          jul: subcategoriesWithData.reduce((sum, sub) => sum + sub.monthly_totals.jul, 0),
          aug: subcategoriesWithData.reduce((sum, sub) => sum + sub.monthly_totals.aug, 0),
          sep: subcategoriesWithData.reduce((sum, sub) => sum + sub.monthly_totals.sep, 0),
          oct: subcategoriesWithData.reduce((sum, sub) => sum + sub.monthly_totals.oct, 0),
          nov: subcategoriesWithData.reduce((sum, sub) => sum + sub.monthly_totals.nov, 0),
          dec: subcategoriesWithData.reduce((sum, sub) => sum + sub.monthly_totals.dec, 0),
        };

        return {
          ...category,
          subcategories: subcategoriesWithData,
          total_amount,
          monthly_totals,
        };
      });

      // Calculate section totals
      const total_amount = categoriesWithData.reduce((sum, cat) => sum + cat.total_amount, 0);
      const monthly_totals = {
        jan: categoriesWithData.reduce((sum, cat) => sum + cat.monthly_totals.jan, 0),
        feb: categoriesWithData.reduce((sum, cat) => sum + cat.monthly_totals.feb, 0),
        mar: categoriesWithData.reduce((sum, cat) => sum + cat.monthly_totals.mar, 0),
        apr: categoriesWithData.reduce((sum, cat) => sum + cat.monthly_totals.apr, 0),
        may: categoriesWithData.reduce((sum, cat) => sum + cat.monthly_totals.may, 0),
        jun: categoriesWithData.reduce((sum, cat) => sum + cat.monthly_totals.jun, 0),
        jul: categoriesWithData.reduce((sum, cat) => sum + cat.monthly_totals.jul, 0),
        aug: categoriesWithData.reduce((sum, cat) => sum + cat.monthly_totals.aug, 0),
        sep: categoriesWithData.reduce((sum, cat) => sum + cat.monthly_totals.sep, 0),
        oct: categoriesWithData.reduce((sum, cat) => sum + cat.monthly_totals.oct, 0),
        nov: categoriesWithData.reduce((sum, cat) => sum + cat.monthly_totals.nov, 0),
        dec: categoriesWithData.reduce((sum, cat) => sum + cat.monthly_totals.dec, 0),
      };

      return {
        ...section,
        categories: categoriesWithData,
        total_amount,
        monthly_totals,
      };
    });

    // Calculate totals
    const revenueSection = sectionsWithData.find(s => s.name === 'Revenue');
    const cogsSection = sectionsWithData.find(s => s.name === 'Cost of Goods Sold');
    const expensesSection = sectionsWithData.find(s => s.name === 'Expenses');

    const total_revenue = revenueSection?.total_amount || 0;
    const total_cogs = cogsSection?.total_amount || 0;
    const total_expenses = expensesSection?.total_amount || 0;
    const gross_profit = total_revenue - total_cogs;
    const net_profit = gross_profit - total_expenses;

    // Calculate monthly totals for the entire budget
    const monthly_totals = {
      revenue: {
        jan: revenueSection?.monthly_totals.jan || 0,
        feb: revenueSection?.monthly_totals.feb || 0,
        mar: revenueSection?.monthly_totals.mar || 0,
        apr: revenueSection?.monthly_totals.apr || 0,
        may: revenueSection?.monthly_totals.may || 0,
        jun: revenueSection?.monthly_totals.jun || 0,
        jul: revenueSection?.monthly_totals.jul || 0,
        aug: revenueSection?.monthly_totals.aug || 0,
        sep: revenueSection?.monthly_totals.sep || 0,
        oct: revenueSection?.monthly_totals.oct || 0,
        nov: revenueSection?.monthly_totals.nov || 0,
        dec: revenueSection?.monthly_totals.dec || 0,
      },
      cogs: {
        jan: cogsSection?.monthly_totals.jan || 0,
        feb: cogsSection?.monthly_totals.feb || 0,
        mar: cogsSection?.monthly_totals.mar || 0,
        apr: cogsSection?.monthly_totals.apr || 0,
        may: cogsSection?.monthly_totals.may || 0,
        jun: cogsSection?.monthly_totals.jun || 0,
        jul: cogsSection?.monthly_totals.jul || 0,
        aug: cogsSection?.monthly_totals.aug || 0,
        sep: cogsSection?.monthly_totals.sep || 0,
        oct: cogsSection?.monthly_totals.oct || 0,
        nov: cogsSection?.monthly_totals.nov || 0,
        dec: cogsSection?.monthly_totals.dec || 0,
      },
      expenses: {
        jan: expensesSection?.monthly_totals.jan || 0,
        feb: expensesSection?.monthly_totals.feb || 0,
        mar: expensesSection?.monthly_totals.mar || 0,
        apr: expensesSection?.monthly_totals.apr || 0,
        may: expensesSection?.monthly_totals.may || 0,
        jun: expensesSection?.monthly_totals.jun || 0,
        jul: expensesSection?.monthly_totals.jul || 0,
        aug: expensesSection?.monthly_totals.aug || 0,
        sep: expensesSection?.monthly_totals.sep || 0,
        oct: expensesSection?.monthly_totals.oct || 0,
        nov: expensesSection?.monthly_totals.nov || 0,
        dec: expensesSection?.monthly_totals.dec || 0,
      },
      gross_profit: {
        jan: (revenueSection?.monthly_totals.jan || 0) - (cogsSection?.monthly_totals.jan || 0),
        feb: (revenueSection?.monthly_totals.feb || 0) - (cogsSection?.monthly_totals.feb || 0),
        mar: (revenueSection?.monthly_totals.mar || 0) - (cogsSection?.monthly_totals.mar || 0),
        apr: (revenueSection?.monthly_totals.apr || 0) - (cogsSection?.monthly_totals.apr || 0),
        may: (revenueSection?.monthly_totals.may || 0) - (cogsSection?.monthly_totals.may || 0),
        jun: (revenueSection?.monthly_totals.jun || 0) - (cogsSection?.monthly_totals.jun || 0),
        jul: (revenueSection?.monthly_totals.jul || 0) - (cogsSection?.monthly_totals.jul || 0),
        aug: (revenueSection?.monthly_totals.aug || 0) - (cogsSection?.monthly_totals.aug || 0),
        sep: (revenueSection?.monthly_totals.sep || 0) - (cogsSection?.monthly_totals.sep || 0),
        oct: (revenueSection?.monthly_totals.oct || 0) - (cogsSection?.monthly_totals.oct || 0),
        nov: (revenueSection?.monthly_totals.nov || 0) - (cogsSection?.monthly_totals.nov || 0),
        dec: (revenueSection?.monthly_totals.dec || 0) - (cogsSection?.monthly_totals.dec || 0),
      },
      net_profit: {
        jan: ((revenueSection?.monthly_totals.jan || 0) - (cogsSection?.monthly_totals.jan || 0)) - (expensesSection?.monthly_totals.jan || 0),
        feb: ((revenueSection?.monthly_totals.feb || 0) - (cogsSection?.monthly_totals.feb || 0)) - (expensesSection?.monthly_totals.feb || 0),
        mar: ((revenueSection?.monthly_totals.mar || 0) - (cogsSection?.monthly_totals.mar || 0)) - (expensesSection?.monthly_totals.mar || 0),
        apr: ((revenueSection?.monthly_totals.apr || 0) - (cogsSection?.monthly_totals.apr || 0)) - (expensesSection?.monthly_totals.apr || 0),
        may: ((revenueSection?.monthly_totals.may || 0) - (cogsSection?.monthly_totals.may || 0)) - (expensesSection?.monthly_totals.may || 0),
        jun: ((revenueSection?.monthly_totals.jun || 0) - (cogsSection?.monthly_totals.jun || 0)) - (expensesSection?.monthly_totals.jun || 0),
        jul: ((revenueSection?.monthly_totals.jul || 0) - (cogsSection?.monthly_totals.jul || 0)) - (expensesSection?.monthly_totals.jul || 0),
        aug: ((revenueSection?.monthly_totals.aug || 0) - (cogsSection?.monthly_totals.aug || 0)) - (expensesSection?.monthly_totals.aug || 0),
        sep: ((revenueSection?.monthly_totals.sep || 0) - (cogsSection?.monthly_totals.sep || 0)) - (expensesSection?.monthly_totals.sep || 0),
        oct: ((revenueSection?.monthly_totals.oct || 0) - (cogsSection?.monthly_totals.oct || 0)) - (expensesSection?.monthly_totals.oct || 0),
        nov: ((revenueSection?.monthly_totals.nov || 0) - (cogsSection?.monthly_totals.nov || 0)) - (expensesSection?.monthly_totals.nov || 0),
        dec: ((revenueSection?.monthly_totals.dec || 0) - (cogsSection?.monthly_totals.dec || 0)) - (expensesSection?.monthly_totals.dec || 0),
      },
    };

    return {
      ...budget,
      sections: sectionsWithData,
      total_revenue,
      total_cogs,
      total_expenses,
      gross_profit,
      net_profit,
      monthly_totals,
    };
  }

  // Utility methods
  static async lockBudget(budgetId: string): Promise<Budget> {
    return this.updateBudget(budgetId, { status: 'locked' });
  }

  static async unlockBudget(budgetId: string): Promise<Budget> {
    return this.updateBudget(budgetId, { status: 'draft' });
  }

  static async duplicateBudget(budgetId: string, newName: string): Promise<Budget> {
    const originalBudget = await this.getBudgetWithData(budgetId);
    
    // Create new budget
    const newBudget = await this.createBudget(originalBudget.organization_id, {
      name: newName,
      description: originalBudget.description,
      fiscal_year: originalBudget.fiscal_year,
    });

    // Copy all budget items
    for (const section of originalBudget.sections) {
      for (const category of section.categories) {
        for (const subcategory of category.subcategories) {
          if (subcategory.budget_item) {
            await this.createBudgetItem(newBudget.id, newBudget.organization_id, {
              section_id: subcategory.budget_item.section_id,
              category_id: subcategory.budget_item.category_id,
              subcategory_id: subcategory.budget_item.subcategory_id,
              amount: subcategory.budget_item.amount,
              notes: subcategory.budget_item.notes,
            });
          }
        }
      }
    }

    return newBudget;
  }
} 