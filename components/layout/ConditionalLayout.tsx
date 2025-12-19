"use client"

import { useAuthContext } from "@/components/providers/AuthProvider"
import { useOrganizationContext } from "@/components/providers/OrganizationProvider"
import { SideNav } from "@/components/layout/SideNav"
import { Header } from "@/components/layout/Header"
import { OrganizationSetup } from "@/components/auth/OrganizationSetup"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const { isAuthenticated, loading: authLoading, user } = useAuthContext()
  const { currentOrganization, loading: orgLoading } = useOrganizationContext()

  const loading = authLoading || orgLoading

  // console.log('ConditionalLayout state:', {
  //   isAuthenticated,
  //   authLoading,
  //   orgLoading,
  //   user: user?.email,
  //   currentOrganization: currentOrganization?.name
  // })

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // If not authenticated, show only the content (for login page)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        {children}
      </div>
    )
  }

  // If authenticated but no organization, show setup flow
  if (!currentOrganization) {
    return <OrganizationSetup />
  }

  // If authenticated with organization, show the full layout with Header and SideNav
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <SideNav />
        <main className="flex-1 overflow-auto p-2">
          {children}
        </main>
      </div>
    </div>
  )
} 