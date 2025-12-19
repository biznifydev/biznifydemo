"use client"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { SubHeader } from "@/components/layout/SubHeader"
import { useState, useEffect } from "react"
import { Plus, Calendar, Clock, CheckCircle, XCircle, Clock as ClockIcon, User, CalendarDays, AlertCircle, Filter, Download, ChevronLeft, ChevronRight, Search, Hand, Umbrella, Thermometer } from "lucide-react"
import { LeaveRequestModal } from "@/components/hr/LeaveRequestModal"
import { ApprovalModal } from "@/components/hr/ApprovalModal"
import LeaveManagement from "@/components/hr/LeaveManagement"
import { LeaveService } from "@/lib/services/leaveService"
import { HrService } from "@/lib/services/hrService"
import { useOrganization } from "@/lib/hooks/useOrganization"
import { LeaveRequestWithDetails, LeaveType } from "@/lib/types/leave"
import { EmployeeWithRelations } from "@/lib/types/hr"

export default function TimeManagerPage() {
  const { currentOrganization } = useOrganization()
  const [activeTab, setActiveTab] = useState("leave-management")
  const [selectedLeaveType, setSelectedLeaveType] = useState("annual")
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState("monthly")
  
  // Database state
  const [employees, setEmployees] = useState<EmployeeWithRelations[]>([])
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestWithDetails[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const timeManagerTabs = [
    { id: "leave-management", label: "Leave Management" },
    { id: "calendar", label: "Calendar" },
  ]

  // Load data from database
  const loadData = async () => {
    if (!currentOrganization?.id) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const [employeesData, leaveRequestsData, leaveTypesData] = await Promise.all([
        HrService.getEmployees(),
        LeaveService.getLeaveRequests(currentOrganization.id),
        LeaveService.getLeaveTypes(currentOrganization.id)
      ])
      
      setEmployees(employeesData)
      setLeaveRequests(leaveRequestsData)
      setLeaveTypes(leaveTypesData)
    } catch (err) {
      console.error('Error loading time manager data:', err)
      setError('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentOrganization?.id])

  // Generate calendar events from leave requests
  const generateCalendarEvents = () => {
    console.log('Generating calendar events...')
    console.log('Leave requests:', leaveRequests)
    console.log('Leave types:', leaveTypes)
    console.log('Current date:', currentDate)
    
    const events: Array<{
      employeeId: string
      day: number
      type: string
      icon: any
      color: string
      request: LeaveRequestWithDetails
    }> = []
    
    leaveRequests.forEach(request => {
      const startDate = new Date(request.start_date)
      const endDate = new Date(request.end_date)
      const currentMonth = currentDate.getMonth()
      const currentYear = currentDate.getFullYear()
      
      console.log(`Processing request: ${request.employee_name} from ${startDate} to ${endDate}`)
      
      // Only show events for current month
      if (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) {
        const leaveType = leaveTypes.find(lt => lt.id === request.leave_type_id)
        
        // Generate events for each day of the leave request
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
            const day = d.getDate()
            
            // Determine icon and color based on leave type
            let icon = Hand
            let color = "purple"
            
            if (leaveType) {
              switch (leaveType.name.toLowerCase()) {
                case 'vacation':
                case 'annual leave':
                  icon = Umbrella
                  color = "blue"
                  break
                case 'sick leave':
                  icon = Thermometer
                  color = "orange"
                  break
                default:
                  icon = Hand
                  color = leaveType.color || "purple"
              }
            }
            
            events.push({
              employeeId: request.employee_id,
              day,
              type: request.status,
              icon,
              color,
              request
            })
            
            console.log(`Added event for ${request.employee_name} on day ${day}`)
          }
        }
      }
    })
    
    console.log('Generated events:', events)
    return events
  }

  const calendarEvents = generateCalendarEvents()

  const headerButtons = (
    <>
      <button 
        onClick={() => setShowRequestModal(true)}
        className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-1"
      >
        <Plus className="h-3 w-3" />
        <span>Request Leave</span>
      </button>
      <button 
        onClick={() => {
          // Export functionality - could generate CSV or PDF
          console.log('Exporting calendar data...')
        }}
        className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors"
      >
        Export Report
      </button>
    </>
  )

  // Generate calendar days for current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const calendarDays = getCalendarDays()
  const today = new Date().getDate()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Check if a day is weekend (Saturday = 6, Sunday = 0)
  const isWeekend = (day: number) => {
    const date = new Date(currentYear, currentMonth, day)
    const dayOfWeek = date.getDay()
    return dayOfWeek === 0 || dayOfWeek === 6
  }

  // Get event for specific employee and day
  const getEvent = (employeeId: string, day: number) => {
    return calendarEvents.find(event => event.employeeId === employeeId && event.day === day)
  }

  // Filter employees based on search
  const filteredEmployees = employees.filter(employee =>
    `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const handleLeaveRequest = async (data: any) => {
    if (!currentOrganization?.id) return
    
    try {
      // Create leave request using the service
      await LeaveService.createLeaveRequest(currentOrganization.id, data.employee_id, {
        leave_type_id: data.leave_type_id,
        start_date: data.start_date,
        end_date: data.end_date,
        reason: data.reason,
        description: data.description
      })
      
      // Refresh data
      await loadData()
      setShowRequestModal(false)
    } catch (err) {
      console.error('Error creating leave request:', err)
      setError('Failed to create leave request')
    }
  }

  const handleApproval = async (requestId: string, notes: string) => {
    try {
      await LeaveService.updateLeaveRequest(requestId, {
        status: 'approved',
        notes
      })
      
      // Refresh data
      await loadData()
      setShowApprovalModal(false)
    } catch (err) {
      console.error('Error approving request:', err)
      setError('Failed to approve request')
    }
  }

  const handleRejection = async (requestId: string, notes: string) => {
    try {
      await LeaveService.updateLeaveRequest(requestId, {
        status: 'rejected',
        rejection_reason: notes
      })
      
      // Refresh data
      await loadData()
      setShowApprovalModal(false)
    } catch (err) {
      console.error('Error rejecting request:', err)
      setError('Failed to reject request')
    }
  }

  const renderCalendarContent = () => {
    if (isLoading) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <div className="text-gray-500">Loading calendar data...</div>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div className="flex items-center justify-center">
            <div className="text-red-500">Error: {error}</div>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Calendar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900">Team Calendar</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateDate('prev')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
                  {formatDate(currentDate)}
                </span>
                <button
                  onClick={() => navigateDate('next')}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left text-xs font-medium text-gray-700 border-b border-gray-200 min-w-[200px]">
                  Employee
                </th>
                {calendarDays.map((day) => (
                  <th key={day} className={`p-2 text-xs font-medium text-center border-b border-gray-200 ${
                    isWeekend(day) ? 'bg-red-50 text-red-700' : 'text-gray-700'
                  }`}>
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b border-gray-100">
                    <td className="p-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-700">
                          {HrService.generateAvatarInitials(employee.first_name, employee.last_name)}
                        </div>
                        <span>{`${employee.first_name} ${employee.last_name}`}</span>
                      </div>
                    </td>
                    {calendarDays.map((day) => {
                      const event = getEvent(employee.id, day)
                      return (
                        <td key={day} className={`p-2 text-center border-r border-gray-100 ${
                          isWeekend(day) ? 'bg-red-50' : 'bg-white'
                        }`}>
                          {event && (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center mx-auto ${
                              event.color === 'purple' ? 'bg-purple-100 border-2 border-purple-400' :
                              event.color === 'blue' ? 'bg-blue-100 border-2 border-blue-400' :
                              'bg-orange-100 border-2 border-orange-400'
                            }`}>
                              <event.icon className={`h-2 w-2 ${
                                event.color === 'purple' ? 'text-purple-600' :
                                event.color === 'blue' ? 'text-blue-600' :
                                'text-orange-600'
                              }`} />
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={calendarDays.length + 1} className="p-8 text-center text-gray-500">
                    {employees.length === 0 ? 'No employees found' : 'No employees match your search'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Legend */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-50 border-2 border-purple-400 rounded flex items-center justify-center">
                <Hand className="h-2 w-2 text-purple-600" />
              </div>
              <span>Leave Request</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-50 border-2 border-blue-400 rounded flex items-center justify-center">
                <Umbrella className="h-2 w-2 text-blue-600" />
              </div>
              <span>Vacation</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-50 border-2 border-orange-400 rounded flex items-center justify-center">
                <Thermometer className="h-2 w-2 text-orange-600" />
              </div>
              <span>Sick Leave</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case "leave-management":
        return <LeaveManagement isManager={true} />
      case "calendar":
        return renderCalendarContent()
      default:
        return null
    }
  }

  return (
    <>
      <PageWrapper
        title="Time Manager" 
        headerButtons={headerButtons}
        subHeader={<SubHeader tabs={timeManagerTabs} activeTab={activeTab} onTabChange={setActiveTab} />}
      >
        {renderContent()}
      </PageWrapper>

      {/* Leave Request Modal */}
      <LeaveRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleLeaveRequest}
      />

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        request={selectedRequest}
        onApprove={handleApproval}
        onReject={handleRejection}
      />
    </>
  )
} 