import { supabase } from '@/lib/supabase'
import {
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  LeaveRequestNote,
  LeaveRequestWithDetails,
  LeaveBalanceWithDetails,
  CreateLeaveRequestData,
  UpdateLeaveRequestData,
  CreateLeaveBalanceData,
  UpdateLeaveBalanceData,
  LeaveSummary,
  TeamLeaveSummary
} from '@/lib/types/leave'

export class LeaveService {
  // Leave Types
  static async getLeaveTypes(organizationId: string): Promise<LeaveType[]> {
    console.log('LeaveService: Getting leave types for org:', organizationId)
    
    const { data, error } = await supabase
      .from('leave_types')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('LeaveService: Error getting leave types:', error)
      throw error
    }
    
    console.log('LeaveService: Found leave types:', data?.length || 0)
    return data || []
  }

  static async createLeaveType(organizationId: string, leaveType: Partial<LeaveType>): Promise<LeaveType> {
    const { data, error } = await supabase
      .from('leave_types')
      .insert([{ ...leaveType, organization_id: organizationId }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Leave Balances
  static async getLeaveBalances(organizationId: string, employeeId?: string): Promise<LeaveBalanceWithDetails[]> {
    console.log('LeaveService: Getting leave balances for org:', organizationId, 'employee:', employeeId)
    
    let query = supabase
      .from('leave_balances')
      .select(`
        *,
        user_profiles!leave_balances_employee_id_fkey(first_name, last_name),
        leave_types!leave_balances_leave_type_id_fkey(name, color)
      `)
      .eq('organization_id', organizationId)

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    const { data, error } = await query.order('year', { ascending: false })

    if (error) {
      console.error('LeaveService: Error getting leave balances:', error)
      throw error
    }

    console.log('LeaveService: Found leave balances:', data?.length || 0)

    return (data || []).map(balance => ({
      ...balance,
      employee_name: balance.user_profiles ? `${balance.user_profiles.first_name} ${balance.user_profiles.last_name}` : 'Unknown',
      leave_type_name: balance.leave_types?.name || 'Unknown',
      leave_type_color: balance.leave_types?.color || '#3B82F6',
      available_days: balance.allocated_days - balance.used_days - balance.pending_days
    }))
  }

  static async createLeaveBalance(organizationId: string, balanceData: CreateLeaveBalanceData): Promise<LeaveBalance> {
    const { data, error } = await supabase
      .from('leave_balances')
      .insert([{ ...balanceData, organization_id: organizationId }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateLeaveBalance(id: string, updates: UpdateLeaveBalanceData): Promise<LeaveBalance> {
    const { data, error } = await supabase
      .from('leave_balances')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Leave Requests
  static async getLeaveRequests(organizationId: string, employeeId?: string): Promise<LeaveRequestWithDetails[]> {
    console.log('LeaveService: Getting leave requests for org:', organizationId, 'employee:', employeeId)
    
    let query = supabase
      .from('leave_requests')
      .select(`
        *,
        user_profiles!leave_requests_employee_id_fkey(first_name, last_name),
        leave_types!leave_requests_leave_type_id_fkey(name, color),
        approved_by_user:user_profiles!leave_requests_approved_by_fkey(first_name, last_name),
        leave_request_notes(*)
      `)
      .eq('organization_id', organizationId)

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('LeaveService: Error getting leave requests:', error)
      throw error
    }

    console.log('LeaveService: Found leave requests:', data?.length || 0)

    return (data || []).map(request => ({
      ...request,
      employee_name: request.user_profiles ? `${request.user_profiles.first_name} ${request.user_profiles.last_name}` : 'Unknown',
      leave_type_name: request.leave_types?.name || 'Unknown',
      leave_type_color: request.leave_types?.color || '#3B82F6',
      approved_by_name: request.approved_by_user ? `${request.approved_by_user.first_name} ${request.approved_by_user.last_name}` : undefined,
      notes: request.leave_request_notes || []
    }))
  }

  static async createLeaveRequest(organizationId: string, employeeId: string, requestData: CreateLeaveRequestData): Promise<LeaveRequest> {
    // Calculate days requested
    const startDate = new Date(requestData.start_date)
    const endDate = new Date(requestData.end_date)
    const daysRequested = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    const { data, error } = await supabase
      .from('leave_requests')
      .insert([{
        ...requestData,
        organization_id: organizationId,
        employee_id: employeeId,
        days_requested: daysRequested
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateLeaveRequest(id: string, updates: UpdateLeaveRequestData): Promise<LeaveRequest> {
    const updateData: any = {
      status: updates.status,
      updated_at: new Date().toISOString()
    }

    if (updates.status === 'approved') {
      updateData.approved_by = (await supabase.auth.getUser()).data.user?.id
      updateData.approved_at = new Date().toISOString()
    } else if (updates.status === 'rejected') {
      updateData.rejection_reason = updates.rejection_reason
    }

    const { data, error } = await supabase
      .from('leave_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Add note if provided
    if (updates.notes) {
      await this.addRequestNote(id, updates.notes)
    }

    return data
  }

  static async addRequestNote(requestId: string, note: string, isInternal: boolean = false): Promise<LeaveRequestNote> {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('leave_request_notes')
      .insert([{
        leave_request_id: requestId,
        user_id: userId,
        note,
        is_internal: isInternal
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Summary and Analytics
  static async getLeaveSummary(organizationId: string, employeeId?: string): Promise<LeaveSummary> {
    console.log('LeaveService: Getting leave summary for org:', organizationId, 'employee:', employeeId)
    
    let query = supabase
      .from('leave_requests')
      .select('status, days_requested')
      .eq('organization_id', organizationId)

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    const { data, error } = await query

    if (error) {
      console.error('LeaveService: Error getting leave summary:', error)
      throw error
    }

    const requests = data || []
    return {
      total_requests: requests.length,
      pending_requests: requests.filter(r => r.status === 'pending').length,
      approved_requests: requests.filter(r => r.status === 'approved').length,
      rejected_requests: requests.filter(r => r.status === 'rejected').length,
      total_days_requested: requests.reduce((sum, r) => sum + r.days_requested, 0),
      total_days_approved: requests
        .filter(r => r.status === 'approved')
        .reduce((sum, r) => sum + r.days_requested, 0)
    }
  }

  static async getTeamLeaveSummary(organizationId: string): Promise<TeamLeaveSummary[]> {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        employee_id,
        status,
        days_requested,
        user_profiles!leave_requests_employee_id_fkey(first_name, last_name)
      `)
      .eq('organization_id', organizationId)

    if (error) throw error

    const requests = data || []
    const employeeMap = new Map<string, TeamLeaveSummary>()

    requests.forEach(request => {
      const employeeId = request.employee_id
      const employeeName = request.user_profiles ? `${request.user_profiles.first_name} ${request.user_profiles.last_name}` : 'Unknown'

      if (!employeeMap.has(employeeId)) {
        employeeMap.set(employeeId, {
          employee_id: employeeId,
          employee_name: employeeName,
          total_requests: 0,
          pending_requests: 0,
          approved_requests: 0,
          total_days_requested: 0,
          total_days_approved: 0
        })
      }

      const summary = employeeMap.get(employeeId)!
      summary.total_requests++
      summary.total_days_requested += request.days_requested

      if (request.status === 'pending') {
        summary.pending_requests++
      } else if (request.status === 'approved') {
        summary.approved_requests++
        summary.total_days_approved += request.days_requested
      }
    })

    return Array.from(employeeMap.values())
  }

  // Utility functions
  static async getCurrentUserLeaveBalances(organizationId: string): Promise<LeaveBalanceWithDetails[]> {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) {
      console.log('LeaveService: No authenticated user found')
      return []
    }
    
    console.log('LeaveService: Getting balances for current user:', userId)
    return this.getLeaveBalances(organizationId, userId)
  }

  static async getCurrentUserLeaveRequests(organizationId: string): Promise<LeaveRequestWithDetails[]> {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) {
      console.log('LeaveService: No authenticated user found')
      return []
    }
    
    console.log('LeaveService: Getting requests for current user:', userId)
    return this.getLeaveRequests(organizationId, userId)
  }

  static async getPendingTeamRequests(organizationId: string): Promise<LeaveRequestWithDetails[]> {
    const { data, error } = await supabase
      .from('leave_requests')
      .select(`
        *,
        user_profiles!leave_requests_employee_id_fkey(first_name, last_name),
        leave_types!leave_requests_leave_type_id_fkey(name, color),
        leave_request_notes(*)
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error

    return (data || []).map(request => ({
      ...request,
      employee_name: request.user_profiles ? `${request.user_profiles.first_name} ${request.user_profiles.last_name}` : 'Unknown',
      leave_type_name: request.leave_types?.name || 'Unknown',
      leave_type_color: request.leave_types?.color || '#3B82F6',
      notes: request.leave_request_notes || []
    }))
  }
} 