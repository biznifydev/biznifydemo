export interface InvestmentRound {
  id: string
  organization_id: string
  round_name: string
  round_type: 'pre-seed' | 'seed' | 'series-a' | 'series-b' | 'series-c' | 'series-d' | 'ipo' | 'other'
  date: string
  amount_raised: number
  valuation: number
  lead_investor_id?: string
  status: 'active' | 'closed' | 'pending' | 'cancelled'
  use_of_funds?: string
  notes?: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface Investor {
  id: string
  organization_id: string
  name: string
  type: 'institutional' | 'angel' | 'strategic' | 'individual' | 'vc' | 'pe'
  email?: string
  phone?: string
  website?: string
  description?: string
  location?: string
  founded_year?: number
  aum?: number
  investment_focus?: string
  contact_person?: string
  contact_email?: string
  contact_phone?: string
  status: 'active' | 'inactive' | 'prospect'
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface RoundInvestor {
  id: string
  round_id: string
  investor_id: string
  investment_amount: number
  ownership_percentage?: number
  shares_issued?: number
  share_price?: number
  investment_type?: 'equity' | 'convertible_note' | 'safe' | 'preferred'
  terms?: string
  board_seat: boolean
  pro_rata_rights: boolean
  anti_dilution: boolean
  created_at: string
  updated_at: string
}

export interface CapTableEntry {
  id: string
  organization_id: string
  shareholder_name: string
  shareholder_type: 'founder' | 'investor' | 'employee' | 'advisor'
  shares_owned: number
  ownership_percentage: number
  share_class?: string
  share_price?: number
  total_value?: number
  vesting_schedule?: string
  vesting_start_date?: string
  vesting_end_date?: string
  fully_vested_date?: string
  last_updated: string
  notes?: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface InvestmentMilestone {
  id: string
  organization_id: string
  milestone_name: string
  description?: string
  target_date: string
  target_amount?: number
  current_progress: number
  status: 'planning' | 'in_progress' | 'completed' | 'cancelled'
  key_metrics?: string[]
  risks?: string[]
  dependencies?: string
  assigned_to?: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface InvestmentDocument {
  id: string
  organization_id: string
  round_id?: string
  document_name: string
  document_type: 'term_sheet' | 'pitch_deck' | 'financial_model' | 'due_diligence' | 'legal'
  file_path: string
  file_size?: number
  mime_type?: string
  version?: string
  status: 'draft' | 'final' | 'archived'
  notes?: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

export interface InvestmentNote {
  id: string
  organization_id: string
  round_id?: string
  investor_id?: string
  title: string
  content: string
  note_type?: 'meeting' | 'call' | 'email' | 'general'
  date: string
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
}

// Extended types with related data
export interface InvestmentRoundWithInvestors extends InvestmentRound {
  round_investors: (RoundInvestor & { investor: Investor })[]
  lead_investor?: Investor
}

export interface InvestorWithRounds extends Investor {
  round_investors: (RoundInvestor & { round: InvestmentRound })[]
  total_invested: number
  rounds_count: number
}

export interface CapTableWithDetails extends CapTableEntry {
  recent_activity?: string
  change_percentage?: number
}

// Form types for creating/updating
export interface CreateInvestmentRoundData {
  round_name: string
  round_type: InvestmentRound['round_type']
  date: string
  amount_raised: number
  valuation: number
  lead_investor_id?: string
  status: InvestmentRound['status']
  use_of_funds?: string
  notes?: string
}

export interface CreateInvestorData {
  name: string
  type: Investor['type']
  email?: string
  phone?: string
  website?: string
  description?: string
  location?: string
  founded_year?: number
  aum?: number
  investment_focus?: string
  contact_person?: string
  contact_email?: string
  contact_phone?: string
  status: Investor['status']
}

export interface CreateRoundInvestorData {
  round_id: string
  investor_id: string
  investment_amount: number
  ownership_percentage?: number
  shares_issued?: number
  share_price?: number
  investment_type?: RoundInvestor['investment_type']
  terms?: string
  board_seat: boolean
  pro_rata_rights: boolean
  anti_dilution: boolean
}

export interface CreateCapTableEntryData {
  shareholder_name: string
  shareholder_type: CapTableEntry['shareholder_type']
  shares_owned: number
  ownership_percentage: number
  share_class?: string
  share_price?: number
  total_value?: number
  vesting_schedule?: string
  vesting_start_date?: string
  vesting_end_date?: string
  fully_vested_date?: string
  last_updated: string
  notes?: string
}

export interface CreateInvestmentMilestoneData {
  milestone_name: string
  description?: string
  target_date: string
  target_amount?: number
  current_progress: number
  status: InvestmentMilestone['status']
  key_metrics?: string[]
  risks?: string[]
  dependencies?: string
  assigned_to?: string
}

// Summary types for dashboard
export interface InvestmentSummary {
  total_raised: number
  total_rounds: number
  current_valuation: number
  total_investors: number
  recent_rounds: InvestmentRound[]
  upcoming_milestones: InvestmentMilestone[]
}

export interface CapTableSummary {
  total_shares: number
  total_value: number
  shareholders_count: number
  average_ownership: number
  top_shareholders: CapTableEntry[]
} 