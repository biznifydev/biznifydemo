// Forecast Types - matches the database schema

export interface Forecast {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  base_budget_id: string;
  fiscal_year: number;
  status: 'draft' | 'active' | 'archived';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ForecastEntry {
  id: string;
  forecast_id: string;
  section_id: string;
  category_id: string;
  subcategory_id: string;
  base_budget_item_id?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ForecastEntryPeriod {
  id: string;
  forecast_entry_id: string;
  period_year: number;
  period_month: number;
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface ForecastEditHistory {
  id: string;
  forecast_id: string;
  forecast_entry_id?: string;
  field_name: string;
  old_value?: string;
  new_value?: string;
  period_year?: number;
  period_month?: number;
  edited_by: string;
  edited_at: string;
}

// Extended types with relationships
export interface ForecastWithEntries extends Forecast {
  forecast_entries: ForecastEntryWithPeriods[];
}

export interface ForecastEntryWithPeriods extends ForecastEntry {
  periods: ForecastEntryPeriod[];
  section: {
    id: string;
    name: string;
    order: number;
  };
  category: {
    id: string;
    name: string;
    order: number;
  };
  subcategory: {
    id: string;
    name: string;
    order: number;
  };
  base_budget_item?: {
    id: string;
    name: string;
    notes?: string;
  };
}

// Types for creating/updating forecasts
export interface CreateForecastRequest {
  name: string;
  description?: string;
  base_budget_id: string;
  fiscal_year: number;
}

export interface UpdateForecastRequest {
  name?: string;
  description?: string;
  status?: 'draft' | 'active' | 'archived';
}

export interface UpdateForecastEntryPeriodRequest {
  amount: number;
}

// Types for forecast table data
export interface ForecastTableRow {
  id: string;
  type: 'section' | 'category' | 'subcategory' | 'summary';
  name: string;
  section_id?: string;
  category_id?: string;
  subcategory_id?: string;
  isExpanded: boolean;
  canExpand: boolean;
  budgetValues: { [key: string]: number }; // month -> amount
  forecastValues: { [key: string]: number }; // month -> amount
  budgetTotal: number;
  forecastTotal: number;
  level: number; // 0=section, 1=category, 2=subcategory
}

// Types for forecast analysis
export interface ForecastAnalysisRow {
  id: string;
  type: 'section' | 'category' | 'subcategory' | 'summary';
  name: string;
  section_id?: string;
  category_id?: string;
  subcategory_id?: string;
  isExpanded: boolean;
  canExpand: boolean;
  budget: number;
  actual: number;
  variance: number;
  variancePercent: number;
  ytdBudget: number;
  ytdActual: number;
  ytdVariance: number;
  ytdVariancePercent: number;
  level: number;
} 