"use client"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { SubHeader } from "@/components/layout/SubHeader"
import { useState } from "react"
import { Plus, CheckCircle, XCircle, Clock, Zap, Mail, CreditCard, Users, Calculator, Megaphone } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState("overview")
  
  const integrationTabs = [
    { id: "overview", label: "Overview" },
    { id: "payment-gateways", label: "Payment Gateways" },
    { id: "email-services", label: "Email Services" },
    { id: "crm-systems", label: "CRM Systems" },
    { id: "accounting-tools", label: "Accounting Tools" },
    { id: "marketing-platforms", label: "Marketing Platforms" },
  ]

  const headerButtons = (
    <>
      <button className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-1">
        <Plus className="h-3 w-3" />
        <span>Add Integration</span>
      </button>
      <button className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors">
        Browse All
      </button>
    </>
  )

  const mockIntegrations = [
    {
      id: "stripe",
      name: "Stripe",
      category: "Payment Gateway",
      status: "connected",
      icon: CreditCard,
      description: "Process payments and manage subscriptions",
      lastSync: "2 minutes ago",
      syncStatus: "success"
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      category: "Email Service",
      status: "connected",
      icon: Mail,
      description: "Email marketing and automation",
      lastSync: "5 minutes ago",
      syncStatus: "success"
    },
    {
      id: "salesforce",
      name: "Salesforce",
      category: "CRM System",
      status: "pending",
      icon: Users,
      description: "Customer relationship management",
      lastSync: "Never",
      syncStatus: "pending"
    },
    {
      id: "quickbooks",
      name: "QuickBooks",
      category: "Accounting Tool",
      status: "disconnected",
      icon: Calculator,
      description: "Accounting and bookkeeping",
      lastSync: "2 days ago",
      syncStatus: "error"
    },
    {
      id: "hubspot",
      name: "HubSpot",
      category: "Marketing Platform",
      status: "connected",
      icon: Megaphone,
      description: "Marketing automation and CRM",
      lastSync: "1 hour ago",
      syncStatus: "success"
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "disconnected":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected":
        return "Connected"
      case "pending":
        return "Pending"
      case "disconnected":
        return "Disconnected"
      default:
        return "Unknown"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-50 text-green-700 border-green-200"
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "disconnected":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-4">
            {/* Integration Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-md border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Total</p>
                    <p className="text-xl font-bold text-gray-900">5</p>
                  </div>
                  <Zap className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <div className="bg-white rounded-md border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Connected</p>
                    <p className="text-xl font-bold text-purple-600">3</p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <div className="bg-white rounded-md border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Pending</p>
                    <p className="text-xl font-bold text-purple-600">1</p>
                  </div>
                  <Clock className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <div className="bg-white rounded-md border border-gray-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Disconnected</p>
                    <p className="text-xl font-bold text-purple-600">1</p>
                  </div>
                  <XCircle className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Active Integrations */}
            <div className="bg-white rounded-md border border-gray-200">
              <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                <h2 className="font-medium text-gray-800 text-sm">Active Integrations</h2>
              </div>
              <div className="p-3">
                <div className="space-y-2">
                  {mockIntegrations.map((integration) => {
                    const Icon = integration.icon
                    return (
                      <div key={integration.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-md hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                            <Icon className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 text-sm">{integration.name}</h3>
                            <p className="text-xs text-gray-500">{integration.description}</p>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(integration.status)}`}>
                                {getStatusIcon(integration.status)}
                                <span className="ml-1">{getStatusText(integration.status)}</span>
                              </span>
                              <span className="text-xs text-gray-400">Last sync: {integration.lastSync}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button className="px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors">
                            Configure
                          </button>
                          <button className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded transition-colors">
                            Disconnect
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )
      case "payment-gateways":
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-md border border-gray-200 p-4">
              <h3 className="text-base font-medium text-gray-800 mb-2">Payment Gateways</h3>
              <p className="text-sm text-gray-600">Connect payment processors to handle transactions and subscriptions.</p>
            </div>
          </div>
        )
      case "email-services":
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-md border border-gray-200 p-4">
              <h3 className="text-base font-medium text-gray-800 mb-2">Email Services</h3>
              <p className="text-sm text-gray-600">Integrate email marketing platforms for campaigns and automation.</p>
            </div>
          </div>
        )
      case "crm-systems":
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-md border border-gray-200 p-4">
              <h3 className="text-base font-medium text-gray-800 mb-2">CRM Systems</h3>
              <p className="text-sm text-gray-600">Connect customer relationship management platforms.</p>
            </div>
          </div>
        )
      case "accounting-tools":
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-md border border-gray-200 p-4">
              <h3 className="text-base font-medium text-gray-800 mb-2">Accounting Tools</h3>
              <p className="text-sm text-gray-600">Sync with accounting software for financial management.</p>
            </div>
          </div>
        )
      case "marketing-platforms":
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-md border border-gray-200 p-4">
              <h3 className="text-base font-medium text-gray-800 mb-2">Marketing Platforms</h3>
              <p className="text-sm text-gray-600">Connect marketing automation and analytics platforms.</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <ProtectedRoute>
      <PageWrapper
        title="Integrations" 
        headerButtons={headerButtons}
        subHeader={<SubHeader tabs={integrationTabs} activeTab={activeTab} onTabChange={setActiveTab} />}
      >
        {renderContent()}
      </PageWrapper>
    </ProtectedRoute>
  )
}