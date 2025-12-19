"use client"

import { useState } from "react"
import { useOrganizationContext } from "@/components/providers/OrganizationProvider"
import { OrganizationService } from "@/lib/services/organizationService"
import { Building2, Users, Key, Plus, ArrowRight, CheckCircle } from "lucide-react"

export function OrganizationSetup() {
  const { createOrganization } = useOrganizationContext()
  const [activeStep, setActiveStep] = useState<'choice' | 'create' | 'join'>('choice')
  const [newOrgName, setNewOrgName] = useState('')
  const [inviteToken, setInviteToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) return
    
    setLoading(true)
    setError('')
    try {
      const slug = newOrgName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      await createOrganization(newOrgName, slug)
      setMessage('Organization created successfully!')
      // The organization context will automatically update and redirect
    } catch (error: any) {
      setError(error.message || 'Failed to create organization')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinOrganization = async () => {
    if (!inviteToken.trim()) return
    
    setLoading(true)
    setError('')
    try {
      await OrganizationService.useInvitationToken(inviteToken.trim())
      setMessage('Successfully joined organization!')
      // The organization context will automatically update and redirect
    } catch (error: any) {
      setError(error.message || 'Failed to join organization')
    } finally {
      setLoading(false)
    }
  }

  const renderChoiceStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="h-8 w-8 text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Biznify!</h1>
        <p className="text-gray-600">To get started, you need to join or create an organization.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Create Organization Option */}
        <div 
          className="border-2 border-gray-200 rounded-lg p-6 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer"
          onClick={() => setActiveStep('create')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Plus className="h-6 w-6 text-purple-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Create New Organization</h3>
          <p className="text-gray-600 text-sm mb-4">
            Start fresh with your own organization. Perfect for new businesses or teams.
          </p>
          <div className="flex items-center text-sm text-gray-500">
            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            <span>You'll be the owner</span>
          </div>
        </div>

        {/* Join Organization Option */}
        <div 
          className="border-2 border-gray-200 rounded-lg p-6 hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer"
          onClick={() => setActiveStep('join')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Join Existing Organization</h3>
          <p className="text-gray-600 text-sm mb-4">
            Join an organization using an invitation token from your team.
          </p>
          <div className="flex items-center text-sm text-gray-500">
            <Key className="h-4 w-4 mr-2 text-blue-500" />
            <span>Use invitation token</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderCreateStep = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="h-8 w-8 text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Organization</h1>
        <p className="text-gray-600">Set up your new organization to get started.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name
            </label>
            <input
              type="text"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              placeholder="Enter organization name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              autoFocus
            />
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> You'll be set as the owner of this organization and can invite team members later.
            </p>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              onClick={() => setActiveStep('choice')}
              className="flex-1 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleCreateOrganization}
              disabled={loading || !newOrgName.trim()}
              className="flex-1 px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Organization'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderJoinStep = () => (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Key className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Organization</h1>
        <p className="text-gray-600">Enter the invitation token to join your team.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invitation Token
            </label>
            <input
              type="text"
              value={inviteToken}
              onChange={(e) => setInviteToken(e.target.value)}
              placeholder="Enter invitation token"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
              autoFocus
            />
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              <strong>Need a token?</strong> Ask your organization admin to generate an invitation token for you.
            </p>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              onClick={() => setActiveStep('choice')}
              className="flex-1 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleJoinOrganization}
              disabled={loading || !inviteToken.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Joining...' : 'Join Organization'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
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

        {/* Main Content */}
        {activeStep === 'choice' && renderChoiceStep()}
        {activeStep === 'create' && renderCreateStep()}
        {activeStep === 'join' && renderJoinStep()}
      </div>
    </div>
  )
} 