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
import { Contact, Company, ContactWithCompany, NewContact, NewHistoryEntry } from "@/lib/types/crm"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function ContactsPage() {
  const { currentOrganization } = useOrganization()
  const [contacts, setContacts] = useState<ContactWithCompany[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedContact, setSelectedContact] = useState<ContactWithCompany | null>(null)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [contactModalTab, setContactModalTab] = useState("details")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showSearchRow, setShowSearchRow] = useState(false)
  const [showFilterRow, setShowFilterRow] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedCompany, setSelectedCompany] = useState("all")
  
  // Form states
  const [newContact, setNewContact] = useState<NewContact>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company_id: "",
    position: "",
    department: "",
    location: ""
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

  const companyOptions = [
    { value: "all", label: "All Companies" },
    ...companies.map(company => ({
      value: company.id,
      label: company.company_name
    }))
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
      const [contactsData, companiesData] = await Promise.all([
        CrmService.getContacts(currentOrganization.id),
        CrmService.getCompanies(currentOrganization.id)
      ])
      setContacts(contactsData)
      setCompanies(companiesData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contact.company?.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === "all" || contact.status.toLowerCase() === selectedStatus
      const matchesCompany = selectedCompany === "all" || contact.company_id === selectedCompany
      return matchesSearch && matchesStatus && matchesCompany
    })
  }, [contacts, searchTerm, selectedStatus, selectedCompany])

  const handleAddContact = async () => {
    if (!currentOrganization?.id) return
    
    try {
      const contact = await CrmService.createContact(currentOrganization.id, newContact)
      setContacts(prev => [...prev, contact])
      setIsAddModalOpen(false)
      setNewContact({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        company_id: "",
        position: "",
        department: "",
        location: ""
      })
    } catch (error) {
      console.error('Error creating contact:', error)
    }
  }

  const handleContactClick = async (contact: ContactWithCompany) => {
    try {
      const fullContact = await CrmService.getContact(contact.id)
      setSelectedContact(fullContact)
      setIsContactModalOpen(true)
    } catch (error) {
      console.error('Error loading contact details:', error)
    }
  }

  const getContactDisplayName = (contact: ContactWithCompany) => {
    return `${contact.first_name} ${contact.last_name}`
  }

  const getContactDisplayPosition = (contact: ContactWithCompany) => {
    return contact.position || "No position"
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
        title="Contacts"
        headerButtons={headerButtons}
      >
        <div className="space-y-4">
          {/* Contacts Table */}
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
                                placeholder="Search contacts by name, email, or company..."
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
                            <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
                            <select 
                              value={selectedCompany}
                              onChange={(e) => setSelectedCompany(e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              {companyOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Position</label>
                            <select className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                              <option value="">All Positions</option>
                              <option value="manager">Manager</option>
                              <option value="director">Director</option>
                              <option value="executive">Executive</option>
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
                    <th className="sticky left-10 bg-gray-50 z-10 border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">Contact</th>
                    <th className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">Company</th>
                    <th className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">Position</th>
                    <th className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">Email</th>
                    <th className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">Phone</th>
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
                  ) : filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <User className="h-8 w-8 text-purple-600" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts found</h3>
                          <p className="text-gray-500 mb-6 max-w-sm mx-auto">Get started by adding your first contact. Build your network and manage relationships.</p>
                          <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Contact
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((contact) => (
                      <tr 
                        key={contact.id}
                        className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleContactClick(contact)}
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
                          <div className="font-medium text-gray-900 text-xs">
                            {getContactDisplayName(contact)}
                          </div>
                        </td>
                        <td className="py-2 px-3 border-r border-gray-200">
                          <div className="text-xs text-gray-900">
                            {contact.company?.company_name || "No company"}
                          </div>
                        </td>
                        <td className="py-2 px-3 border-r border-gray-200">
                          <div className="text-xs text-gray-900">
                            {getContactDisplayPosition(contact)}
                          </div>
                        </td>
                        <td className="py-2 px-3 border-r border-gray-200">
                          <div className="text-xs text-gray-900">
                            {contact.email || "No email"}
                          </div>
                        </td>
                        <td className="py-2 px-3 border-r border-gray-200">
                          <div className="text-xs text-gray-900">
                            {contact.phone || "No phone"}
                          </div>
                        </td>
                        <td className={`py-2 px-3 border-r border-gray-200 ${getStatusColor(contact.status)}`}>
                          <span className="text-xs font-medium text-gray-900">{contact.status}</span>
                        </td>
                        <td className="py-2 px-3 border-r border-gray-200">
                          <span className="text-xs text-gray-900">{formatDate(contact.created_at)}</span>
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

        {/* Add Contact Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-6xl w-[95vw] max-h-[80vh] flex flex-col bg-white border-0 shadow-2xl">
            <DialogHeader className="flex-shrink-0 bg-white border-b border-gray-100 px-8 py-6">
              <DialogTitle className="text-2xl font-semibold text-gray-900">Add new contact</DialogTitle>
              <p className="text-sm text-gray-600 mt-2">Create new contact by filling in details and selecting a company.</p>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto px-8 py-6">
              <div className="grid grid-cols-2 gap-12">
                {/* Left Column - Contact Details */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="first_name" className="text-sm font-medium text-gray-700">First Name *</Label>
                    <Input
                      id="first_name"
                      placeholder="Enter first name"
                      value={newContact.first_name}
                      onChange={(e) => setNewContact(prev => ({ ...prev, first_name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">Last Name *</Label>
                    <Input
                      id="last_name"
                      placeholder="Enter last name"
                      value={newContact.last_name}
                      onChange={(e) => setNewContact(prev => ({ ...prev, last_name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={newContact.email}
                      onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Primary Phone</Label>
                    <Input
                      id="phone"
                      placeholder="Phone"
                      value={newContact.phone}
                      onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department" className="text-sm font-medium text-gray-700">Department</Label>
                    <Input
                      id="department"
                      placeholder="Enter department"
                      value={newContact.department}
                      onChange={(e) => setNewContact(prev => ({ ...prev, department: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                {/* Right Column - Company & Additional Details */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="company" className="text-sm font-medium text-gray-700">Company</Label>
                    <select
                      id="company"
                      value={newContact.company_id}
                      onChange={(e) => setNewContact(prev => ({ ...prev, company_id: e.target.value }))}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a company</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>
                          {company.company_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="position" className="text-sm font-medium text-gray-700">Position</Label>
                    <Input
                      id="position"
                      placeholder="Enter position"
                      value={newContact.position}
                      onChange={(e) => setNewContact(prev => ({ ...prev, position: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location</Label>
                    <Input
                      id="location"
                      placeholder="Enter location"
                      value={newContact.location}
                      onChange={(e) => setNewContact(prev => ({ ...prev, location: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
                    <select className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
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
              <Button onClick={handleAddContact} className="px-6">
                Create Contact
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Contact Details Modal */}
        {selectedContact && (
          <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Contact Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Contact Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getContactDisplayName(selectedContact)}
                      </h3>
                      <p className="text-gray-600">{selectedContact.position}</p>
                      <p className="text-gray-600">{selectedContact.company?.company_name}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-gray-900">{selectedContact.email || "No email"}</p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="text-sm text-gray-900">{selectedContact.phone || "No phone"}</p>
                  </div>
                  <div>
                    <Label>Department</Label>
                    <p className="text-sm text-gray-900">{selectedContact.department || "No department"}</p>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <p className="text-sm text-gray-900">{selectedContact.location || "No location"}</p>
                  </div>
                </div>

                <Separator />

                {/* Notes */}
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Add a note about this contact..."
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