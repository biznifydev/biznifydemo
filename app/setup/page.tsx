"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useOrganizationContext } from "@/components/providers/OrganizationProvider"

export default function SetupPage() {
  const [organizationName, setOrganizationName] = useState("")
  const [organizationSlug, setOrganizationSlug] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { createOrganization } = useOrganizationContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await createOrganization(organizationName, organizationSlug)
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Failed to create organization")
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNameChange = (name: string) => {
    setOrganizationName(name)
    setOrganizationSlug(generateSlug(name))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <img src="/images/image.png" alt="Biznify Logo" className="w-12 h-12" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Set up your organization
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create your first organization to get started with Biznify
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="organization-name" className="block text-sm font-medium text-gray-700">
                Organization Name
              </label>
              <input
                id="organization-name"
                name="organizationName"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                placeholder="Acme Corp"
                value={organizationName}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="organization-slug" className="block text-sm font-medium text-gray-700">
                Organization URL
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  biznify.com/
                </span>
                <input
                  id="organization-slug"
                  name="organizationSlug"
                  type="text"
                  required
                  className="flex-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm"
                  placeholder="acme-corp"
                  value={organizationSlug}
                  onChange={(e) => setOrganizationSlug(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !organizationName || !organizationSlug}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating organization...
                </div>
              ) : (
                "Create Organization"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 