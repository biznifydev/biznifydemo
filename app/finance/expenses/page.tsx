"use client"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { SubHeader } from "@/components/layout/SubHeader"
import { useState } from "react"
import { Plus, Upload, FileText, DollarSign, CheckCircle, XCircle, Clock, Filter, Download, Eye, Edit2, Trash2, Receipt, BarChart3, Calendar, User, Building } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "rejected":
      return <XCircle className="h-4 w-4 text-red-500" />
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case "approved":
      return "Approved"
    case "rejected":
      return "Rejected"
    case "pending":
      return "Pending"
    default:
      return "Unknown"
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-50 text-green-700 border-green-200"
    case "rejected":
      return "bg-red-50 text-red-700 border-red-200"
    case "pending":
      return "bg-yellow-50 text-yellow-700 border-yellow-200"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200"
  }
}

const getCategoryColor = (category: string) => {
  const cat = expenseCategories.find(c => c.name === category)
  if (!cat) return "bg-gray-50 text-gray-700 border-gray-200"
  
  switch (cat.color) {
    case "blue":
      return "bg-blue-50 text-blue-700 border-blue-200"
    case "green":
      return "bg-green-50 text-green-700 border-green-200"
    case "purple":
      return "bg-purple-50 text-purple-700 border-purple-200"
    case "orange":
      return "bg-orange-50 text-orange-700 border-orange-200"
    case "pink":
      return "bg-pink-50 text-pink-700 border-pink-200"
    default:
      return "bg-gray-50 text-gray-700 border-gray-200"
  }
}

// Mock data
const expenseCategories = [
  { name: "Office Supplies", color: "blue", icon: Building },
  { name: "Meals & Entertainment", color: "green", icon: Calendar },
  { name: "Software & Subscriptions", color: "purple", icon: FileText },
  { name: "Travel", color: "orange", icon: User },
  { name: "Marketing", color: "pink", icon: BarChart3 },
  { name: "Equipment", color: "gray", icon: Receipt }
]

const mockExpenses = [
  {
    id: "EXP001",
    description: "Office Supplies - Staples and Paper",
    amount: 125.50,
    category: "Office Supplies",
    status: "approved",
    date: "2024-03-15",
    employee: "Sarah Johnson",
    employeeId: "EMP001",
    receipt: "receipt_001.pdf",
    receiptUrl: "/receipts/receipt_001.pdf",
    submittedDate: "2024-03-14",
    approvedBy: "Mike Chen",
    approvedDate: "2024-03-16",
    notes: "Monthly office supplies purchase",
    project: "General Operations",
    department: "Administration"
  },
  {
    id: "EXP002",
    description: "Client Lunch - TechCorp Meeting",
    amount: 85.00,
    category: "Meals & Entertainment",
    status: "pending",
    date: "2024-03-18",
    employee: "Mike Chen",
    employeeId: "EMP002",
    receipt: "receipt_002.pdf",
    receiptUrl: "/receipts/receipt_002.pdf",
    submittedDate: "2024-03-17",
    approvedBy: null,
    approvedDate: null,
    notes: "Business lunch with potential client",
    project: "Sales & Marketing",
    department: "Sales"
  },
  {
    id: "EXP003",
    description: "Adobe Creative Suite Subscription",
    amount: 299.00,
    category: "Software & Subscriptions",
    status: "approved",
    date: "2024-03-20",
    employee: "Emma Wilson",
    employeeId: "EMP003",
    receipt: "receipt_003.pdf",
    receiptUrl: "/receipts/receipt_003.pdf",
    submittedDate: "2024-03-19",
    approvedBy: "Sarah Johnson",
    approvedDate: "2024-03-21",
    notes: "Annual subscription for design team",
    project: "Product Development",
    department: "Design"
  },
  {
    id: "EXP004",
    description: "Flight to San Francisco Conference",
    amount: 450.00,
    category: "Travel",
    status: "rejected",
    date: "2024-03-22",
    employee: "Alex Thompson",
    employeeId: "EMP004",
    receipt: "receipt_004.pdf",
    receiptUrl: "/receipts/receipt_004.pdf",
    submittedDate: "2024-03-21",
    approvedBy: "Mike Chen",
    approvedDate: "2024-03-23",
    notes: "Conference travel - budget exceeded",
    project: "Professional Development",
    department: "Engineering"
  },
  {
    id: "EXP005",
    description: "Marketing Materials - Business Cards",
    amount: 75.00,
    category: "Marketing",
    status: "approved",
    date: "2024-03-25",
    employee: "David Kim",
    employeeId: "EMP005",
    receipt: "receipt_005.pdf",
    receiptUrl: "/receipts/receipt_005.pdf",
    submittedDate: "2024-03-24",
    approvedBy: "Emma Wilson",
    approvedDate: "2024-03-26",
    notes: "New business cards for sales team",
    project: "Sales & Marketing",
    department: "Marketing"
  },
  {
    id: "EXP006",
    description: "Coffee and Snacks for Team Meeting",
    amount: 45.00,
    category: "Meals & Entertainment",
    status: "pending",
    date: "2024-03-28",
    employee: "Sarah Johnson",
    employeeId: "EMP001",
    receipt: "receipt_006.pdf",
    receiptUrl: "/receipts/receipt_006.pdf",
    submittedDate: "2024-03-27",
    approvedBy: null,
    approvedDate: null,
    notes: "Team building refreshments",
    project: "General Operations",
    department: "Administration"
  }
]

