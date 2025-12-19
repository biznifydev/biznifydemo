import { supabase } from '@/lib/supabase'
import {
  InvestmentRound,
  Investor,
  RoundInvestor,
  CapTableEntry,
  InvestmentMilestone,
  InvestmentDocument,
  InvestmentNote,
  InvestmentRoundWithInvestors,
  InvestorWithRounds,
  CreateInvestmentRoundData,
  CreateInvestorData,
  CreateRoundInvestorData,
  CreateCapTableEntryData,
  CreateInvestmentMilestoneData,
  InvestmentSummary,
  CapTableSummary
} from '@/lib/types/investment'

export class InvestmentService {
  // Investment Rounds
  static async getInvestmentRounds(organizationId: string): Promise<InvestmentRound[]> {
    const { data, error } = await supabase
      .from('investment_rounds')
      .select('*')
      .eq('organization_id', organizationId)
      .order('date', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getInvestmentRound(id: string): Promise<InvestmentRound | null> {
    const { data, error } = await supabase
      .from('investment_rounds')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async getInvestmentRoundWithInvestors(id: string): Promise<InvestmentRoundWithInvestors | null> {
    const { data, error } = await supabase
      .from('investment_rounds')
      .select(`
        *,
        round_investors (
          *,
          investor (*)
        ),
        lead_investor:investors!investment_rounds_lead_investor_id_fkey (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async createInvestmentRound(organizationId: string, roundData: CreateInvestmentRoundData): Promise<InvestmentRound> {
    const { data, error } = await supabase
      .from('investment_rounds')
      .insert({
        organization_id: organizationId,
        ...roundData,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateInvestmentRound(id: string, roundData: Partial<CreateInvestmentRoundData>): Promise<InvestmentRound> {
    const { data, error } = await supabase
      .from('investment_rounds')
      .update({
        ...roundData,
        updated_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteInvestmentRound(id: string): Promise<void> {
    const { error } = await supabase
      .from('investment_rounds')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Investors
  static async getInvestors(organizationId: string): Promise<Investor[]> {
    const { data, error } = await supabase
      .from('investors')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async getInvestor(id: string): Promise<Investor | null> {
    const { data, error } = await supabase
      .from('investors')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async getInvestorWithRounds(id: string): Promise<InvestorWithRounds | null> {
    const { data, error } = await supabase
      .from('investors')
      .select(`
        *,
        round_investors (
          *,
          round (*)
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    
    if (data) {
      const total_invested = data.round_investors.reduce((sum: number, ri: typeof data.round_investors[0]) => sum + ri.investment_amount, 0)
      const rounds_count = data.round_investors.length
      return { ...data, total_invested, rounds_count }
    }
    
    return null
  }

  static async createInvestor(organizationId: string, investorData: CreateInvestorData): Promise<Investor> {
    const { data, error } = await supabase
      .from('investors')
      .insert({
        organization_id: organizationId,
        ...investorData,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateInvestor(id: string, investorData: Partial<CreateInvestorData>): Promise<Investor> {
    const { data, error } = await supabase
      .from('investors')
      .update({
        ...investorData,
        updated_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteInvestor(id: string): Promise<void> {
    const { error } = await supabase
      .from('investors')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Round Investors
  static async getRoundInvestors(roundId: string): Promise<RoundInvestor[]> {
    const { data, error } = await supabase
      .from('round_investors')
      .select('*')
      .eq('round_id', roundId)
      .order('investment_amount', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createRoundInvestor(roundInvestorData: CreateRoundInvestorData): Promise<RoundInvestor> {
    const { data, error } = await supabase
      .from('round_investors')
      .insert(roundInvestorData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateRoundInvestor(id: string, roundInvestorData: Partial<CreateRoundInvestorData>): Promise<RoundInvestor> {
    const { data, error } = await supabase
      .from('round_investors')
      .update(roundInvestorData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteRoundInvestor(id: string): Promise<void> {
    const { error } = await supabase
      .from('round_investors')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Cap Table
  static async getCapTable(organizationId: string): Promise<CapTableEntry[]> {
    const { data, error } = await supabase
      .from('cap_table')
      .select('*')
      .eq('organization_id', organizationId)
      .order('ownership_percentage', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createCapTableEntry(organizationId: string, capTableData: CreateCapTableEntryData): Promise<CapTableEntry> {
    const { data, error } = await supabase
      .from('cap_table')
      .insert({
        organization_id: organizationId,
        ...capTableData,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateCapTableEntry(id: string, capTableData: Partial<CreateCapTableEntryData>): Promise<CapTableEntry> {
    const { data, error } = await supabase
      .from('cap_table')
      .update({
        ...capTableData,
        updated_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteCapTableEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('cap_table')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Investment Milestones
  static async getInvestmentMilestones(organizationId: string): Promise<InvestmentMilestone[]> {
    const { data, error } = await supabase
      .from('investment_milestones')
      .select('*')
      .eq('organization_id', organizationId)
      .order('target_date', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async createInvestmentMilestone(organizationId: string, milestoneData: CreateInvestmentMilestoneData): Promise<InvestmentMilestone> {
    const { data, error } = await supabase
      .from('investment_milestones')
      .insert({
        organization_id: organizationId,
        ...milestoneData,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateInvestmentMilestone(id: string, milestoneData: Partial<CreateInvestmentMilestoneData>): Promise<InvestmentMilestone> {
    const { data, error } = await supabase
      .from('investment_milestones')
      .update({
        ...milestoneData,
        updated_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteInvestmentMilestone(id: string): Promise<void> {
    const { error } = await supabase
      .from('investment_milestones')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Investment Documents
  static async getInvestmentDocuments(organizationId: string, roundId?: string): Promise<InvestmentDocument[]> {
    let query = supabase
      .from('investment_documents')
      .select('*')
      .eq('organization_id', organizationId)

    if (roundId) {
      query = query.eq('round_id', roundId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createInvestmentDocument(organizationId: string, documentData: Omit<InvestmentDocument, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): Promise<InvestmentDocument> {
    const { data, error } = await supabase
      .from('investment_documents')
      .insert({
        organization_id: organizationId,
        ...documentData,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteInvestmentDocument(id: string): Promise<void> {
    const { error } = await supabase
      .from('investment_documents')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Investment Notes
  static async getInvestmentNotes(organizationId: string, roundId?: string, investorId?: string): Promise<InvestmentNote[]> {
    let query = supabase
      .from('investment_notes')
      .select('*')
      .eq('organization_id', organizationId)

    if (roundId) {
      query = query.eq('round_id', roundId)
    }

    if (investorId) {
      query = query.eq('investor_id', investorId)
    }

    const { data, error } = await query.order('date', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createInvestmentNote(organizationId: string, noteData: Omit<InvestmentNote, 'id' | 'organization_id' | 'created_at' | 'updated_at'>): Promise<InvestmentNote> {
    const { data, error } = await supabase
      .from('investment_notes')
      .insert({
        organization_id: organizationId,
        ...noteData,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateInvestmentNote(id: string, noteData: Partial<Omit<InvestmentNote, 'id' | 'organization_id' | 'created_at' | 'updated_at'>>): Promise<InvestmentNote> {
    const { data, error } = await supabase
      .from('investment_notes')
      .update({
        ...noteData,
        updated_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteInvestmentNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('investment_notes')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Summary and Analytics
  static async getInvestmentSummary(organizationId: string): Promise<InvestmentSummary> {
    const [rounds, milestones] = await Promise.all([
      this.getInvestmentRounds(organizationId),
      this.getInvestmentMilestones(organizationId)
    ])

    const total_raised = rounds.reduce((sum, round) => sum + round.amount_raised, 0)
    const total_rounds = rounds.length
    const current_valuation = rounds.length > 0 ? rounds[0].valuation : 0
    const total_investors = new Set(rounds.flatMap(round => round.lead_investor_id ? [round.lead_investor_id] : [])).size

    const recent_rounds = rounds.slice(0, 5)
    const upcoming_milestones = milestones
      .filter(m => m.status === 'planning' || m.status === 'in_progress')
      .slice(0, 5)

    return {
      total_raised,
      total_rounds,
      current_valuation,
      total_investors,
      recent_rounds,
      upcoming_milestones
    }
  }

  static async getCapTableSummary(organizationId: string): Promise<CapTableSummary> {
    const capTable = await this.getCapTable(organizationId)

    const total_shares = capTable.reduce((sum, entry) => sum + entry.shares_owned, 0)
    const total_value = capTable.reduce((sum, entry) => sum + (entry.total_value || 0), 0)
    const shareholders_count = capTable.length
    const average_ownership = shareholders_count > 0 ? capTable.reduce((sum, entry) => sum + entry.ownership_percentage, 0) / shareholders_count : 0
    const top_shareholders = capTable.slice(0, 10)

    return {
      total_shares,
      total_value,
      shareholders_count,
      average_ownership,
      top_shareholders
    }
  }
} 