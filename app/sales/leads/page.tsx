"use client"

import { useState, useEffect } from "react"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { SubHeader } from "@/components/layout/SubHeader"
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
  ArrowRight 
} from "lucide-react"
import { useOrganization } from "@/lib/hooks/useOrganization"
import { CrmService } from "@/lib/services/crmService"
import { Contact, Company, ContactWithCompany, CompanyWithContacts, NewContact, NewCompany, NewHistoryEntry } from "@/lib/types/crm"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function ContactsPage() {
  const { currentOrganization } = useOrganization()
  const [activeTab, setActiveTab] = useState("contacts")
  const [contacts, setContacts] = useState<ContactWithCompany[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedContact, setSelectedContact] = useState<ContactWithCompany | null>(null)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [contactModalTab, setContactModalTab] = useState("details")
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithContacts | null>(null)
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
  const [companyModalTab, setCompanyModalTab] = useState("details")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [addModalStep, setAddModalStep] = useState("choice")
  const [selectedType, setSelectedType] = useState<"contact" | "company" | null>(null)
  
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
  const [isLoading, setIsLoading] = useState(false)
  
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

  const handleAddContact = async () => {
    if (!currentOrganization?.id) return
    
    try {
      await CrmService.createContact(currentOrganization.id, newContact)
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
      setIsAddModalOpen(false)
      setAddModalStep("choice")
      setSelectedType(null)
      loadData() // Reload data
    } catch (error) {
      console.error('Error adding contact:', error)
    }
  }

  const handleAddCompany = async () => {
    if (!currentOrganization?.id) return
    
    try {
      await CrmService.createCompany(currentOrganization.id, newCompany)
      setNewCompany({
        company_name: "",
        industry: "",
        website: "",
        location: "",
        employee_count: "",
        company_size: "",
        annual_revenue: ""
      })
      setIsAddModalOpen(false)
      setAddModalStep("choice")
      setSelectedType(null)
      loadData() // Reload data
    } catch (error) {
      console.error('Error adding company:', error)
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

  const handleCompanyClick = async (company: Company) => {
    try {
      const fullCompany = await CrmService.getCompany(company.id)
      setSelectedCompany(fullCompany)
      setIsCompanyModalOpen(true)
    } catch (error) {
      console.error('Error loading company details:', error)
    }
  }
  
  const contactTabs = [
    { id: "contacts", label: "Contacts" },
    { id: "companies", label: "Companies" },
  ]

  const headerButtons = (
    <>
      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors flex items-center space-x-1"
      >
        <Plus className="h-3 w-3" />
        <span>Add New</span>
      </button>
    </>
  )

  // Helper function to get contact display name
  const getContactDisplayName = (contact: ContactWithCompany) => {
    return `${contact.first_name} ${contact.last_name}`
  }

  // Helper function to get contact display position
  const getContactDisplayPosition = (contact: ContactWithCompany) => {
    return contact.position || "No position"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-50 text-green-700 border-green-200"
      case "Inactive":
        return "bg-gray-50 text-gray-700 border-gray-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
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

  const renderContent = () => {
    switch (activeTab) {
      case "contacts":
        return (
          <div className="space-y-4">
            {/* Contacts Table */}
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
                        Contact Name
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                        Position
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                        Company
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                        Email
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                        Phone
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                        Status
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                        Last Contact
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-gray-500">Loading contacts...</td>
                      </tr>
                    ) : contacts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <User className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No contacts yet</h3>
                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">Get started by adding your first contact. You can create individual contacts and associate them with companies.</p>
                            <button
                              onClick={() => {
                                setSelectedType("contact")
                                setAddModalStep("contact")
                                setIsAddModalOpen(true)
                              }}
                              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Your First Contact
                            </button>
              </div>
                        </td>
                      </tr>
                    ) : (
                      contacts.map((contact: ContactWithCompany) => (
                        <tr 
                          key={contact.id} 
                          className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleContactClick(contact)}
                        >
                          <td className="py-2 px-3 w-10 sticky left-0 bg-white z-10 border-r border-gray-200">
                            <div className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                              />
              </div>
                          </td>
                          <td className="py-2 px-3 sticky left-10 bg-white z-10 border-r border-gray-200">
                            <span className="font-medium text-gray-900 text-xs">{getContactDisplayName(contact)}</span>
                          </td>
                          <td className="py-2 px-3 border-r border-gray-200">
                            <span className="text-xs text-gray-900">{getContactDisplayPosition(contact)}</span>
                          </td>
                          <td className="py-2 px-3 border-r border-gray-200">
                            <span className="text-xs text-gray-900">{contact.company?.company_name || "No company"}</span>
                          </td>
                          <td className="py-2 px-3 border-r border-gray-200">
                            <span className="text-xs text-gray-900">{contact.email || "No email"}</span>
                          </td>
                          <td className="py-2 px-3 border-r border-gray-200">
                            <span className="text-xs text-gray-900">{contact.phone || "No phone"}</span>
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
        )
      case "companies":
        return (
          <div className="space-y-4">
            {/* Companies Table */}
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
                        Company Name
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                        Industry
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                        Location
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                        Website
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                        Employee Count
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                        Status
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                        Contacts
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-gray-500">Loading companies...</td>
                      </tr>
                    ) : companies.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Building2 className="h-8 w-8 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No companies yet</h3>
                            <p className="text-gray-500 mb-6 max-w-sm mx-auto">Get started by adding your first company. You can then add contacts and associate them with companies.</p>
                            <button
                              onClick={() => {
                                setSelectedType("company")
                                setAddModalStep("company")
                                setIsAddModalOpen(true)
                              }}
                              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Your First Company
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      companies.map((company: Company) => (
                        <tr 
                          key={company.id} 
                          className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleCompanyClick(company)}
                        >
                          <td className="py-2 px-3 w-10 sticky left-0 bg-white z-10 border-r border-gray-200">
                            <div className="flex items-center justify-center">
                              <input
                                type="checkbox"
                                className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                              />
                          </div>
                        </td>
                          <td className="py-2 px-3 sticky left-10 bg-white z-10 border-r border-gray-200">
                            <span className="font-medium text-gray-900 text-xs">{company.company_name}</span>
                          </td>
                          <td className="py-2 px-3 border-r border-gray-200">
                            <span className="text-xs text-gray-900">{company.industry || "No industry"}</span>
                          </td>
                          <td className="py-2 px-3 border-r border-gray-200">
                            <span className="text-xs text-gray-900">{company.location || "No location"}</span>
                          </td>
                          <td className="py-2 px-3 border-r border-gray-200">
                            <span className="text-xs text-gray-900">{company.website || "No website"}</span>
                        </td>
                          <td className="py-2 px-3 border-r border-gray-200">
                            <span className="text-xs text-gray-900">{company.employee_count || "No data"}</span>
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
        )
      default:
        return null
    }
  }

  return (
    <ProtectedRoute>
      <>
    <PageWrapper 
          title="Contacts" 
      headerButtons={headerButtons}
          subHeader={<SubHeader tabs={contactTabs} activeTab={activeTab} onTabChange={setActiveTab} />}
    >
      {renderContent()}
    </PageWrapper>

        {/* Contact Details Side Drawer */}
        {isContactModalOpen && selectedContact && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="flex-1 bg-black bg-opacity-25"
              onClick={() => setIsContactModalOpen(false)}
            />
            
            {/* Side Drawer */}
            <div className="w-[45vw] bg-white shadow-xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Contact details</h2>
                <button
                  onClick={() => setIsContactModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Employee Information Card */}
                <div className="p-4 border border-gray-200 bg-white rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{getContactDisplayName(selectedContact)}</h3>
                        <p className="text-sm text-gray-500">{selectedContact.position || "No position"}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <Phone className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <MessageCircle className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setContactModalTab("details")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      contactModalTab === "details"
                        ? "text-purple-600 border-b-2 border-purple-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setContactModalTab("history")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      contactModalTab === "history"
                        ? "text-purple-600 border-b-2 border-purple-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    History
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-4 space-y-4">
                  {contactModalTab === "details" ? (
                    <>
                      {/* Contact Information Card */}
                      <div className="bg-white border border-gray-200 rounded-md">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 rounded-t-md">
                          <h4 className="font-semibold text-gray-900 text-sm">Contact information</h4>
                        </div>
                        <div className="p-4 space-y-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Email:</span>
                            <span className="text-gray-900">{selectedContact.email}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="text-gray-900">{selectedContact.phone}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Location:</span>
                            <span className="text-gray-900">{selectedContact.location}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Company:</span>
                            <span className="text-gray-900">{selectedContact.company?.company_name || "No company"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Position:</span>
                            <span className="text-gray-900">{selectedContact.position}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status and Value Card */}
                      <div className="bg-white border border-gray-200 rounded-md">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 rounded-t-md">
                          <h4 className="font-semibold text-gray-900 text-sm">Status and value</h4>
                        </div>
                        <div className="p-4 space-y-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedContact.status)}`}>
                              {selectedContact.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Value:</span>
                            <span className="font-medium text-gray-900">{selectedContact.value}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Created:</span>
                            <span className="text-gray-900">{formatDate(selectedContact.created_at)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Notes Card */}
                      <div className="bg-white border border-gray-200 rounded-md">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 rounded-t-md">
                          <h4 className="font-semibold text-gray-900 text-sm">Notes</h4>
                        </div>
                        <div className="p-4">
                          <p className="text-sm text-gray-600">{selectedContact.notes?.join(', ') || "No notes"}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* History Card */}
                      <div className="bg-white border border-gray-200 rounded-md">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 rounded-t-md">
                          <h4 className="font-semibold text-gray-900 text-sm">Contact history</h4>
                        </div>
                        <div className="p-4 space-y-3">
                          {selectedContact.history?.map((entry: any, index: number) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">{entry.type}</div>
                                <div className="text-xs text-gray-500">{entry.description}</div>
                                <div className="text-xs text-gray-400 mt-1">{formatDate(entry.date)}</div>
                              </div>
                            </div>
                          )) || (
                            <p className="text-sm text-gray-500">No history available</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Company Details Side Drawer */}
        {isCompanyModalOpen && selectedCompany && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="flex-1 bg-black bg-opacity-25"
              onClick={() => setIsCompanyModalOpen(false)}
            />
            
            {/* Side Drawer */}
            <div className="w-[45vw] bg-white shadow-xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Company details</h2>
                <button
                  onClick={() => setIsCompanyModalOpen(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {/* Company Information Card */}
                <div className="p-4 border border-gray-200 bg-white rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {selectedCompany.website ? (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden">
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${selectedCompany.website}&sz=32`}
                            alt={`${selectedCompany.company_name} favicon`}
                            className="w-8 h-8"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center hidden">
                            <Building2 className="h-6 w-6 text-purple-600" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-purple-600" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedCompany.company_name}</h3>
                        <p className="text-sm text-gray-500">{selectedCompany.industry || "No industry"}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <Phone className="h-4 w-4 text-gray-600" />
                      </button>
                      <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <MessageCircle className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setCompanyModalTab("details")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      companyModalTab === "details"
                        ? "text-purple-600 border-b-2 border-purple-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setCompanyModalTab("contacts")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      companyModalTab === "contacts"
                        ? "text-purple-600 border-b-2 border-purple-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Contacts
                  </button>
                  <button
                    onClick={() => setCompanyModalTab("history")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      companyModalTab === "history"
                        ? "text-purple-600 border-b-2 border-purple-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    History
                  </button>
                  <button
                    onClick={() => setCompanyModalTab("notes")}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      companyModalTab === "notes"
                        ? "text-purple-600 border-b-2 border-purple-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Notes
                  </button>
                </div>

                {/* Tab Content */}
                <div className="p-4 space-y-4">
                  {companyModalTab === "details" ? (
                    <>
                      {/* Company Information Card */}
                      <div className="bg-white border border-gray-200 rounded-md">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 rounded-t-md">
                          <h4 className="font-semibold text-gray-900 text-sm">Company information</h4>
                        </div>
                        <div className="p-4 space-y-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Website:</span>
                            <span className="text-gray-900">{selectedCompany.website || "No website"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Location:</span>
                            <span className="text-gray-900">{selectedCompany.location || "No location"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Employee Count:</span>
                            <span className="text-gray-900">{selectedCompany.employee_count || "Not specified"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Company Size:</span>
                            <span className="text-gray-900">{selectedCompany.company_size || "Not specified"}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Annual Revenue:</span>
                            <span className="text-gray-900">{selectedCompany.annual_revenue || "Not specified"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status and Value Card */}
                      <div className="bg-white border border-gray-200 rounded-md">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 rounded-t-md">
                          <h4 className="font-semibold text-gray-900 text-sm">Status and value</h4>
                        </div>
                        <div className="p-4 space-y-3 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedCompany.status)}`}>
                              {selectedCompany.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Value:</span>
                            <span className="font-medium text-gray-900">{selectedCompany.value}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Created:</span>
                            <span className="text-gray-900">{formatDate(selectedCompany.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : companyModalTab === "contacts" ? (
                    <>
                      {/* Contacts Card */}
                      <div className="bg-white border border-gray-200 rounded-md">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 rounded-t-md">
                          <h4 className="font-semibold text-gray-900 text-sm">Company contacts</h4>
                        </div>
                        <div className="p-4 space-y-3">
                          {selectedCompany.contacts?.map((contact: Contact) => (
                            <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                  <User className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{contact.first_name} {contact.last_name}</div>
                                  <div className="text-xs text-gray-500">{contact.position || "No position"}</div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 text-xs text-gray-500">
                                <span>{contact.email || "No email"}</span>
                                <span>•</span>
                                <span>{contact.phone || "No phone"}</span>
                              </div>
                            </div>
                          )) || (
                            <p className="text-sm text-gray-500">No contacts associated with this company</p>
                          )}
                        </div>
                      </div>
                    </>
                  ) : companyModalTab === "history" ? (
                    <>
                      {/* History Card */}
                      <div className="bg-white border border-gray-200 rounded-md">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 rounded-t-md">
                          <h4 className="font-semibold text-gray-900 text-sm">Company history</h4>
                        </div>
                        <div className="p-4 space-y-3">
                          {selectedCompany.history?.map((entry: any, index: number) => (
                            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-gray-900">{entry.type}</div>
                                <div className="text-xs text-gray-500">{entry.description}</div>
                                <div className="text-xs text-gray-400 mt-1">{formatDate(entry.date)}</div>
                              </div>
                            </div>
                          )) || (
                            <p className="text-sm text-gray-500">No history available</p>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Notes Card */}
                      <div className="bg-white border border-gray-200 rounded-md">
                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 rounded-t-md">
                          <h4 className="font-semibold text-gray-900 text-sm">Company notes</h4>
                        </div>
                        <div className="p-4 space-y-3">
                          {selectedCompany.notes?.map((note: string, index: number) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-md">
                              <div className="text-sm text-gray-900">{note}</div>
                              <div className="text-xs text-gray-500 mt-1">{formatDate(selectedCompany.created_at)}</div>
                            </div>
                          )) || (
                            <p className="text-sm text-gray-500">No notes available</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add New Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-25"
              onClick={() => setIsAddModalOpen(false)}
            />
            
            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl w-[800px] h-[600px] flex flex-col">
              {/* Content */}
              <div className="flex-1 flex w-full">
                {addModalStep === "choice" && (
                  <div className="w-full flex flex-col items-center justify-center p-8">
                    <div className="text-center space-y-8">
                      <div className="space-y-2">
                        <p className="text-gray-600">Contacts & Companies</p>
                        <h2 className="text-xl font-bold text-gray-800">What would you like to add?</h2>
                      </div>
                      <div className="flex space-x-4 justify-center">
                        {/* Add Contact Card */}
                        <button
                          onClick={() => {
                            setSelectedType("contact")
                            setAddModalStep("contact")
                          }}
                          className="w-48 h-48 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors flex flex-col items-center justify-center space-y-3"
                          style={{ aspectRatio: '1 / 1' }}
                        >
                          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                            <User className="h-8 w-8 text-purple-600" />
                          </div>
                          <div className="text-center">
                            <h3 className="font-medium text-gray-900">Add Contact</h3>
                            <p className="text-sm text-gray-500 mt-1">Create a new individual contact</p>
                          </div>
                        </button>

                        {/* Add Company Card */}
                        <button
                          onClick={() => {
                            setSelectedType("company")
                            setAddModalStep("company")
                          }}
                          className="w-48 h-48 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors flex flex-col items-center justify-center space-y-3"
                          style={{ aspectRatio: '1 / 1' }}
                        >
                          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-purple-600" />
                          </div>
                          <div className="text-center">
                            <h3 className="font-medium text-gray-900">Add Company</h3>
                            <p className="text-sm text-gray-500 mt-1">Create a new company record</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {addModalStep === "contact" && (
                  <div className="flex w-full h-full">
                    {/* Left Column - Header */}
                    <div className="w-1/3 bg-gray-50 p-6 border-r border-gray-200 flex items-center justify-center rounded-l-lg">
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                          <User className="h-10 w-10 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Add Contact</h3>
                        <p className="text-sm text-gray-600 max-w-xs">
                          Create a new individual contact in your CRM
                        </p>
                      </div>
                    </div>

                    {/* Right Column - Form */}
                    <div className="w-2/3 p-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                            <input
                              type="text"
                              value={newContact.first_name}
                              onChange={(e) => setNewContact({...newContact, first_name: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Enter first name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                            <input
                              type="text"
                              value={newContact.last_name}
                              onChange={(e) => setNewContact({...newContact, last_name: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Enter last name"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={newContact.email}
                            onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter email address"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={newContact.phone}
                            onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter phone number"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                          <input
                            type="text"
                            value={newContact.position}
                            onChange={(e) => setNewContact({...newContact, position: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter job title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <input
                            type="text"
                            value={newContact.location}
                            onChange={(e) => setNewContact({...newContact, location: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter location"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                          <select 
                            value={newContact.company_id || ""}
                            onChange={(e) => setNewContact({...newContact, company_id: e.target.value || undefined})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="">Select a company (optional)</option>
                            {companies.map((company) => (
                              <option key={company.id} value={company.id}>
                                {company.company_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {addModalStep === "company" && (
                  <div className="flex w-full h-full">
                    {/* Left Column - Header */}
                    <div className="w-1/3 bg-gray-50 p-6 border-r border-gray-200 flex items-center justify-center rounded-l-lg">
                      <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                          <Building2 className="h-10 w-10 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Add Company</h3>
                        <p className="text-sm text-gray-600 max-w-xs">
                          Create a new company in your CRM
                        </p>
                      </div>
                    </div>

                    {/* Right Column - Form */}
                    <div className="w-2/3 p-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                          <input
                            type="text"
                            value={newCompany.company_name}
                            onChange={(e) => setNewCompany({...newCompany, company_name: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter company name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                          <input
                            type="text"
                            value={newCompany.industry}
                            onChange={(e) => setNewCompany({...newCompany, industry: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter industry"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                          <input
                            type="url"
                            value={newCompany.website}
                            onChange={(e) => setNewCompany({...newCompany, website: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter website URL"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                          <input
                            type="text"
                            value={newCompany.location}
                            onChange={(e) => setNewCompany({...newCompany, location: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter location"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Employee Count</label>
                          <select 
                            value={newCompany.employee_count}
                            onChange={(e) => setNewCompany({...newCompany, employee_count: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="">Select employee count</option>
                            <option value="1-10">1-10</option>
                            <option value="11-50">11-50</option>
                            <option value="51-200">51-200</option>
                            <option value="201-500">201-500</option>
                            <option value="501-1000">501-1000</option>
                            <option value="1000+">1000+</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                          <select 
                            value={newCompany.company_size}
                            onChange={(e) => setNewCompany({...newCompany, company_size: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="">Select company size</option>
                            <option value="Startup">Startup</option>
                            <option value="Small Business">Small Business</option>
                            <option value="Medium Business">Medium Business</option>
                            <option value="Large Enterprise">Large Enterprise</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Annual Revenue</label>
                          <select 
                            value={newCompany.annual_revenue}
                            onChange={(e) => setNewCompany({...newCompany, annual_revenue: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="">Select revenue range</option>
                            <option value="Under $1M">Under $1M</option>
                            <option value="$1M - $10M">$1M - $10M</option>
                            <option value="$10M - $50M">$10M - $50M</option>
                            <option value="$50M - $100M">$50M - $100M</option>
                            <option value="$100M+">$100M+</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer - Only show for contact/company steps */}
              {(addModalStep === "contact" || addModalStep === "company") && (
                <div className="bg-gray-200 px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 rounded-b-lg">
                  <button
                    onClick={() => {
                      setAddModalStep("choice")
                      setSelectedType(null)
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={addModalStep === "contact" ? handleAddContact : handleAddCompany}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors"
                  >
                    {addModalStep === "contact" ? "Add Contact" : "Add Company"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </>
    </ProtectedRoute>
  )
} 