import { supabase } from '@/lib/supabase'

export interface OrganizationInvitation {
  id: string
  organization_id: string
  email: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  invitation_code: string
  invited_by: string
  status: 'pending' | 'accepted' | 'expired' | 'cancelled'
  expires_at: string
  accepted_at?: string
  created_at: string
  updated_at: string
}

export class OrganizationService {
  // Create an invitation for an organization
  static async createInvitation(organizationId: string, email: string, role: 'owner' | 'admin' | 'member' | 'viewer' = 'member'): Promise<string> {
    const { data, error } = await supabase.rpc('create_organization_invitation', {
      p_organization_id: organizationId,
      p_email: email,
      p_role: role
    })

    if (error) {
      console.error('Error creating invitation:', error)
      throw new Error(error.message)
    }

    return data
  }

  // Accept an invitation using invitation code
  static async acceptInvitation(invitationCode: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('accept_organization_invitation', {
      p_invitation_code: invitationCode
    })

    if (error) {
      console.error('Error accepting invitation:', error)
      throw new Error(error.message)
    }

    return data
  }

  // Get invitations for an organization
  static async getOrganizationInvitations(organizationId: string): Promise<OrganizationInvitation[]> {
    const { data, error } = await supabase
      .from('organization_invitations')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invitations:', error)
      throw new Error(error.message)
    }

    return data || []
  }

  // Get pending invitations for a user's email
  static async getPendingInvitations(email: string): Promise<OrganizationInvitation[]> {
    const { data, error } = await supabase
      .from('organization_invitations')
      .select(`
        *,
        organizations (
          id,
          name,
          slug
        )
      `)
      .eq('email', email)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending invitations:', error)
      throw new Error(error.message)
    }

    return data || []
  }

  // Cancel an invitation
  static async cancelInvitation(invitationId: string): Promise<void> {
    const { error } = await supabase
      .from('organization_invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitationId)

    if (error) {
      console.error('Error cancelling invitation:', error)
      throw new Error(error.message)
    }
  }

  // Get member count for an organization
  static async getMemberCount(organizationId: string): Promise<number> {
    const { data, error } = await supabase.rpc('get_organization_member_count', {
      p_organization_id: organizationId
    })

    if (error) {
      console.error('Error getting member count:', error)
      throw new Error(error.message)
    }

    return data || 0
  }

  // Create invitation token for existing users
  static async createInvitationToken(organizationId: string, role: 'owner' | 'admin' | 'member' | 'viewer' = 'member'): Promise<string> {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    const { error } = await supabase
      .from('organization_invitation_tokens')
      .insert({
        organization_id: organizationId,
        token: token,
        role: role,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })

    if (error) {
      console.error('Error creating invitation token:', error)
      throw new Error(error.message)
    }

    return token
  }

  // Use invitation token
  static async useInvitationToken(token: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('use_invitation_token', {
      p_token: token
    })

    if (error) {
      console.error('Error using invitation token:', error)
      throw new Error(error.message)
    }

    return data
  }

  // Get organization with member count
  static async getOrganizationWithMemberCount(organizationId: string) {
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    if (orgError) {
      console.error('Error fetching organization:', orgError)
      throw new Error(orgError.message)
    }

    const memberCount = await this.getMemberCount(organizationId)

    return {
      ...org,
      member_count: memberCount
    }
  }

  // Remove a member from an organization
  static async removeMember(organizationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', organizationId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error removing member:', error)
      throw new Error(error.message)
    }
  }
} 