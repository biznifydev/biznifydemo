import { supabase } from '@/lib/supabase'
import { 
  Employee, 
  EmployeeWithRelations, 
  Department, 
  TimeOffRequest, 
  LeaveAllowance, 
  TrainingProgress, 
  Certification,
  NewEmployee,
  UpdateEmployee,
  NewTimeOffRequest,
  NewLeaveAllowance,
  NewTrainingProgress,
  NewCertification
} from '@/lib/types/hr'

export class HrService {
  // Employee operations
  static async getEmployees(organizationId?: string): Promise<EmployeeWithRelations[]> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // If no organizationId provided, get the first active organization
    let targetOrganizationId = organizationId
    if (!targetOrganizationId) {
      const { data: orgMembers, error: orgMembersError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: true })
        .limit(1)

      if (orgMembersError) {
        console.error('HrService.getEmployees - Error fetching org members:', orgMembersError)
        throw new Error('No active organization found')
      }

      if (!orgMembers || orgMembers.length === 0) {
        console.error('HrService.getEmployees - No org members found for user:', user.email)
        throw new Error('No active organization found')
      }

      targetOrganizationId = orgMembers[0].organization_id
    }

    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        department:departments(*)
      `)
      .eq('organization_id', targetOrganizationId)
      .order('first_name')

    if (error) throw error
    
    // If we have data, fetch manager information separately
    if (data && data.length > 0) {
      const employeesWithManagers = await Promise.all(
        data.map(async (employee) => {
          if (employee.manager_id) {
            const { data: managerData } = await supabase
              .from('employees')
              .select('id, first_name, last_name, position')
              .eq('id', employee.manager_id)
              .eq('organization_id', targetOrganizationId) // Also filter manager by org
              .single()
            
            return {
              ...employee,
              manager: managerData
            }
          }
          return employee
        })
      )
      return employeesWithManagers
    }
    
    return data || []
  }

  static async getEmployee(id: string, organizationId?: string): Promise<EmployeeWithRelations | null> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Build the query
    let query = supabase
      .from('employees')
      .select(`
        *,
        department:departments(*)
      `)
      .eq('id', id)

    // Only filter by organization if explicitly provided
    if (organizationId) {
      query = query.eq('organization_id', organizationId)
    }

    const { data, error } = await query.single()

    if (error) {
      console.error('HrService.getEmployee - Error fetching employee:', error)
      throw error
    }
    
    // If we have data and it has a manager_id, fetch manager information
    if (data && data.manager_id) {
      const { data: managerData } = await supabase
        .from('employees')
        .select('id, first_name, last_name, position')
        .eq('id', data.manager_id)
        .single()
      
      return {
        ...data,
        manager: managerData
      }
    }
    
    return data
  }

  static async createEmployee(employee: NewEmployee, organizationId?: string): Promise<Employee> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // If no organizationId provided, get the first active organization
    let targetOrganizationId = organizationId
    if (!targetOrganizationId) {
      const { data: orgMembers, error: orgMembersError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: true })
        .limit(1)

      if (orgMembersError) {
        console.error('HrService.createEmployee - Error fetching org members:', orgMembersError)
        throw new Error('No active organization found')
      }

      if (!orgMembers || orgMembers.length === 0) {
        console.error('HrService.createEmployee - No org members found for user:', user.email)
        throw new Error('No active organization found')
      }

      targetOrganizationId = orgMembers[0].organization_id
    }

    const employeeWithOrg = {
      ...employee,
      organization_id: targetOrganizationId
    }

    const { data, error } = await supabase
      .from('employees')
      .insert(employeeWithOrg)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async createEmployeeForCurrentUser(employeeData: Omit<NewEmployee, 'user_id' | 'organization_id'>, organizationId?: string): Promise<Employee> {
    // Get current user and organization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) throw new Error('No active session')

    // Get user profile
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!userProfile) throw new Error('User profile not found')

    // If no organizationId provided, get the first active organization
    let targetOrganizationId = organizationId
    if (!targetOrganizationId) {
      const { data: orgMembers, error: orgMembersError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: true })
        .limit(1)

      if (orgMembersError) {
        console.error('HrService.createEmployeeForCurrentUser - Error fetching org members:', orgMembersError)
        throw new Error('No active organization found')
      }

      if (!orgMembers || orgMembers.length === 0) {
        console.error('HrService.createEmployeeForCurrentUser - No org members found for user:', user.email)
        throw new Error('No active organization found')
      }

      targetOrganizationId = orgMembers[0].organization_id
    }

    // Generate employee ID if not provided
    let employeeId = employeeData.employee_id
    if (!employeeId) {
      employeeId = await this.generateNextEmployeeId(targetOrganizationId)
    }

    // Generate avatar initials
    const avatarInitials = this.generateAvatarInitials(employeeData.first_name, employeeData.last_name)

    const newEmployee: NewEmployee = {
      ...employeeData,
      employee_id: employeeId,
      user_id: user.id,
      organization_id: targetOrganizationId,
      avatar_initials: avatarInitials
    }

    return this.createEmployee(newEmployee, targetOrganizationId)
  }

  static async generateNextEmployeeId(organizationId?: string): Promise<string> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // If no organizationId provided, get the first active organization
      let targetOrganizationId = organizationId
      if (!targetOrganizationId) {
        const { data: orgMembers, error: orgMembersError } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: true })
          .limit(1)

        if (orgMembersError) {
          console.error('HrService.generateNextEmployeeId - Error fetching org members:', orgMembersError)
          throw new Error('No active organization found')
        }

        if (!orgMembers || orgMembers.length === 0) {
          console.error('HrService.generateNextEmployeeId - No org members found for user:', user.email)
          throw new Error('No active organization found')
        }

        targetOrganizationId = orgMembers[0].organization_id
      }

      // Get all existing employee IDs from the current organization
      const { data: existingEmployees } = await supabase
        .from('employees')
        .select('employee_id')
        .eq('organization_id', targetOrganizationId)

      if (!existingEmployees) return 'EMP001'

      // Extract numeric parts from existing employee IDs
      const existingIds = existingEmployees
        .map(emp => emp.employee_id)
        .filter(id => id && id.startsWith('EMP'))
        .map(id => {
          const numericPart = id.replace('EMP', '')
          return parseInt(numericPart, 10)
        })
        .filter(num => !isNaN(num))

      // Find the next available number
      let nextNumber = 1
      if (existingIds.length > 0) {
        const maxNumber = Math.max(...existingIds)
        nextNumber = maxNumber + 1
      }

      // Format as EMP001, EMP002, etc.
      return `EMP${String(nextNumber).padStart(3, '0')}`
    } catch (error) {
      console.error('Error generating employee ID:', error)
      // Fallback to timestamp-based ID if database query fails
      return `EMP${String(Date.now()).slice(-3)}`
    }
  }

  static async updateEmployee(id: string, updates: UpdateEmployee): Promise<Employee> {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteEmployee(id: string): Promise<void> {
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Department operations
  static async getDepartments(): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  }

  static async createDepartment(department: { name: string; description?: string }): Promise<Department> {
    const { data, error } = await supabase
      .from('departments')
      .insert(department)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateDepartment(id: string, updates: { name?: string; description?: string; manager_id?: string }): Promise<Department> {
    const { data, error } = await supabase
      .from('departments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteDepartment(id: string): Promise<void> {
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Time off operations
  static async getTimeOffRequests(employeeId?: string): Promise<TimeOffRequest[]> {
    let query = supabase
      .from('time_off_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  static async createTimeOffRequest(request: NewTimeOffRequest): Promise<TimeOffRequest> {
    const { data, error } = await supabase
      .from('time_off_requests')
      .insert(request)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateTimeOffRequest(id: string, updates: Partial<TimeOffRequest>): Promise<TimeOffRequest> {
    const { data, error } = await supabase
      .from('time_off_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Leave allowance operations
  static async getLeaveAllowances(employeeId?: string): Promise<LeaveAllowance[]> {
    let query = supabase
      .from('leave_allowances')
      .select('*')
      .order('year', { ascending: false })

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  static async createLeaveAllowance(allowance: NewLeaveAllowance): Promise<LeaveAllowance> {
    const { data, error } = await supabase
      .from('leave_allowances')
      .insert(allowance)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateLeaveAllowance(id: string, updates: Partial<LeaveAllowance>): Promise<LeaveAllowance> {
    const { data, error } = await supabase
      .from('leave_allowances')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Training operations
  static async getTrainingProgress(employeeId?: string): Promise<TrainingProgress[]> {
    let query = supabase
      .from('training_progress')
      .select('*')
      .order('created_at', { ascending: false })

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  static async createTrainingProgress(training: NewTrainingProgress): Promise<TrainingProgress> {
    const { data, error } = await supabase
      .from('training_progress')
      .insert(training)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateTrainingProgress(id: string, updates: Partial<TrainingProgress>): Promise<TrainingProgress> {
    const { data, error } = await supabase
      .from('training_progress')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Certification operations
  static async getCertifications(employeeId?: string): Promise<Certification[]> {
    let query = supabase
      .from('certifications')
      .select('*')
      .order('issue_date', { ascending: false })

    if (employeeId) {
      query = query.eq('employee_id', employeeId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  static async createCertification(certification: NewCertification): Promise<Certification> {
    const { data, error } = await supabase
      .from('certifications')
      .insert(certification)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateCertification(id: string, updates: Partial<Certification>): Promise<Certification> {
    const { data, error } = await supabase
      .from('certifications')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteCertification(id: string): Promise<void> {
    const { error } = await supabase
      .from('certifications')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Utility functions
  static generateAvatarInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  static async getEmployeeStats(organizationId?: string): Promise<{
    total: number
    active: number
    onLeave: number
    terminated: number
  }> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // If no organizationId provided, get the first active organization
    let targetOrganizationId = organizationId
    if (!targetOrganizationId) {
      const { data: orgMembers, error: orgMembersError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: true })
        .limit(1)

      if (orgMembersError) {
        console.error('HrService.getEmployeeStats - Error fetching org members:', orgMembersError)
        throw new Error('No active organization found')
      }

      if (!orgMembers || orgMembers.length === 0) {
        console.error('HrService.getEmployeeStats - No org members found for user:', user.email)
        throw new Error('No active organization found')
      }

      targetOrganizationId = orgMembers[0].organization_id
    }

    const { data, error } = await supabase
      .from('employees')
      .select('status')
      .eq('organization_id', targetOrganizationId)

    if (error) throw error

    const stats = {
      total: data?.length || 0,
      active: data?.filter(e => e.status === 'Active').length || 0,
      onLeave: data?.filter(e => e.status === 'On Leave').length || 0,
      terminated: data?.filter(e => e.status === 'Terminated').length || 0
    }

    return stats
  }
} 