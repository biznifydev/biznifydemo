import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { APP_NAME } from "@/lib/constants"
import { Users, UserCheck, UserX, UserPlus } from "lucide-react"
import { designUtils, layout, colors } from "@/lib/design-system"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { SubHeader } from "@/components/layout/SubHeader"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function DashboardPage() {
  const dashboardTabs = [
    { id: "overview", label: "Overview" },
    { id: "analytics", label: "Analytics" },
    { id: "reports", label: "Reports" },
  ]

  const headerButtons = (
    <>
      <button className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-1">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Export CSV</span>
      </button>
      <button className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors">
        + Add New
      </button>
    </>
  )

  return (
    <ProtectedRoute>
      <PageWrapper 
        title="Dashboard" 
        headerButtons={headerButtons}
        subHeader={<SubHeader tabs={dashboardTabs} />}
      >
        <div className="space-y-4">
          
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-3">
                <div className="text-xs text-gray-600 mb-1">Total employees</div>
                <div className="text-xl font-bold text-gray-800 mb-1">1,384</div>
              </div>
              <div className="border-t border-gray-200 p-2 bg-gray-50">
                <div className="flex items-center space-x-1">
                  <svg className="h-3 w-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span className="text-xs text-green-600 font-medium">+47</span>
                  <span className="text-xs text-gray-500">from last period</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-3">
                <div className="text-xs text-gray-600 mb-1">Active employees</div>
                <div className="text-xl font-bold text-gray-800 mb-1">1,245</div>
              </div>
              <div className="border-t border-gray-200 p-2 bg-gray-50">
                <div className="flex items-center space-x-1">
                  <svg className="h-3 w-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span className="text-xs text-green-600 font-medium">+23</span>
                  <span className="text-xs text-gray-500">from last period</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-3">
                <div className="text-xs text-gray-600 mb-1">Inactive employees</div>
                <div className="text-xl font-bold text-gray-800 mb-1">89</div>
              </div>
              <div className="border-t border-gray-200 p-2 bg-gray-50">
                <div className="flex items-center space-x-1">
                  <svg className="h-3 w-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span className="text-xs text-red-600 font-medium">-12</span>
                  <span className="text-xs text-gray-500">from last period</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-3">
                <div className="text-xs text-gray-600 mb-1">Onboarding</div>
                <div className="text-xl font-bold text-gray-800 mb-1">50</div>
              </div>
              <div className="border-t border-gray-200 p-2 bg-gray-50">
                <div className="flex items-center space-x-1">
                  <svg className="h-3 w-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span className="text-xs text-green-600 font-medium">+8</span>
                  <span className="text-xs text-gray-500">from last period</span>
                </div>
              </div>
            </div>
          </div>
          
          <Card className="bg-white rounded-lg border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-gray-600">
                No recent activity to display.
              </p>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    </ProtectedRoute>
  )
} 