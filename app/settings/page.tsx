"use client"

import { useState, useEffect } from "react"
import { useOrganizationContext } from "@/components/providers/OrganizationProvider"
import { supabase } from "@/lib/supabase"
import { PageWrapper } from "@/components/layout/PageWrapper"
import { SubHeader } from "@/components/layout/SubHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Save, X, User, Building2, Mail, Plus, Trash2, Key } from "lucide-react"
import { OrganizationService } from "@/lib/services/organizationService"

export default function SettingsPage() {
  const { userProfile, refreshUserProfile, currentOrganization, getOrganizationMembers, getCurrentUserRole, canManageMembers, canRemoveMember } = useOrganizationContext()
  const [activeTab, setActiveTab] = useState("account")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [organizationMembers, setOrganizationMembers] = useState<any[]>([])
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("member")
  const [inviting, setInviting] = useState(false)
  const [inviteToken, setInviteToken] = useState("")
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false)
  const [generatingToken, setGeneratingToken] = useState(false)
  const [joinToken, setJoinToken] = useState("")
  const [isJoinTokenModalOpen, setIsJoinTokenModalOpen] = useState(false)
  const [joiningWithToken, setJoiningWithToken] = useState(false)
  const [removingMember, setRemovingMember] = useState<string | null>(null)

  // Auto-dismiss success message
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage("")
      }, 3000) // 3 seconds

      return () => clearTimeout(timer)
    }
  }, [message])

  const settingsTabs = [
    { id: "account", label: "Account Details" },
    { id: "organizations", label: "My Organizations" },
  ]

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.first_name || "")
      setLastName(userProfile.last_name || "")
    }
  }, [userProfile])

  useEffect(() => {
    if (activeTab === "organizations" && currentOrganization) {
      loadOrganizationMembers()
    }
  }, [activeTab, currentOrganization])

  const loadOrganizationMembers = async () => {
    try {
      const members = await getOrganizationMembers(currentOrganization!.id)
      setOrganizationMembers(members)
      
      // Get current user's role
      const role = await getCurrentUserRole(currentOrganization!.id)
      setCurrentUserRole(role)
    } catch (error) {
      console.error('Error loading organization members:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    setError("")

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile?.id)

      if (error) throw error

      await refreshUserProfile()
      setMessage("Profile updated successfully!")
      setIsEditing(false)
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (userProfile) {
      setFirstName(userProfile.first_name || "")
      setLastName(userProfile.last_name || "")
    }
    setIsEditing(false)
    setMessage("")
    setError("")
  }

  const handleInviteMember = async () => {
    if (!inviteEmail.trim() || !currentOrganization) return
    
    setInviting(true)
    try {
      await OrganizationService.createInvitation(currentOrganization.id, inviteEmail.trim(), inviteRole as any)
      setMessage("Invitation sent successfully!")
      setIsInviteModalOpen(false)
      setInviteEmail("")
      setInviteRole("member")
      await loadOrganizationMembers()
    } catch (error: any) {
      setError(error.message || "Failed to send invitation")
    } finally {
      setInviting(false)
    }
  }

  const generateInviteToken = async () => {
    if (!currentOrganization) return
    
    setGeneratingToken(true)
    try {
      // Generate a unique token
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      
      // Store the token in the database (you'll need to create this table)
      const { error } = await supabase
        .from('organization_invitation_tokens')
        .insert({
          organization_id: currentOrganization.id,
          token: token,
          created_by: userProfile?.id,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          role: 'member'
        })

      if (error) throw error

      setInviteToken(token)
      setIsTokenModalOpen(true)
      setMessage("Invitation token generated successfully!")
    } catch (error: any) {
      setError(error.message || "Failed to generate invitation token")
    } finally {
      setGeneratingToken(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setMessage("Token copied to clipboard!")
    } catch (error) {
      setError("Failed to copy to clipboard")
    }
  }

  const handleJoinWithToken = async () => {
    if (!joinToken.trim()) return
    
    setJoiningWithToken(true)
    try {
      await OrganizationService.useInvitationToken(joinToken.trim())
      setMessage("Successfully joined organization!")
      setIsJoinTokenModalOpen(false)
      setJoinToken("")
      await loadOrganizationMembers()
    } catch (error: any) {
      setError(error.message || "Failed to join organization")
    } finally {
      setJoiningWithToken(false)
    }
  }

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!currentOrganization || !currentUserRole) return
    
    if (!confirm(`Are you sure you want to remove ${userName} from the organization?`)) {
      return
    }
    
    setRemovingMember(userId)
    setError("")
    
    try {
      await OrganizationService.removeMember(currentOrganization.id, userId)
      setMessage(`${userName} has been removed from the organization`)
      await loadOrganizationMembers() // Refresh the members list
    } catch (err: any) {
      setError(err.message || "Failed to remove member")
    } finally {
      setRemovingMember(null)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-red-100 text-red-800'
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'member': return 'bg-blue-100 text-blue-800'
      case 'viewer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderAccountDetails = () => (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* User Information Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {userProfile?.first_name?.charAt(0) || userProfile?.last_name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {userProfile?.first_name && userProfile?.last_name 
                  ? `${userProfile.first_name} ${userProfile.last_name}`
                  : 'User'
                }
              </h3>
              <p className="text-sm text-gray-500">{userProfile?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Settings Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Profile Settings</h2>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">First Name</span>
              <div className="w-48">
                {isEditing ? (
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400"
                    placeholder="Enter first name"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-800">{firstName || 'Not set'}</span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Name</span>
              <div className="w-48">
                {isEditing ? (
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400"
                    placeholder="Enter last name"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-800">{lastName || 'Not set'}</span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email Address</span>
              <div className="w-48">
                <span className="text-sm font-medium text-gray-800">{userProfile?.email}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Role</span>
              <div className="w-48">
                <span className="text-sm font-medium text-gray-800">{userProfile?.role || 'user'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Preferences</h2>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email Notifications</span>
              <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-green-500">
                <span className="inline-block h-3 w-3 transform rounded-full bg-white transition translate-x-5"></span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Push Notifications</span>
              <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-gray-200">
                <span className="inline-block h-3 w-3 transform rounded-full bg-white transition translate-x-1"></span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Two-Factor Authentication</span>
              <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-gray-200">
                <span className="inline-block h-3 w-3 transform rounded-full bg-white transition translate-x-1"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderOrganizations = () => (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Current Organization Details */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Current Organization</h2>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-teal-500 rounded flex items-center justify-center">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{currentOrganization?.name}</h3>
                <p className="text-sm text-gray-500">{organizationMembers.length} members</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Plan</p>
              <p className="text-sm font-medium text-gray-800">{currentOrganization?.plan_type || 'Free'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Members</h2>
          {canManageMembers(currentUserRole) && (
            <div className="flex items-center space-x-2">
              <button
                onClick={generateInviteToken}
                disabled={generatingToken}
                className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <span>{generatingToken ? 'Generating...' : 'Generate Token'}</span>
              </button>
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-md hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span>Invite Member</span>
              </button>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {organizationMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      {member.user?.first_name?.charAt(0) || member.user?.email?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {member.user?.first_name && member.user?.last_name 
                        ? `${member.user.first_name} ${member.user.last_name}`
                        : member.user?.email || 'Unknown User'
                      }
                    </p>
                    <p className="text-xs text-gray-500">{member.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.role)}`}>
                    {member.role}
                  </span>
                  <span className="text-xs text-gray-500">
                    {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : 'Recently'}
                  </span>
                  {canRemoveMember(currentUserRole, member.role, member.user_id) && (
                    <button
                      onClick={() => handleRemoveMember(
                        member.user_id, 
                        member.user?.first_name && member.user?.last_name 
                          ? `${member.user.first_name} ${member.user.last_name}`
                          : member.user?.email || 'Unknown User'
                      )}
                      disabled={removingMember === member.user_id}
                      className="ml-2 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Remove member"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Join with Token Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Join Another Organization</h2>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Have an invitation token? Use it to join another organization.
            </p>
            <button
              onClick={() => setIsJoinTokenModalOpen(true)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <Key className="h-3 w-3" />
              <span>Join with Token</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <PageWrapper
      title="Settings"
      subHeader={
        <SubHeader
          tabs={settingsTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      }
      headerButtons={
        activeTab === "account" && !isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-900 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit</span>
          </button>
        ) : activeTab === "account" && isEditing ? (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? "Saving..." : "Save"}</span>
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          </div>
        ) : null
      }
    >
      {activeTab === "account" && renderAccountDetails()}
      {activeTab === "organizations" && renderOrganizations()}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Invite Member</h2>
              <button 
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                    {currentUserRole === 'owner' && (
                      <option value="admin">Admin</option>
                    )}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteMember}
                disabled={inviting || !inviteEmail.trim()}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {inviting ? 'Sending...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invitation Token Modal */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Invitation Token</h2>
              <button 
                onClick={() => setIsTokenModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Share this token with existing users
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={inviteToken}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50 font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(inviteToken)}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    <strong>How to use:</strong> Share this token with users who already have accounts. 
                    They can use it to join your organization from their settings page.
                  </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This token expires in 7 days and can only be used once.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsTokenModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join with Token Modal */}
      {isJoinTokenModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Join Organization</h2>
              <button 
                onClick={() => setIsJoinTokenModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invitation Token
                  </label>
                  <input
                    type="text"
                    value={joinToken}
                    onChange={(e) => setJoinToken(e.target.value)}
                    placeholder="Enter invitation token"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                    autoFocus
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <p className="text-sm text-blue-800">
                    <strong>How to get a token:</strong> Ask an organization admin to generate an invitation token for you.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setIsJoinTokenModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinWithToken}
                disabled={joiningWithToken || !joinToken.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {joiningWithToken ? 'Joining...' : 'Join Organization'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
      {message && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg border border-green-200 p-4 shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm text-green-700">{message}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg border border-red-200 p-4 shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
    </PageWrapper>
  )
}