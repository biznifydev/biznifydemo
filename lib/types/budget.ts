export interface Budget {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  status: 'draft' | 'live';
  fiscal_year: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetSection {
  id: string;
  name: string;
  display_order: number;
  is_calculated: boolean;
  calculation_type?: 'gross_profit' | 'net_profit';
  created_at: string;
  updated_at: string;
}

export interface BudgetCategory {
  id: string;
  budget_id: string;
  section_id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BudgetSubcategory {
  id: string;
  budget_id: string;
  category_id: string;
  name: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BudgetItem {
  id: string;
  budget_id: string;
  organization_id: string;
  section_id: string;
  category_id: string;
  subcategory_id: string;
  amount: number;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetItemPeriod {
  id: string;
  budget_item_id: string;
  period_year: number;
  period_month: number;
  amount: number;
  created_at: string;
  updated_at: string;
}

// Extended types for UI
export interface BudgetSectionWithCategories extends BudgetSection {
  categories: BudgetCategoryWithSubcategories[];
  total_amount: number;
  monthly_totals: {
    jan: number;
    feb: number;
    mar: number;
    apr: number;
    may: number;
    jun: number;
    jul: number;
    aug: number;
    sep: number;
    oct: number;
    nov: number;
    dec: number;
  };
}

export interface BudgetCategoryWithSubcategories extends BudgetCategory {
  subcategories: BudgetSubcategoryWithItem[];
  total_amount: number;
  monthly_totals: {
    jan: number;
    feb: number;
    mar: number;
    apr: number;
    may: number;
    jun: number;
    jul: number;
    aug: number;
    sep: number;
    oct: number;
    nov: number;
    dec: number;
  };
}

export interface BudgetSubcategoryWithItem extends BudgetSubcategory {
  budget_item?: BudgetItem;
  total_amount: number;
  monthly_totals: {
    jan: number;
    feb: number;
    mar: number;
    apr: number;
    may: number;
    jun: number;
    jul: number;
    aug: number;
    sep: number;
    oct: number;
    nov: number;
    dec: number;
  };
}

export interface BudgetWithData extends Budget {
  sections: BudgetSectionWithCategories[];
  total_revenue: number;
  total_cogs: number;
  total_expenses: number;
  gross_profit: number;
  net_profit: number;
  monthly_totals: {
    revenue: { [key: string]: number };
    cogs: { [key: string]: number };
    expenses: { [key: string]: number };
    gross_profit: { [key: string]: number };
    net_profit: { [key: string]: number };
  };
}

// Form types
export interface CreateBudgetForm {
  name: string;
  description?: string;
  fiscal_year: number;
}

export interface CreateCategoryForm {
  name: string;
  section_id: string;
}

export interface CreateSubcategoryForm {
  name: string;
  category_id: string;
}

export interface UpdateBudgetItemForm {
  amount: number;
  notes?: string;
}

export interface UpdateBudgetItemPeriodForm {
  period_year: number;
  period_month: number;
  amount: number;
}

export interface UpdateBudgetItemPeriodsForm {
  periods: UpdateBudgetItemPeriodForm[];
  notes?: string;
} 