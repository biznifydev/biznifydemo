"use client"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { SubHeader } from "@/components/layout/SubHeader"
import React, { useState, useEffect, useMemo } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { User, Mail, Phone, MapPin, Calendar, Clock, GraduationCap, MoreVertical, X, Building2, CheckCircle, AlertCircle, Clock as ClockIcon, Edit3, Save, X as XIcon, Plus, ChevronDown, ChevronRight, Trash2, Users } from "lucide-react"
import { HrService } from "@/lib/services/hrService"
import { EmployeeWithRelations, TimeOffRequest, LeaveAllowance, TrainingProgress, Certification, UpdateEmployee, NewEmployee } from "@/lib/types/hr"
import { useOrganizationContext } from "@/components/providers/OrganizationProvider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function EmployeesPage() {
  const { currentOrganization, organizationMembers } = useOrganizationContext()
  const [activeTab, setActiveTab] = useState("all")
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithRelations | null>(null)
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>("all")
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false)
  const [employeeModalTab, setEmployeeModalTab] = useState("details")
  const [isEditing, setIsEditing] = useState(false)
  const [employees, setEmployees] = useState<EmployeeWithRelations[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [employeeStats, setEmployeeStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    terminated: 0
  })
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([])
  const [leaveAllowances, setLeaveAllowances] = useState<LeaveAllowance[]>([])
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress[]>([])
  const [certifications, setCertifications] = useState<Certification[]>([])
  
  // Filter bar states
  const [showFilterBar, setShowFilterBar] = useState(false)
  const [employeeSearch, setEmployeeSearch] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  
  // Add Employee Modal States
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [organizationUsers, setOrganizationUsers] = useState<any[]>([])
  const [isGeneratingId, setIsGeneratingId] = useState(false)
  const [newEmployee, setNewEmployee] = useState<NewEmployee>({
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    department_id: '',
    manager_id: '',
    status: 'Active',
    start_date: '',
    location: '',
    avatar_initials: ''
  })
  const [linkToUser, setLinkToUser] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  
  // Department management states
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set())
  const [isAddDepartmentModalOpen, setIsAddDepartmentModalOpen] = useState(false)
  const [isEditDepartmentModalOpen, setIsEditDepartmentModalOpen] = useState(false)
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null)
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    description: '',
    manager_id: ''
  })
  
  // Alert modal states
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertTitle, setAlertTitle] = useState('')
  const [alertType, setAlertType] = useState<'error' | 'warning' | 'info'>('info')
  
  // Department deletion state
  const [departmentToDelete, setDepartmentToDelete] = useState<string | null>(null)
  
  // Build org chart hierarchy from employee data
  const buildOrgChartHierarchy = () => {
    if (!employees || employees.length === 0) {
      return { levels: [], maxLevel: 0 }
    }

    // Create a map of employees by ID for quick lookup
    const employeeMap = new Map(employees.map(emp => [emp.id, emp]))
    
    // Find employees without managers (top level)
    const topLevelEmployees = employees.filter(emp => !emp.manager_id)
    
    // Build hierarchy recursively
    const buildLevel = (employeeIds: string[], level: number): any[] => {
      if (employeeIds.length === 0) return []
      
      const levelEmployees = employeeIds
        .map(id => employeeMap.get(id))
        .filter((emp): emp is EmployeeWithRelations => emp !== undefined)
        .map(emp => ({
          ...emp,
          directReports: employees.filter(e => e.manager_id === emp.id).map(e => e.id)
        }))
      
      return levelEmployees
    }
    
    // Build all levels
    const levels: any[][] = []
    let currentLevelIds = topLevelEmployees.map(emp => emp.id)
    let level = 0
    
    while (currentLevelIds.length > 0 && level < 10) { // Prevent infinite loops
      const levelEmployees = buildLevel(currentLevelIds, level)
      levels.push(levelEmployees)
      
      // Get IDs of employees in the next level
      currentLevelIds = levelEmployees.flatMap(emp => emp.directReports)
      level++
    }
    
    return { levels, maxLevel: levels.length }
  }

  // Get color for employee avatar based on position
  const getAvatarColor = (position: string) => {
    const colors = [
      'bg-blue-100 border-blue-300 text-blue-800',
      'bg-green-100 border-green-300 text-green-800',
      'bg-purple-100 border-purple-300 text-purple-800',
      'bg-yellow-100 border-yellow-300 text-yellow-800',
      'bg-red-100 border-red-300 text-red-800',
      'bg-indigo-100 border-indigo-300 text-indigo-800',
      'bg-pink-100 border-pink-300 text-pink-800',
      'bg-gray-100 border-gray-300 text-gray-800'
    ]
    
    // Use position to determine color (simple hash)
    const hash = position.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }
  
  // Filter employees based on active tab and department
  const filteredEmployees = Array.isArray(employees) ? employees.filter(employee => {
    // Filter by search term
    const searchMatch = !employeeSearch || 
      `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      employee.email.toLowerCase().includes(employeeSearch.toLowerCase()) ||
      employee.position.toLowerCase().includes(employeeSearch.toLowerCase())
    
    // Filter by status
    const statusMatch = selectedStatus === "all" || employee.status === selectedStatus
    
    // Filter by department
    const departmentMatch = selectedDepartmentFilter === "all" || 
      employee.department_id === selectedDepartmentFilter
    
    return searchMatch && statusMatch && departmentMatch
  }) : []

  const employeeTabs = [
    { id: "all", label: "All Employees" },
    { id: "departments", label: "Departments" },
    { id: "org-chart", label: "Org Chart" },
  ]

  const employeeModalTabs = [
    { id: "details", label: "Details" },
    { id: "timeoff", label: "Time Off" },
    { id: "training", label: "Training" },
  ]

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "Active", label: "Active" },
    { value: "On Leave", label: "On Leave" },
    { value: "Terminated", label: "Terminated" },
  ]

  const departmentOptions = [
    { value: "all", label: "All Departments" },
    ...(departments && Array.isArray(departments) ? departments.map(dept => ({ value: dept.id, label: dept.name })) : [])
  ]

  const handleAddEmployeeModalOpen = async () => {
    setIsAddEmployeeModalOpen(true)
    setIsGeneratingId(true)
    loadOrganizationUsers()
    
    // Only load employees if we have a current organization
    if (currentOrganization) {
      loadEmployees()
    }
    
    const nextId = await generateNextEmployeeId()
    setNewEmployee(prev => ({ ...prev, employee_id: nextId }))
    setIsGeneratingId(false)
  }

  const headerButtons = (
    <>
      {activeTab === "departments" ? (
        <button 
          onClick={() => setIsAddDepartmentModalOpen(true)}
          className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors flex items-center space-x-1"
        >
          <Plus className="h-3 w-3" />
          <span>Add Department</span>
      </button>
      ) : (
        <button 
          onClick={handleAddEmployeeModalOpen}
          className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors flex items-center space-x-1"
        >
          <Plus className="h-3 w-3" />
          <span>Add Employee</span>
      </button>
      )}
    </>
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-50 text-green-700 border-green-200"
      case "On Leave":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "Terminated":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Load employees when component mounts or organization changes
  useEffect(() => {
    if (currentOrganization) {
      loadEmployees()
      loadDepartments()
    }
  }, [currentOrganization])

  // Load organization users when organization members are available
  useEffect(() => {
    if (organizationMembers) {
      loadOrganizationUsers()
    }
  }, [organizationMembers])

  // Reset department filter when switching tabs
  useEffect(() => {
    setSelectedDepartmentFilter("all")
  }, [activeTab])

  // Load employees when add employee modal opens
  useEffect(() => {
    if (isAddEmployeeModalOpen && currentOrganization) {
      loadEmployees()
    }
  }, [isAddEmployeeModalOpen, currentOrganization])

  // Load departments
  const loadDepartments = async () => {
    try {
      const data = await HrService.getDepartments()
      setDepartments(data)
    } catch (error) {
      console.error('Error loading departments:', error)
    }
  }

  // Load organization users from the organization context
  const loadOrganizationUsers = async () => {
    if (organizationMembers && organizationMembers.length > 0) {
      // Filter out members that don't have user profiles and map to the expected format
      const users = organizationMembers
        .filter(member => member.user)
        .map(member => ({
          id: member.user_id,
          email: member.user!.email,
          first_name: member.user!.first_name,
          last_name: member.user!.last_name
        }))
      setOrganizationUsers(users)
    } else {
      // Fallback to empty array if no members
      setOrganizationUsers([])
    }
  }

  // Load employees
  const loadEmployees = async () => {
    if (!currentOrganization) {
      return
    }
    
    setIsLoading(true)
    try {
      const data = await HrService.getEmployees(currentOrganization.id)
      setEmployees(data)
    } catch (error) {
      console.error('Error loading employees:', error)
      setError('Failed to load employees')
    } finally {
      setIsLoading(false)
    }
  }

  const loadEmployeeStats = async () => {
    if (!currentOrganization) return
    
    try {
      const stats = await HrService.getEmployeeStats(currentOrganization.id)
      setEmployeeStats(stats)
    } catch (error) {
      console.error('Error loading employee stats:', error)
    }
  }

  const loadEmployeeData = async (employeeId: string) => {
    try {
      const [requests, allowances, training, certs] = await Promise.all([
        HrService.getTimeOffRequests(employeeId),
        HrService.getLeaveAllowances(employeeId),
        HrService.getTrainingProgress(employeeId),
        HrService.getCertifications(employeeId)
      ])
      setTimeOffRequests(requests)
      setLeaveAllowances(allowances)
      setTrainingProgress(training)
      setCertifications(certs)
    } catch (error) {
      console.error('Error loading employee data:', error)
    }
  }

  const handleEmployeeClick = async (employee: EmployeeWithRelations) => {
    setSelectedEmployee(employee)
    setIsEmployeeModalOpen(true)
  }

  const handleSave = async () => {
    if (!selectedEmployee) return
    
    try {
      const updates: UpdateEmployee = {
        first_name: selectedEmployee.first_name,
        last_name: selectedEmployee.last_name,
        email: selectedEmployee.email,
        phone: selectedEmployee.phone,
        position: selectedEmployee.position,
        department_id: selectedEmployee.department_id,
        manager_id: selectedEmployee.manager_id,
        status: selectedEmployee.status,
        start_date: selectedEmployee.start_date,
        location: selectedEmployee.location,
        avatar_initials: selectedEmployee.avatar_initials
      }
      
      await HrService.updateEmployee(selectedEmployee.id, updates)
      
      // Refresh both employees and departments to get updated data
      await loadEmployees()
      await loadDepartments()
      
      // Update the selected employee with fresh data including department info
      const updatedEmployee = await HrService.getEmployee(selectedEmployee.id)
      if (updatedEmployee) {
        setSelectedEmployee(updatedEmployee)
      }
      
      setIsEditing(false)
      
      // Show success message
      showAlert(
        'Employee Updated',
        'Employee information has been updated successfully.',
        'info'
      )
    } catch (error: any) {
      console.error('Error updating employee:', error)
      showAlert(
        'Error',
        'Failed to update employee. Please try again.',
        'error'
      )
    }
  }

  const handleCancel = async () => {
    if (!selectedEmployee) return
    
    try {
      // Reload the employee data to reset any changes
      const freshEmployee = await HrService.getEmployee(selectedEmployee.id)
      if (freshEmployee) {
        setSelectedEmployee(freshEmployee)
      }
    } catch (error) {
      console.error('Error reloading employee data:', error)
    } finally {
      setIsEditing(false)
    }
  }

  const generateNextEmployeeId = async () => {
    if (!currentOrganization) return 'EMP001'
    
    try {
      return await HrService.generateNextEmployeeId(currentOrganization.id)
    } catch (error) {
      console.error('Error generating employee ID:', error)
      // Fallback to timestamp-based ID if database query fails
      return `EMP${String(Date.now()).slice(-3)}`
    }
  }

  const handleUserSelection = (userId: string) => {
    setSelectedUserId(userId)
    if (userId) {
      const selectedUser = organizationUsers.find(user => user.id === userId)
      if (selectedUser) {
        setNewEmployee({
          ...newEmployee,
          first_name: selectedUser.first_name,
          last_name: selectedUser.last_name,
          email: selectedUser.email
        })
      }
    }
  }

  const handleAddEmployee = async () => {
    if (!currentOrganization) return
    
    try {
      // Generate employee ID if not provided
      if (!newEmployee.employee_id) {
        newEmployee.employee_id = await generateNextEmployeeId()
      }

      // Generate avatar initials if not provided
      if (!newEmployee.avatar_initials) {
        newEmployee.avatar_initials = HrService.generateAvatarInitials(newEmployee.first_name, newEmployee.last_name)
      }

      // Prepare employee data - convert empty strings to undefined for UUID fields
      const employeeData = {
        ...newEmployee,
        department_id: newEmployee.department_id || undefined,
        manager_id: newEmployee.manager_id || undefined
      }

      await HrService.createEmployee(employeeData, currentOrganization.id)
      await loadEmployees() // Refresh the list
      setIsAddEmployeeModalOpen(false)
      
      // Reset form
      setNewEmployee({
        employee_id: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        position: '',
        department_id: '',
        manager_id: '',
        status: 'Active',
        start_date: '',
        location: '',
        avatar_initials: ''
      })
      setLinkToUser(false)
      setSelectedUserId('')
    } catch (error) {
      console.error('Error adding employee:', error)
    }
  }

  // Department management functions
  const toggleDepartmentExpansion = (departmentId: string) => {
    const newExpanded = new Set(expandedDepartments)
    if (newExpanded.has(departmentId)) {
      newExpanded.delete(departmentId)
    } else {
      newExpanded.add(departmentId)
    }
    setExpandedDepartments(newExpanded)
  }

  const handleAddDepartment = async () => {
    try {
      await HrService.createDepartment(newDepartment)
      await loadDepartments()
      setIsAddDepartmentModalOpen(false)
      setNewDepartment({ name: '', description: '', manager_id: '' })
      
      // If we came from the employee modal, show success and reopen it
      if (!isEmployeeModalOpen) {
        showAlert(
          'Department Created',
          'Department has been created successfully. You can now assign it to employees.',
          'info'
        )
      }
    } catch (error) {
      console.error('Error adding department:', error)
      showAlert(
        'Error',
        'Failed to create department. Please try again.',
        'error'
      )
    }
  }

  const handleEditDepartment = async () => {
    if (!selectedDepartment) return
    try {
      await HrService.updateDepartment(selectedDepartment.id, {
        name: selectedDepartment.name,
        description: selectedDepartment.description,
        manager_id: selectedDepartment.manager_id
      })
      await loadDepartments()
      setIsEditDepartmentModalOpen(false)
      setSelectedDepartment(null)
    } catch (error) {
      console.error('Error updating department:', error)
    }
  }

  const handleDeleteDepartment = async (departmentId: string) => {
    // Check if department has employees
    const departmentEmployees = Array.isArray(employees) ? employees.filter(emp => emp.department_id === departmentId) : []
    
    if (departmentEmployees.length > 0) {
      showAlert(
        'Cannot Delete Department',
        `There are ${departmentEmployees.length} employee(s) still assigned to this department. Please reassign or remove these employees first.`,
        'warning'
      )
      return
    }
    
    // Store the department ID and show confirmation dialog
    setDepartmentToDelete(departmentId)
    showAlert(
      'Delete Department',
      'Are you sure you want to delete this department? This action cannot be undone.',
      'warning'
    )
  }

  const confirmDeleteDepartment = async () => {
    if (!departmentToDelete) return
    
    try {
      await HrService.deleteDepartment(departmentToDelete)
      await loadDepartments()
      await loadEmployees()
      setIsAlertModalOpen(false)
      setDepartmentToDelete(null)
      showAlert(
        'Department Deleted',
        'The department has been successfully deleted.',
        'info'
      )
    } catch (error: any) {
      console.error('Error deleting department:', error)
      setIsAlertModalOpen(false)
      setDepartmentToDelete(null)
      // Show user-friendly error message
      if (error.code === '23503') {
        showAlert(
          'Cannot Delete Department',
          'There are still employees assigned to this department. Please reassign them first.',
          'error'
        )
      } else {
        showAlert(
          'Error',
          'An error occurred while deleting the department. Please try again.',
          'error'
        )
      }
    }
  }

  // Helper function to show styled alerts
  const showAlert = (title: string, message: string, type: 'error' | 'warning' | 'info' = 'info') => {
    setAlertTitle(title)
    setAlertMessage(message)
    setAlertType(type)
    setIsAlertModalOpen(true)
  }

  // Calculate department statistics for pie chart
  const getDepartmentStats = () => {
    if (!Array.isArray(departments) || !Array.isArray(employees)) return []
    
    const stats = departments.map(dept => {
      const employeeCount = employees.filter(emp => emp.department_id === dept.id).length
      return {
        id: dept.id,
        name: dept.name,
        count: employeeCount,
        percentage: employees.length > 0 ? Math.round((employeeCount / employees.length) * 100) : 0
      }
    }).filter(stat => stat.count > 0) // Only show departments with employees

    // Add "No Department" category if there are employees without departments
    const noDeptCount = employees.filter(emp => !emp.department_id).length
    if (noDeptCount > 0) {
      stats.push({
        id: 'no-dept',
        name: 'No Department',
        count: noDeptCount,
        percentage: Math.round((noDeptCount / employees.length) * 100)
      })
    }

    return stats
  }

  // Memoize department stats to prevent expensive recalculations
  const departmentStats = useMemo(() => {
    // Defensive check - ensure arrays exist and are arrays
    if (!departments || !Array.isArray(departments) || !employees || !Array.isArray(employees)) {
      return []
    }
    
    const stats = departments.map(dept => {
      const employeeCount = employees.filter(emp => emp.department_id === dept.id).length
      return {
        id: dept.id,
        name: dept.name,
        count: employeeCount,
        percentage: employees.length > 0 ? Math.round((employeeCount / employees.length) * 100) : 0
      }
    }).filter(stat => stat.count > 0) // Only show departments with employees

    // Add "No Department" category if there are employees without departments
    const noDeptCount = employees.filter(emp => !emp.department_id).length
    if (noDeptCount > 0) {
      stats.push({
        id: 'no-dept',
        name: 'No Department',
        count: noDeptCount,
        percentage: Math.round((noDeptCount / employees.length) * 100)
      })
    }

    return stats
  }, [departments, employees])

  // Memoize pie chart colors
  const pieChartColors = useMemo(() => [
    '#8B5CF6', // Purple-600 (primary)
    '#A78BFA', // Purple-400
    '#C4B5FD', // Purple-300
    '#DDD6FE', // Purple-200
    '#EDE9FE', // Purple-100
    '#F3E8FF', // Purple-50
    '#7C3AED', // Purple-700
    '#6D28D9'  // Purple-800
  ], [])

  // Memoize department employees mapping to prevent expensive filtering
  const departmentEmployeesMap = useMemo(() => {
    // Defensive check - ensure arrays exist and are arrays
    if (!departments || !Array.isArray(departments) || !employees || !Array.isArray(employees)) {
      return new Map()
    }
    
    const map = new Map()
    departments.forEach(dept => {
      const deptEmployees = employees.filter(emp => emp.department_id === dept.id)
      map.set(dept.id, deptEmployees)
    })
    return map
  }, [departments, employees])

  // Calculate optimal column widths based on content
  const getColumnWidth = (columnId: string, data: EmployeeWithRelations[]) => {
    const maxWidths = {
      select: 40, // Fixed width for checkbox
      name: 256, // Max width for employee name (w-64)
      position: 200, // Max width for position
      department: 180, // Max width for department
      email: 250, // Max width for email
      phone: 140, // Max width for phone
      status: 120, // Max width for status
      start_date: 120, // Max width for start date
      actions: 60 // Fixed width for actions
    }

    const minWidths = {
      select: 40,
      name: 150,
      position: 100,
      department: 80,
      email: 150,
      phone: 100,
      status: 80,
      start_date: 100,
      actions: 60
    }

    if (columnId === 'select' || columnId === 'actions') {
      return maxWidths[columnId as keyof typeof maxWidths]
    }

    // Calculate content width based on longest value
    let maxContentLength = 0
    data.forEach(item => {
      let content = ''
      switch (columnId) {
        case 'name':
          content = `${item.first_name} ${item.last_name}`
          break
        case 'position':
          content = item.position || 'No position'
          break
        case 'department':
          content = item.department?.name || 'No department'
          break
        case 'email':
          content = item.email || ''
          break
        case 'phone':
          content = item.phone || 'No phone'
          break
        case 'status':
          content = item.status || ''
          break
        case 'start_date':
          content = formatDate(item.start_date)
          break
      }
      maxContentLength = Math.max(maxContentLength, content.length)
    })

    // Estimate width: roughly 8px per character + padding
    const estimatedWidth = Math.max(maxContentLength * 8 + 24, minWidths[columnId as keyof typeof minWidths])
    return Math.min(estimatedWidth, maxWidths[columnId as keyof typeof maxWidths])
  }

  // Calculate column widths
  const columnWidths = useMemo(() => ({
    select: getColumnWidth('select', filteredEmployees),
    name: getColumnWidth('name', filteredEmployees),
    position: getColumnWidth('position', filteredEmployees),
    department: getColumnWidth('department', filteredEmployees),
    email: getColumnWidth('email', filteredEmployees),
    phone: getColumnWidth('phone', filteredEmployees),
    status: getColumnWidth('status', filteredEmployees),
    start_date: getColumnWidth('start_date', filteredEmployees),
    actions: getColumnWidth('actions', filteredEmployees)
  }), [filteredEmployees])

  const renderContent = () => {
    switch (activeTab) {
      case "all":
        return (
          <div className="space-y-4">
            {/* Filter Bar */}
            {showFilterBar && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={employeeSearch}
                      onChange={(e) => setEmployeeSearch(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                    <select
                      value={selectedDepartmentFilter}
                      onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {departmentOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
        
        {/* Employees Table */}
            <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th 
                        style={{ width: columnWidths.select }}
                        className="sticky left-0 bg-gray-50 z-10 border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        <input
                          type="checkbox"
                          className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                        />
                      </th>
                      <th 
                        style={{ width: columnWidths.name }}
                        className="sticky left-10 bg-gray-50 z-10 border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        Employee Name
                      </th>
                      <th 
                        style={{ width: columnWidths.position }}
                        className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        Position
                      </th>
                      <th 
                        style={{ width: columnWidths.department }}
                        className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        Department
                      </th>
                      <th 
                        style={{ width: columnWidths.email }}
                        className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        Email
                      </th>
                      <th 
                        style={{ width: columnWidths.phone }}
                        className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        Phone
                      </th>
                      <th 
                        style={{ width: columnWidths.status }}
                        className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        Status
                      </th>
                      <th 
                        style={{ width: columnWidths.start_date }}
                        className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        Start Date
                      </th>
                      <th 
                        style={{ width: columnWidths.actions }}
                        className="text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        Actions
                      </th>
                </tr>
              </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-gray-500">
                          Loading employees...
                        </td>
                      </tr>
                    ) : filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <User className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees yet</h3>
                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">Add your first employee to start building your team and managing HR processes.</p>
                            <button
                              onClick={handleAddEmployeeModalOpen}
                              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Your First Employee
                            </button>
                      </div>
                    </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((employee) => (
                        <tr 
                          key={employee.id}
                          className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleEmployeeClick(employee)}
                        >
                          <td 
                            style={{ width: columnWidths.select }}
                            className="py-2 px-3 sticky left-0 bg-white z-10 border-r border-gray-200"
                          >
                            <div className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                    </td>
                          <td 
                            style={{ width: columnWidths.name }}
                            className="py-2 px-3 sticky left-10 bg-white z-10 border-r border-gray-200"
                          >
                            <span className="font-medium text-gray-900 text-xs truncate block">
                              {`${employee.first_name} ${employee.last_name}`}
                            </span>
                    </td>
                          <td 
                            style={{ width: columnWidths.position }}
                            className="py-2 px-3 border-r border-gray-200"
                          >
                            <span className="text-xs text-gray-900 truncate block">
                              {employee.position || "No position"}
                            </span>
                    </td>
                          <td 
                            style={{ width: columnWidths.department }}
                            className="py-2 px-3 border-r border-gray-200"
                          >
                            <span className="text-xs text-gray-900 truncate block">
                              {employee.department?.name || "No department"}
                      </span>
                    </td>
                          <td 
                            style={{ width: columnWidths.email }}
                            className="py-2 px-3 border-r border-gray-200"
                          >
                            <span className="text-xs text-gray-900 truncate block">
                              {employee.email}
                            </span>
                    </td>
                          <td 
                            style={{ width: columnWidths.phone }}
                            className="py-2 px-3 border-r border-gray-200"
                          >
                            <span className="text-xs text-gray-900 truncate block">
                              {employee.phone || "No phone"}
                            </span>
                    </td>
                          <td 
                            style={{ width: columnWidths.status }}
                            className={`py-2 px-3 border-r border-gray-200 ${getStatusColor(employee.status)}`}
                          >
                            <span className="text-xs font-medium text-gray-900 truncate block">
                              {employee.status}
                            </span>
                          </td>
                          <td 
                            style={{ width: columnWidths.start_date }}
                            className="py-2 px-3 border-r border-gray-200"
                          >
                            <span className="text-xs text-gray-900 truncate block">
                              {formatDate(employee.start_date)}
                            </span>
                          </td>
                          <td 
                            style={{ width: columnWidths.actions }}
                            className="py-2 px-3"
                          >
                      <button className="text-gray-400 hover:text-gray-600">
                              <MoreVertical className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                      ))
                    )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
        )
      case "departments":
        return (
          <div className="space-y-6">

            {/* Pie Chart Section */}
            <div className="bg-white rounded-md border border-gray-200 p-6">
              <h3 className="text-md font-semibold text-gray-900 mb-4">Employee Distribution</h3>
              <div className="flex items-center justify-center h-64">
                {departmentStats.length > 0 ? (
                  <div className="flex items-center space-x-8">
                    {/* Simple Pie Chart */}
                    <div className="relative w-48 h-48">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        {(() => {
                          const stats = departmentStats
                          let currentAngle = 0
                          
                          return stats.map((stat, index) => {
                            const percentage = stat.percentage
                            const angle = (percentage / 100) * 360
                            const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180)
                            const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180)
                            const x2 = 50 + 40 * Math.cos(((currentAngle + angle) * Math.PI) / 180)
                            const y2 = 50 + 40 * Math.sin(((currentAngle + angle) * Math.PI) / 180)
                            
                            const largeArcFlag = angle > 180 ? 1 : 0
                            const pathData = [
                              `M 50 50`,
                              `L ${x1} ${y1}`,
                              `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                              'Z'
                            ].join(' ')
                            
                            // Calculate center point of the slice for label positioning
                            const midAngle = currentAngle + (angle / 2)
                            const labelRadius = 25
                            const labelX = 50 + labelRadius * Math.cos((midAngle * Math.PI) / 180)
                            const labelY = 50 + labelRadius * Math.sin((midAngle * Math.PI) / 180)
                            
                            currentAngle += angle
                            
                            return (
                              <g key={stat.id} className="group">
                                <path
                                  d={pathData}
                                  fill={pieChartColors[index % pieChartColors.length]}
                                  stroke="white"
                                  strokeWidth="1"
                                  className="cursor-pointer transition-all duration-200 group-hover:opacity-80"
                                />
                                {/* Card Background */}
                                <rect
                                  x={labelX - 20}
                                  y={labelY - 12}
                                  width="40"
                                  height="24"
                                  rx="4"
                                  fill="rgba(0, 0, 0, 0.8)"
                                  className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                />
                                <text
                                  x={labelX}
                                  y={labelY - 2}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  className="text-[10px] font-medium fill-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                >
                                  {stat.name}
                                </text>
                                <text
                                  x={labelX}
                                  y={labelY + 8}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  className="text-[10px] fill-white pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                >
                                  ({stat.count})
                                </text>
                              </g>
                            )
                          })
                        })()}
                      </svg>
                    </div>
                    
                    {/* Legend */}
                    <div className="space-y-2">
                      {departmentStats.map((stat, index) => {
                        return (
                          <div key={stat.id} className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: pieChartColors[index % pieChartColors.length] }}
                            />
                            <span className="text-sm text-gray-700">{stat.name}</span>
                            <span className="text-sm text-gray-500">({stat.count} employees)</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <Building2 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No departments with employees yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Departments Table */}
            <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs w-10 sticky left-0 bg-gray-50 z-10 border-r border-gray-200">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                          />
                        </div>
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs sticky left-10 bg-gray-50 z-10 border-r border-gray-200">
                        Department Name
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                        Employee Count
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                        Manager
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                        Description
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {!Array.isArray(departments) || departments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Building2 className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No departments yet</h3>
                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">Create your first department to organize your employees and track team performance.</p>
                            <button
                              onClick={() => setIsAddDepartmentModalOpen(true)}
                              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Your First Department
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      departments.map((department) => {
                        const departmentEmployees = departmentEmployeesMap.get(department.id)
                        const isExpanded = expandedDepartments.has(department.id)
                        
                        return (
                          <React.Fragment key={department.id}>
                            <tr className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="py-2 px-3 w-10 sticky left-0 bg-white z-10 border-r border-gray-200">
                                <div className="flex items-center justify-center">
                                  <input
                                    type="checkbox"
                                    className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                </div>
                              </td>
                              <td className="py-2 px-3 sticky left-10 bg-white z-10 border-r border-gray-200">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => toggleDepartmentExpansion(department.id)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                  </button>
                                  <Building2 className="h-3 w-3 text-gray-400" />
                                  <span className="font-medium text-gray-900 text-xs">{department.name}</span>
                                </div>
                              </td>
                              <td className="py-2 px-3 border-r border-gray-200">
                                <span className="text-xs text-gray-900">{departmentEmployees?.length} employees</span>
                              </td>
                              <td className="py-2 px-3 border-r border-gray-200">
                                <span className="text-xs text-gray-900">
                                  {department.manager_id ? 
                                    (() => {
                                      const manager = Array.isArray(employees) ? employees.find(emp => emp.id === department.manager_id) : null
                                      return manager ? `${manager.first_name} ${manager.last_name}` : 'Unknown'
                                    })() : 
                                    'No manager assigned'
                                  }
                                </span>
                              </td>
                              <td className="py-2 px-3 border-r border-gray-200">
                                <span className="text-xs text-gray-900">
                                  {department.description || 'No description'}
                                </span>
                              </td>
                              <td className="py-2 px-3">
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedDepartment(department)
                                      setIsEditDepartmentModalOpen(true)
                                    }}
                                    className="text-gray-400 hover:text-gray-600 p-1"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </button>
                                  {(() => {
                                    const departmentEmployees = departmentEmployeesMap.get(department.id)
                                    const canDelete = departmentEmployees?.length === 0
                                    
                                    return (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          if (canDelete) {
                                            handleDeleteDepartment(department.id)
                                          } else {
                                            showAlert(
                                              'Cannot Delete Department',
                                              `There are ${departmentEmployees?.length} employee(s) still assigned to this department. Please reassign them first.`,
                                              'warning'
                                            )
                                          }
                                        }}
                                        className={`p-1 ${
                                          canDelete 
                                            ? 'text-red-400 hover:text-red-600' 
                                            : 'text-gray-300 cursor-not-allowed'
                                        }`}
                                        title={canDelete ? 'Delete department' : `Cannot delete - ${departmentEmployees?.length} employee(s) assigned`}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    )
                                  })()}
                                </div>
                              </td>
                            </tr>
                            
                            {/* Expanded Employee List */}
                            {isExpanded && (
                              <tr>
                                <td colSpan={6} className="bg-gray-50 p-0">
                                  <div className="p-4">
                                    <h4 className="font-medium text-gray-900 mb-3 text-sm">Employees in {department.name}</h4>
                                    {departmentEmployees?.length === 0 ? (
                                      <p className="text-sm text-gray-500">No employees in this department</p>
                                    ) : (
                                      <div className="space-y-2">
                                        {departmentEmployees?.map((employee: EmployeeWithRelations) => (
                                          <div key={employee.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <div className="flex items-center space-x-2">
                                              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                                                <span className="text-xs font-medium text-purple-600">
                                                  {`${employee.first_name.charAt(0)}${employee.last_name.charAt(0)}`}
                                                </span>
                                              </div>
                                              <span className="text-sm text-gray-900">{`${employee.first_name} ${employee.last_name}`}</span>
                                            </div>
                                            <span className="text-xs text-gray-500">{employee.position}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )

      case "org-chart":
        return (
          <div className="bg-white rounded-md border border-gray-200 p-6">
            <div className="bg-gray-50 rounded-lg p-6 relative overflow-auto" style={{ minHeight: '400px' }}>
              {employees.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Employees</h3>
                    <p className="text-gray-500 mb-4">Add employees to see your organization chart</p>
                    <button
                      onClick={handleAddEmployeeModalOpen}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                      Add Employee
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative w-full" style={{ minHeight: '600px' }}>
                  {/* Background Grid Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <circle cx="10" cy="10" r="1" fill="#9CA3AF"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)"/>
                    </svg>
                  </div>

                  {/* Dynamic Org Chart */}
                  {(() => {
                    const { levels } = buildOrgChartHierarchy()
                    const levelHeight = 140
                    const cardWidth = 260
                    const cardHeight = 90
                    
                    return levels.map((levelEmployees, levelIndex) => {
                      const levelY = levelIndex * levelHeight + 40
                      const totalWidth = levelEmployees.length * cardWidth
                      const containerWidth = Math.max(1000, totalWidth + 100)
                      const startX = Math.max(20, (containerWidth - totalWidth) / 2)
                      
                      return (
                        <div key={levelIndex} className="absolute" style={{ top: levelY, left: startX, width: totalWidth }}>
                          <div className="flex justify-center space-x-6">
                            {levelEmployees.map((employee, empIndex) => {
                              const avatarColor = getAvatarColor(employee.position)
                              const initials = `${employee.first_name?.charAt(0) || ''}${employee.last_name?.charAt(0) || ''}`.toUpperCase()
                              
                              return (
                                <div key={employee.id} className="relative">
                                  <div 
                                    className="bg-white rounded-lg shadow-md p-4 border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
                                    onClick={() => handleEmployeeClick(employee)}
                                    style={{ width: cardWidth, height: cardHeight }}
                                  >
                                    <div className="flex items-center space-x-3 h-full">
                                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${avatarColor} flex-shrink-0`}>
                                        <span className="text-sm font-semibold">{initials}</span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate text-sm">
                                          {employee.first_name} {employee.last_name}
                                        </h3>
                                        <p className="text-xs text-gray-600 truncate">{employee.position}</p>
                                        <p className="text-xs text-gray-500 truncate">{employee.location || 'No location'}</p>
                                      </div>
                                      <MoreVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    </div>
                                  </div>
                                  
                                  {/* Add button if employee has direct reports */}
                                  {employee.directReports && employee.directReports.length > 0 && (
                                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                                      <button className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors shadow-md">
                                        <Plus className="h-3 w-3 text-white" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })
                  })()}

                  {/* Connecting Lines */}
                  <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
                    {(() => {
                      const { levels } = buildOrgChartHierarchy()
                      const levelHeight = 140
                      const cardWidth = 260
                      
                      return levels.flatMap((levelEmployees, levelIndex) => {
                        if (levelIndex === 0) return []
                        
                        const levelY = levelIndex * levelHeight + 40
                        const prevLevelY = (levelIndex - 1) * levelHeight + 40
                        const totalWidth = levelEmployees.length * cardWidth
                        const prevTotalWidth = levels[levelIndex - 1].length * cardWidth
                        const containerWidth = Math.max(1000, Math.max(totalWidth, prevTotalWidth) + 100)
                        const startX = Math.max(20, (containerWidth - totalWidth) / 2)
                        const prevStartX = Math.max(20, (containerWidth - prevTotalWidth) / 2)
                        
                        return levelEmployees.map((employee, empIndex) => {
                          if (!employee.manager_id) return null
                          
                          const manager = levels[levelIndex - 1].find(emp => emp.directReports?.includes(employee.id))
                          if (!manager) return null
                          
                          const managerIndex = levels[levelIndex - 1].findIndex(emp => emp.id === manager.id)
                          const managerX = prevStartX + managerIndex * cardWidth + cardWidth / 2
                          const employeeX = startX + empIndex * cardWidth + cardWidth / 2
                          
                          return (
                            <line
                              key={`${manager.id}-${employee.id}`}
                              x1={managerX}
                              y1={prevLevelY + 90}
                              x2={employeeX}
                              y2={levelY}
                              stroke="#D1D5DB"
                              strokeWidth="2"
                              markerEnd="url(#arrowhead)"
                            />
                          )
                        }).filter(Boolean)
                      })
                    })()}
                    
                    {/* Arrow marker definition */}
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                        refX="9" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#D1D5DB" />
                      </marker>
                    </defs>
                  </svg>
                </div>
              )}

              {/* Zoom Controls */}
              <div className="absolute bottom-4 left-4 flex space-x-2">
                <button className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <span className="text-gray-600 font-semibold">-</span>
                </button>
                <button className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <span className="text-gray-600 font-semibold">+</span>
                </button>
                <button className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <span className="text-gray-600 text-xs">⤢</span>
                </button>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <ProtectedRoute>
      <>
      <PageWrapper 
      title="Employees" 
      headerButtons={headerButtons}
      subHeader={<SubHeader tabs={employeeTabs} activeTab={activeTab} onTabChange={setActiveTab} onFilterClick={() => setShowFilterBar(!showFilterBar)} isFilterActive={showFilterBar} />}
    >
      {renderContent()}
    </PageWrapper>

                {/* Employee Details Side Drawer */}
        {isEmployeeModalOpen && selectedEmployee && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="flex-1 bg-black bg-opacity-25"
              onClick={() => setIsEmployeeModalOpen(false)}
            />
            
            {/* Side Drawer */}
            <div className="w-[45vw] bg-white shadow-xl flex flex-col">
              {/* Profile Header */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-medium text-purple-600">
                        {selectedEmployee.avatar_initials || HrService.generateAvatarInitials(selectedEmployee.first_name, selectedEmployee.last_name)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{`${selectedEmployee.first_name} ${selectedEmployee.last_name}`}</h2>
                      <p className="text-sm text-gray-500">{selectedEmployee.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSave}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Save changes"
                        >
                          <Save className="h-5 w-5" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-gray-600 hover:text-gray-800 p-1"
                          title="Cancel editing"
                        >
                          <XIcon className="h-5 w-5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-gray-600 hover:text-gray-800 p-1"
                        title="Edit employee"
                      >
                        <Edit3 className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => setIsEmployeeModalOpen(false)}
                      className="text-gray-600 hover:text-gray-800 p-1 ml-2 border-l border-gray-300 pl-2"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

                              {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-white">
                  {employeeModalTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setEmployeeModalTab(tab.id)}
                      className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        employeeModalTab === tab.id
                          ? 'border-purple-500 text-purple-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {employeeModalTab === "details" && (
                  <div className="p-4 space-y-4">
                    {/* Employee Information Card */}
                    <div className="border border-gray-200 bg-white rounded-md p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Employee Information</h3>
                        {isEditing ? (
                          <select
                            value={selectedEmployee.status}
                            onChange={(e) => {
                              const updatedEmployee = { ...selectedEmployee, status: e.target.value as any }
                              setSelectedEmployee(updatedEmployee)
                            }}
                            className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          >
                            <option value="Active">Active</option>
                            <option value="On Leave">On Leave</option>
                            <option value="Terminated">Terminated</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedEmployee.status)}`}>
                            {selectedEmployee.status}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Employee ID</p>
                          <p className="text-sm font-medium text-gray-900">{selectedEmployee.employee_id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Position</p>
                          {isEditing ? (
                            <input
                              type="text"
                              value={selectedEmployee.position}
                              onChange={(e) => {
                                const updatedEmployee = { ...selectedEmployee, position: e.target.value }
                                setSelectedEmployee(updatedEmployee)
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                          ) : (
                            <p className="text-sm font-medium text-gray-900">{selectedEmployee.position}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Department</p>
                          {isEditing ? (
                            <div className="space-y-2">
                              {!Array.isArray(departments) || departments.length === 0 ? (
                                <div className="text-center py-3 border border-dashed border-gray-300 rounded-md">
                                  <p className="text-xs text-gray-500 mb-2">No departments created yet</p>
                                  <button
                                    onClick={() => {
                                      setIsEmployeeModalOpen(false)
                                      setIsAddDepartmentModalOpen(true)
                                    }}
                                    className="inline-flex items-center px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Create Department
                                  </button>
                                </div>
                              ) : (
                                <select
                                  value={selectedEmployee.department_id || ''}
                                  onChange={(e) => {
                                    const updatedEmployee = { ...selectedEmployee, department_id: e.target.value }
                                    setSelectedEmployee(updatedEmployee)
                                  }}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                >
                                  <option value="">Select department...</option>
                                  {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                      {dept.name}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm font-medium text-gray-900">{selectedEmployee.department?.name || 'N/A'}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Manager</p>
                          {isEditing ? (
                            <select
                              value={selectedEmployee.manager_id || ''}
                              onChange={(e) => {
                                const updatedEmployee = { ...selectedEmployee, manager_id: e.target.value }
                                setSelectedEmployee(updatedEmployee)
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            >
                              <option value="">Select manager...</option>
                              {employees.filter(emp => emp.id !== selectedEmployee.id).map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                  {emp.first_name} {emp.last_name} - {emp.position}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <p className="text-sm font-medium text-gray-900">
                              {selectedEmployee.manager ? `${selectedEmployee.manager.first_name} ${selectedEmployee.manager.last_name}` : 'N/A'}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Start Date</p>
                          {isEditing ? (
                            <input
                              type="date"
                              value={selectedEmployee.start_date}
                              onChange={(e) => {
                                const updatedEmployee = { ...selectedEmployee, start_date: e.target.value }
                                setSelectedEmployee(updatedEmployee)
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                          ) : (
                            <p className="text-sm font-medium text-gray-900">{formatDate(selectedEmployee.start_date)}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Location</p>
                          {isEditing ? (
                            <input
                              type="text"
                              value={selectedEmployee.location || ''}
                              onChange={(e) => {
                                const updatedEmployee = { ...selectedEmployee, location: e.target.value }
                                setSelectedEmployee(updatedEmployee)
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              placeholder="Enter location"
                            />
                          ) : (
                            <p className="text-sm font-medium text-gray-900">{selectedEmployee.location || 'N/A'}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div className="border border-gray-200 bg-white rounded-md p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Personal Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">First Name</p>
                          {isEditing ? (
                            <input
                              type="text"
                              value={selectedEmployee.first_name}
                              onChange={(e) => {
                                const updatedEmployee = { ...selectedEmployee, first_name: e.target.value }
                                setSelectedEmployee(updatedEmployee)
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                          ) : (
                            <p className="text-sm font-medium text-gray-900">{selectedEmployee.first_name}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Last Name</p>
                          {isEditing ? (
                            <input
                              type="text"
                              value={selectedEmployee.last_name}
                              onChange={(e) => {
                                const updatedEmployee = { ...selectedEmployee, last_name: e.target.value }
                                setSelectedEmployee(updatedEmployee)
                              }}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                          ) : (
                            <p className="text-sm font-medium text-gray-900">{selectedEmployee.last_name}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="border border-gray-200 bg-white rounded-md p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {isEditing ? (
                            <input
                              type="email"
                              value={selectedEmployee.email}
                              onChange={(e) => {
                                const updatedEmployee = { ...selectedEmployee, email: e.target.value }
                                setSelectedEmployee(updatedEmployee)
                              }}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{selectedEmployee.email}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {isEditing ? (
                            <input
                              type="tel"
                              value={selectedEmployee.phone || ''}
                              onChange={(e) => {
                                const updatedEmployee = { ...selectedEmployee, phone: e.target.value }
                                setSelectedEmployee(updatedEmployee)
                              }}
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              placeholder="Enter phone number"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">{selectedEmployee.phone || 'N/A'}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* System Information */}
                    <div className="border border-gray-200 bg-white rounded-md p-4">
                      <h4 className="font-medium text-gray-900 mb-3">System Information</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Created</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(selectedEmployee.created_at)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                          <p className="text-sm font-medium text-gray-900">{formatDate(selectedEmployee.updated_at)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">User ID</p>
                          <p className="text-sm font-medium text-gray-900">{selectedEmployee.user_id || 'Not linked'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Organization ID</p>
                          <p className="text-sm font-medium text-gray-900">{selectedEmployee.organization_id}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {employeeModalTab === "timeoff" && (
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Time Off Requests</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-white rounded border">
                            <div>
                              <div className="font-medium">Vacation Request</div>
                              <div className="text-sm text-gray-600">Dec 15-20, 2024</div>
                            </div>
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                              Pending
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-white rounded border">
                            <div>
                              <div className="font-medium">Sick Leave</div>
                              <div className="text-sm text-gray-600">Nov 28, 2024</div>
                            </div>
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                              Approved
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Leave Balance</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-3 rounded border">
                            <div className="text-sm text-gray-600">Vacation Days</div>
                            <div className="text-2xl font-bold text-blue-600">12</div>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <div className="text-sm text-gray-600">Sick Days</div>
                            <div className="text-2xl font-bold text-green-600">5</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {employeeModalTab === "training" && (
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Current Training</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-white rounded border">
                            <div>
                              <div className="font-medium">Leadership Skills</div>
                              <div className="text-sm text-gray-600">Progress: 75%</div>
                            </div>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-white rounded border">
                            <div>
                              <div className="font-medium">Project Management</div>
                              <div className="text-sm text-gray-600">Progress: 45%</div>
                            </div>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Certifications</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-white rounded border">
                            <div>
                              <div className="font-medium">PMP Certification</div>
                              <div className="text-sm text-gray-600">Expires: Dec 2025</div>
                            </div>
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                              Active
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-white rounded border">
                            <div>
                              <div className="font-medium">Scrum Master</div>
                              <div className="text-sm text-gray-600">Expires: Mar 2026</div>
                            </div>
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                              Active
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Department Modal */}
        {isAddDepartmentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black bg-opacity-25"
              onClick={() => setIsAddDepartmentModalOpen(false)}
            />
            <div className="relative bg-white rounded-lg shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Add New Department</h2>
                <p className="text-sm text-gray-600 mt-1">Create a new department to organize your employees</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                  <input
                    type="text"
                    value={newDepartment.name}
                    onChange={(e) => setNewDepartment({...newDepartment, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter department name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newDepartment.description}
                    onChange={(e) => setNewDepartment({...newDepartment, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter department description"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department Manager</label>
                  <select
                    value={newDepartment.manager_id}
                    onChange={(e) => setNewDepartment({...newDepartment, manager_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select manager...</option>
                    {Array.isArray(employees) && employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} - {emp.position}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-end p-6 border-t border-gray-200 space-x-3">
                <button
                  onClick={() => setIsAddDepartmentModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDepartment}
                  disabled={!newDepartment.name}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Department
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Department Modal */}
        {isEditDepartmentModalOpen && selectedDepartment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black bg-opacity-25"
              onClick={() => setIsEditDepartmentModalOpen(false)}
            />
            <div className="relative bg-white rounded-lg shadow-xl w-[500px] max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Edit Department</h2>
                <p className="text-sm text-gray-600 mt-1">Update department information</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                  <input
                    type="text"
                    value={selectedDepartment.name}
                    onChange={(e) => setSelectedDepartment({...selectedDepartment, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter department name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={selectedDepartment.description || ''}
                    onChange={(e) => setSelectedDepartment({...selectedDepartment, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter department description"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department Manager</label>
                  <select
                    value={selectedDepartment.manager_id || ''}
                    onChange={(e) => setSelectedDepartment({...selectedDepartment, manager_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select manager...</option>
                    {Array.isArray(employees) && employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} - {emp.position}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-end p-6 border-t border-gray-200 space-x-3">
                <button
                  onClick={() => setIsEditDepartmentModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditDepartment}
                  disabled={!selectedDepartment.name}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Department
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alert Modal */}
        {isAlertModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black bg-opacity-25"
              onClick={() => setIsAlertModalOpen(false)}
            />
            <div className="relative bg-white rounded-lg shadow-xl w-[400px] max-w-full">
              <div className={`p-6 border-b border-gray-200 ${
                alertType === 'error' ? 'border-red-200' :
                alertType === 'warning' ? 'border-yellow-200' :
                'border-blue-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    alertType === 'error' ? 'bg-red-100' :
                    alertType === 'warning' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    {alertType === 'error' ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : alertType === 'warning' ? (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{alertTitle}</h2>
                </div>
              </div>
              
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-6">{alertMessage}</p>
                
                <div className="flex justify-end space-x-3">
                  {alertType === 'warning' && alertTitle === 'Delete Department' ? (
                    <>
                      <button
                        onClick={() => setIsAlertModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                                             <button
                         onClick={() => {
                           setIsAlertModalOpen(false)
                           setDepartmentToDelete(null)
                         }}
                         className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                       >
                         Cancel
                       </button>
                       <button
                         onClick={confirmDeleteDepartment}
                         className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                       >
                         Delete
                       </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsAlertModalOpen(false)}
                      className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        alertType === 'error' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' :
                        alertType === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500' :
                        'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'
                      }`}
                    >
                      OK
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Employee Modal */}
        {isAddEmployeeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-25"
              onClick={() => setIsAddEmployeeModalOpen(false)}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl w-[800px] h-[600px] flex">
              {/* Left Column - Header */}
              <div className="w-1/3 bg-gray-50 p-6 border-r border-gray-200 flex items-center justify-center rounded-l-lg">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                    <User className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Add Employee</h3>
                  <p className="text-sm text-gray-600 max-w-xs">
                    Create a new employee record and optionally link to a user account
                  </p>
                </div>
              </div>

              {/* Right Column - Form with Footer */}
              <div className="w-2/3 flex flex-col">
                {/* Form Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="space-y-4">
                    {/* User Account Linking */}
                    <div className="space-y-3 p-4 border border-purple-200 rounded-lg bg-purple-50">
                      <div className="flex items-center space-x-2">
                                                    <input
                              type="checkbox"
                              id="linkToUser"
                              checked={linkToUser}
                              onChange={(e) => {
                                setLinkToUser(e.target.checked)
                                if (!e.target.checked) {
                                  // Clear user selection and reset form fields when unchecked
                                  setSelectedUserId('')
                                  setNewEmployee({
                                    ...newEmployee,
                                    first_name: '',
                                    last_name: '',
                                    email: ''
                                  })
                                }
                              }}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                        <label htmlFor="linkToUser" className="text-sm font-medium text-gray-700">
                          Link to existing user account
                        </label>
                      </div>
                      
                                                {linkToUser && (
                            <div className="space-y-2">
                              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                                Select User
                              </label>
                              <select
                                id="userId"
                                value={selectedUserId}
                                onChange={(e) => handleUserSelection(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              >
                                <option value="">Select a user...</option>
                                {organizationUsers.map((user) => (
                                  <option key={user.id} value={user.id}>
                                    {user.first_name} {user.last_name} ({user.email})
                                  </option>
                                ))}
                              </select>
                              <p className="text-xs text-gray-500">
                                Select a user to automatically populate their information
                              </p>
                            </div>
                          )}
                    </div>

                    {/* Employee Information */}
                                            <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Employee ID
                              <span className="text-xs text-gray-500 ml-1">(Auto-generated)</span>
                            </label>
                            <input
                              type="text"
                              value={isGeneratingId ? 'Generating...' : newEmployee.employee_id}
                              onChange={(e) => setNewEmployee({...newEmployee, employee_id: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 select-none"
                              placeholder="EMP001"
                              readOnly
                              disabled={isGeneratingId}
                              onSelect={(e) => e.preventDefault()}
                              onCopy={(e) => e.preventDefault()}
                              onCut={(e) => e.preventDefault()}
                              onPaste={(e) => e.preventDefault()}
                            />
                          </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={newEmployee.status}
                          onChange={(e) => setNewEmployee({...newEmployee, status: e.target.value as any})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="Active">Active</option>
                          <option value="On Leave">On Leave</option>
                          <option value="Terminated">Terminated</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input
                          type="text"
                          value={newEmployee.first_name}
                          onChange={(e) => setNewEmployee({...newEmployee, first_name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter first name"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <input
                          type="text"
                          value={newEmployee.last_name}
                          onChange={(e) => setNewEmployee({...newEmployee, last_name: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter last name"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          value={newEmployee.email}
                          onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter email address"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="text"
                          value={newEmployee.phone}
                          onChange={(e) => setNewEmployee({...newEmployee, phone: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                        <input
                          type="text"
                          value={newEmployee.position}
                          onChange={(e) => setNewEmployee({...newEmployee, position: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter position"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select
                          value={newEmployee.department_id}
                          onChange={(e) => setNewEmployee({...newEmployee, department_id: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="">Select department...</option>
                          {Array.isArray(departments) && departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                        <input
                          type="date"
                          value={newEmployee.start_date}
                          onChange={(e) => setNewEmployee({...newEmployee, start_date: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          value={newEmployee.location}
                          onChange={(e) => setNewEmployee({...newEmployee, location: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter location"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                      <select
                        value={newEmployee.manager_id}
                        onChange={(e) => setNewEmployee({...newEmployee, manager_id: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select manager...</option>
                        {Array.isArray(employees) && employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.first_name} {emp.last_name} - {emp.position}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Footer - Only for Right Column */}
                <div className="flex items-center justify-end p-6 border-t border-gray-200 space-x-3">
                  <button
                    onClick={() => setIsAddEmployeeModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddEmployee}
                    disabled={!newEmployee.first_name || !newEmployee.last_name || !newEmployee.email || !newEmployee.position || !newEmployee.start_date}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Employee
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
      </ProtectedRoute>
    )
}