const mockReports = [
  {
    id: "RPT001",
    name: "Monthly Expense Summary",
    type: "summary",
    period: "March 2024",
    totalAmount: 1079.50,
    totalExpenses: 6,
    status: "generated",
    generatedDate: "2024-03-31"
  },
  {
    id: "RPT002",
    name: "Department Expense Analysis",
    type: "department",
    period: "Q1 2024",
    totalAmount: 3245.75,
    totalExpenses: 18,
    status: "generated",
    generatedDate: "2024-03-31"
  },
  {
    id: "RPT003",
    name: "Travel Expense Report",
    type: "category",
    period: "March 2024",
    totalAmount: 450.00,
    totalExpenses: 1,
    status: "pending",
    generatedDate: null
  }
]

export default function FinanceExpensesPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<any>(null)
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"individual" | "categories">("individual")
  
  const expenseTabs = [
    { id: "overview", label: "Overview" },
    { id: "expenses", label: "Expenses" },
    { id: "approvals", label: "Approvals" },
    { id: "reports", label: "Reports" },
  ]

  const headerButtons = (
    <>
      <button 
        onClick={() => setShowExpenseModal(true)}
        className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-1"
      >
        <Plus className="h-3 w-3" />
        <span>New Expense</span>
      </button>
      <button className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors">
        Export Report
      </button>
    </>
  )

  const getFilteredExpenses = () => {
    if (selectedFilter === "all") return mockExpenses
    return mockExpenses.filter(expense => expense.status === selectedFilter)
  }

  const getPendingApprovals = () => {
    return mockExpenses.filter(expense => expense.status === "pending")
  }

  const getTotalAmount = (expenses: any[]) => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0)
  }

  const handleExpenseSubmit = (data: any) => {
    console.log("Expense submitted:", data)
    // Here you would typically send the data to your backend
  }

  const handleApproval = (expenseId: string, notes: string) => {
    console.log("Expense approved:", expenseId, notes)
    // Here you would typically update the expense status in your backend
  }

  const handleRejection = (expenseId: string, notes: string) => {
    console.log("Expense rejected:", expenseId, notes)
    // Here you would typically update the expense status in your backend
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-4">
            {/* Expense Summary Cards */}
            <div className="grid grid-cols-4 gap-6">
              <div className="flex items-center space-x-3">
                <DollarSign className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(getTotalAmount(mockExpenses))}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending Approval</p>
                  <p className="text-lg font-semibold text-yellow-600">{getPendingApprovals().length}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Approved This Month</p>
                  <p className="text-lg font-semibold text-green-600">{mockExpenses.filter(e => e.status === "approved").length}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Average per Expense</p>
                  <p className="text-lg font-semibold text-purple-600">{formatCurrency(getTotalAmount(mockExpenses) / mockExpenses.length)}</p>
                </div>
              </div>
            </div>
            
            {/* Recent Expenses Table */}
            <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  {/* Table Header with Toggle */}
                  <thead>
                                         <tr className="bg-white border-b border-gray-200">
                       <td colSpan={7} className="p-0">
                        <div className="flex items-center justify-between p-2">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setViewMode("individual")}
                              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                                viewMode === "individual"
                                  ? "bg-gray-200 text-gray-900"
                                  : "text-gray-700 hover:text-gray-900"
                              }`}
                            >
                              Individual Expenses
                            </button>
                            <button
                              onClick={() => setViewMode("categories")}
                              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                                viewMode === "categories"
                                  ? "bg-gray-200 text-gray-900"
                                  : "text-gray-700 hover:text-gray-900"
                              }`}
                            >
                              Categories
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Table Headers */}
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left p-3 text-sm font-medium text-gray-700 border-r border-gray-200">
                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700 border-r border-gray-200">Description</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700 border-r border-gray-200">Category</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700 border-r border-gray-200">Employee</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700 border-r border-gray-200">Amount</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700 border-r border-gray-200">Status</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                                         {viewMode === "individual" ? (
                       // Individual Expenses View
                       mockExpenses.slice(0, 5).map((expense) => (
                         <tr key={expense.id} className="border-b border-gray-200 hover:bg-gray-50">
                           <td className="p-3 border-r border-gray-200">
                             <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                           </td>
                           <td className="p-3 border-r border-gray-200">
                             <div>
                               <div className="font-medium text-gray-900 text-xs">{expense.description}</div>
                             </div>
                           </td>
                           <td className={`p-3 border-r border-gray-200 ${getCategoryColor(expense.category)}`}>
                             <span className="text-xs font-medium text-gray-900">{expense.category}</span>
                           </td>
                           <td className="p-3 border-r border-gray-200">
                             <div className="flex items-center space-x-2">
                               <User className="h-4 w-4 text-gray-400" />
                               <span className="text-xs text-gray-700">{expense.employee}</span>
                             </div>
                           </td>
                           <td className="p-3 border-r border-gray-200">
                             <span className="text-xs font-medium text-gray-900">{formatCurrency(expense.amount)}</span>
                           </td>
                           <td className={`p-3 border-r border-gray-200 ${getStatusColor(expense.status)}`}>
                             <div className="flex items-center space-x-2">
                               {getStatusIcon(expense.status)}
                               <span className="text-xs font-medium text-gray-900">
                                 {getStatusText(expense.status)}
                               </span>
                             </div>
                           </td>
                           <td className="p-3">
                             <span className="text-xs text-gray-500">{expense.date}</span>
                           </td>
                         </tr>
                       ))
                                         ) : (
                       // Categories View
                       expenseCategories.map((category) => {
                         const Icon = category.icon
                         const categoryExpenses = mockExpenses.filter(e => e.category === category.name)
                         const totalAmount = getTotalAmount(categoryExpenses)
                         
                         return (
                           <tr key={category.name} className="border-b border-gray-200 hover:bg-gray-50">
                             <td className="p-3 border-r border-gray-200">
                               <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                             </td>
                             <td className="p-3 border-r border-gray-200">
                               <div className="flex items-center space-x-2">
                                 <Icon className="h-4 w-4 text-gray-500" />
                                 <span className="font-medium text-gray-900 text-xs">{category.name}</span>
                               </div>
                             </td>
                             <td className={`p-3 border-r border-gray-200 ${getCategoryColor(category.name)}`}>
                               <span className="text-xs font-medium text-gray-900">{categoryExpenses.length} expenses</span>
                             </td>
                             <td className="p-3 border-r border-gray-200">
                               <span className="text-xs text-gray-500">-</span>
                             </td>
                             <td className="p-3 border-r border-gray-200">
                               <span className="text-xs font-medium text-gray-900">{formatCurrency(totalAmount)}</span>
                             </td>
                             <td className="p-3 border-r border-gray-200">
                               <span className="text-xs text-gray-500">-</span>
                             </td>
                             <td className="p-3">
                               <span className="text-xs text-gray-500">-</span>
                             </td>
                           </tr>
                         )
                       })
                     )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      case "expenses":
        return (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex items-center space-x-3 overflow-x-auto pb-2">
              {["all", "pending", "approved", "rejected"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                    selectedFilter === filter
                      ? "bg-purple-50 border-purple-200"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {filter === "all" && <DollarSign className="h-4 w-4 text-purple-600" />}
                  {filter === "pending" && <Clock className="h-4 w-4 text-yellow-600" />}
                  {filter === "approved" && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {filter === "rejected" && <XCircle className="h-4 w-4 text-red-600" />}
                  <span className={`text-sm font-medium ${
                    selectedFilter === filter ? "text-purple-800" : "text-gray-800"
                  }`}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Expenses Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Expense</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Receipt</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getFilteredExpenses().map((expense) => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{expense.description}</div>
                            <div className="text-xs text-gray-500">ID: {expense.id}</div>
                            <div className="text-xs text-gray-400">{expense.project}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm text-gray-900">{expense.employee}</div>
                            <div className="text-xs text-gray-500">{expense.department}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(expense.category)}`}>
                            {expense.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(expense.amount)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(expense.status)}`}>
                            {getStatusIcon(expense.status)}
                            <span className="ml-1">{getStatusText(expense.status)}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm text-gray-900">{expense.date}</div>
                            <div className="text-xs text-gray-500">Submitted: {expense.submittedDate}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1">
                            <Receipt className="h-3 w-3" />
                            <span>View</span>
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-1">
                            <button className="text-gray-400 hover:text-blue-600 p-1">
                              <Eye className="h-3 w-3" />
                            </button>
                            <button className="text-gray-400 hover:text-green-600 p-1">
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button className="text-gray-400 hover:text-red-600 p-1">
                              <Trash2 className="h-3 w-3" />
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
      case "approvals":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Pending Approvals</h2>
              </div>
              <div className="p-4">
                <div className="space-y-4">
                  {getPendingApprovals().map((expense) => (
                    <div key={expense.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Receipt className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{expense.description}</h3>
                            <p className="text-sm text-gray-500">{expense.employee} • {expense.category}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(expense.status)}`}>
                          {getStatusIcon(expense.status)}
                          <span className="ml-1">{getStatusText(expense.status)}</span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Amount</p>
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(expense.amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Date</p>
                          <p className="text-sm font-medium text-gray-900">{expense.date}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 mb-1">Notes</p>
                        <p className="text-sm text-gray-900">{expense.notes}</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedExpense(expense)
                            setShowApprovalModal(true)
                          }}
                          className="flex-1 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-md transition-colors border border-green-200"
                        >
                          Approve
                        </button>
                        <button className="flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors border border-red-200">
                          Reject
                        </button>
                        <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md transition-colors border border-gray-200">
                          View Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
      case "reports":
        return (
          <div className="space-y-6">
            {/* Report Generation */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Generate Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
                  <BarChart3 className="h-8 w-8 text-blue-500 mb-2" />
                  <h4 className="font-medium text-gray-900">Monthly Summary</h4>
                  <p className="text-sm text-gray-500">Generate monthly expense summary report</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left">
                  <Building className="h-8 w-8 text-green-500 mb-2" />
                  <h4 className="font-medium text-gray-900">Department Analysis</h4>
                  <p className="text-sm text-gray-500">Break down expenses by department</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left">
                  <Receipt className="h-8 w-8 text-purple-500 mb-2" />
                  <h4 className="font-medium text-gray-900">Category Report</h4>
                  <p className="text-sm text-gray-500">Analyze expenses by category</p>
                </button>
              </div>
            </div>

            {/* Existing Reports */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800">Generated Reports</h2>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {mockReports.map((report) => (
                    <div key={report.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm">{report.name}</h3>
                          <p className="text-xs text-gray-500">{report.period} • {report.totalExpenses} expenses</p>
                          <p className="text-xs text-gray-400">Total: {formatCurrency(report.totalAmount)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                          report.status === "generated" 
                            ? "bg-green-50 text-green-700 border-green-200" 
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}>
                          {report.status === "generated" ? "Ready" : "Processing"}
                        </span>
                        <button className="text-blue-600 hover:text-blue-800 text-sm">
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
      title="Expenses" 
      headerButtons={headerButtons}
      subHeader={<SubHeader tabs={expenseTabs} activeTab={activeTab} onTabChange={setActiveTab} />}
    >
      {renderContent()}
      
      {/* New Expense Modal */}
      {showExpenseModal && (
        <ExpenseModal 
          onClose={() => setShowExpenseModal(false)}
          onSubmit={handleExpenseSubmit}
        />
      )}
      
      {/* Approval Modal */}
      {showApprovalModal && selectedExpense && (
        <ApprovalModal 
          expense={selectedExpense}
          onClose={() => {
            setShowApprovalModal(false)
            setSelectedExpense(null)
          }}
          onApprove={handleApproval}
          onReject={handleRejection}
        />
      )}
      </PageWrapper>
    </ProtectedRoute>
  )
}

// Expense Modal Component
function ExpenseModal({ onClose, onSubmit }: { onClose: () => void, onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    date: "",
    project: "",
    notes: "",
    receipt: null as File | null
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, receipt: e.target.files[0] })
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">New Expense</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select category</option>
              {expenseCategories.map((category) => (
                <option key={category.name} value={category.name}>{category.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <input
              type="text"
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt</label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf"
                className="hidden"
                id="receipt-upload"
              />
              <label htmlFor="receipt-upload" className="cursor-pointer text-blue-600 hover:text-blue-800">
                {formData.receipt ? formData.receipt.name : "Upload receipt"}
              </label>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Submit Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Approval Modal Component
function ApprovalModal({ 
  expense, 
  onClose, 
  onApprove, 
  onReject 
}: { 
  expense: any, 
  onClose: () => void, 
  onApprove: (id: string, notes: string) => void, 
  onReject: (id: string, notes: string) => void 
}) {
  const [notes, setNotes] = useState("")
  const [action, setAction] = useState<"approve" | "reject" | null>(null)

  const handleSubmit = () => {
    if (action === "approve") {
      onApprove(expense.id, notes)
    } else if (action === "reject") {
      onReject(expense.id, notes)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Review Expense</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900">{expense.description}</h3>
            <p className="text-sm text-gray-500">{expense.employee} • {expense.category}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Amount</p>
              <p className="text-sm font-medium text-gray-900">{formatCurrency(expense.amount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="text-sm font-medium text-gray-900">{expense.date}</p>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-1">Notes</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add approval/rejection notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setAction("reject")}
              className="flex-1 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors border border-red-200"
            >
              Reject
            </button>
            <button
              onClick={() => setAction("approve")}
              className="flex-1 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 rounded-md transition-colors border border-green-200"
            >
              Approve
            </button>
          </div>
          
          {action && (
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                  action === "approve" 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Confirm {action === "approve" ? "Approval" : "Rejection"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}