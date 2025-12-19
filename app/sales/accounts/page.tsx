"use client"

import { useState, useEffect, useMemo } from "react"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Plus, 
  MoreVertical, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  X, 
  MessageCircle, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  ArrowRight,
  Search,
  Filter,
  ArrowUpDown
} from "lucide-react"
import { useOrganization } from "@/lib/hooks/useOrganization"
import { CrmService } from "@/lib/services/crmService"
import { Contact, Company, CompanyWithContacts, NewCompany, NewHistoryEntry } from "@/lib/types/crm"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function AccountsPage() {
  const { currentOrganization } = useOrganization()
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithContacts | null>(null)
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
  const [companyModalTab, setCompanyModalTab] = useState("details")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showSearchRow, setShowSearchRow] = useState(false)
  const [showFilterRow, setShowFilterRow] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedIndustry, setSelectedIndustry] = useState("all")
  
  // Form states
  const [newCompany, setNewCompany] = useState<NewCompany>({
    company_name: "",
    industry: "",
    website: "",
    location: "",
    employee_count: "",
    company_size: "",
    annual_revenue: ""
  })
  
  const [newHistoryEntry, setNewHistoryEntry] = useState<NewHistoryEntry>({
    type: "",
    description: "",
    status: ""
  })
  
  const [newNote, setNewNote] = useState("")

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" }
  ]

  const industryOptions = [
    { value: "all", label: "All Industries" },
    { value: "technology", label: "Technology" },
    { value: "finance", label: "Finance" },
    { value: "healthcare", label: "Healthcare" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "retail", label: "Retail" },
    { value: "consulting", label: "Consulting" }
  ]
  
  // Load data from database
  useEffect(() => {
    if (currentOrganization?.id) {
      loadData()
    }
  }, [currentOrganization?.id])

  const loadData = async () => {
    if (!currentOrganization?.id) return
    
    setIsLoading(true)
    try {
      const companiesData = await CrmService.getCompanies(currentOrganization.id)
      setCompanies(companiesData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchesSearch = company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           company.location?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === "all" || company.status.toLowerCase() === selectedStatus
      const matchesIndustry = selectedIndustry === "all" || company.industry?.toLowerCase() === selectedIndustry
      return matchesSearch && matchesStatus && matchesIndustry
    })
  }, [companies, searchTerm, selectedStatus, selectedIndustry])

  const handleAddCompany = async () => {
    if (!currentOrganization?.id) return
    
    try {
      const company = await CrmService.createCompany(currentOrganization.id, newCompany)
      setCompanies(prev => [...prev, company])
      setIsAddModalOpen(false)
      setNewCompany({
        company_name: "",
        industry: "",
        website: "",
        location: "",
        employee_count: "",
        company_size: "",
        annual_revenue: ""
      })
    } catch (error) {
      console.error('Error creating company:', error)
    }
  }

  const handleCompanyClick = async (company: Company) => {
    try {
      const fullCompany = await CrmService.getCompany(company.id)
      setSelectedCompany(fullCompany)
      setIsCompanyModalOpen(true)
    } catch (error) {
      console.error('Error loading company details:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-50 text-green-700"
      case "Inactive":
        return "bg-gray-50 text-gray-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const headerButtons = (
    <>
      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors flex items-center space-x-1"
      >
        <Plus className="h-3 w-3" />
        <span>Add New</span>
      </button>
    </>
  )

  return (
    <ProtectedRoute>
      <PageWrapper
        title="Accounts"
        headerButtons={headerButtons}
      >
        <div className="space-y-4">
          {/* Accounts Table */}
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                {/* Filter Bar Header Row */}
                <thead>
                  <tr className="bg-white border-b border-gray-200">
                    <td colSpan={9} className="p-0">
                      <div className="flex items-center justify-between p-2">
                        {/* Left Section - Status Filters */}
                        <div className="flex items-center space-x-3">
                          {statusOptions.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => setSelectedStatus(option.value)}
                              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                                selectedStatus === option.value
                                  ? "bg-gray-200 text-gray-900"
                                  : "text-gray-700 hover:text-gray-900"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                          <button className="text-gray-700 hover:text-gray-900 text-sm font-medium">
                            +
                          </button>
                        </div>

                        {/* Right Section - Action Icons */}
                        <div className="flex items-center space-x-1">
                          <button 
                            onClick={() => setShowSearchRow(!showSearchRow)}
                            className={`p-1.5 rounded-md border border-gray-200 transition-colors ${
                              showSearchRow 
                                ? "bg-purple-100 border-purple-200" 
                                : "bg-gray-100 hover:bg-gray-200"
                            }`}
                          >
                            <Search className="h-3 w-3 text-gray-700" />
                          </button>
                          <button 
                            onClick={() => setShowFilterRow(!showFilterRow)}
                            className={`p-1.5 rounded-md border border-gray-200 transition-colors ${
                              showFilterRow 
                                ? "bg-purple-100 border-purple-200" 
                                : "bg-gray-100 hover:bg-gray-200"
                            }`}
                          >
                            <Filter className="h-3 w-3 text-gray-700" />
                          </button>
                          <button className="p-1.5 bg-gray-100 rounded-md border border-gray-200 hover:bg-gray-200 transition-colors">
                            <ArrowUpDown className="h-3 w-3 text-gray-700" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Search Row */}
                  {showSearchRow && (
                    <tr className="bg-purple-50 border-b border-purple-200">
                      <td colSpan={9} className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search accounts by name, industry, or location..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                          <button 
                            onClick={() => setShowSearchRow(false)}
                            className="text-xs text-gray-600 hover:text-gray-800"
                          >
                            Close
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Filter Row */}
                  {showFilterRow && (
                    <tr className="bg-purple-50 border-b border-purple-200">
                      <td colSpan={9} className="p-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Industry</label>
                            <select 
                              value={selectedIndustry}
                              onChange={(e) => setSelectedIndustry(e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              {industryOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Employee Count</label>
                            <select className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                              <option value="">All Sizes</option>
                              <option value="1-10">1-10 employees</option>
                              <option value="11-50">11-50 employees</option>
                              <option value="51-200">51-200 employees</option>
                              <option value="201-1000">201-1000 employees</option>
                              <option value="1000+">1000+ employees</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex justify-end mt-3">
                          <button 
                            onClick={() => setShowFilterRow(false)}
                            className="text-xs text-gray-600 hover:text-gray-800"
                          >
                            Close
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Table Headers */}
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="sticky left-0 bg-gray-50 z-10 border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">
                      <input type="checkbox" className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2" />
                    </th>
                    <th className="sticky left-10 bg-gray-50 z-10 border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">Account</th>
                    <th className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">Industry</th>
                    <th className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">Location</th>
                    <th className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">Employees</th>
                    <th className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">Website</th>
                    <th className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">Status</th>
                    <th className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">Created</th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredCompanies.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Building2 className="h-8 w-8 text-purple-600" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
                          <p className="text-gray-500 mb-6 max-w-sm mx-auto">Get started by adding your first account. Manage your business relationships and company information.</p>
                          <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Account
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredCompanies.map((company) => (
                      <tr 
                        key={company.id}
                        className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleCompanyClick(company)}
                      >
                        <td className="py-2 px-3 sticky left-0 bg-white z-10 border-r border-gray-200">
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </td>
                        <td className="py-2 px-3 sticky left-10 bg-white z-10 border-r border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                              {company.website ? (
                                <img
                                  src={`https://www.google.com/s2/favicons?domain=${company.website}&sz=32`}
                                  alt={`${company.company_name} favicon`}
                                  className="w-6 h-6"
                                  onError={(e) => {
                                    // Fallback to building icon if favicon fails to load
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <Building2 className={`h-4 w-4 text-gray-600 ${company.website ? 'hidden' : ''}`} />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 text-xs">
                                {company.company_name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-3 border-r border-gray-200">
                          <div className="text-xs text-gray-900">
                            {company.industry || "No industry"}
                          </div>
                        </td>
                        <td className="py-2 px-3 border-r border-gray-200">
                          <div className="text-xs text-gray-900">
                            {company.location || "No location"}
                          </div>
                        </td>
                        <td className="py-2 px-3 border-r border-gray-200">
                          <div className="text-xs text-gray-900">
                            {company.employee_count || "No data"}
                          </div>
                        </td>
                        <td className="py-2 px-3 border-r border-gray-200">
                          <div className="text-xs text-gray-900">
                            {company.website || "No website"}
                          </div>
                        </td>
                        <td className={`py-2 px-3 border-r border-gray-200 ${getStatusColor(company.status)}`}>
                          <span className="text-xs font-medium text-gray-900">{company.status}</span>
                        </td>
                        <td className="py-2 px-3 border-r border-gray-200">
                          <span className="text-xs text-gray-900">-</span>
                        </td>
                        <td className="py-2 px-3">
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

        {/* Add Account Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-6xl w-[95vw] max-h-[80vh] flex flex-col bg-white border-0 shadow-2xl">
            <DialogHeader className="flex-shrink-0 bg-white border-b border-gray-100 px-8 py-6">
              <DialogTitle className="text-2xl font-semibold text-gray-900">Add new account</DialogTitle>
              <p className="text-sm text-gray-600 mt-2">Create new account by filling in details and company information.</p>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="grid grid-cols-2 gap-12">
                {/* Left Column - Account Details */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="company_name" className="text-sm font-medium text-gray-700">Company Name *</Label>
                    <Input
                      id="company_name"
                      placeholder="Enter company name"
                      value={newCompany.company_name}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, company_name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="industry" className="text-sm font-medium text-gray-700">Industry</Label>
                    <Input
                      id="industry"
                      placeholder="Enter industry"
                      value={newCompany.industry}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, industry: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website" className="text-sm font-medium text-gray-700">Website</Label>
                    <Input
                      id="website"
                      placeholder="Enter website URL"
                      value={newCompany.website}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, website: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                    <Input
                      id="location"
                      placeholder="Enter location"
                      value={newCompany.location}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, location: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employee_count" className="text-sm font-medium text-gray-700">Employee Count</Label>
                    <Input
                      id="employee_count"
                      placeholder="Enter employee count"
                      value={newCompany.employee_count}
                      onChange={(e) => setNewCompany(prev => ({ ...prev, employee_count: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                {/* Right Column - Additional Details */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                    <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="prospect">Prospect</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="owner" className="text-sm font-medium text-gray-700">Owner</Label>
                    <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Unassigned</option>
                      <option value="user1">John Doe</option>
                      <option value="user2">Jane Smith</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="followers" className="text-sm font-medium text-gray-700">Followers</Label>
                    <Input
                      id="followers"
                      placeholder="Add Followers"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="source" className="text-sm font-medium text-gray-700">Account Source</Label>
                    <Input
                      id="source"
                      placeholder="Enter Source"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags" className="text-sm font-medium text-gray-700">Tags</Label>
                    <Input
                      id="tags"
                      placeholder="Please Input Tag name"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex-shrink-0 bg-white border-t border-gray-100 px-8 py-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="px-6">
                Cancel
              </Button>
              <Button onClick={handleAddCompany} className="px-6">
                Create Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Account Details Modal */}
        {selectedCompany && (
          <Dialog open={isCompanyModalOpen} onOpenChange={setIsCompanyModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Account Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Account Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedCompany.company_name}
                      </h3>
                      <p className="text-gray-600">{selectedCompany.industry}</p>
                      <p className="text-gray-600">{selectedCompany.location}</p>
                    </div>
                  </div>
                </div>

                {/* Account Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Website</Label>
                    <p className="text-sm text-gray-900">{selectedCompany.website || "No website"}</p>
                  </div>
                  <div>
                    <Label>Employee Count</Label>
                    <p className="text-sm text-gray-900">{selectedCompany.employee_count || "No data"}</p>
                  </div>
                  <div>
                    <Label>Company Size</Label>
                    <p className="text-sm text-gray-900">{selectedCompany.company_size || "No data"}</p>
                  </div>
                  <div>
                    <Label>Annual Revenue</Label>
                    <p className="text-sm text-gray-900">{selectedCompany.annual_revenue || "No data"}</p>
                  </div>
                </div>

                <Separator />

                {/* Contacts */}
                {selectedCompany.contacts && selectedCompany.contacts.length > 0 && (
                  <div>
                    <Label>Contacts ({selectedCompany.contacts.length})</Label>
                    <div className="space-y-2 mt-2">
                      {selectedCompany.contacts.map((contact) => (
                        <div key={contact.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {contact.first_name} {contact.last_name}
                            </p>
                            <p className="text-xs text-gray-600">{contact.position}</p>
                          </div>
                          <div className="text-xs text-gray-500">
                            {contact.email}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Notes */}
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Add a note about this account..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </PageWrapper>
    </ProtectedRoute>
  )
} 