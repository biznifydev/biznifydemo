export interface FinancialAccount {
  id: string
  organization_id: string
  name: string
  code?: string
  type: 'revenue' | 'expense' | 'asset' | 'liability' | 'equity'
  category: 'income_statement' | 'balance_sheet' | 'cash_flow'
  parent_id?: string
  level: number // 0=section, 1=category, 2=subcategory, 3=detail
  sort_order: number
  is_active: boolean
  is_manual: boolean
  description?: string
  created_at: string
  updated_at: string
  children?: FinancialAccount[]
  parent?: FinancialAccount
}

export interface FinancialData {
  id: string
  organization_id: string
  account_id: string
  year: number
  month: number
  amount: number
  is_manual: boolean
  notes?: string
  created_by: string
  created_at: string
  updated_at: string
  account?: FinancialAccount
}

export interface FinancialPeriod {
  id: string
  organization_id: string
  name: string
  start_date: string
  end_date: string
  is_active: boolean
  is_closed: boolean
  created_at: string
  updated_at: string
}

export interface PnLRow {
  account: FinancialAccount
  monthlyData: { [month: number]: number }
  total: number
  isExpanded: boolean
  level: number
}

export interface PnLData {
  year: number
  months: number[]
  rows: PnLRow[]
  totals: {
    revenue: number
    expenses: number
    grossProfit: number
    netIncome: number
  }
}

export type AccountType = 'revenue' | 'expense' | 'asset' | 'liability' | 'equity'
export type CategoryType = 'income_statement' | 'balance_sheet' | 'cash_flow' 