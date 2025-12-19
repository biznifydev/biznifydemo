"use client"

import { useAuthContext } from "@/components/providers/AuthProvider"
import { useOrganizationContext } from "@/components/providers/OrganizationProvider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
export default function HomePage() {
  const { isAuthenticated, loading: authLoading } = useAuthContext()
  const { currentOrganization, loading: orgLoading } = useOrganizationContext()
  const router = useRouter()

  const loading = authLoading || orgLoading

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (!currentOrganization) {
        router.push("/setup")
      } else {
        router.push("/")
      }
    }
  }, [isAuthenticated, currentOrganization, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return null
} 