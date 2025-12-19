export interface Department {
  id: string
  name: string
  description?: string
  created_at: string
  updated_at: string
}

export interface Employee {
  id: string
  employee_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  position: string
  department_id?: string
  manager_id?: string
  status: 'Active' | 'On Leave' | 'Terminated'
  start_date: string
  location?: string
  avatar_initials?: string
  organization_id?: string
  user_id?: string
  created_at: string
  updated_at: string
}

export interface EmployeeWithRelations extends Employee {
  department?: Department
  manager?: Employee
  direct_reports?: Employee[]
}

export interface TimeOffRequest {
  id: string
  employee_id: string
  type: 'Annual Leave' | 'Sick Leave' | 'Personal Leave' | 'Maternity/Paternity'
  start_date: string
  end_date: string
  days_requested: number
  reason?: string
  status: 'Pending' | 'Approved' | 'Rejected'
  approved_by?: string
  approved_at?: string
  created_at: string
  updated_at: string
}

export interface LeaveAllowance {
  id: string
  employee_id: string
  leave_type: 'Annual Leave' | 'Sick Leave' | 'Personal Leave' | 'Maternity/Paternity'
  total_days: number
  used_days: number
  year: number
  created_at: string
  updated_at: string
}

export interface TrainingProgress {
  id: string
  employee_id: string
  training_name: string
  progress_percentage: number
  status: 'Not Started' | 'In Progress' | 'Completed'
  start_date?: string
  completion_date?: string
  created_at: string
  updated_at: string
}

export interface Certification {
  id: string
  employee_id: string
  name: string
  issuing_organization?: string
  issue_date?: string
  expiry_date?: string
  certificate_url?: string
  created_at: string
  updated_at: string
}

export interface NewEmployee {
  employee_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  position: string
  department_id?: string
  manager_id?: string
  status?: 'Active' | 'On Leave' | 'Terminated'
  start_date: string
  location?: string
  avatar_initials?: string
  organization_id?: string
  user_id?: string
}

export interface UpdateEmployee {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  position?: string
  department_id?: string
  manager_id?: string
  status?: 'Active' | 'On Leave' | 'Terminated'
  start_date?: string
  location?: string
  avatar_initials?: string
}

export interface NewTimeOffRequest {
  employee_id: string
  type: 'Annual Leave' | 'Sick Leave' | 'Personal Leave' | 'Maternity/Paternity'
  start_date: string
  end_date: string
  days_requested: number
  reason?: string
}

export interface NewLeaveAllowance {
  employee_id: string
  leave_type: 'Annual Leave' | 'Sick Leave' | 'Personal Leave' | 'Maternity/Paternity'
  total_days: number
  used_days?: number
  year: number
}

export interface NewTrainingProgress {
  employee_id: string
  training_name: string
  progress_percentage?: number
  status?: 'Not Started' | 'In Progress' | 'Completed'
  start_date?: string
  completion_date?: string
}

export interface NewCertification {
  employee_id: string
  name: string
  issuing_organization?: string
  issue_date?: string
  expiry_date?: string
  certificate_url?: string
} 