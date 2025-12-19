"use client"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { SubHeader } from "@/components/layout/SubHeader"
import { useState, useEffect } from "react"
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  PieChart,
  Calendar,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Search,
  Filter,
  MoreVertical,
  FileText,
  Download,
  Eye,
  ChevronUp,
  ChevronDown,
  X,
  Building
} from 'lucide-react'
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useOrganization } from "@/lib/hooks/useOrganization"
import { InvestmentService } from "@/lib/services/investmentService"
import InvestmentPlanning from "@/components/finance/InvestmentPlanning"
import {
  InvestmentRound,
  Investor,
  RoundInvestor,
  CapTableEntry,
  InvestmentMilestone,
  InvestmentSummary,
  CapTableSummary,
  CreateInvestmentRoundData,
  CreateInvestorData,
  CreateRoundInvestorData
} from "@/lib/types/investment"

export default function FinanceInvestmentPage() {
  const { currentOrganization, loading: orgLoading } = useOrganization()
  
  console.log('Investment page rendered, currentOrganization:', currentOrganization, 'orgLoading:', orgLoading)
  
  const [activeTab, setActiveTab] = useState("cap-table")
  const [showFilterBar, setShowFilterBar] = useState(false)
  const [sortField, setSortField] = useState("shareholder")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [selectedCapTable, setSelectedCapTable] = useState<string[]>([])
  const [selectedRounds, setSelectedRounds] = useState<string[]>([])
  const [selectAllCapTable, setSelectAllCapTable] = useState(false)
  const [selectAllRounds, setSelectAllRounds] = useState(false)
  const [capTableSearch, setCapTableSearch] = useState("")
  const [roundsSearch, setRoundsSearch] = useState("")
  const [capTableRound, setCapTableRound] = useState("all")
  const [capTableGrouping, setCapTableGrouping] = useState("individual")
  const [capTableView, setCapTableView] = useState("table")
  const [isRoundDetailsOpen, setIsRoundDetailsOpen] = useState(false)
  const [selectedRoundDetails, setSelectedRoundDetails] = useState<InvestmentRound | null>(null)
  const [isAddRoundModalOpen, setIsAddRoundModalOpen] = useState(false)
  const [addRoundStep, setAddRoundStep] = useState(1)
  const [roundFormData, setRoundFormData] = useState({
    round_name: '',
    round_type: 'series-a' as const,
    date: '',
    amount_raised: '',
    valuation: '',
    lead_investor_id: '',
    status: 'active' as const,
    use_of_funds: ''
  })
  const [investors, setInvestors] = useState<Array<{name: string, amount: string, type: string}>>([])
  const [newInvestor, setNewInvestor] = useState({name: '', amount: '', type: 'institutional'})

  // Real data state
  const [investmentRounds, setInvestmentRounds] = useState<InvestmentRound[]>([])
  const [allInvestors, setAllInvestors] = useState<Investor[]>([])
  const [capTableData, setCapTableData] = useState<CapTableEntry[]>([])
  const [investmentMilestones, setInvestmentMilestones] = useState<InvestmentMilestone[]>([])
  const [investmentSummary, setInvestmentSummary] = useState<InvestmentSummary | null>(null)
  const [capTableSummary, setCapTableSummary] = useState<CapTableSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const investmentTabs = [
    { id: "cap-table", label: "Cap Table" },
    { id: "round-history", label: "Round History" },
    { id: "investment-planning", label: "Investment Planning" },
  ]

  // Data loading functions
  const loadData = async () => {
    console.log('loadData called, currentOrganization:', currentOrganization)
    console.log('currentOrganization?.id:', currentOrganization?.id)
    
    if (!currentOrganization?.id) {
      console.log('No organization ID available')
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('Starting to fetch data for organization:', currentOrganization.id)
      
      const [
        rounds,
        investors,
        capTable,
        milestones,
        summary,
        capTableSummaryData
      ] = await Promise.all([
        InvestmentService.getInvestmentRounds(currentOrganization.id),
        InvestmentService.getInvestors(currentOrganization.id),
        InvestmentService.getCapTable(currentOrganization.id),
        InvestmentService.getInvestmentMilestones(currentOrganization.id),
        InvestmentService.getInvestmentSummary(currentOrganization.id),
        InvestmentService.getCapTableSummary(currentOrganization.id)
      ])

      console.log('Data fetched successfully:', {
        rounds: rounds.length,
        investors: investors.length,
        capTable: capTable.length,
        milestones: milestones.length,
        summary: summary,
        capTableSummary: capTableSummaryData
      })

      setInvestmentRounds(rounds)
      setAllInvestors(investors)
      setCapTableData(capTable)
      setInvestmentMilestones(milestones)
      setInvestmentSummary(summary)
      setCapTableSummary(capTableSummaryData)
    } catch (err) {
      console.error('Error loading investment data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount and when organization changes
  useEffect(() => {
    loadData()
  }, [currentOrganization?.id])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'closed':
        return 'bg-green-100 text-green-800'
      case 'in progress':
        return 'bg-blue-100 text-blue-800'
      case 'planning':
        return 'bg-yellow-100 text-yellow-800'
      case 'future':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleSelectAllCapTable = () => {
    if (selectAllCapTable) {
      setSelectedCapTable([])
      setSelectAllCapTable(false)
    } else {
      setSelectedCapTable(capTableData.map(item => item.id.toString()))
      setSelectAllCapTable(true)
    }
  }

  const handleSelectCapTable = (id: string) => {
    setSelectedCapTable(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleSelectAllRounds = () => {
    if (selectAllRounds) {
      setSelectedRounds([])
      setSelectAllRounds(false)
    } else {
      setSelectedRounds(investmentRounds.map(item => item.id.toString()))
      setSelectAllRounds(true)
    }
  }

  const handleSelectRound = (id: string) => {
    setSelectedRounds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const getFilteredCapTable = () => {
    let filtered = capTableData

    if (capTableSearch) {
      filtered = filtered.filter(item =>
        item.shareholder_name.toLowerCase().includes(capTableSearch.toLowerCase()) ||
        item.shareholder_type.toLowerCase().includes(capTableSearch.toLowerCase()) ||
        (item.share_class && item.share_class.toLowerCase().includes(capTableSearch.toLowerCase()))
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof typeof a]
      let bValue: any = b[sortField as keyof typeof b]
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }

  const handleRoundClick = (round: any) => {
    setSelectedRoundDetails(round)
    setIsRoundDetailsOpen(true)
  }

  const handleAddRound = () => {
    setIsAddRoundModalOpen(true)
    setAddRoundStep(1)
    setRoundFormData({
      round_name: '',
      round_type: 'series-a' as const,
      date: '',
      amount_raised: '',
      valuation: '',
      lead_investor_id: '',
      status: 'active' as const,
      use_of_funds: ''
    })
    setInvestors([])
    setNewInvestor({name: '', amount: '', type: 'institutional'})
  }

  const handleRoundFormChange = (field: string, value: string) => {
    setRoundFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNextStep = () => {
    setAddRoundStep(2)
  }

  const handlePrevStep = () => {
    setAddRoundStep(1)
  }

  const handleAddInvestor = () => {
    if (newInvestor.name && newInvestor.amount) {
      setInvestors(prev => [...prev, { ...newInvestor }])
      setNewInvestor({name: '', amount: '', type: 'institutional'})
    }
  }

  const handleRemoveInvestor = (index: number) => {
    setInvestors(prev => prev.filter((_, i) => i !== index))
  }

  const handleCreateRound = async () => {
    if (!currentOrganization?.id) return

    try {
      // Create the round
      const roundData: CreateInvestmentRoundData = {
        round_name: roundFormData.round_name,
        round_type: roundFormData.round_type,
        date: roundFormData.date,
        amount_raised: parseFloat(roundFormData.amount_raised) || 0,
        valuation: parseFloat(roundFormData.valuation) || 0,
        lead_investor_id: roundFormData.lead_investor_id || undefined,
        status: roundFormData.status,
        use_of_funds: roundFormData.use_of_funds || undefined,
        notes: undefined
      }

      const newRound = await InvestmentService.createInvestmentRound(currentOrganization.id, roundData)

      // Create round investors
      for (const investor of investors) {
        const roundInvestorData: CreateRoundInvestorData = {
          round_id: newRound.id,
          investor_id: investor.name, // This should be the actual investor ID
          investment_amount: parseFloat(investor.amount) || 0,
          ownership_percentage: undefined,
          shares_issued: undefined,
          share_price: undefined,
          investment_type: undefined,
          terms: undefined,
          board_seat: false,
          pro_rata_rights: false,
          anti_dilution: false
        }
        await InvestmentService.createRoundInvestor(roundInvestorData)
      }

      // Reload data
      await loadData()

      // Close modal and reset
      setIsAddRoundModalOpen(false)
      setAddRoundStep(1)
      setRoundFormData({
        round_name: '',
        round_type: 'series-a',
        date: '',
        amount_raised: '',
        valuation: '',
        lead_investor_id: '',
        status: 'active',
        use_of_funds: ''
      })
      setInvestors([])
      setNewInvestor({name: '', amount: '', type: 'institutional'})
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create round')
      console.error('Error creating round:', err)
    }
  }

  const getFilteredRounds = () => {
    let filtered = investmentRounds

    if (roundsSearch) {
      filtered = filtered.filter(item =>
        item.round_name.toLowerCase().includes(roundsSearch.toLowerCase()) ||
        item.status.toLowerCase().includes(roundsSearch.toLowerCase())
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof typeof a]
      let bValue: any = b[sortField as keyof typeof b]
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })

    return filtered
  }

  const renderCapTable = () => {
    const filteredCapTable = getFilteredCapTable()
    
    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Shares</p>
                <p className="text-lg font-bold text-gray-900">{capTableSummary?.total_shares.toLocaleString() || '0'}</p>
              </div>
              <PieChart className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Company Value</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(capTableSummary?.total_value || 0)}</p>
              </div>
              <DollarSign className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Shareholders</p>
                <p className="text-lg font-bold text-gray-900">{capTableSummary?.shareholders_count || 0}</p>
              </div>
              <Users className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Avg Ownership</p>
                <p className="text-lg font-bold text-gray-900">{formatPercentage(capTableSummary?.average_ownership || 0)}</p>
              </div>
              <BarChart3 className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        {showFilterBar && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search shareholders..."
                    value={capTableSearch}
                    onChange={(e) => setCapTableSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setCapTableSearch("")}
                  className="w-full px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-300"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedCapTable.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-purple-800">
                  {selectedCapTable.length} shareholder{selectedCapTable.length !== 1 ? 's' : ''} selected
                </span>
                <button 
                  onClick={handleSelectAllCapTable}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                >
                  Select all
                </button>
                <button 
                  onClick={() => setSelectedCapTable([])}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                >
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

        {/* Cap Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Capitalization Table</h3>
              </div>
              <div className="flex items-center space-x-4">
                {/* Round Toggle */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-700">Round:</span>
                  <select
                    value={capTableRound}
                    onChange={(e) => setCapTableRound(e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Rounds</option>
                    <option value="current">Current</option>
                    <option value="seed">Seed</option>
                    <option value="series-a">Series A</option>
                    <option value="series-b">Series B</option>
                  </select>
                </div>

                {/* Grouping Toggle */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-700">View:</span>
                  <select
                    value={capTableGrouping}
                    onChange={(e) => setCapTableGrouping(e.target.value)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="individual">Individual</option>
                    <option value="groups">Groups</option>
                  </select>
                </div>

                {/* Chart Type Toggle */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-medium text-gray-700">Display:</span>
                  <div className="flex border border-gray-300 rounded">
                    <button
                      onClick={() => setCapTableView("table")}
                      className={`px-3 py-1 text-xs font-medium transition-colors ${
                        capTableView === "table"
                          ? "bg-purple-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Table
                    </button>
                    <button
                      onClick={() => setCapTableView("pie")}
                      className={`px-3 py-1 text-xs font-medium transition-colors ${
                        capTableView === "pie"
                          ? "bg-purple-600 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Pie Chart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            {capTableView === "table" ? (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs w-10 sticky left-0 bg-gray-50 z-10 border-r border-gray-200">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectAllCapTable}
                          onChange={handleSelectAllCapTable}
                          className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                        />
                      </div>
                    </th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs sticky left-10 bg-gray-50 z-10 border-r border-gray-200">
                      <div className="flex items-center space-x-1">
                        <span>Shareholder</span>
                        <button 
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() => handleSort("shareholder")}
                        >
                          {sortField === "shareholder" && sortDirection === "asc" ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                      <div className="flex items-center space-x-1">
                        <span>Shares</span>
                        <button 
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() => handleSort("shares")}
                        >
                          {sortField === "shares" && sortDirection === "asc" ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                      <div className="flex items-center space-x-1">
                        <span>Percentage</span>
                        <button 
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() => handleSort("percentage")}
                        >
                          {sortField === "percentage" && sortDirection === "asc" ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                      <div className="flex items-center space-x-1">
                        <span>Value</span>
                        <button 
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() => handleSort("value")}
                        >
                          {sortField === "value" && sortDirection === "asc" ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                      <div className="flex items-center space-x-1">
                        <span>Type</span>
                        <button 
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() => handleSort("type")}
                        >
                          {sortField === "type" && sortDirection === "asc" ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </th>
                    <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                      <div className="flex items-center space-x-1">
                        <span>Last Updated</span>
                        <button 
                          className="text-gray-400 hover:text-gray-600"
                          onClick={() => handleSort("lastUpdated")}
                        >
                          {sortField === "lastUpdated" && sortDirection === "asc" ? (
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
                  {filteredCapTable.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-2 px-3 w-10 sticky left-0 bg-white z-10 border-r border-gray-200">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedCapTable.includes(item.id.toString())}
                            onChange={() => handleSelectCapTable(item.id.toString())}
                            className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                          />
                        </div>
                      </td>
                      <td className="py-2 px-3 sticky left-10 bg-white z-10 border-r border-gray-200">
                        <div className="font-medium text-gray-900 text-xs">{item.shareholder_name}</div>
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200">
                        <span className="text-xs text-gray-900">{item.shares_owned.toLocaleString()}</span>
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200">
                        <span className="text-xs text-gray-900">{formatPercentage(item.ownership_percentage * 100)}</span>
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200">
                        <span className="text-xs text-gray-900">{item.total_value ? formatCurrency(item.total_value) : '-'}</span>
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200">
                        <span className="text-xs text-gray-900">{item.shareholder_type}</span>
                      </td>
                      <td className="py-2 px-3 border-r border-gray-200">
                        <span className="text-xs text-gray-900">{item.last_updated}</span>
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
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-center">
                  <div className="w-64 h-64 relative">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      {/* Pie Chart Slices */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="20"
                        strokeDasharray={`${80 * 0.8} ${80 * 0.2}`}
                        strokeDashoffset="0"
                        transform="rotate(-90 50 50)"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="20"
                        strokeDasharray={`${80 * 0.1} ${80 * 0.9}`}
                        strokeDashoffset={`-${80 * 0.8}`}
                        transform="rotate(-90 50 50)"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#c084fc"
                        strokeWidth="20"
                        strokeDasharray={`${80 * 0.05} ${80 * 0.95}`}
                        strokeDashoffset={`-${80 * 0.9}`}
                        transform="rotate(-90 50 50)"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#d8b4fe"
                        strokeWidth="20"
                        strokeDasharray={`${80 * 0.05} ${80 * 0.95}`}
                        strokeDashoffset={`-${80 * 0.95}`}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">100%</div>
                        <div className="text-xs text-gray-600">Total Ownership</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                    <span className="text-sm text-gray-700">Founders (80%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-600 rounded"></div>
                    <span className="text-sm text-gray-700">Angel Investors (10%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-400 rounded"></div>
                    <span className="text-sm text-gray-700">Venture Capital A (5%)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-300 rounded"></div>
                    <span className="text-sm text-gray-700">Employee Stock Pool (5%)</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderRoundHistory = () => {
    return (
      <div className="space-y-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Total Raised</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(investmentSummary?.total_raised || 0)}</p>
              </div>
              <Target className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Rounds</p>
                <p className="text-lg font-bold text-gray-900">{investmentRounds.length}</p>
              </div>
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Current Valuation</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(investmentSummary?.current_valuation || 0)}</p>
              </div>
              <BarChart3 className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600">Investors</p>
                <p className="text-lg font-bold text-gray-900">{investmentSummary?.total_investors || 0}</p>
              </div>
              <Users className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        {showFilterBar && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search rounds..."
                    value={roundsSearch}
                    onChange={(e) => setRoundsSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setRoundsSearch("")}
                  className="w-full px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-300"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedRounds.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-purple-800">
                  {selectedRounds.length} round{selectedRounds.length !== 1 ? 's' : ''} selected
                </span>
                <button 
                  onClick={handleSelectAllRounds}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                >
                  Select all
                </button>
                <button 
                  onClick={() => setSelectedRounds([])}
                  className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                >
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

        {/* Round History */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs w-10 sticky left-0 bg-gray-50 z-10 border-r border-gray-200">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={selectAllRounds}
                        onChange={handleSelectAllRounds}
                        className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                      />
                    </div>
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs sticky left-10 bg-gray-50 z-10 border-r border-gray-200">
                    <div className="flex items-center space-x-1">
                      <span>Round</span>
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => handleSort("round")}
                      >
                        {sortField === "round" && sortDirection === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => handleSort("date")}
                      >
                        {sortField === "date" && sortDirection === "asc" ? (
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
                        onClick={() => handleSort("amount")}
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
                      <span>Valuation</span>
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => handleSort("valuation")}
                      >
                        {sortField === "valuation" && sortDirection === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </th>
                  <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs border-r border-gray-200">
                    <div className="flex items-center space-x-1">
                      <span>Lead Investor</span>
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => handleSort("leadInvestor")}
                      >
                        {sortField === "leadInvestor" && sortDirection === "asc" ? (
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
                        onClick={() => handleSort("status")}
                      >
                        {sortField === "status" && sortDirection === "asc" ? (
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
                {getFilteredRounds().map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-2 px-3 w-10 sticky left-0 bg-white z-10 border-r border-gray-200">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedRounds.includes(item.id.toString())}
                          onChange={() => handleSelectRound(item.id.toString())}
                          className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                        />
                      </div>
                    </td>
                    <td 
                      className="py-2 px-3 sticky left-10 bg-white z-10 border-r border-gray-200 cursor-pointer"
                      onClick={() => handleRoundClick(item)}
                    >
                      <div className="font-medium text-gray-900 text-xs">{item.round_name}</div>
                    </td>
                    <td 
                      className="py-2 px-3 border-r border-gray-200 cursor-pointer"
                      onClick={() => handleRoundClick(item)}
                    >
                      <span className="text-xs text-gray-900">{item.date}</span>
                    </td>
                    <td 
                      className="py-2 px-3 border-r border-gray-200 cursor-pointer"
                      onClick={() => handleRoundClick(item)}
                    >
                      <span className="text-xs text-gray-900">{formatCurrency(item.amount_raised)}</span>
                    </td>
                    <td 
                      className="py-2 px-3 border-r border-gray-200 cursor-pointer"
                      onClick={() => handleRoundClick(item)}
                    >
                      <span className="text-xs text-gray-900">{formatCurrency(item.valuation)}</span>
                    </td>
                    <td 
                      className="py-2 px-3 border-r border-gray-200 cursor-pointer"
                      onClick={() => handleRoundClick(item)}
                    >
                      <span className="text-xs text-gray-900">{item.lead_investor_id || 'N/A'}</span>
                    </td>
                    <td 
                      className="py-2 px-3 border-r border-gray-200 cursor-pointer"
                      onClick={() => handleRoundClick(item)}
                    >
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <button 
                        className="text-gray-400 hover:text-gray-600"
                        onClick={(e) => e.stopPropagation()}
                      >
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

  const renderRoundDetailsSidebar = () => {
    if (!isRoundDetailsOpen || !selectedRoundDetails) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
        <div className="bg-white h-full w-[768px] shadow-xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{selectedRoundDetails.round_name}</h2>
                <p className="text-sm text-gray-600">Funding Round Details</p>
              </div>
            </div>
            <button
              onClick={() => setIsRoundDetailsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Round Overview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Round Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Amount Raised</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedRoundDetails.amount_raised)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Valuation</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedRoundDetails.valuation)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Date</p>
                    <p className="text-sm font-medium text-gray-900">{selectedRoundDetails.date}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Status</p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedRoundDetails.status)}`}>
                      {selectedRoundDetails.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lead Investor */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Lead Investor</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Building className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedRoundDetails.lead_investor_id || 'Not specified'}</p>
                      <p className="text-xs text-gray-600">Lead Investor</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* All Investors */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">All Investors</h3>
                <div className="space-y-2">
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Users className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Investor details will be loaded from round_investors table</p>
                        <p className="text-xs text-gray-600">Investor</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Use of Funds */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Use of Funds</h3>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">{selectedRoundDetails.use_of_funds}</p>
                </div>
              </div>

              {/* Key Metrics */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-600">Dilution</p>
                    <p className="text-lg font-bold text-gray-900">15%</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-600">New Shares</p>
                    <p className="text-lg font-bold text-gray-900">1,500,000</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-600">Price per Share</p>
                    <p className="text-lg font-bold text-gray-900">$3.33</p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-600">Total Shares</p>
                    <p className="text-lg font-bold text-gray-900">10,000,000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderInvestmentPlanning = () => {
    return (
      <InvestmentPlanning 
        capTableData={capTableData}
        investmentRounds={investmentRounds}
        currentValuation={investmentSummary?.current_valuation || 0}
      />
    )
  }

  const renderAddRoundModal = () => {
    if (!isAddRoundModalOpen) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setIsAddRoundModalOpen(false)}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Plus className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Add Investment Round</h2>
                <p className="text-sm text-gray-600">
                  {addRoundStep === 1 ? 'Step 1: Round Details' : 'Step 2: Investors'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAddRoundModalOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {addRoundStep === 1 ? (
              /* Step 1: Round Details */
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Round Name</label>
                    <input
                      type="text"
                      value={roundFormData.round_name}
                      onChange={(e) => handleRoundFormChange('round_name', e.target.value)}
                      placeholder="e.g., Series A, Seed Round"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={roundFormData.date}
                      onChange={(e) => handleRoundFormChange('date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount Raised ($)</label>
                    <input
                      type="number"
                      value={roundFormData.amount_raised}
                      onChange={(e) => handleRoundFormChange('amount_raised', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Valuation ($)</label>
                    <input
                      type="number"
                      value={roundFormData.valuation}
                      onChange={(e) => handleRoundFormChange('valuation', e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lead Investor</label>
                    <input
                      type="text"
                      value={roundFormData.lead_investor_id}
                      onChange={(e) => handleRoundFormChange('lead_investor_id', e.target.value)}
                      placeholder="Lead investor name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={roundFormData.status}
                      onChange={(e) => handleRoundFormChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Use of Funds</label>
                  <textarea
                    value={roundFormData.use_of_funds}
                    onChange={(e) => handleRoundFormChange('use_of_funds', e.target.value)}
                    placeholder="Describe how the funds will be used..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            ) : (
              /* Step 2: Investors */
              <div className="space-y-6">
                {/* Add Investor Form */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Add Investor</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Investor Name</label>
                      <input
                        type="text"
                        value={newInvestor.name}
                        onChange={(e) => setNewInvestor(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Investor name"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Investment Amount ($)</label>
                      <input
                        type="number"
                        value={newInvestor.amount}
                        onChange={(e) => setNewInvestor(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={newInvestor.type}
                        onChange={(e) => setNewInvestor(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="institutional">Institutional</option>
                        <option value="angel">Angel</option>
                        <option value="strategic">Strategic</option>
                        <option value="individual">Individual</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={handleAddInvestor}
                      disabled={!newInvestor.name || !newInvestor.amount}
                      className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Add Investor
                    </button>
                  </div>
                </div>

                {/* Investors Table */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Investors ({investors.length})</h3>
                  {investors.length > 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full border-collapse">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-700 border-b border-gray-200">Investor</th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-700 border-b border-gray-200">Amount</th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-700 border-b border-gray-200">Type</th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-700 border-b border-gray-200">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {investors.map((investor, index) => (
                            <tr key={index} className="border-b border-gray-200 last:border-b-0">
                              <td className="py-2 px-3 text-sm text-gray-900">{investor.name}</td>
                              <td className="py-2 px-3 text-sm text-gray-900">{formatCurrency(parseFloat(investor.amount) || 0)}</td>
                              <td className="py-2 px-3 text-sm text-gray-900 capitalize">{investor.type}</td>
                              <td className="py-2 px-3">
                                <button
                                  onClick={() => handleRemoveInvestor(index)}
                                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600">No investors added yet. Add your first investor above.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <div>
              {addRoundStep === 2 && (
                <button
                  onClick={handlePrevStep}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsAddRoundModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              {addRoundStep === 1 ? (
                <button
                  onClick={handleNextStep}
                  disabled={!roundFormData.round_name || !roundFormData.date || !roundFormData.amount_raised}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleCreateRound}
                  disabled={investors.length === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Create Round
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const headerButtons = (
    <>
      <button 
        onClick={handleAddRound}
        className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-1"
      >
        <Plus className="h-3 w-3" />
        <span>Add Round</span>
      </button>
      <button className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors">
        Export Data
      </button>
    </>
  )

  const renderContent = () => {
    switch (activeTab) {
      case "cap-table":
        return renderCapTable()
      case "round-history":
        return renderRoundHistory()
      case "investment-planning":
        return renderInvestmentPlanning()
      default:
        return renderCapTable()
    }
  }

  return (
    <ProtectedRoute>
      <PageWrapper 
        title="Investment" 
        headerButtons={headerButtons}
        subHeader={
          <SubHeader 
            tabs={investmentTabs} 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            onFilterClick={() => setShowFilterBar(!showFilterBar)}
            isFilterActive={showFilterBar}
          />
        }
      >
        {(loading || orgLoading) && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{orgLoading ? 'Loading organization...' : 'Loading investment data...'}</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading data</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={loadData}
                  className="text-sm text-red-800 hover:text-red-900 font-medium"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}
        
        {!loading && !orgLoading && !error && (
          <>
            {renderContent()}
            {renderRoundDetailsSidebar()}
            {renderAddRoundModal()}
          </>
        )}
      </PageWrapper>
    </ProtectedRoute>
  )
} 