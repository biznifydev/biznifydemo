"use client"

import { createContext, useContext, ReactNode } from "react"
import { useOrganization } from "@/lib/hooks/useOrganization"
import { Organization, OrganizationMember, UserProfile } from "@/lib/types/organization"

interface OrganizationContextType {
  currentOrganization: Organization | null
  organizationMembers: OrganizationMember[]
  userProfile: UserProfile | null
  loading: boolean
  createOrganization: (name: string, slug: string) => Promise<Organization>
  switchToOrganization: (organizationId: string) => Promise<Organization>
  getUserOrganizations: () => Promise<Organization[]>
  getOrganizationMembers: (organizationId: string) => Promise<OrganizationMember[]>
  refreshUserProfile: () => Promise<UserProfile | null>
  getCurrentUserRole: (organizationId: string) => Promise<string | null>
  canManageMembers: (role: string | null) => boolean
  canRemoveMember: (userRole: string | null, targetRole: string, targetUserId: string) => boolean
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const organization = useOrganization()

  return (
    <OrganizationContext.Provider value={organization}>
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error("useOrganizationContext must be used within an OrganizationProvider")
  }
  return context
} 