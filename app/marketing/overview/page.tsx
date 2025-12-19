"use client"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { SubHeader } from "@/components/layout/SubHeader"
import { useState } from "react"
export default function MarketingOverviewPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const marketingTabs = [
    { id: "overview", label: "AI Overview" },
    { id: "campaigns", label: "Campaigns" },
    { id: "analytics", label: "Analytics" },
  ]

  const headerButtons = (
    <>
      <button className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-1">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>New Campaign</span>
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
            {/* AI Marketing Assistant */}
            <div className="bg-white rounded-lg p-6">
              <div className="text-center space-y-4">
                <div className="space-y-2">
                  <p className="text-gray-600">Hi, I'm your AI Marketing assistant</p>
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="h-4 w-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <h2 className="text-xl font-bold text-gray-800">Ask me for marketing insights and campaign optimization</h2>
                  </div>
                </div>
                
                <div className="relative max-w-2xl mx-auto">
                  <input
                    type="text"
                    placeholder="Ask about campaigns, audience targeting, or marketing performance"
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
                    <h4 className="font-semibold text-gray-800 mb-2">Create Campaign</h4>
                    <p className="text-sm text-gray-600">Launch new marketing campaigns.</p>
                  </div>
                  <div className="absolute top-4 right-4 border-2 border-white rounded-lg p-2">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                </div>
                
                <div className="bg-[#f2f3f7] rounded-lg border border-gray-200 p-6 relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="relative z-10">
                    <h4 className="font-semibold text-gray-800 mb-2">Content Calendar</h4>
                    <p className="text-sm text-gray-600">Plan and schedule content.</p>
                  </div>
                  <div className="absolute top-4 right-4 border-2 border-white rounded-lg p-2">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                
                <div className="bg-[#f2f3f7] rounded-lg border border-gray-200 p-6 relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="relative z-10">
                    <h4 className="font-semibold text-gray-800 mb-2">Analytics Dashboard</h4>
                    <p className="text-sm text-gray-600">Track campaign performance.</p>
                  </div>
                  <div className="absolute top-4 right-4 border-2 border-white rounded-lg p-2">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                
                <div className="bg-[#f2f3f7] rounded-lg border border-gray-200 p-6 relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                  <div className="relative z-10">
                    <h4 className="font-semibold text-gray-800 mb-2">Audience Targeting</h4>
                    <p className="text-sm text-gray-600">Define target audiences.</p>
                  </div>
                  <div className="absolute top-4 right-4 border-2 border-white rounded-lg p-2">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      case "campaigns":
        return <div className="text-gray-600">Campaigns content coming soon...</div>
      case "analytics":
        return <div className="text-gray-600">Analytics content coming soon...</div>
      default:
        return null
    }
  }

  return (
    <PageWrapper
        title="Marketing Overview" 
      headerButtons={headerButtons}
      subHeader={<SubHeader tabs={marketingTabs} activeTab={activeTab} onTabChange={setActiveTab} />}
    >
      {renderContent()}
    </PageWrapper>
  )
}