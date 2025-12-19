"use client"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { SubHeader } from "@/components/layout/SubHeader"
import { useState } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function HROverviewPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const hrTabs = [
    { id: "overview", label: "AI Overview" },
    { id: "analytics", label: "HR Analytics" },
    { id: "reports", label: "Reports" },
  ]

  const headerButtons = (
    <>
      <button className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-1">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>New Employee</span>
      </button>
      <button className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors">
        + Add New
      </button>
    </>
  )

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-8 max-w-4xl mx-auto px-6">
            {/* AI HR Assistant */}
            <div className="bg-white rounded-lg p-6">
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <p className="text-gray-600">Hi, I'm your AI HR assistant</p>
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h2 className="text-xl font-bold text-gray-800">Ask me for HR insights and employee management</h2>
                  </div>
                </div>
                
                <div className="relative max-w-2xl mx-auto">
                  <input
                    type="text"
                    placeholder="Ask about employee policies, recruitment, or HR compliance"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <button className="flex items-center space-x-2 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-full hover:bg-purple-700 transition-colors">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span>Go</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Start Section */}
            <div className="space-y-4 max-w-2xl mx-auto">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">QUICK START</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#f2f3f7] rounded-lg border border-gray-200 p-6 relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="relative z-10">
                    <h4 className="font-semibold text-gray-800 mb-2">Add Employee</h4>
                    <p className="text-sm text-gray-600">Onboard new employees and manage records.</p>
                  </div>
                  <div className="absolute top-4 right-4 border-2 border-white rounded-lg p-2">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                </div>
                
                <div className="bg-[#f2f3f7] rounded-lg border border-gray-200 p-6 relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="relative z-10">
                    <h4 className="font-semibold text-gray-800 mb-2">Post Job</h4>
                    <p className="text-sm text-gray-600">Create job postings and manage recruitment.</p>
                  </div>
                  <div className="absolute top-4 right-4 border-2 border-white rounded-lg p-2">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                    </svg>
                  </div>
                </div>
                
                <div className="bg-[#f2f3f7] rounded-lg border border-gray-200 p-6 relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="relative z-10">
                    <h4 className="font-semibold text-gray-800 mb-2">HR Policies</h4>
                    <p className="text-sm text-gray-600">Manage company policies and procedures.</p>
                  </div>
                  <div className="absolute top-4 right-4 border-2 border-white rounded-lg p-2">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                
                <div className="bg-[#f2f3f7] rounded-lg border border-gray-200 p-6 relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="relative z-10">
                    <h4 className="font-semibold text-gray-800 mb-2">Performance Reviews</h4>
                    <p className="text-sm text-gray-600">Conduct employee performance evaluations.</p>
                  </div>
                  <div className="absolute top-4 right-4 border-2 border-white rounded-lg p-2">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case "analytics":
        return <div className="text-gray-600">HR Analytics content coming soon...</div>
      case "reports":
        return <div className="text-gray-600">HR Reports content coming soon...</div>
      default:
        return null
    }
  }

  return (
    <ProtectedRoute>
      <PageWrapper 
        title="HR" 
        headerButtons={headerButtons}
        subHeader={<SubHeader tabs={hrTabs} activeTab={activeTab} onTabChange={setActiveTab} />}
      >
        {renderContent()}
      </PageWrapper>
    </ProtectedRoute>
  )
} 