"use client"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { SubHeader } from "@/components/layout/SubHeader"
import { useState } from "react"
import { Plus, CheckCircle, XCircle, Clock, CreditCard, Zap, ExternalLink } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function PaymentGatewaysPage() {
  const [activeTab, setActiveTab] = useState("all")
  
  const paymentTabs = [
    { id: "all", label: "All Gateways" },
    { id: "connected", label: "Connected" },
    { id: "available", label: "Available" },
  ]

  const headerButtons = (
    <>
      <button className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-1">
        <Plus className="h-3 w-3" />
        <span>Add Gateway</span>
      </button>
      <button className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors">
        View Documentation
      </button>
    </>
  )

  const mockPaymentGateways = [
    {
      id: "stripe",
      name: "Stripe",
      status: "connected",
      icon: CreditCard,
      description: "Accept payments and move money globally with the world's most flexible and scalable payment infrastructure.",
      features: ["Credit Cards", "Digital Wallets", "Subscriptions", "International"],
      pricing: "2.9% + 30¢ per transaction",
      lastSync: "2 minutes ago",
      syncStatus: "success"
    },
    {
      id: "paypal",
      name: "PayPal",
      status: "available",
      icon: CreditCard,
      description: "Send and receive money with PayPal. Shop online. Send money to friends and family.",
      features: ["PayPal Balance", "Credit Cards", "Bank Transfers", "Buy Now Pay Later"],
      pricing: "2.9% + fixed fee per transaction",
      lastSync: "Never",
      syncStatus: "none"
    },
    {
      id: "square",
      name: "Square",
      status: "available",
      icon: CreditCard,
      description: "Accept payments, track inventory, and manage your business with Square's point-of-sale system.",
      features: ["Point of Sale", "Online Payments", "Invoicing", "Analytics"],
      pricing: "2.6% + 10¢ per transaction",
      lastSync: "Never",
      syncStatus: "none"
    },
    {
      id: "adyen",
      name: "Adyen",
      status: "available",
      icon: CreditCard,
      description: "The payments platform built for the future. Accept payments globally with one integration.",
      features: ["Global Coverage", "Omnichannel", "Fraud Protection", "Advanced Analytics"],
      pricing: "Custom pricing",
      lastSync: "Never",
      syncStatus: "none"
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "available":
        return <Plus className="h-4 w-4 text-blue-500" />
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
      case "available":
        return "Available"
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
      case "available":
        return "bg-blue-50 text-blue-700 border-blue-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const renderContent = () => {
    const filteredGateways = activeTab === "all" 
      ? mockPaymentGateways 
      : mockPaymentGateways.filter(gateway => gateway.status === activeTab)

    return (
      <div className="space-y-6">
        {/* Payment Gateway Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connected Gateways</p>
                <p className="text-2xl font-bold text-green-600">1</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Gateways</p>
                <p className="text-2xl font-bold text-blue-600">3</p>
              </div>
              <Plus className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">1,247</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Payment Gateways List */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h2 className="font-semibold text-gray-800">Payment Gateways</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredGateways.map((gateway) => {
                const Icon = gateway.icon
                return (
                  <div key={gateway.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{gateway.name}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(gateway.status)}`}>
                            {getStatusIcon(gateway.status)}
                            <span className="ml-1">{getStatusText(gateway.status)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{gateway.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Pricing:</span>
                        <span className="font-medium text-gray-900">{gateway.pricing}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Last Sync:</span>
                        <span className="text-gray-900">{gateway.lastSync}</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {gateway.features.map((feature, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-xs text-gray-700 rounded">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {gateway.status === "connected" ? (
                        <>
                          <button className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                            Configure
                          </button>
                          <button className="flex-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">
                            Disconnect
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="flex-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                            Connect
                          </button>
                          <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-md transition-colors">
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <PageWrapper
        title="Payment Gateways" 
        headerButtons={headerButtons}
        subHeader={<SubHeader tabs={paymentTabs} activeTab={activeTab} onTabChange={setActiveTab} />}
      >
        {renderContent()}
      </PageWrapper>
    </ProtectedRoute>
  )
}