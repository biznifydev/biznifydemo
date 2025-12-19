"use client"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { SubHeader } from "@/components/layout/SubHeader"
import { useState, useEffect, useMemo } from "react"
import { Plus, MoreVertical, DollarSign, Calendar, User, Building2, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, ArrowRight, Eye, MessageCircle, Search, Filter, ArrowUpDown, ChevronDown, Info, Star, BarChart3, Users } from "lucide-react"
import { useOrganization } from "@/lib/hooks/useOrganization"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

interface Deal {
  id: string
  title: string
  company: string
  contact: string
  value: number
  stage: string
  probability: number
  expectedCloseDate: string
  lastActivity: string
  owner: string
  description: string
  notes: string[]
  history: DealHistory[]
  status: "hot" | "warm" | "cold"
  industry: string
  daysInStage: number
  dueDate?: string
}

interface DealHistory {
  id: string
  type: string
  description: string
  date: string
  status: string
}

export default function SalesDealsPage() {
  const { currentOrganization } = useOrganization()
  const [deals, setDeals] = useState<Deal[]>([])
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [isDealModalOpen, setIsDealModalOpen] = useState(false)
  const [dealModalTab, setDealModalTab] = useState("details")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeView, setActiveView] = useState("pipeline")
  const [searchTerm, setSearchTerm] = useState("")

  // Updated pipeline stages to match the image
  const dealStages = [
    { 
      id: "new", 
      label: "New", 
      color: "bg-yellow-100 border-yellow-200",
      textColor: "text-yellow-800"
    },
    { 
      id: "discovery", 
      label: "Discovery", 
      color: "bg-blue-100 border-blue-200",
      textColor: "text-blue-800"
    },
    { 
      id: "negotiation", 
      label: "Negotiation", 
      color: "bg-teal-100 border-teal-200",
      textColor: "text-teal-800"
    },
    { 
      id: "proposal", 
      label: "Proposal", 
      color: "bg-green-100 border-green-200",
      textColor: "text-green-800"
    },
    { 
      id: "legal", 
      label: "Legal", 
      color: "bg-purple-100 border-purple-200",
      textColor: "text-purple-800"
    },
    { 
      id: "won", 
      label: "Won", 
      color: "bg-emerald-100 border-emerald-200",
      textColor: "text-emerald-800"
    },
    { 
      id: "lost", 
      label: "Lost", 
      color: "bg-red-100 border-red-200",
      textColor: "text-red-800"
    }
  ]

  // Mock data for now - will be replaced with database calls
  const mockDeals: Deal[] = [
    {
      id: "DEAL001",
      title: "Sunflower Industries Deal",
      company: "Sunflower Industries",
      contact: "John Smith",
      value: 58000,
      stage: "new",
      probability: 25,
      expectedCloseDate: "2024-02-15",
      lastActivity: "2024-01-20",
      owner: "Sarah Johnson",
      description: "Enterprise software license renewal",
      notes: ["Client is evaluating competitor pricing", "Decision expected by end of month"],
      status: "hot",
      industry: "Technology",
      daysInStage: 14,
      history: [
        { id: "1", type: "Meeting", description: "Product demonstration", date: "2024-01-20", status: "Completed" },
        { id: "2", type: "Proposal", description: "Proposal sent", date: "2024-01-18", status: "Sent" },
        { id: "3", type: "Call", description: "Initial discovery call", date: "2024-01-15", status: "Completed" }
      ]
    },
    {
      id: "DEAL002",
      title: "Pilot Deal",
      company: "Pilot Corp",
      contact: "Maria Garcia",
      value: 45000,
      stage: "new",
      probability: 30,
      expectedCloseDate: "2024-02-28",
      lastActivity: "2024-01-22",
      owner: "Mike Wilson",
      description: "Marketing automation platform",
      notes: ["Budget approved", "Technical review scheduled"],
      status: "warm",
      industry: "Marketing",
      daysInStage: 7,
      history: [
        { id: "1", type: "Call", description: "Discovery call", date: "2024-01-22", status: "Completed" },
        { id: "2", type: "Email", description: "Proposal sent", date: "2024-01-20", status: "Sent" }
      ]
    },
    {
      id: "DEAL003",
      title: "Pear inc Deal",
      company: "Pear Inc",
      contact: "David Lee",
      value: 120000,
      stage: "discovery",
      probability: 50,
      expectedCloseDate: "2024-03-15",
      lastActivity: "2024-01-25",
      owner: "Sarah Johnson",
      description: "Full-stack development services",
      notes: ["Requirements gathering in progress", "Stakeholder meeting scheduled"],
      status: "hot",
      industry: "Technology",
      daysInStage: 21,
      history: [
        { id: "1", type: "Meeting", description: "Requirements workshop", date: "2024-01-25", status: "Completed" },
        { id: "2", type: "Call", description: "Initial consultation", date: "2024-01-20", status: "Completed" }
      ]
    },
    {
      id: "DEAL004",
      title: "Greentech Innovators Deal",
      company: "Greentech Innovators",
      contact: "Lisa Chen",
      value: 19800,
      stage: "discovery",
      probability: 40,
      expectedCloseDate: "2024-02-20",
      lastActivity: "2024-01-23",
      owner: "Mike Wilson",
      description: "Green energy consulting services",
      notes: ["Technical assessment needed", "Budget constraints identified"],
      status: "warm",
      industry: "Energy",
      daysInStage: 12,
      history: [
        { id: "1", type: "Call", description: "Technical discussion", date: "2024-01-23", status: "Completed" },
        { id: "2", type: "Email", description: "Initial proposal", date: "2024-01-18", status: "Sent" }
      ]
    },
    {
      id: "DEAL005",
      title: "Wave Innovations Deal",
      company: "Wave Innovations",
      contact: "Alex Turner",
      value: 17800,
      stage: "negotiation",
      probability: 75,
      expectedCloseDate: "2024-02-10",
      lastActivity: "2024-01-26",
      owner: "Sarah Johnson",
      description: "AI-powered analytics platform",
      notes: ["Contract terms being finalized", "Legal review in progress"],
      status: "hot",
      industry: "Technology",
      daysInStage: 8,
      history: [
        { id: "1", type: "Meeting", description: "Contract negotiation", date: "2024-01-26", status: "Completed" },
        { id: "2", type: "Call", description: "Pricing discussion", date: "2024-01-24", status: "Completed" }
      ]
    },
    {
      id: "DEAL006",
      title: "Shoy Deal",
      company: "Shoy Solutions",
      contact: "Rachel Green",
      value: 30500,
      stage: "proposal",
      probability: 60,
      expectedCloseDate: "2024-02-25",
      lastActivity: "2024-01-27",
      owner: "Mike Wilson",
      description: "Custom software development",
      notes: ["Proposal under review", "Follow-up scheduled"],
      status: "warm",
      industry: "Technology",
      daysInStage: 5,
      history: [
        { id: "1", type: "Meeting", description: "Proposal presentation", date: "2024-01-27", status: "Completed" },
        { id: "2", type: "Email", description: "Detailed proposal sent", date: "2024-01-25", status: "Sent" }
      ]
    },
    {
      id: "DEAL007",
      title: "HSBF Deal",
      company: "HSBF Bank",
      contact: "Tom Anderson",
      value: 85000,
      stage: "legal",
      probability: 85,
      expectedCloseDate: "2024-02-05",
      lastActivity: "2024-01-28",
      owner: "Sarah Johnson",
      description: "Banking software integration",
      notes: ["Legal documents being reviewed", "Compliance checks in progress"],
      status: "hot",
      industry: "Finance",
      daysInStage: 15,
      history: [
        { id: "1", type: "Meeting", description: "Legal review meeting", date: "2024-01-28", status: "Completed" },
        { id: "2", type: "Email", description: "Contract draft sent", date: "2024-01-25", status: "Sent" }
      ]
    },
    {
      id: "DEAL008",
      title: "Facebook Deal",
      company: "Facebook",
      contact: "Mark Zuckerberg",
      value: 250000,
      stage: "won",
      probability: 100,
      expectedCloseDate: "2024-01-30",
      lastActivity: "2024-01-29",
      owner: "Sarah Johnson",
      description: "Enterprise social media platform",
      notes: ["Contract signed", "Implementation starting"],
      status: "hot",
      industry: "Technology",
      daysInStage: 2,
      history: [
        { id: "1", type: "Meeting", description: "Contract signing", date: "2024-01-29", status: "Completed" },
        { id: "2", type: "Email", description: "Final approval received", date: "2024-01-28", status: "Completed" }
      ]
    },
    {
      id: "DEAL009",
      title: "Audio Labs Deal",
      company: "Audio Labs",
      contact: "Steve Jobs",
      value: 180000,
      stage: "won",
      probability: 100,
      expectedCloseDate: "2024-01-25",
      lastActivity: "2024-01-25",
      owner: "Mike Wilson",
      description: "Audio processing software",
      notes: ["Project kickoff scheduled", "Team assigned"],
      status: "hot",
      industry: "Technology",
      daysInStage: 5,
      history: [
        { id: "1", type: "Meeting", description: "Project kickoff", date: "2024-01-25", status: "Completed" },
        { id: "2", type: "Email", description: "Contract executed", date: "2024-01-24", status: "Completed" }
      ]
    },
    {
      id: "DEAL010",
      title: "Adidas Deal",
      company: "Adidas",
      contact: "John Doe",
      value: 95000,
      stage: "lost",
      probability: 0,
      expectedCloseDate: "2024-01-20",
      lastActivity: "2024-01-20",
      owner: "Sarah Johnson",
      description: "Sports analytics platform",
      notes: ["Lost to competitor", "Budget constraints cited"],
      status: "cold",
      industry: "Sports",
      daysInStage: 30,
      history: [
        { id: "1", type: "Call", description: "Loss notification", date: "2024-01-20", status: "Completed" },
        { id: "2", type: "Email", description: "Final proposal", date: "2024-01-18", status: "Sent" }
      ]
    }
  ]

  useEffect(() => {
    setDeals(mockDeals)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "hot":
        return "bg-red-50 text-red-700 border-red-200"
      case "warm":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      case "cold":
        return "bg-blue-50 text-blue-700 border-blue-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "hot":
        return "Hot"
      case "warm":
        return "Warm"
      case "cold":
        return "Cold"
      default:
        return "Unknown"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getDealsByStage = (stageId: string) => {
    return deals.filter(deal => deal.stage === stageId)
  }

  const getPipelineStats = () => {
    const stats = {
      total: deals.length,
      totalValue: deals.reduce((sum, deal) => sum + deal.value, 0),
      weightedValue: deals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0),
    }
    return stats
  }

  const headerButtons = (
    <>
      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors flex items-center space-x-1"
      >
        <Plus className="h-3 w-3" />
        <span>New Opportunity</span>
        <ChevronDown className="h-3 w-3" />
      </button>
    </>
  )

  const renderDealCard = (deal: Deal) => (
    <div 
      key={deal.id}
      className="bg-white rounded-lg border border-gray-200 p-3 mb-3 cursor-pointer hover:shadow-md transition-shadow relative"
      onClick={() => {
        setSelectedDeal(deal)
        setIsDealModalOpen(true)
        setDealModalTab("details")
      }}
    >
      {/* Top Row - Deal Name and Actions */}
      <div className="flex items-start justify-between mb-2">
        <div className="font-medium text-gray-900 text-sm leading-tight flex-1 pr-2">
          {deal.title}
        </div>
        <div className="flex items-center space-x-1">
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <Plus className="h-3 w-3" />
          </button>
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <MoreVertical className="h-3 w-3" />
          </button>
        </div>
      </div>
      
      {/* Deal Value */}
      <div className="flex items-center space-x-2 mb-2">
        <Users className="h-3 w-3 text-gray-400" />
        <span className="text-xs text-gray-500">Deal Value</span>
        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
          {formatCurrency(deal.value)}
        </span>
      </div>
      
      {/* Days in Stage */}
      <div className="flex items-center space-x-2">
        <Clock className="h-3 w-3 text-gray-400" />
        <span className="text-xs text-gray-500">Deal length</span>
        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
          {deal.daysInStage} Days
        </span>
      </div>
    </div>
  )

  const viewTabs = [
    { id: "pipeline-table", label: "Pipeline Table" },
    { id: "main-table", label: "Main Table" },
    { id: "pipeline", label: "Pipeline View" },
    { id: "dashboard", label: "Dashboard" },
    { id: "my-view", label: "My View" },
    { id: "closed-deals", label: "Closed Deals" }
  ]

  return (
    <ProtectedRoute>
      <PageWrapper
        title="Opportunities"
        headerButtons={headerButtons}
        subHeader={<SubHeader tabs={viewTabs} activeTab={activeView} onTabChange={setActiveView} />}
      >
        <div className="space-y-4">
          {/* Pipeline Board with Action Bar */}
          <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
            {/* Action Bar - Attached to Kanban Table */}
            <div className="bg-white border-b border-gray-200 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors flex items-center space-x-1">
                    <Plus className="h-3 w-3" />
                    <span>New Opportunity</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Right side icons */}
                  <span className="text-sm text-gray-600">Activity</span>
                  <span className="text-sm text-gray-600">Integrate</span>
                  <BarChart3 className="h-4 w-4 text-gray-600" />
                  <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Kanban Board */}
            <div className="overflow-x-auto">
              <div className="flex min-w-max">
                {dealStages.map((stage) => {
                  const stageDeals = getDealsByStage(stage.id)
                  const stageValue = stageDeals.reduce((sum, deal) => sum + deal.value, 0)
                  
                  return (
                    <div key={stage.id} className="w-64 flex-shrink-0 border-r border-gray-200 last:border-r-0">
                      {/* Column Header - More Compact */}
                      <div className={`p-3 ${stage.color} border-b border-gray-200`}>
                        <div className="flex items-center justify-between">
                          <h3 className={`font-semibold text-sm ${stage.textColor}`}>
                            {stage.label}
                          </h3>
                          <span className="bg-white text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                            {stageDeals.length}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-gray-900 mt-1">
                          {formatCurrency(stageValue)}
                        </div>
                      </div>
                      
                      {/* Column Content */}
                      <div className="p-3 min-h-[600px] bg-gray-50">
                        {isLoading ? (
                          <div className="text-center text-gray-500 py-8">Loading...</div>
                        ) : stageDeals.length === 0 ? (
                          <div className="text-center text-gray-400 py-8 text-sm">
                            No deals in this stage
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {stageDeals.map(renderDealCard)}
                          </div>
                        )}
                        
                        {/* Add Deal Button */}
                        <button className="w-full mt-3 p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors text-sm">
                          <Plus className="h-4 w-4 mx-auto mb-1" />
                          Add deal
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    </ProtectedRoute>
  )
} 