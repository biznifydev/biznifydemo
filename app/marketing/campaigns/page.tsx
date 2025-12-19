"use client"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { useState, useMemo } from "react"
import { Search, Filter, ArrowUpDown, MoreVertical, BarChart3, TrendingUp, Eye, MousePointer, Users } from "lucide-react"

export default function MarketingCampaignsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [selectedMetric, setSelectedMetric] = useState("sessions")
  const [searchTerm, setSearchTerm] = useState("")
  const [showSearchRow, setShowSearchRow] = useState(false)
  const [showFilterRow, setShowFilterRow] = useState(false)

  // Sample campaign data
  const campaigns = [
    {
      id: 1,
      name: "Summer Sale Campaign",
      channel: "Email",
      type: "email",
      status: "Active",
      sessions: 1250,
      sales: 12500,
      orders: 89,
      conversionRate: 7.1,
      cost: 1200,
      roas: 10.4,
      cpa: 13.5,
      ctr: 2.8,
      aov: 140.4,
      newCustomers: 45,
      returningCustomers: 44,
      startDate: "2024-07-01",
      endDate: "2024-08-31"
    },
    {
      id: 2,
      name: "Social Media Boost",
      channel: "Social",
      type: "social",
      status: "Active",
      sessions: 890,
      sales: 6700,
      orders: 52,
      conversionRate: 5.8,
      cost: 800,
      roas: 8.4,
      cpa: 15.4,
      ctr: 1.9,
      aov: 128.8,
      newCustomers: 28,
      returningCustomers: 24,
      startDate: "2024-07-15",
      endDate: "2024-08-15"
    },
    {
      id: 3,
      name: "Google Ads Campaign",
      channel: "Paid Search",
      type: "paid",
      status: "Draft",
      sessions: 0,
      sales: 0,
      orders: 0,
      conversionRate: 0,
      cost: 0,
      roas: 0,
      cpa: 0,
      ctr: 0,
      aov: 0,
      newCustomers: 0,
      returningCustomers: 0,
      startDate: "2024-08-01",
      endDate: "2024-09-30"
    }
  ]

  const periodOptions = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 90 days" }
  ]

  const metricOptions = [
    { value: "sessions", label: "Sessions", icon: Eye },
    { value: "sales", label: "Sales", icon: TrendingUp },
    { value: "conversions", label: "Conversions", icon: MousePointer }
  ]

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
    { value: "completed", label: "Completed" }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-50 text-green-700"
      case "Draft":
        return "bg-yellow-50 text-yellow-700"
      case "Completed":
        return "bg-blue-50 text-blue-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-GB').format(num)
  }

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`
  }

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           campaign.channel.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }, [campaigns, searchTerm])

  const headerButtons = (
    <>
      <button className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-1">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
        <span>Connect Ad Account</span>
      </button>
      <button className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors flex items-center space-x-1">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>New Campaign</span>
      </button>
    </>
  )

  // Column widths for responsive table
  const columnWidths = {
    select: "40px",
    name: "200px",
    channel: "120px",
    status: "100px",
    sessions: "100px",
    sales: "120px",
    orders: "80px",
    conversionRate: "120px",
    cost: "100px",
    roas: "80px",
    cpa: "80px",
    ctr: "80px",
    aov: "100px",
    newCustomers: "140px",
    returningCustomers: "140px",
    actions: "60px"
  }

  return (
    <PageWrapper
      title="Campaigns"
      headerButtons={headerButtons}
    >
      <div className="space-y-6">
        {/* Chart Section - Top 2/3 */}
        <div className="bg-white rounded-md border border-gray-200 p-6">
          {/* Chart Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedPeriod("30d")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedPeriod === "30d"
                    ? "bg-gray-200 text-gray-900 border border-gray-300"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                Last 30 days
              </button>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-gray-600" />
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {metricOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Chart Title */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Campaign performance over time
              <button className="ml-2 text-gray-400 hover:text-gray-600">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </h3>
          </div>

          {/* Chart Placeholder */}
          <div className="bg-gray-50 rounded-lg p-8 flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-sm">Chart visualization will be implemented here</p>
              <p className="text-gray-500 text-xs mt-1">Showing {selectedMetric} data for {selectedPeriod}</p>
            </div>
          </div>
        </div>

        {/* Table Section - Bottom 1/3 */}
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Filter Bar Header Row */}
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <td colSpan={16} className="p-0">
                    <div className="flex items-center justify-between p-2">
                      {/* Left Section - Status Filters */}
                      <div className="flex items-center space-x-3">
                        {statusOptions.map((option) => (
                          <button
                            key={option.value}
                            className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                              option.value === "all"
                                ? "bg-gray-200 text-gray-900"
                                : "text-gray-700 hover:text-gray-900"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
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
                    <td colSpan={16} className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search campaigns by name or channel..."
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
                    <td colSpan={16} className="p-3">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Channel</label>
                          <select className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            <option value="">All Channels</option>
                            <option value="email">Email</option>
                            <option value="social">Social</option>
                            <option value="paid">Paid Search</option>
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
                          <label className="block text-xs font-medium text-gray-700 mb-1">Performance</label>
                          <select className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                            <option value="">All Performance</option>
                            <option value="high">High Performing</option>
                            <option value="medium">Medium Performing</option>
                            <option value="low">Low Performing</option>
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
                  <th style={{ width: columnWidths.select }} className="sticky left-0 bg-gray-50 z-10 border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">
                    <input type="checkbox" className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2" />
                  </th>
                  <th style={{ width: columnWidths.name }} className="sticky left-10 bg-gray-50 z-10 border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">Campaign</th>
                  <th style={{ width: columnWidths.channel }} className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">Channel</th>
                  <th style={{ width: columnWidths.status }} className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">Status</th>
                  <th style={{ width: columnWidths.sessions }} className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">Sessions</th>
                  <th style={{ width: columnWidths.sales }} className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">Sales</th>
                  <th style={{ width: columnWidths.orders }} className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">Orders</th>
                  <th style={{ width: columnWidths.conversionRate }} className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">Conv. Rate</th>
                  <th style={{ width: columnWidths.cost }} className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">Cost</th>
                  <th style={{ width: columnWidths.roas }} className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">ROAS</th>
                  <th style={{ width: columnWidths.cpa }} className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">CPA</th>
                  <th style={{ width: columnWidths.ctr }} className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">CTR</th>
                  <th style={{ width: columnWidths.aov }} className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">AOV</th>
                  <th style={{ width: columnWidths.newCustomers }} className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">New Customers</th>
                  <th style={{ width: columnWidths.returningCustomers }} className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs">Returning</th>
                  <th style={{ width: columnWidths.actions }} className="text-left py-2 px-3 font-semibold text-gray-700 text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="py-12">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <BarChart3 className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">Create your first campaign to start tracking marketing performance.</p>
                        <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors">
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Create Your First Campaign
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer">
                      <td style={{ width: columnWidths.select }} className="py-2 px-3 sticky left-0 bg-white z-10 border-r border-gray-200">
                        <div className="flex items-center justify-center">
                          <input type="checkbox" className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2" onClick={(e) => e.stopPropagation()} />
                        </div>
                      </td>
                      <td style={{ width: columnWidths.name }} className="py-2 px-3 sticky left-10 bg-white z-10 border-r border-gray-200">
                        <div className="font-medium text-gray-900 text-xs leading-tight max-h-8 overflow-hidden">
                          <div className="line-clamp-2">{campaign.name}</div>
                        </div>
                      </td>
                      <td style={{ width: columnWidths.channel }} className="py-2 px-3 border-r border-gray-200">
                        <div className="text-xs text-gray-600 leading-tight max-h-8 overflow-hidden">
                          <div className="line-clamp-2">{campaign.channel}</div>
                        </div>
                      </td>
                      <td style={{ width: columnWidths.status }} className={`py-2 px-3 border-r border-gray-200 ${getStatusColor(campaign.status)}`}>
                        <span className="text-xs font-medium text-gray-900">{campaign.status}</span>
                      </td>
                      <td style={{ width: columnWidths.sessions }} className="py-2 px-3 border-r border-gray-200">
                        <div className="text-xs font-medium text-gray-900 leading-tight max-h-8 overflow-hidden">
                          <div className="line-clamp-2">{formatNumber(campaign.sessions)}</div>
                        </div>
                      </td>
                      <td style={{ width: columnWidths.sales }} className="py-2 px-3 border-r border-gray-200">
                        <div className="text-xs font-medium text-gray-900 leading-tight max-h-8 overflow-hidden">
                          <div className="line-clamp-2">{formatCurrency(campaign.sales)}</div>
                        </div>
                      </td>
                      <td style={{ width: columnWidths.orders }} className="py-2 px-3 border-r border-gray-200">
                        <div className="text-xs text-gray-600 leading-tight max-h-8 overflow-hidden">
                          <div className="line-clamp-2">{formatNumber(campaign.orders)}</div>
                        </div>
                      </td>
                      <td style={{ width: columnWidths.conversionRate }} className="py-2 px-3 border-r border-gray-200">
                        <div className="text-xs text-gray-600 leading-tight max-h-8 overflow-hidden">
                          <div className="line-clamp-2">{formatPercentage(campaign.conversionRate)}</div>
                        </div>
                      </td>
                      <td style={{ width: columnWidths.cost }} className="py-2 px-3 border-r border-gray-200">
                        <div className="text-xs text-gray-600 leading-tight max-h-8 overflow-hidden">
                          <div className="line-clamp-2">{campaign.cost > 0 ? formatCurrency(campaign.cost) : "-"}</div>
                        </div>
                      </td>
                      <td style={{ width: columnWidths.roas }} className="py-2 px-3 border-r border-gray-200">
                        <div className="text-xs text-gray-600 leading-tight max-h-8 overflow-hidden">
                          <div className="line-clamp-2">{campaign.roas > 0 ? `${campaign.roas.toFixed(1)}x` : "-"}</div>
                        </div>
                      </td>
                      <td style={{ width: columnWidths.cpa }} className="py-2 px-3 border-r border-gray-200">
                        <div className="text-xs text-gray-600 leading-tight max-h-8 overflow-hidden">
                          <div className="line-clamp-2">{campaign.cpa > 0 ? formatCurrency(campaign.cpa) : "-"}</div>
                        </div>
                      </td>
                      <td style={{ width: columnWidths.ctr }} className="py-2 px-3 border-r border-gray-200">
                        <div className="text-xs text-gray-600 leading-tight max-h-8 overflow-hidden">
                          <div className="line-clamp-2">{campaign.ctr > 0 ? formatPercentage(campaign.ctr) : "-"}</div>
                        </div>
                      </td>
                      <td style={{ width: columnWidths.aov }} className="py-2 px-3 border-r border-gray-200">
                        <div className="text-xs text-gray-600 leading-tight max-h-8 overflow-hidden">
                          <div className="line-clamp-2">{campaign.aov > 0 ? formatCurrency(campaign.aov) : "-"}</div>
                        </div>
                      </td>
                      <td style={{ width: columnWidths.newCustomers }} className="py-2 px-3 border-r border-gray-200">
                        <div className="text-xs text-gray-600 leading-tight max-h-8 overflow-hidden">
                          <div className="line-clamp-2">{formatNumber(campaign.newCustomers)}</div>
                        </div>
                      </td>
                      <td style={{ width: columnWidths.returningCustomers }} className="py-2 px-3 border-r border-gray-200">
                        <div className="text-xs text-gray-600 leading-tight max-h-8 overflow-hidden">
                          <div className="line-clamp-2">{formatNumber(campaign.returningCustomers)}</div>
                        </div>
                      </td>
                      <td style={{ width: columnWidths.actions }} className="py-2 px-3">
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
    </PageWrapper>
  )
}