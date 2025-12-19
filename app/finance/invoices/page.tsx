"use client"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { SubHeader } from "@/components/layout/SubHeader"
import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { 
  Plus, 
  Search, 
  Filter,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  FileText,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  X
} from 'lucide-react'
import CreateInvoiceForm from "@/components/finance/CreateInvoiceForm"

export default function FinanceInvoicesPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [sortField, setSortField] = useState("invoiceNumber")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [showFilterBar, setShowFilterBar] = useState(false)
  const [invoiceSearch, setInvoiceSearch] = useState("")
  const [selectedInvoiceStatus, setSelectedInvoiceStatus] = useState("all")
  const [selectedInvoiceClient, setSelectedInvoiceClient] = useState("all")
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false)

  const invoiceTabs = [
    { id: "all", label: "All Invoices" },
    { id: "draft", label: "Drafts" },
    { id: "sent", label: "Sent" },
    { id: "paid", label: "Paid" },
  ]

  const invoiceStatuses = [
    { id: "all", name: "All Statuses", count: 12 },
    { id: "draft", name: "Draft", count: 3 },
    { id: "sent", name: "Sent", count: 4 },
    { id: "paid", name: "Paid", count: 5 },
  ]

  const invoiceClients = [
    { id: "all", name: "All Clients", count: 12 },
    { id: "acme", name: "Acme Corp", count: 3 },
    { id: "techstart", name: "TechStart Inc", count: 2 },
    { id: "global", name: "Global Solutions", count: 4 },
    { id: "innovation", name: "Innovation Labs", count: 3 },
  ]

  const headerButtons = (
    <>
      <button 
        onClick={() => setIsCreateInvoiceModalOpen(true)}
        className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-1"
      >
        <Plus className="h-3 w-3" />
        <span>New Invoice</span>
      </button>
      <button className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors">
        + Add New
      </button>
    </>
  )

  const mockInvoices = [
    {
      id: "INV001",
      invoiceNumber: "INV-2024-001",
      client: "Acme Corp",
      clientId: "acme",
      amount: 2500.00,
      status: "paid",
      dueDate: "2024-01-15",
      issueDate: "2024-01-01",
      description: "Website Development Services"
    },
    {
      id: "INV002",
      invoiceNumber: "INV-2024-002",
      client: "TechStart Inc",
      clientId: "techstart",
      amount: 1800.00,
      status: "sent",
      dueDate: "2024-01-30",
      issueDate: "2024-01-10",
      description: "Mobile App Development"
    },
    {
      id: "INV003",
      invoiceNumber: "INV-2024-003",
      client: "Global Solutions",
      clientId: "global",
      amount: 3200.00,
      status: "draft",
      dueDate: "2024-02-15",
      issueDate: "2024-01-20",
      description: "Consulting Services"
    },
    {
      id: "INV004",
      invoiceNumber: "INV-2024-004",
      client: "Innovation Labs",
      clientId: "innovation",
      amount: 950.00,
      status: "paid",
      dueDate: "2024-01-20",
      issueDate: "2024-01-05",
      description: "UI/UX Design"
    },
    {
      id: "INV005",
      invoiceNumber: "INV-2024-005",
      client: "Acme Corp",
      clientId: "acme",
      amount: 1500.00,
      status: "sent",
      dueDate: "2024-02-01",
      issueDate: "2024-01-15",
      description: "SEO Services"
    },
    {
      id: "INV006",
      invoiceNumber: "INV-2024-006",
      client: "Global Solutions",
      clientId: "global",
      amount: 2800.00,
      status: "draft",
      dueDate: "2024-02-28",
      issueDate: "2024-01-25",
      description: "Data Analysis"
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-3 w-3 text-green-600" />
      case 'sent':
        return <Clock className="h-3 w-3 text-blue-600" />
      case 'draft':
        return <FileText className="h-3 w-3 text-gray-600" />
      default:
        return <AlertTriangle className="h-3 w-3 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid'
      case 'sent':
        return 'Sent'
      case 'draft':
        return 'Draft'
      default:
        return 'Unknown'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-50 text-green-700'
      case 'sent':
        return 'bg-blue-50 text-blue-700'
      case 'draft':
        return 'bg-gray-50 text-gray-700'
      default:
        return 'bg-gray-50 text-gray-700'
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getFilteredInvoices = () => {
    let filtered = mockInvoices

    // Filter by search
    if (invoiceSearch) {
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        invoice.client.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        invoice.description.toLowerCase().includes(invoiceSearch.toLowerCase())
      )
    }

    // Filter by status
    if (selectedInvoiceStatus !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === selectedInvoiceStatus)
    }

    // Filter by client
    if (selectedInvoiceClient !== 'all') {
      filtered = filtered.filter(invoice => invoice.clientId === selectedInvoiceClient)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof typeof a]
      let bValue: any = b[sortField as keyof typeof b]

      if (sortField === 'amount') {
        aValue = parseFloat(aValue)
        bValue = parseFloat(bValue)
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedInvoices([])
      setSelectAll(false)
    } else {
      const allIds = getFilteredInvoices().map(invoice => invoice.id)
      setSelectedInvoices(allIds)
      setSelectAll(true)
    }
  }

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices(prev => {
      if (prev.includes(invoiceId)) {
        return prev.filter(id => id !== invoiceId)
      } else {
        return [...prev, invoiceId]
      }
    })
  }

  const handleCreateInvoice = (invoiceData: any) => {
    // Generate a new invoice ID
    const newId = `INV${String(mockInvoices.length + 1).padStart(3, '0')}`
    const newInvoiceNumber = `INV-2024-${String(mockInvoices.length + 1).padStart(3, '0')}`
    
    const newInvoice = {
      id: newId,
      invoiceNumber: newInvoiceNumber,
      client: invoiceData.client,
      clientId: invoiceData.clientId,
      amount: parseFloat(invoiceData.amount),
      status: 'draft',
      dueDate: invoiceData.dueDate,
      issueDate: invoiceData.issueDate,
      description: invoiceData.description
    }
    
    // Add to mock data (in a real app, this would be saved to database)
    mockInvoices.push(newInvoice)
    
    // Close modal
    setIsCreateInvoiceModalOpen(false)
  }

  const renderCreateInvoiceModal = () => {
    if (!isCreateInvoiceModalOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Create New Invoice</h2>
            <button
              onClick={() => setIsCreateInvoiceModalOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <CreateInvoiceForm 
            onSubmit={handleCreateInvoice}
            onCancel={() => setIsCreateInvoiceModalOpen(false)}
            clients={invoiceClients.filter(client => client.id !== 'all')}
          />
        </div>
      </div>
    )
  }

  const renderContent = () => {
    const filteredInvoices = getFilteredInvoices()
    
    return (
      <div className="space-y-6">
        {/* Filter Bar */}
        {showFilterBar && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={invoiceSearch}
                    onChange={(e) => setInvoiceSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={selectedInvoiceStatus}
                  onChange={(e) => setSelectedInvoiceStatus(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {invoiceStatuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name} ({status.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Client Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Client</label>
                <select
                  value={selectedInvoiceClient}
                  onChange={(e) => setSelectedInvoiceClient(e.target.value)}
                  className="w-full text-xs border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {invoiceClients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setInvoiceSearch("")
                    setSelectedInvoiceStatus("all")
                    setSelectedInvoiceClient("all")
                  }}
                  className="w-full px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-300"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedInvoices.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-purple-800">
                  {selectedInvoices.length} invoice{selectedInvoices.length !== 1 ? 's' : ''} selected
                </span>
                <button className="text-xs text-purple-600 hover:text-purple-800 font-medium">
                  Select all
                </button>
                <button className="text-xs text-purple-600 hover:text-purple-800 font-medium">
                  Clear selection
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-md hover:bg-purple-700 transition-colors">
                  Export Selected
                </button>
                <button className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors">
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Invoices Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs w-10 sticky left-0 bg-gray-50 z-10 border-r border-gray-200">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                      />
                    </div>
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs sticky left-10 bg-gray-50 z-10 border-r border-gray-200">
                    <div className="flex items-center space-x-1">
                      <span>Invoice</span>
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => {
                          setSortField("invoiceNumber")
                          setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                        }}
                      >
                        {sortField === "invoiceNumber" && sortDirection === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                    <div className="flex items-center space-x-1">
                      <span>Client</span>
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => {
                          setSortField("client")
                          setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                        }}
                      >
                        {sortField === "client" && sortDirection === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                    <div className="flex items-center space-x-1">
                      <span>Amount</span>
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => {
                          setSortField("amount")
                          setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                        }}
                      >
                        {sortField === "amount" && sortDirection === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => {
                          setSortField("status")
                          setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                        }}
                      >
                        {sortField === "status" && sortDirection === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                    <div className="flex items-center space-x-1">
                      <span>Issue Date</span>
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => {
                          setSortField("issueDate")
                          setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                        }}
                      >
                        {sortField === "issueDate" && sortDirection === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                    <div className="flex items-center space-x-1">
                      <span>Due Date</span>
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => {
                          setSortField("dueDate")
                          setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                        }}
                      >
                        {sortField === "dueDate" && sortDirection === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-2 px-3 w-10 sticky left-0 bg-white z-10 border-r border-gray-200">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={() => handleSelectInvoice(invoice.id)}
                          className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                        />
                      </div>
                    </td>
                    <td className="py-2 px-3 sticky left-10 bg-white z-10 border-r border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900 text-xs">{invoice.invoiceNumber}</div>
                        <div className="text-xs text-gray-500">{invoice.description}</div>
                      </div>
                    </td>
                    <td className="py-2 px-3 border-r border-gray-200">
                      <span className="text-xs text-gray-900">{invoice.client}</span>
                    </td>
                    <td className="py-2 px-3 border-r border-gray-200">
                      <span className="text-xs font-medium text-gray-900">{formatCurrency(invoice.amount)}</span>
                    </td>
                    <td className={`py-2 px-3 border-r border-gray-200 ${getStatusColor(invoice.status)}`}>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(invoice.status)}
                        <span className="text-xs font-medium">{getStatusText(invoice.status)}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 border-r border-gray-200">
                      <span className="text-xs text-gray-900">{formatDate(invoice.issueDate)}</span>
                    </td>
                    <td className="py-2 px-3 border-r border-gray-200">
                      <span className="text-xs text-gray-900">{formatDate(invoice.dueDate)}</span>
                    </td>
                    <td className="py-2 px-3">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-3 w-3" />
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

  return (
    <ProtectedRoute>
      <PageWrapper 
        title="Invoices" 
        headerButtons={headerButtons}
        subHeader={
          <SubHeader 
            tabs={invoiceTabs} 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            onFilterClick={() => setShowFilterBar(!showFilterBar)}
            isFilterActive={showFilterBar}
          />
        }
      >
        {renderContent()}
        {renderCreateInvoiceModal()}
      </PageWrapper>
    </ProtectedRoute>
  )
}