"use client"

import { useState } from "react"
import { Plus, FileText, Shield, Users, Clock, TrendingUp, Calendar, DollarSign, CheckCircle, AlertTriangle, Clock as ClockIcon } from "lucide-react"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { ContractTemplateModal } from "@/components/legal/ContractTemplateModal"
import { UploadContractModal } from "@/components/legal/UploadContractModal"

export default function LegalOverviewPage() {
  const [isContractModalOpen, setIsContractModalOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)

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

  const recentContracts = [
    {
      id: 1,
      name: "Service Agreement - TechCorp",
      type: "Service Agreement",
      status: "Active",
      lastModified: "2024-01-15",
      parties: ["Biznify Inc", "TechCorp Solutions"]
    },
    {
      id: 2,
      name: "Employment Contract - Sarah Johnson",
      type: "Employment",
      status: "Draft",
      lastModified: "2024-01-14",
      parties: ["Biznify Inc", "Sarah Johnson"]
    },
    {
      id: 3,
      name: "NDA - Innovation Labs",
      type: "Non-Disclosure",
      status: "Pending",
      lastModified: "2024-01-13",
      parties: ["Biznify Inc", "Innovation Labs"]
    }
  ]

  const contractStats = [
    {
      title: "Total Contracts",
      value: "24",
      change: "+12%",
      changeType: "positive",
      icon: FileText
    },
    {
      title: "Active Contracts",
      value: "18",
      change: "+8%",
      changeType: "positive",
      icon: CheckCircle
    },
    {
      title: "Pending Review",
      value: "4",
      change: "-2",
      changeType: "negative",
      icon: ClockIcon
    },
    {
      title: "Expiring Soon",
      value: "2",
      change: "0",
      changeType: "neutral",
      icon: AlertTriangle
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200"
      case "Draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Pending":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Expired":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case "positive":
        return "text-green-600"
      case "negative":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <PageWrapper
      title="Legal Overview"
      headerButtons={headerButtons}
    >
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {contractStats.map((stat, index) => (
            <div key={index} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">{stat.title}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.icon === CheckCircle ? 'bg-green-100' : stat.icon === ClockIcon ? 'bg-blue-100' : stat.icon === AlertTriangle ? 'bg-yellow-100' : 'bg-purple-100'}`}>
                  <stat.icon className={`h-5 w-5 ${stat.icon === CheckCircle ? 'text-green-600' : stat.icon === ClockIcon ? 'text-blue-600' : stat.icon === AlertTriangle ? 'text-yellow-600' : 'text-purple-600'}`} />
                </div>
              </div>
              <div className="mt-2">
                <span className={`text-xs font-medium ${getChangeColor(stat.changeType)}`}>
                  {stat.change}
                </span>
                <span className="text-xs text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            onClick={() => setIsContractModalOpen(true)}
            className="bg-[#f2f3f7] rounded-lg border border-gray-200 p-4 relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Create Contract</h3>
                <p className="text-xs text-gray-600">Start with a template</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Use professional templates for service agreements, employment contracts, NDAs, and more.
            </p>
            <div className="flex items-center text-xs text-purple-600 font-medium">
              Get started →
            </div>
          </div>

          <div className="bg-[#f2f3f7] rounded-lg border border-gray-200 p-4 relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Compliance Check</h3>
                <p className="text-xs text-gray-600">Review requirements</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Check your contracts against compliance requirements and get recommendations.
            </p>
            <div className="flex items-center text-xs text-blue-600 font-medium">
              Review now →
            </div>
          </div>

          <div className="bg-[#f2f3f7] rounded-lg border border-gray-200 p-4 relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Team Access</h3>
                <p className="text-xs text-gray-600">Manage permissions</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Control who can view, edit, and sign contracts within your organization.
            </p>
            <div className="flex items-center text-xs text-green-600 font-medium">
              Configure →
            </div>
          </div>
        </div>

        {/* Recent Contracts */}
        <div className="bg-gray-50 rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Recent Contracts</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentContracts.map((contract) => (
              <div key={contract.id} className="px-4 py-3 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-sm font-medium text-gray-900">{contract.name}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(contract.status)}`}>
                        {contract.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{contract.type}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Parties: {contract.parties.join(" & ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Last modified</p>
                    <p className="text-xs font-medium text-gray-900">{contract.lastModified}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-gray-50 rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Upcoming Deadlines</h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-3 w-3 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Service Agreement - TechCorp</p>
                    <p className="text-xs text-gray-600">Expires in 5 days</p>
                  </div>
                </div>
                <button className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-md hover:bg-yellow-200 transition-colors">
                  Renew
                </button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="h-3 w-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Employment Contract - Sarah Johnson</p>
                    <p className="text-xs text-gray-600">Review due in 2 days</p>
                  </div>
                </div>
                <button className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors">
                  Review
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ContractTemplateModal isOpen={isContractModalOpen} onClose={() => setIsContractModalOpen(false)} />
      <UploadContractModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
    </PageWrapper>
  )
}