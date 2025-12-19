'use client'

import { useState } from 'react'
import { 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus, 
  Search, 
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  FileText,
  Building,
  Users,
  Shield,
  TrendingUp,
  Bell
} from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { SubHeader } from '@/components/layout/SubHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ComplianceDeadline {
  id: string
  title: string
  description: string
  dueDate: string
  status: 'upcoming' | 'overdue' | 'completed' | 'warning'
  priority: 'high' | 'medium' | 'low'
  category: 'companies-house' | 'tax' | 'employment' | 'data-protection' | 'health-safety' | 'financial'
  assignedTo: string
  organization: string
  daysUntilDue: number
}

interface ComplianceRequirement {
  id: string
  title: string
  description: string
  frequency: 'annual' | 'quarterly' | 'monthly' | 'one-time'
  lastCompleted?: string
  nextDue?: string
  status: 'active' | 'inactive' | 'completed'
  category: string
}

export default function LegalCompliancePage() {
  const [activeTab, setActiveTab] = useState('deadlines')
  const [showFilterBar, setShowFilterBar] = useState(false)
  const [deadlineSearch, setDeadlineSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [isAddDeadlineModalOpen, setIsAddDeadlineModalOpen] = useState(false)
  const [isWizardModalOpen, setIsWizardModalOpen] = useState(false)
  const [sortField, setSortField] = useState('dueDate')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // Mock data for compliance deadlines
  const complianceDeadlines: ComplianceDeadline[] = [
    {
      id: '1',
      title: 'Companies House Annual Return',
      description: 'Annual confirmation statement for company registration',
      dueDate: '2024-03-15',
      status: 'upcoming',
      priority: 'high',
      category: 'companies-house',
      assignedTo: 'Legal Team',
      organization: 'Companies House',
      daysUntilDue: 12
    },
    {
      id: '2',
      title: 'VAT Return Submission',
      description: 'Quarterly VAT return for Q1 2024',
      dueDate: '2024-02-28',
      status: 'overdue',
      priority: 'high',
      category: 'tax',
      assignedTo: 'Finance Team',
      organization: 'HMRC',
      daysUntilDue: -3
    },
    {
      id: '3',
      title: 'Data Protection Impact Assessment',
      description: 'Annual DPIA review for customer data processing',
      dueDate: '2024-04-01',
      status: 'warning',
      priority: 'medium',
      category: 'data-protection',
      assignedTo: 'IT Team',
      organization: 'ICO',
      daysUntilDue: 29
    },
    {
      id: '4',
      title: 'Health & Safety Audit',
      description: 'Annual workplace safety assessment',
      dueDate: '2024-03-30',
      status: 'upcoming',
      priority: 'medium',
      category: 'health-safety',
      assignedTo: 'HR Team',
      organization: 'HSE',
      daysUntilDue: 27
    },
    {
      id: '5',
      title: 'Employment Law Review',
      description: 'Review and update employment contracts',
      dueDate: '2024-02-15',
      status: 'completed',
      priority: 'low',
      category: 'employment',
      assignedTo: 'Legal Team',
      organization: 'Internal',
      daysUntilDue: -16
    }
  ]

  // Mock data for compliance requirements
  const complianceRequirements: ComplianceRequirement[] = [
    {
      id: '1',
      title: 'Annual Accounts Filing',
      description: 'File annual accounts with Companies House',
      frequency: 'annual',
      lastCompleted: '2023-03-15',
      nextDue: '2024-03-15',
      status: 'active',
      category: 'companies-house'
    },
    {
      id: '2',
      title: 'VAT Returns',
      description: 'Submit quarterly VAT returns',
      frequency: 'quarterly',
      lastCompleted: '2023-11-30',
      nextDue: '2024-02-28',
      status: 'active',
      category: 'tax'
    },
    {
      id: '3',
      title: 'Data Protection Training',
      description: 'Annual GDPR training for all staff',
      frequency: 'annual',
      lastCompleted: '2023-06-15',
      nextDue: '2024-06-15',
      status: 'active',
      category: 'data-protection'
    }
  ]

  const complianceTabs = [
    { id: 'deadlines', label: 'Deadlines', count: complianceDeadlines.length },
    { id: 'requirements', label: 'Requirements', count: complianceRequirements.length },
    { id: 'reports', label: 'Reports', count: 0 }
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'warning', label: 'Warning' },
    { value: 'completed', label: 'Completed' }
  ]

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'companies-house', label: 'Companies House' },
    { value: 'tax', label: 'Tax' },
    { value: 'employment', label: 'Employment' },
    { value: 'data-protection', label: 'Data Protection' },
    { value: 'health-safety', label: 'Health & Safety' },
    { value: 'financial', label: 'Financial' }
  ]

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ]

  const headerButtons = (
    <>
      <button 
        onClick={() => setIsWizardModalOpen(true)}
        className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-1"
      >
        <Shield className="h-3 w-3" />
        <span>Compliance Wizard</span>
      </button>
      <button 
        onClick={() => setIsAddDeadlineModalOpen(true)}
        className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors flex items-center space-x-1"
      >
        <Plus className="h-3 w-3" />
        <span>Add Deadline</span>
      </button>
    </>
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-gray-100 text-gray-800'
      case 'overdue': return 'bg-gray-100 text-gray-800'
      case 'warning': return 'bg-gray-100 text-gray-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-gray-100 text-gray-800'
      case 'medium': return 'bg-gray-100 text-gray-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'companies-house': return <Building className="h-4 w-4" />
      case 'tax': return <TrendingUp className="h-4 w-4" />
      case 'employment': return <Users className="h-4 w-4" />
      case 'data-protection': return <Shield className="h-4 w-4" />
      case 'health-safety': return <AlertTriangle className="h-4 w-4" />
      case 'financial': return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getFilteredDeadlines = () => {
    return complianceDeadlines.filter(deadline => {
      const matchesSearch = deadline.title.toLowerCase().includes(deadlineSearch.toLowerCase()) ||
                           deadline.description.toLowerCase().includes(deadlineSearch.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || deadline.status === selectedStatus
      const matchesCategory = selectedCategory === 'all' || deadline.category === selectedCategory
      const matchesPriority = selectedPriority === 'all' || deadline.priority === selectedPriority
      
      return matchesSearch && matchesStatus && matchesCategory && matchesPriority
    }).sort((a, b) => {
      if (sortField === 'dueDate') {
        return sortDirection === 'asc' 
          ? new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          : new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      }
      return 0
    })
  }

  const getDeadlineStats = () => {
    const total = complianceDeadlines.length
    const overdue = complianceDeadlines.filter(d => d.status === 'overdue').length
    const upcoming = complianceDeadlines.filter(d => d.status === 'upcoming').length
    const completed = complianceDeadlines.filter(d => d.status === 'completed').length
    
    return { total, overdue, upcoming, completed }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const renderDeadlinesTab = () => {
    const stats = getDeadlineStats()
    const filteredDeadlines = getFilteredDeadlines()

    return (
      <div>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deadlines</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-purple-600">{stats.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-purple-400" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-400" />
            </div>
          </Card>
        </div>

        {/* Filter Bar */}
        {showFilterBar && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search deadlines..."
                    value={deadlineSearch}
                    onChange={(e) => setDeadlineSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setDeadlineSearch("")
                    setSelectedStatus("all")
                    setSelectedCategory("all")
                    setSelectedPriority("all")
                  }}
                  className="w-full px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-300"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deadlines Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-2 px-4 font-semibold text-gray-700 text-xs">
                    <div className="flex items-center space-x-1">
                      <span>Deadline</span>
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => {
                          setSortField('dueDate')
                          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
                        }}
                      >
                        {sortField === 'dueDate' && sortDirection === 'asc' ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-700 text-xs">Category</th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-700 text-xs">Priority</th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-700 text-xs">Status</th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-700 text-xs">Assigned To</th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-700 text-xs">Days Until Due</th>
                  <th className="text-left py-2 px-4 font-semibold text-gray-700 text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeadlines.map((deadline) => (
                  <tr key={deadline.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-4">
                      <div>
                        <div className="font-medium text-gray-900 text-xs">{deadline.title}</div>
                        <div className="text-xs text-gray-500">{deadline.description}</div>
                        <div className="text-xs text-gray-400">{formatDate(deadline.dueDate)}</div>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(deadline.category)}
                        <span className="text-xs text-gray-900 capitalize">
                          {deadline.category.replace('-', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <Badge className={`text-xs ${getPriorityColor(deadline.priority)}`}>
                        {deadline.priority}
                      </Badge>
                    </td>
                    <td className="py-2 px-4">
                      <Badge className={`text-xs ${getStatusColor(deadline.status)}`}>
                        {deadline.status}
                      </Badge>
                    </td>
                    <td className="py-2 px-4">
                      <span className="text-xs text-gray-900">{deadline.assignedTo}</span>
                    </td>
                    <td className="py-2 px-4">
                      <div className={`text-xs font-medium ${
                        deadline.daysUntilDue < 0 ? 'text-red-600' :
                        deadline.daysUntilDue <= 7 ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {deadline.daysUntilDue < 0 ? `${Math.abs(deadline.daysUntilDue)} days overdue` :
                         deadline.daysUntilDue === 0 ? 'Due today' :
                         `${deadline.daysUntilDue} days`}
                      </div>
                    </td>
                    <td className="py-2 px-4">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const renderRequirementsTab = () => {
    return (
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {complianceRequirements.map((requirement) => (
            <Card key={requirement.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">{requirement.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{requirement.description}</p>
                </div>
                <Badge className={`text-xs ${requirement.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {requirement.status}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Frequency:</span>
                  <span className="font-medium capitalize">{requirement.frequency}</span>
                </div>
                {requirement.lastCompleted && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Completed:</span>
                    <span className="font-medium">{formatDate(requirement.lastCompleted)}</span>
                  </div>
                )}
                {requirement.nextDue && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next Due:</span>
                    <span className="font-medium">{formatDate(requirement.nextDue)}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex space-x-2">
                <Button size="sm" variant="outline" className="text-xs">
                  Mark Complete
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const renderReportsTab = () => {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Compliance Reports</h3>
        <p className="text-gray-600 mb-4">Generate detailed compliance reports and analytics</p>
        <Button variant="outline">
          Generate Report
        </Button>
      </div>
    )
  }

  const renderComplianceWizardModal = () => {
    if (!isWizardModalOpen) return null

    const automationCategories = [
      { id: 'basic', label: 'Basic', icon: '📦' },
      { id: 'featured', label: 'Featured', icon: '💎' },
      { id: 'notifications', label: 'Notifications', icon: '🔔' },
      { id: 'status-change', label: 'Status Change', icon: '📊' },
      { id: 'recurring', label: 'Recurring', icon: '🔄' },
      { id: 'due-dates', label: 'Due Dates', icon: '⏰' },
      { id: 'item-creation', label: '+ Item Creation', icon: '➕' },
      { id: 'move-item', label: '→ Move Item', icon: '➡️' },
      { id: 'subitems', label: 'Subitems', icon: '🔗' },
      { id: 'dependencies', label: 'Dependencies', icon: '🔄' },
      { id: 'custom', label: 'Custom', icon: '⚙️' }
    ]

    const basicAutomations = [
      {
        id: '1',
        title: 'When a new compliance item is created, assign creator as person',
        icon: '➕',
        supportsSubitems: false
      },
      {
        id: '2',
        title: 'When a status changes to something, notify someone',
        icon: '🔔📊',
        supportsSubitems: true
      },
      {
        id: '3',
        title: 'When date arrives, notify someone',
        icon: '🔔⏰',
        supportsSubitems: false
      }
    ]

        return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-[95vw] h-[95vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">Compliance Wizard</h2>
              <span className="text-sm text-gray-500">Board Automations / 0</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Account Usage</span>
              <button
                onClick={() => setIsWizardModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Sidebar - Categories */}
            <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-1">
                {automationCategories.map((category) => (
                  <button
                    key={category.id}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span>{category.label}</span>
                    {category.id === 'custom' && (
                      <button className="ml-auto text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">
                        +
                      </button>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Search and Learn Section */}
              <div className="flex items-center justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 border border-blue-500 text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">Learn to automate your workflow in 3 minutes</span>
                </button>
              </div>

              {/* New Feature Template */}
              <div className="relative bg-white border border-gray-200 rounded-lg p-6 mb-8">
                <div className="absolute -top-2 -left-2">
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">New feature</span>
                </div>
                
                <div className="text-center mb-4">
                  <p className="text-lg text-gray-700">
                    When <span className="underline cursor-pointer hover:text-purple-600">Date</span> arrives,{' '}
                    <span className="underline cursor-pointer hover:text-purple-600">do something</span>
                  </p>
                </div>
                
                <div className="text-center mb-4">
                  <button className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors">
                    Create Custom Automation
                  </button>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <span>Supports subitems</span>
                </div>
              </div>

              {/* Basic Automations Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {basicAutomations.map((automation) => (
                    <div key={automation.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-lg">{automation.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{automation.title}</p>
                          {automation.supportsSubitems && (
                            <div className="flex items-center space-x-1 mt-2 text-xs text-gray-500">
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                              </svg>
                              <span>Supports subite...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
                </div>
              </div>
            </div>
          </div>
        )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'deadlines':
        return renderDeadlinesTab()
      case 'requirements':
        return renderRequirementsTab()
      case 'reports':
        return renderReportsTab()
      default:
        return renderDeadlinesTab()
    }
  }

  return (
    <ProtectedRoute>
    <PageWrapper
        title="Compliance Management" 
      headerButtons={headerButtons}
        subHeader={
          <SubHeader 
            tabs={complianceTabs} 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            onFilterClick={() => setShowFilterBar(!showFilterBar)}
            isFilterActive={showFilterBar}
          />
        }
    >
      {renderContent()}
        {renderComplianceWizardModal()}
    </PageWrapper>
    </ProtectedRoute>
  )
}