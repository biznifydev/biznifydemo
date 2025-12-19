"use client"

import { useState } from "react"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { SubHeader } from "@/components/layout/SubHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Download, Plus } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function FinanceReportsPage() {
  const [selectedReport, setSelectedReport] = useState("pnl")
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const reports = [
    {
      id: "pnl",
      name: "Profit & Loss",
      description: "View your revenue, expenses, and profitability",
      icon: "📊"
    },
    {
      id: "balance",
      name: "Balance Sheet",
      description: "Assets, liabilities, and equity overview",
      icon: "⚖️"
    },
    {
      id: "cashflow",
      name: "Cash Flow",
      description: "Track cash inflows and outflows",
      icon: "💰"
    }
  ]

  const reportTabs = [
    { id: "pnl", label: "Profit & Loss" },
    { id: "balance", label: "Balance Sheet" },
    { id: "cashflow", label: "Cash Flow" },
  ]

  const handleUpdateValue = async (accountId: string, month: number, value: number) => {
    // TODO: Implement update functionality
    console.log('Update value:', accountId, month, value)
  }

  const handleAddAccount = (parentId?: string) => {
    // TODO: Implement add account functionality
    console.log('Add account under:', parentId)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const headerButtons = (
    <>
      <button className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-1">
        <Download className="h-3 w-3" />
        <span>Export</span>
      </button>
      <button className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors">
        + Add Account
      </button>
    </>
  )

  return (
    <ProtectedRoute>
      <PageWrapper 
      title="Financial Reports"
      headerButtons={headerButtons}
      subHeader={<SubHeader tabs={reportTabs} activeTab={selectedReport} onTabChange={setSelectedReport} />}
    >
      <div className="mt-6">
        {selectedReport === "pnl" && (
          <div className="flex items-center justify-end mb-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedYear(selectedYear - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-semibold text-lg">{selectedYear}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedYear(selectedYear + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <Card>
          <CardContent className="p-0">
            {selectedReport === "pnl" && (
              <div className="text-center py-8 text-gray-500">
                Profit & Loss report moved to Budget & Forecast page...
              </div>
            )}

            {selectedReport === "balance" && (
              <div className="text-center py-8 text-gray-500">
                Balance Sheet report coming soon...
              </div>
            )}

            {selectedReport === "cashflow" && (
              <div className="text-center py-8 text-gray-500">
                Cash Flow report coming soon...
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </PageWrapper>
    </ProtectedRoute>
  )
}