"use client"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { SubHeader } from "@/components/layout/SubHeader"
import { useState } from "react"
import { ChevronLeft, ChevronRight, List, Calendar, MoreVertical, Edit2, Eye, Trash2, Clock, CheckCircle, XCircle } from "lucide-react"
export default function MarketingContentPage() {
  const [activeTab, setActiveTab] = useState("table")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"table" | "calendar" | "list">("table")
  
  const contentTabs = [
    { id: "table", label: "Content Table" },
    { id: "calendar", label: "Calendar" },
  ]

  const mockContent = [
    {
      id: "CONT001",
      title: "10 Ways to Boost Your Social Media Engagement",
      type: "blog",
      status: "published",
      author: "Sarah Johnson",
      publishDate: "2024-03-05",
      views: 1247,
      engagement: 8.5,
      category: "Social Media",
      description: "Comprehensive guide on improving social media engagement rates"
    },
    {
      id: "CONT002",
      title: "Q1 Product Launch Campaign",
      type: "email",
      status: "scheduled",
      author: "Mike Chen",
      publishDate: "2024-03-12",
      views: 0,
      engagement: 0,
      category: "Product Marketing",
      description: "Email campaign for the new product launch"
    },
    {
      id: "CONT003",
      title: "Behind the Scenes: Our Design Process",
      type: "social",
      status: "draft",
      author: "Emma Wilson",
      publishDate: "2024-03-15",
      views: 0,
      engagement: 0,
      category: "Company Culture",
      description: "Instagram post showing our design workflow"
    },
    {
      id: "CONT004",
      title: "Industry Trends Report 2024",
      type: "blog",
      status: "published",
      author: "Alex Thompson",
      publishDate: "2024-03-01",
      views: 2156,
      engagement: 12.3,
      category: "Industry Analysis",
      description: "Annual report on industry trends and predictions"
    },
    {
      id: "CONT005",
      title: "Customer Success Story: TechCorp",
      type: "blog",
      status: "published",
      author: "Sarah Johnson",
      publishDate: "2024-03-08",
      views: 892,
      engagement: 6.7,
      category: "Customer Stories",
      description: "Case study featuring TechCorp's success with our platform"
    },
    {
      id: "CONT006",
      title: "Weekly Newsletter #12",
      type: "email",
      status: "scheduled",
      author: "Mike Chen",
      publishDate: "2024-03-14",
      views: 0,
      engagement: 0,
      category: "Newsletter",
      description: "Weekly newsletter with company updates and insights"
    },
    {
      id: "CONT007",
      title: "Team Building Event Highlights",
      type: "social",
      status: "draft",
      author: "Emma Wilson",
      publishDate: "2024-03-20",
      views: 0,
      engagement: 0,
      category: "Company Culture",
      description: "LinkedIn post showcasing our team building activities"
    },
    {
      id: "CONT008",
      title: "How to Optimize Your Landing Pages",
      type: "blog",
      status: "published",
      author: "Alex Thompson",
      publishDate: "2024-03-10",
      views: 1567,
      engagement: 9.2,
      category: "Conversion Optimization",
      description: "Step-by-step guide to improving landing page performance"
    }
  ]

  const mockCalendarEvents = [
    {
      id: "EVT001",
      title: "Blog Post: Social Media Tips",
      date: "2024-03-05",
      type: "blog",
      status: "published",
      emoji: "📝"
    },
    {
      id: "EVT002",
      title: "Email Campaign: Product Launch",
      date: "2024-03-12",
      type: "email",
      status: "scheduled",
      emoji: "📧"
    },
    {
      id: "EVT003",
      title: "Instagram Post: Design Process",
      date: "2024-03-15",
      type: "social",
      status: "draft",
      emoji: "📸"
    },
    {
      id: "EVT004",
      title: "LinkedIn Post: Team Event",
      date: "2024-03-20",
      type: "social",
      status: "draft",
      emoji: "👥"
    },
    {
      id: "EVT005",
      title: "Newsletter: Weekly Update",
      date: "2024-03-14",
      type: "email",
      status: "scheduled",
      emoji: "📰"
    }
  ]

  const headerButtons = (
    <>
      <button className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-1">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>New Content</span>
      </button>
      <button className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors">
        + Add New
      </button>
    </>
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "published":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "draft":
        return <Edit2 className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "published":
        return "Published"
      case "scheduled":
        return "Scheduled"
      case "draft":
        return "Draft"
      default:
        return "Unknown"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "blog":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "social":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "email":
        return "bg-green-50 text-green-700 border-green-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear()
  }

  const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 6
  }

  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return mockCalendarEvents.filter(event => event.date === dateString)
  }

  const renderContent = () => {
    switch (activeTab) {
      case "table":
        return (
          <div className="space-y-6">
            {/* Content Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-2 px-4 font-semibold text-gray-700 text-xs">Content Title</th>
                      <th className="text-left py-2 px-4 font-semibold text-gray-700 text-xs">Type</th>
                      <th className="text-left py-2 px-4 font-semibold text-gray-700 text-xs">Status</th>
                      <th className="text-left py-2 px-4 font-semibold text-gray-700 text-xs">Author</th>
                      <th className="text-left py-2 px-4 font-semibold text-gray-700 text-xs">Publish Date</th>
                      <th className="text-left py-2 px-4 font-semibold text-gray-700 text-xs">Views</th>
                      <th className="text-left py-2 px-4 font-semibold text-gray-700 text-xs">Engagement</th>
                      <th className="text-left py-2 px-4 font-semibold text-gray-700 text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockContent.map((content) => (
                      <tr key={content.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-4">
                          <div>
                            <div className="font-medium text-gray-900 text-xs">{content.title}</div>
                            <div className="text-xs text-gray-500">{content.description}</div>
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(content.type)}`}>
                            {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
                          </span>
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(content.status)}
                            <span className="text-xs text-gray-900">{getStatusText(content.status)}</span>
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          <span className="text-xs text-gray-900">{content.author}</span>
                        </td>
                        <td className="py-2 px-4">
                          <span className="text-xs text-gray-900">{formatDate(content.publishDate)}</span>
                        </td>
                        <td className="py-2 px-4">
                          <span className="text-xs text-gray-900">{content.views.toLocaleString()}</span>
                        </td>
                        <td className="py-2 px-4">
                          <span className="text-xs text-gray-900">{content.engagement}%</span>
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex items-center space-x-1">
                            <button className="text-gray-400 hover:text-blue-600 p-1">
                              <Eye className="h-3 w-3" />
                            </button>
                            <button className="text-gray-400 hover:text-green-600 p-1">
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button className="text-gray-400 hover:text-red-600 p-1">
                              <MoreVertical className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      case "calendar":
        return (
          <div className="space-y-6">
            {/* Calendar Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Today, {currentDate.getDate()} {currentDate.toLocaleDateString('en-US', { month: 'long' })} {currentDate.getFullYear()}
                  </h2>
                  <button 
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <select className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Monthly</option>
                    <option>Weekly</option>
                    <option>Daily</option>
                  </select>
                  <button className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}>
                    <List className="h-4 w-4" />
                  </button>
                  <button className={`p-2 rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}>
                    <Calendar className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {/* Day Headers */}
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="bg-gray-50 p-3 text-center">
                    <span className="text-sm font-medium text-gray-700">{day}</span>
                  </div>
                ))}
                
                {/* Calendar Days */}
                {(() => {
                  const daysInMonth = getDaysInMonth(currentDate)
                  const firstDayOfMonth = getFirstDayOfMonth(currentDate)
                  const days = []
                  
                  // Add empty cells for days before the first day of the month
                  for (let i = 0; i < firstDayOfMonth; i++) {
                    days.push(<div key={`empty-${i}`} className="bg-white min-h-[120px]"></div>)
                  }
                  
                  // Add days of the month
                  for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                    const events = getEventsForDate(date)
                    const isTodayDate = isToday(date)
                    const isWeekendDate = isWeekend(date)
                    
                    days.push(
                      <div 
                        key={day} 
                        className={`bg-white min-h-[120px] p-2 ${isWeekendDate ? 'bg-gray-50' : ''} ${isTodayDate ? 'ring-2 ring-orange-400' : ''}`}
                      >
                        <div className="text-sm font-medium text-gray-900 mb-1">{day}</div>
                        <div className="space-y-1">
                          {events.map((event) => (
                            <div key={event.id} className="text-xs p-1 rounded bg-blue-50 border border-blue-200">
                              <div className="flex items-center space-x-1">
                                <span>{event.emoji}</span>
                                <span className="truncate">{event.title}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  
                  return days
                })()}
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <PageWrapper
        title="Content" 
      headerButtons={headerButtons}
      subHeader={<SubHeader tabs={contentTabs} activeTab={activeTab} onTabChange={setActiveTab} />}
    >
      {renderContent()}
    </PageWrapper>
  )
}