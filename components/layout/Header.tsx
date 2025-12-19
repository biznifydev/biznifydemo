"use client"

import { useState, useEffect, useRef } from "react"
import { useAuthContext } from "@/components/providers/AuthProvider"
import { useOrganizationContext } from "@/components/providers/OrganizationProvider"
import { Building2, ChevronDown, Search, Settings, Bell, X, Sparkles, Info, DollarSign, BarChart3, Users, TrendingUp, CheckCircle } from "lucide-react"
import { OrganizationService } from "@/lib/services/organizationService"
import { HrService } from "@/lib/services/hrService"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Image from "next/image"

export function Header() {
  const { user } = useAuthContext()
  const { currentOrganization, getUserOrganizations, createOrganization, switchToOrganization } = useOrganizationContext()
  const router = useRouter()
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false)
  const [organizations, setOrganizations] = useState<any[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [joinOrgCode, setJoinOrgCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [isAccountSetupModalOpen, setIsAccountSetupModalOpen] = useState(false)
  const [accountSetupStep, setAccountSetupStep] = useState(1)
  const userDropdownRef = useRef<HTMLDivElement>(null)

  // Account Setup Modal States
  const [departments, setDepartments] = useState<any[]>([])
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)
  const [employeeFormData, setEmployeeFormData] = useState({
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    position: '',
    department_id: '',
    manager_id: '',
    status: 'Active' as const,
    start_date: '',
    location: '',
    avatar_initials: ''
  })
  const [isCreatingEmployee, setIsCreatingEmployee] = useState(false)
  const [employeeError, setEmployeeError] = useState('')

  // Load organizations
  const loadOrganizations = async () => {
    try {
      const orgs = await getUserOrganizations()
      const orgsWithActive = orgs.map(org => ({
        ...org,
        isActive: org.id === currentOrganization?.id,
        members: 1 // You'll need to implement member count logic
      }))
      setOrganizations(orgsWithActive)
    } catch (error) {
      console.error('Error loading organizations:', error)
    }
  }

  // Create organization
  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) return
    
    setLoading(true)
    try {
      const slug = newOrgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      await createOrganization(newOrgName, slug)
      await loadOrganizations()
      setIsCreateModalOpen(false)
      setNewOrgName('')
    } catch (error) {
      console.error('Error creating organization:', error)
    } finally {
      setLoading(false)
    }
  }

  // Join organization
  const handleJoinOrganization = async () => {
    if (!joinOrgCode.trim()) return
    
    setLoading(true)
    try {
      await OrganizationService.acceptInvitation(joinOrgCode.trim())
      await loadOrganizations()
      setIsJoinModalOpen(false)
      setJoinOrgCode('')
      // You might want to show a success message here
    } catch (error) {
      console.error('Error joining organization:', error)
      // You might want to show an error message here
    } finally {
      setLoading(false)
    }
  }

  // Switch organization
  const handleSwitchOrganization = async (orgId: string) => {
    try {
      await switchToOrganization(orgId)
      // Don't call loadOrganizations here - it will be called by the useEffect when currentOrganization changes
      setIsUserDropdownOpen(false)
    } catch (error) {
      console.error('Error switching organization:', error)
    }
  }

  // Sign out
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Close dropdown and redirect to login
      setIsUserDropdownOpen(false)
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Load organizations on mount
  useEffect(() => {
    loadOrganizations()
  }, [currentOrganization])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Load departments and employees for the employee form
  useEffect(() => {
    if (isAccountSetupModalOpen && accountSetupStep === 1) {
      loadDepartments()
      loadEmployees()
    }
  }, [isAccountSetupModalOpen, accountSetupStep])

  // Auto-populate employee form from user profile
  useEffect(() => {
    if (user && accountSetupStep === 1 && isAccountSetupModalOpen) {
      loadUserProfile()
    }
  }, [user, accountSetupStep, isAccountSetupModalOpen])

  const loadUserProfile = async () => {
    if (!user) {
      return
    }
    
    try {
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('first_name, last_name, email')
        .eq('id', user.id)
        .single()
      
      if (userProfile) {
        const updatedFormData = {
          first_name: userProfile.first_name || '',
          last_name: userProfile.last_name || '',
          email: userProfile.email || user.email || '',
          // Set some sensible defaults for the user's own employee profile
          position: 'Employee', // Default position
          status: 'Active' as const,
          start_date: new Date().toISOString().split('T')[0], // Today's date
          location: 'Remote', // Default location
          avatar_initials: `${userProfile.first_name?.charAt(0) || ''}${userProfile.last_name?.charAt(0) || ''}`.toUpperCase()
        }
        
        setEmployeeFormData(prev => ({
          ...prev,
          ...updatedFormData
        }))
      } else {
        // Fallback to user email if profile not found
        setEmployeeFormData(prev => ({
          ...prev,
          email: user.email || '',
          first_name: '',
          last_name: '',
          position: 'Employee',
          status: 'Active' as const,
          start_date: new Date().toISOString().split('T')[0],
          location: 'Remote',
          avatar_initials: ''
        }))
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
      // Fallback to user email if profile not found
      setEmployeeFormData(prev => ({
        ...prev,
        email: user.email || '',
        first_name: '',
        last_name: '',
        position: 'Employee',
        status: 'Active' as const,
        start_date: new Date().toISOString().split('T')[0],
        location: 'Remote',
        avatar_initials: ''
      }))
    }
  }

  const loadDepartments = async () => {
    setIsLoadingDepartments(true)
    try {
      const deps = await HrService.getDepartments()
      setDepartments(deps)
    } catch (error) {
      console.error('Error loading departments:', error)
    } finally {
      setIsLoadingDepartments(false)
    }
  }

  const loadEmployees = async () => {
    if (!currentOrganization) {
      return
    }
    setIsLoadingEmployees(true)
    try {
      const emps = await HrService.getEmployees(currentOrganization.id)
      setEmployees(emps)
    } catch (error) {
      console.error('Error loading employees:', error)
    } finally {
      setIsLoadingEmployees(false)
    }
  }

  const handleCreateEmployeeProfile = async () => {
    if (!currentOrganization) {
      setEmployeeError('No active organization found')
      return
    }
    
    setIsCreatingEmployee(true)
    setEmployeeError('')
    
    try {
      // Validate required fields
      if (!employeeFormData.first_name || !employeeFormData.last_name || !employeeFormData.email || !employeeFormData.position || !employeeFormData.start_date) {
        throw new Error('Please fill in all required fields')
      }

      // Prepare employee data - convert empty strings to undefined for UUID fields
      const employeeData = {
        ...employeeFormData,
        department_id: employeeFormData.department_id || undefined,
        manager_id: employeeFormData.manager_id || undefined
      }

      await HrService.createEmployeeForCurrentUser(employeeData, currentOrganization.id)
      
      // Move to next step
      setAccountSetupStep(2)
    } catch (error) {
      console.error('Error creating employee profile:', error)
      setEmployeeError(error instanceof Error ? error.message : 'Failed to create employee profile')
    } finally {
      setIsCreatingEmployee(false)
    }
  }

  const handleCloseAccountSetupModal = () => {
    setIsAccountSetupModalOpen(false)
    setAccountSetupStep(1)
    setEmployeeFormData({
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
    setEmployeeError('')
  }

  const generateOrgInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase()
  }

  const generateUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <>
      <header className="flex items-center justify-between px-4 py-1 bg-black">
        {/* Left Section - Logo and Account Setup */}
        <div className="flex items-center space-x-6">
          {/* Biznify Logo */}
          <Link href="/" className="flex items-center">
            <img
              src="/images/biznifylogo1.png"
              alt="Biznify"
              className="h-5 w-auto"
            />
          </Link>
          
          <button 
            className="px-3 py-1.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors text-xs font-medium"
            onClick={() => setIsAccountSetupModalOpen(true)}
          >
            Account setup
          </button>
        </div>

        {/* Right Section - Utility Icons and Combined User/Org Dropdown */}
        <div className="flex items-center space-x-2">
          
          <button 
            className="flex items-center space-x-2 px-2 py-1.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors border border-gray-700"
            onClick={() => setIsAiDrawerOpen(true)}
          >
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span className="text-xs font-medium">Ask AI</span>
          </button>
          
          <button className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
            <Bell className="h-4 w-4" />
          </button>
          
          <button 
            className="p-1.5 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
          </button>
          
          {/* Combined User/Organization Dropdown */}
          <div className="relative" ref={userDropdownRef}>
            <button 
              className="flex items-center space-x-2 px-2 py-1.5 bg-gray-800 rounded-md border border-gray-700 hover:bg-gray-700 transition-colors"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            >
              <div className="w-5 h-5 bg-teal-500 rounded flex items-center justify-center">
                <Building2 className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-medium text-white">
                {currentOrganization?.name || 'Organization'}
              </span>
              <ChevronDown className={`h-3 w-3 text-gray-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Combined Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-1 w-80 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user ? generateUserInitials(user.email?.split('@')[0] || 'U', 'S') : 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {user?.email || 'user@example.com'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {currentOrganization?.name || 'Organization'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Organizations List */}
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                    Organizations
                  </div>
                  {organizations.map((org) => (
                    <div
                      key={org.id}
                      className={`px-4 py-3 cursor-pointer transition-colors ${
                        org.isActive 
                          ? 'bg-purple-50 border-l-2 border-purple-500' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleSwitchOrganization(org.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gray-700 rounded flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {generateOrgInitials(org.name)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm font-medium ${
                            org.isActive ? 'text-purple-600' : 'text-gray-900'
                          }`}>
                            {org.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {org.members} Member{org.members !== 1 ? 's' : ''}
                          </div>
                        </div>
                        {org.isActive && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100"></div>

                {/* Organization Actions */}
                <div className="py-2">
                  <div 
                    className="px-4 py-2 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <div className="w-5 h-5 bg-gray-700 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">+</span>
                    </div>
                    <span className="text-sm text-gray-900">Create Organization</span>
                  </div>
                  <div 
                    className="px-4 py-2 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setIsJoinModalOpen(true)}
                  >
                    <div className="w-5 h-5 bg-gray-700 rounded flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">👤+</span>
                    </div>
                    <span className="text-sm text-gray-900">Join Organization</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100"></div>

                {/* User Actions */}
                <div className="py-2">
                  <Link 
                    href="/settings"
                    className="px-4 py-2 flex items-center space-x-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setIsUserDropdownOpen(false)}
                  >
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-900">Settings</span>
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button 
                    className="w-full text-left px-4 py-2 flex items-center space-x-3 text-red-600 hover:bg-gray-50 transition-colors" 
                    onClick={handleSignOut}
                  >
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
            <div className="flex items-center p-4 border-b border-gray-200">
              <Search className="h-5 w-5 text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Search everything..."
                className="flex-1 text-lg focus:outline-none"
                autoFocus
              />
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="ml-3 p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <div className="text-sm text-gray-500 mb-3">Quick actions</div>
              <div className="space-y-2">
                <button className="w-full text-left p-2 hover:bg-gray-50 rounded-md text-sm">
                  <div className="font-medium">Go to Sales</div>
                  <div className="text-gray-500">View deals and customers</div>
                </button>
                <button className="w-full text-left p-2 hover:bg-gray-50 rounded-md text-sm">
                  <div className="font-medium">Go to Finance</div>
                  <div className="text-gray-500">View budgets and reports</div>
                </button>
                <button className="w-full text-left p-2 hover:bg-gray-50 rounded-md text-sm">
                  <div className="font-medium">Go to HR</div>
                  <div className="text-gray-500">Manage employees and time</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Drawer */}
      {isAiDrawerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-96 h-full shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span className="text-lg font-semibold text-gray-900">Ask Biznify AI</span>
              </div>
              <button 
                onClick={() => setIsAiDrawerOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-4">
                {/* Quick Start */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Start</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                      <div className="font-medium text-purple-900">Analyze my financial data</div>
                      <div className="text-sm text-purple-700">Get insights on revenue, expenses, and trends</div>
                    </button>
                    <button className="w-full text-left p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                      <div className="font-medium text-purple-900">Review my sales pipeline</div>
                      <div className="text-sm text-purple-700">Analyze deals and identify opportunities</div>
                    </button>
                    <button className="w-full text-left p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                      <div className="font-medium text-purple-900">Optimize my team structure</div>
                      <div className="text-sm text-purple-700">Get recommendations for HR and hiring</div>
                    </button>
                  </div>
                </div>

                {/* Recent Analysis */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Analysis</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-900">Q4 Financial Review</div>
                      <div className="text-xs text-gray-500">2 hours ago</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-900">Sales Performance Analysis</div>
                      <div className="text-xs text-gray-500">1 day ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Ask me anything about your business..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                  Ask
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Organization Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create Organization</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Enter organization name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrganization}
                disabled={loading || !newOrgName.trim()}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Organization'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Organization Modal */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Join Organization</h2>
              <button 
                onClick={() => setIsJoinModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invitation Code
                  </label>
                  <input
                    type="text"
                    value={joinOrgCode}
                    onChange={(e) => setJoinOrgCode(e.target.value)}
                    placeholder="Enter invitation code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsJoinModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinOrganization}
                disabled={loading || !joinOrgCode.trim()}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Joining...' : 'Join Organization'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Setup Modal */}
      {isAccountSetupModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg shadow-xl w-[95vw] h-[95vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Account Setup</h2>
              </div>
              <button
                onClick={handleCloseAccountSetupModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Panel - Steps */}
              <div className="w-1/3 bg-gray-50 p-6 overflow-y-auto">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      accountSetupStep >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      1
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Employee Profile</div>
                      <div className="text-xs text-gray-500">Set up your employee profile</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      accountSetupStep >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      2
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">Platform Walkthrough</div>
                      <div className="text-xs text-gray-500">Learn how to use the platform</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel - Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {accountSetupStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Employee Profile Setup</h3>
                      <p className="text-sm text-gray-600">Create your employee profile to get started with the platform.</p>
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-blue-800">
                              This will create an employee profile linked to your user account. Your name and email are auto-populated from your profile and cannot be changed here.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {employeeError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <div className="text-red-600 mt-0.5">⚠</div>
                          <div>
                            <h4 className="text-sm font-medium text-red-900">Error</h4>
                            <p className="text-sm text-red-700 mt-1">{employeeError}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                          <input
                            type="text"
                            value={employeeFormData.first_name}
                            onChange={(e) => setEmployeeFormData(prev => ({ ...prev, first_name: e.target.value }))}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-gray-50"
                            placeholder="Enter your first name"
                            readOnly
                          />
                          <p className="text-xs text-gray-500 mt-1">Auto-populated from your user profile</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                          <input
                            type="text"
                            value={employeeFormData.last_name}
                            onChange={(e) => setEmployeeFormData(prev => ({ ...prev, last_name: e.target.value }))}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-gray-50"
                            placeholder="Enter your last name"
                            readOnly
                          />
                          <p className="text-xs text-gray-500 mt-1">Auto-populated from your user profile</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          value={employeeFormData.email}
                          onChange={(e) => setEmployeeFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-gray-50"
                          placeholder="Enter your work email"
                          readOnly
                        />
                        <p className="text-xs text-gray-500 mt-1">Auto-populated from your user profile</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={employeeFormData.phone}
                            onChange={(e) => setEmployeeFormData(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            placeholder="Enter your phone number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                          <input
                            type="text"
                            value={employeeFormData.position}
                            onChange={(e) => setEmployeeFormData(prev => ({ ...prev, position: e.target.value }))}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            placeholder="e.g., Senior Manager, Developer, etc."
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                          <select 
                            value={employeeFormData.department_id}
                            onChange={(e) => setEmployeeFormData(prev => ({ ...prev, department_id: e.target.value }))}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            disabled={isLoadingDepartments}
                          >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                          <select 
                            value={employeeFormData.manager_id}
                            onChange={(e) => setEmployeeFormData(prev => ({ ...prev, manager_id: e.target.value }))}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            disabled={isLoadingEmployees}
                          >
                            <option value="">Select Manager (Optional)</option>
                            {employees.map((emp) => (
                              <option key={emp.id} value={emp.id}>
                                {emp.first_name} {emp.last_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                          <input
                            type="date"
                            value={employeeFormData.start_date}
                            onChange={(e) => setEmployeeFormData(prev => ({ ...prev, start_date: e.target.value }))}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <input
                            type="text"
                            value={employeeFormData.location}
                            onChange={(e) => setEmployeeFormData(prev => ({ ...prev, location: e.target.value }))}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                            placeholder="e.g., New York, Remote, etc."
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                        <input
                          type="text"
                          value={employeeFormData.employee_id}
                          onChange={(e) => setEmployeeFormData(prev => ({ ...prev, employee_id: e.target.value }))}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          placeholder="Leave blank to auto-generate (EMP001, EMP002, etc.)"
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave blank to automatically generate an employee ID</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-900">Why create an employee profile?</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Your employee profile helps track your work, manage permissions, and integrate with HR features like leave management and time tracking.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {accountSetupStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform Walkthrough</h3>
                      <p className="text-sm text-gray-600">Learn how to use each section of the platform effectively.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                          </div>
                          <h4 className="text-sm font-medium text-gray-900">Sales</h4>
                        </div>
                        <p className="text-xs text-gray-600">Manage leads, customers, deals, and track your sales pipeline.</p>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <BarChart3 className="h-4 w-4 text-green-600" />
                          </div>
                          <h4 className="text-sm font-medium text-gray-900">Finance</h4>
                        </div>
                        <p className="text-xs text-gray-600">Track expenses, manage budgets, and monitor financial performance.</p>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Users className="h-4 w-4 text-purple-600" />
                          </div>
                          <h4 className="text-sm font-medium text-gray-900">HR</h4>
                        </div>
                        <p className="text-xs text-gray-600">Manage employees, recruitment, and time tracking.</p>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-orange-600" />
                          </div>
                          <h4 className="text-sm font-medium text-gray-900">Marketing</h4>
                        </div>
                        <p className="text-xs text-gray-600">Create campaigns, track analytics, and manage content.</p>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-green-900">You're all set!</h4>
                          <p className="text-sm text-green-700 mt-1">
                            You can now explore each section of the platform. Use the side navigation to switch between modules and start managing your business.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setAccountSetupStep(Math.max(1, accountSetupStep - 1))}
                    disabled={accountSetupStep === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={async () => {
                      if (accountSetupStep === 1) {
                        await handleCreateEmployeeProfile()
                      } else if (accountSetupStep === 2) {
                        setIsAccountSetupModalOpen(false)
                      }
                    }}
                    disabled={accountSetupStep === 1 && isCreatingEmployee}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {accountSetupStep === 1 ? (isCreatingEmployee ? 'Creating...' : 'Create Profile') : 'Finish'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 