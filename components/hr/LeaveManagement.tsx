import React, { useState, useEffect, useMemo } from 'react'
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Search, 
  Filter, 
  ChevronUp, 
  ChevronDown,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  TrendingUp,
  Users,
  FileText
} from 'lucide-react'
import { LeaveService } from '@/lib/services/leaveService'
import { useOrganization } from '@/lib/hooks/useOrganization'
import { supabase } from '@/lib/supabase'
import {
  LeaveRequestWithDetails,
  LeaveBalanceWithDetails,
  CreateLeaveRequestData,
  UpdateLeaveRequestData,
  LeaveSummary,
  TeamLeaveSummary
} from '@/lib/types/leave'

interface LeaveManagementProps {
  isManager: boolean
}

export default function LeaveManagement({ isManager }: LeaveManagementProps) {
  const { currentOrganization } = useOrganization()
  const [activeTab, setActiveTab] = useState<'my-leave' | 'my-team'>('my-leave')
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestWithDetails | null>(null)
  const [showFilterBar, setShowFilterBar] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortField, setSortField] = useState('created_at')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Data states
  const [myRequests, setMyRequests] = useState<LeaveRequestWithDetails[]>([])
  const [myBalances, setMyBalances] = useState<LeaveBalanceWithDetails[]>([])
  const [teamRequests, setTeamRequests] = useState<LeaveRequestWithDetails[]>([])
  const [teamBalances, setTeamBalances] = useState<LeaveBalanceWithDetails[]>([])
  const [leaveSummary, setLeaveSummary] = useState<LeaveSummary | null>(null)
  const [teamSummary, setTeamSummary] = useState<TeamLeaveSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data
  const loadData = async () => {
    if (!currentOrganization?.id) {
      console.log('LeaveManagement: No organization ID available')
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log('LeaveManagement: Loading data for organization:', currentOrganization.id)

      // Check if user is authenticated first
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.log('LeaveManagement: User not authenticated, skipping data load')
        setLoading(false)
        return
      }

      console.log('LeaveManagement: User authenticated:', user.id)

      const [myRequestsData, myBalancesData, leaveSummaryData] = await Promise.all([
        LeaveService.getCurrentUserLeaveRequests(currentOrganization.id),
        LeaveService.getCurrentUserLeaveBalances(currentOrganization.id),
        LeaveService.getLeaveSummary(currentOrganization.id)
      ])

      setMyRequests(myRequestsData)
      setMyBalances(myBalancesData)
      setLeaveSummary(leaveSummaryData)

      if (isManager) {
        const [teamRequestsData, teamBalancesData, teamSummaryData] = await Promise.all([
          LeaveService.getPendingTeamRequests(currentOrganization.id),
          LeaveService.getLeaveBalances(currentOrganization.id),
          LeaveService.getTeamLeaveSummary(currentOrganization.id)
        ])

        setTeamRequests(teamRequestsData)
        setTeamBalances(teamBalancesData)
        setTeamSummary(teamSummaryData)
      }
    } catch (err) {
      console.error('LeaveManagement: Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentOrganization?.id, isManager])

  // Filter and sort data
  const filteredRequests = useMemo(() => {
    let requests = activeTab === 'my-leave' ? myRequests : teamRequests
    
    if (searchTerm) {
      requests = requests.filter(request => 
        request.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.leave_type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      requests = requests.filter(request => request.status === statusFilter)
    }

    return requests.sort((a, b) => {
      const aValue = a[sortField as keyof LeaveRequestWithDetails]
      const bValue = b[sortField as keyof LeaveRequestWithDetails]
      
      if (sortDirection === 'asc') {
        return (aValue || '') > (bValue || '') ? 1 : -1
      } else {
        return (aValue || '') < (bValue || '') ? 1 : -1
      }
    })
  }, [activeTab, myRequests, teamRequests, searchTerm, statusFilter, sortField, sortDirection])

  // Handle functions
  const handleCreateRequest = async (data: CreateLeaveRequestData) => {
    if (!currentOrganization?.id) return

    try {
      await LeaveService.createLeaveRequest(currentOrganization.id, 'current-user-id', data)
      await loadData()
      setShowRequestModal(false)
    } catch (err) {
      console.error('Failed to create request:', err)
    }
  }

  const handleApproval = async (requestId: string, notes: string) => {
    try {
      await LeaveService.updateLeaveRequest(requestId, {
        status: 'approved',
        notes
      })
      await loadData()
      setShowApprovalModal(false)
      setSelectedRequest(null)
    } catch (err) {
      console.error('Failed to approve request:', err)
    }
  }

  const handleRejection = async (requestId: string, notes: string) => {
    try {
      await LeaveService.updateLeaveRequest(requestId, {
        status: 'rejected',
        rejection_reason: notes,
        notes
      })
      await loadData()
      setShowApprovalModal(false)
      setSelectedRequest(null)
    } catch (err) {
      console.error('Failed to reject request:', err)
    }
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-800 border-yellow-200'
      case 'approved': return 'bg-green-50 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-50 text-red-800 border-red-200'
      case 'cancelled': return 'bg-gray-50 text-gray-800 border-gray-200'
      default: return 'bg-gray-50 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3" />
      case 'approved': return <CheckCircle className="h-3 w-3" />
      case 'rejected': return <XCircle className="h-3 w-3" />
      case 'cancelled': return <XCircle className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Render functions
  const renderSummaryCards = () => {
    const summary = activeTab === 'my-leave' ? leaveSummary : null
    const teamData = activeTab === 'my-team' ? teamSummary : []

    if (activeTab === 'my-leave' && summary) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Requests</p>
                <p className="text-lg font-bold text-gray-900">{summary.total_requests}</p>
              </div>
              <FileText className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-lg font-bold text-yellow-600">{summary.pending_requests}</p>
              </div>
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Approved</p>
                <p className="text-lg font-bold text-green-600">{summary.approved_requests}</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Days Approved</p>
                <p className="text-lg font-bold text-blue-600">{summary.total_days_approved}</p>
              </div>
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>
      )
    }

    if (activeTab === 'my-team' && teamData.length > 0) {
      const totalPending = teamData.reduce((sum, member) => sum + member.pending_requests, 0)
      const totalRequests = teamData.reduce((sum, member) => sum + member.total_requests, 0)
      const totalDays = teamData.reduce((sum, member) => sum + member.total_days_requested, 0)

      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Team Members</p>
                <p className="text-lg font-bold text-gray-900">{teamData.length}</p>
              </div>
              <Users className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Pending Requests</p>
                <p className="text-lg font-bold text-yellow-600">{totalPending}</p>
              </div>
              <AlertCircle className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Requests</p>
                <p className="text-lg font-bold text-blue-600">{totalRequests}</p>
              </div>
              <FileText className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Days Requested</p>
                <p className="text-lg font-bold text-green-600">{totalDays}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  const renderLeaveBalances = () => {
    const balances = activeTab === 'my-leave' ? myBalances : teamBalances

    if (balances.length === 0) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No leave balances found</p>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs sticky left-0 bg-gray-50 z-10 border-r border-gray-200">
                  {activeTab === 'my-leave' ? 'Leave Type' : 'Employee'}
                </th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                  Allocated
                </th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                  Used
                </th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                  Pending
                </th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                  Available
                </th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs">
                  Year
                </th>
              </tr>
            </thead>
            <tbody>
              {balances.map((balance, index) => (
                <tr key={balance.id} className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="py-2 px-3 text-xs font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: balance.leave_type_color }}
                      />
                      <span>{activeTab === 'my-leave' ? balance.leave_type_name : balance.employee_name}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-900 text-center border-r border-gray-200">
                    {balance.allocated_days}
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-900 text-center border-r border-gray-200">
                    {balance.used_days}
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-900 text-center border-r border-gray-200">
                    {balance.pending_days}
                  </td>
                  <td className={`py-2 px-3 text-xs text-center font-medium border-r border-gray-200 ${
                    balance.available_days < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {balance.available_days}
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-900 text-center">
                    {balance.year}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderRequestsTable = () => {
    if (filteredRequests.length === 0) {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No leave requests found</p>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs sticky left-0 bg-gray-50 z-10 border-r border-gray-200">
                  <div className="flex items-center space-x-1">
                    <span>Employee</span>
                    <button 
                      onClick={() => handleSort('employee_name')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {sortField === 'employee_name' && sortDirection === 'asc' ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </th>
                <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                  <div className="flex items-center space-x-1">
                    <span>Leave Type</span>
                    <button 
                      onClick={() => handleSort('leave_type_name')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {sortField === 'leave_type_name' && sortDirection === 'asc' ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                  <div className="flex items-center space-x-1 justify-center">
                    <span>Start Date</span>
                    <button 
                      onClick={() => handleSort('start_date')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {sortField === 'start_date' && sortDirection === 'asc' ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                  <div className="flex items-center space-x-1 justify-center">
                    <span>End Date</span>
                    <button 
                      onClick={() => handleSort('end_date')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {sortField === 'end_date' && sortDirection === 'asc' ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                  <div className="flex items-center space-x-1 justify-center">
                    <span>Days</span>
                    <button 
                      onClick={() => handleSort('days_requested')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {sortField === 'days_requested' && sortDirection === 'asc' ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                  <div className="flex items-center space-x-1 justify-center">
                    <span>Status</span>
                    <button 
                      onClick={() => handleSort('status')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {sortField === 'status' && sortDirection === 'asc' ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                </th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request, index) => (
                <tr key={request.id} className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="py-2 px-3 text-xs font-medium text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-200">
                    {request.employee_name}
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-900 border-r border-gray-200">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: request.leave_type_color }}
                      />
                      <span>{request.leave_type_name}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-900 text-center border-r border-gray-200">
                    {formatDate(request.start_date)}
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-900 text-center border-r border-gray-200">
                    {formatDate(request.end_date)}
                  </td>
                  <td className="py-2 px-3 text-xs text-gray-900 text-center border-r border-gray-200">
                    {request.days_requested}
                  </td>
                  <td className={`py-2 px-3 text-xs text-center border-r border-gray-200 ${getStatusColor(request.status)}`}>
                    <div className="flex items-center justify-center space-x-1">
                      {getStatusIcon(request.status)}
                      <span className="font-medium">{request.status}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-xs text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button 
                        onClick={() => {
                          setSelectedRequest(request)
                          setShowApprovalModal(true)
                        }}
                        className="text-gray-400 hover:text-gray-600"
                        title="View Details"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                      {isManager && request.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => {
                              setSelectedRequest(request)
                              setShowApprovalModal(true)
                            }}
                            className="text-green-400 hover:text-green-600"
                            title="Approve"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedRequest(request)
                              setShowApprovalModal(true)
                            }}
                            className="text-red-400 hover:text-red-600"
                            title="Reject"
                          >
                            <XCircle className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leave data...</p>
        </div>
      </div>
    )
  }

  if (!currentOrganization?.id) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please select an organization to view leave data</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('my-leave')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 text-xs font-medium transition-colors ${
              activeTab === 'my-leave'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <User className="h-3 w-3" />
            <span>My Leave</span>
          </button>
          {isManager && (
            <button
              onClick={() => setActiveTab('my-team')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 text-xs font-medium transition-colors ${
                activeTab === 'my-team'
                  ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="h-3 w-3" />
              <span>My Team</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {renderSummaryCards()}

      {/* Leave Balances */}
      {renderLeaveBalances()}

      {/* Filter Bar */}
      {showFilterBar && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full text-xs border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                }}
                className="w-full px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Requests Table */}
      {renderRequestsTable()}

      {/* Modals would be rendered here */}
      {/* You'll need to create/import the modal components */}
    </div>
  )
} 