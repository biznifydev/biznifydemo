export interface LeaveType {
  id: string
  organization_id: string
  name: string
  description?: string
  color: string
  icon: string
  is_active: boolean
  requires_approval: boolean
  max_days_per_year?: number
  created_at: string
  updated_at: string
}

export interface LeaveBalance {
  id: string
  organization_id: string
  employee_id: string
  leave_type_id: string
  year: number
  allocated_days: number
  used_days: number
  pending_days: number
  carried_over_days: number
  created_at: string
  updated_at: string
}

export interface LeaveRequest {
  id: string
  organization_id: string
  employee_id: string
  leave_type_id: string
  start_date: string
  end_date: string
  days_requested: number
  reason?: string
  description?: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
}

export interface LeaveRequestNote {
  id: string
  organization_id: string
  leave_request_id: string
  user_id: string
  note: string
  is_internal: boolean
  created_at: string
}

export interface LeaveRequestWithDetails extends LeaveRequest {
  employee_name: string
  leave_type_name: string
  leave_type_color: string
  approved_by_name?: string
  notes: LeaveRequestNote[]
}

export interface LeaveBalanceWithDetails extends LeaveBalance {
  employee_name: string
  leave_type_name: string
  leave_type_color: string
  available_days: number
}

export interface CreateLeaveRequestData {
  leave_type_id: string
  start_date: string
  end_date: string
  reason?: string
  description?: string
}

export interface UpdateLeaveRequestData {
  status: 'approved' | 'rejected' | 'cancelled'
  rejection_reason?: string
  notes?: string
}

export interface CreateLeaveBalanceData {
  employee_id: string
  leave_type_id: string
  year: number
  allocated_days: number
  carried_over_days?: number
}

export interface UpdateLeaveBalanceData {
  allocated_days?: number
  carried_over_days?: number
}

export interface LeaveSummary {
  total_requests: number
  pending_requests: number
  approved_requests: number
  rejected_requests: number
  total_days_requested: number
  total_days_approved: number
}

export interface TeamLeaveSummary {
  employee_id: string
  employee_name: string
  total_requests: number
  pending_requests: number
  approved_requests: number
  total_days_requested: number
  total_days_approved: number
} 