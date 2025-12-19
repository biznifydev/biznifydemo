"use client"

import { useState, useMemo } from "react"
import { Plus, FileText, Search, MoreVertical, Filter, ArrowUpDown } from "lucide-react"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { ContractTemplateModal } from "@/components/legal/ContractTemplateModal"
import { UploadContractModal } from "@/components/legal/UploadContractModal"

export default function ContractsPage() {
  const [isContractModalOpen, setIsContractModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showSearchRow, setShowSearchRow] = useState(false)
  const [showFilterRow, setShowFilterRow] = useState(false)

  const headerButtons = (
    <>
      <button 
        onClick={() => setIsUploadModalOpen(true)}
        className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-1"
      >
        <Plus className="h-3 w-3" />
        <span>Upload Contract</span>
      </button>
      <button 
        onClick={() => setIsContractModalOpen(true)}
        className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-md hover:bg-gray-800 transition-colors flex items-center space-x-1"
      >
        <Plus className="h-3 w-3" />
        <span>Create from Template</span>
      </button>
    </>
  )

  // Mock data
  const contracts = [
    {
      id: 1,
      name: "Service Agreement - TechCorp",
      type: "Service Agreement",
      status: "Active",
      createdDate: "2024-01-15",
      lastModified: "2024-01-15",
      parties: ["Biznify Inc", "TechCorp Solutions"],
      value: "$50,000"
    },
    {
      id: 2,
      name: "Employment Contract - Sarah Johnson",
      type: "Employment",
      status: "Draft",
      createdDate: "2024-01-14",
      lastModified: "2024-01-14",
      parties: ["Biznify Inc", "Sarah Johnson"],
      value: "$75,000"
    },
    {
      id: 3,
      name: "NDA - Innovation Labs",
      type: "Non-Disclosure",
      status: "Pending",
      createdDate: "2024-01-13",
      lastModified: "2024-01-13",
      parties: ["Biznify Inc", "Innovation Labs"],
      value: "N/A"
    }
  ]

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
    { value: "pending", label: "Pending" },
    { value: "expired", label: "Expired" }
  ]

  const columnWidths = {
    select: "40px",
    name: "250px",
    type: "150px",
    status: "100px",
    parties: "200px",
    value: "120px",
    created: "120px",
    modified: "120px",
    actions: "60px"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-50 text-green-700"
      case "Draft":
        return "bg-yellow-50 text-yellow-700"
      case "Pending":
        return "bg-blue-50 text-blue-700"
      case "Expired":
        return "bg-red-50 text-red-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  const filteredContracts = useMemo(() => {
    return contracts.filter(contract => {
      const matchesSearch = contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           contract.parties.some(party => party.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = selectedStatus === "all" || contract.status.toLowerCase() === selectedStatus
      return matchesSearch && matchesStatus
    })
  }, [contracts, searchTerm, selectedStatus])

  return (
    <PageWrapper
      title="Contracts"
      headerButtons={headerButtons}
    >
      <div className="space-y-4">
        {/* Contracts Table */}
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
                              placeholder="Search contracts by name, parties, or type..."
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
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Contract Type</label>
                          <select className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            <option value="">All Types</option>
                            <option value="service">Service Agreement</option>
                            <option value="employment">Employment</option>
                            <option value="nda">Non-Disclosure</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Date Range</label>
                          <select className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            <option value="">All Time</option>
                            <option value="7d">Last 7 days</option>
                            <option value="30d">Last 30 days</option>
                            <option value="90d">Last 90 days</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Value Range</label>
                          <select className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            <option value="">All Values</option>
                            <option value="0-10k">$0 - $10k</option>
                            <option value="10k-50k">$10k - $50k</option>
                            <option value="50k+">$50k+</option>
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
                    Contract Name
                  </th>
                  <th 
                    style={{ width: columnWidths.type }}
                    className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                  >
                    Type
                  </th>
                  <th 
                    style={{ width: columnWidths.status }}
                    className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                  >
                    Status
                  </th>
                  <th 
                    style={{ width: columnWidths.parties }}
                    className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                  >
                    Parties
                  </th>
                  <th 
                    style={{ width: columnWidths.value }}
                    className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                  >
                    Value
                  </th>
                  <th 
                    style={{ width: columnWidths.created }}
                    className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                  >
                    Created
                  </th>
                  <th 
                    style={{ width: columnWidths.modified }}
                    className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                  >
                    Last Modified
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
                {filteredContracts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">Create your first contract to start managing legal documents.</p>
                        <button
                          onClick={() => setIsContractModalOpen(true)}
                          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Contract
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredContracts.map((contract) => (
                    <tr 
                      key={contract.id}
                      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
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
                        <div className="font-medium text-gray-900 text-xs leading-tight max-h-8 overflow-hidden">
                          <div className="line-clamp-2">{contract.name}</div>
                        </div>
                      </td>
                      <td 
                        style={{ width: columnWidths.type }}
                        className="py-2 px-3 border-r border-gray-200"
                      >
                        <div className="text-xs text-gray-600 leading-tight max-h-8 overflow-hidden">
                          <div className="line-clamp-2">{contract.type}</div>
                        </div>
                      </td>
                      <td 
                        style={{ width: columnWidths.status }}
                        className={`py-2 px-3 border-r border-gray-200 ${getStatusColor(contract.status)}`}
                      >
                        <span className="text-xs font-medium text-gray-900">
                          {contract.status}
                        </span>
                      </td>
                      <td 
                        style={{ width: columnWidths.parties }}
                        className="py-2 px-3 border-r border-gray-200"
                      >
                        <div className="text-xs text-gray-600 leading-tight max-h-8 overflow-hidden">
                          <div className="line-clamp-2">{contract.parties.join(" & ")}</div>
                        </div>
                      </td>
                      <td 
                        style={{ width: columnWidths.value }}
                        className="py-2 px-3 border-r border-gray-200"
                      >
                        <div className="text-xs font-medium text-gray-900 leading-tight max-h-8 overflow-hidden">
                          <div className="line-clamp-2">{contract.value}</div>
                        </div>
                      </td>
                      <td 
                        style={{ width: columnWidths.created }}
                        className="py-2 px-3 border-r border-gray-200"
                      >
                        <div className="text-xs text-gray-600 leading-tight max-h-8 overflow-hidden">
                          <div className="line-clamp-2">{formatDate(contract.createdDate)}</div>
                        </div>
                      </td>
                      <td 
                        style={{ width: columnWidths.modified }}
                        className="py-2 px-3 border-r border-gray-200"
                      >
                        <div className="text-xs text-gray-600 leading-tight max-h-8 overflow-hidden">
                          <div className="line-clamp-2">{formatDate(contract.lastModified)}</div>
                        </div>
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

      {/* Modals */}
      <ContractTemplateModal isOpen={isContractModalOpen} onClose={() => setIsContractModalOpen(false)} />
      <UploadContractModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
    </PageWrapper>
  )
}