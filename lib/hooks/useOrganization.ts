import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Organization, OrganizationMember, UserProfile } from '@/lib/types/organization'
import { useAuthContext } from '@/components/providers/AuthProvider'

export function useOrganization() {
  const { user } = useAuthContext()
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [organizationMembers, setOrganizationMembers] = useState<OrganizationMember[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Get user's profile
  const getUserProfile = async () => {
    if (!user) return null
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  }

  // Get user's organizations
  const getUserOrganizations = async () => {
    if (!user) {
      // console.log('No user, returning empty organizations array')
      return []
    }

    // console.log('Fetching organizations for user ID:', user.id)
    
    // First get the organization members
    const { data: members, error: membersError } = await supabase
      .from('organization_members')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('joined_at', { ascending: true }) // Consistent ordering by join date

    if (membersError) {
      console.error('Error fetching organization members:', membersError)
      return []
    }

    // console.log('Raw organization members data:', members)

    // Then get the organizations
    if (members && members.length > 0) {
      const orgIds = members.map(member => member.organization_id)
      const { data: organizations, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .in('id', orgIds)
        .order('created_at', { ascending: true }) // Consistent ordering by creation date

      if (orgsError) {
        console.error('Error fetching organizations:', orgsError)
        return []
      }

      // console.log('Processed organizations:', organizations)
      return organizations || []
    }

    return []
  }

  // Get organization members
  const getOrganizationMembers = async (organizationId: string) => {
    // First get the organization members
    const { data: members, error: membersError } = await supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'active')

    if (membersError) {
      console.error('Error fetching organization members:', membersError)
      return []
    }

    // Then get the user profiles for each member
    if (members && members.length > 0) {
      const userIds = members.map(member => member.user_id)
      
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .in('id', userIds)

      if (profilesError) {
        console.error('Error fetching user profiles:', profilesError)
        return members
      }

      // Combine the data
      return members.map(member => ({
        ...member,
        user: profiles?.find(profile => profile.id === member.user_id) || null
      }))
    }

    return members || []
  }

  // Create new organization
  const createOrganization = async (name: string, slug: string) => {
    if (!user) throw new Error('User not authenticated')

    // Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name,
        slug,
        plan_type: 'free'
      })
      .select()
      .single()

    if (orgError) throw orgError

    // Add user as owner
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role: 'owner',
        status: 'active',
        joined_at: new Date().toISOString()
      })

    if (memberError) throw memberError

    return org
  }

  // Switch to organization
  const switchToOrganization = async (organizationId: string) => {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    if (error) throw error

    setCurrentOrganization(data)
    
    // Fetch members for this organization
    const members = await getOrganizationMembers(organizationId)
    setOrganizationMembers(members)

    return data
  }

  // Get current user's role in the current organization
  const getCurrentUserRole = async (organizationId: string) => {
    if (!user) return null
    
    const { data, error } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (error) {
      console.error('Error fetching current user role:', error)
      return null
    }

    return data?.role || null
  }

  // Check if user has permission to manage members
  const canManageMembers = (role: string | null) => {
    return role === 'owner' || role === 'admin'
  }

  // Check if user can remove members (admins can remove members, owners can remove anyone except themselves)
  const canRemoveMember = (userRole: string | null, targetRole: string, targetUserId: string) => {
    if (!userRole) return false
    if (userRole === 'owner') return targetUserId !== user?.id // Owners can remove anyone except themselves
    if (userRole === 'admin') return targetRole === 'member' || targetRole === 'viewer' // Admins can only remove members/viewers
    return false
  }

  // Initialize organization context
  useEffect(() => {
    const initializeOrganization = async () => {
      if (!user) {
        // console.log('No user, setting loading to false')
        setLoading(false)
        return
      }

      // console.log('Initializing organization for user:', user.email)
      setLoading(true)

      try {
        // Get user profile
        // console.log('Fetching user profile...')
        const profile = await getUserProfile()
        setUserProfile(profile)
        // console.log('User profile:', profile)

        // Get user's organizations
        // console.log('Fetching user organizations...')
        const organizations = await getUserOrganizations()
        // console.log('User organizations:', organizations)
        
        if (organizations.length > 0) {
          // Set first organization as current
          // console.log('Setting current organization:', organizations[0])
          await switchToOrganization(organizations[0].id)
        } else {
          // console.log('No organizations found for user')
        }
      } catch (error) {
        console.error('Error initializing organization:', error)
      } finally {
        // console.log('Setting loading to false')
        setLoading(false)
      }
    }

    initializeOrganization()
  }, [user])

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (!user) return null
    
    const profile = await getUserProfile()
    setUserProfile(profile)
    return profile
  }

  return {
    currentOrganization,
    organizationMembers,
    userProfile,
    loading,
    createOrganization,
    switchToOrganization,
    getUserOrganizations,
    getOrganizationMembers,
    refreshUserProfile,
    getCurrentUserRole,
    canManageMembers,
    canRemoveMember
  }
} 