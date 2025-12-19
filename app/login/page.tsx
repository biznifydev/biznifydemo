"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/useAuth"
import { Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error } = isSignUp 
        ? await signUp(email, password, firstName, lastName)
        : await signIn(email, password)

      if (error) {
        setError(error.message)
      } else {
        router.push("/")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp)
    setError("")
    // Clear form fields when switching modes
    if (!isSignUp) {
      setFirstName("")
      setLastName("")
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Login Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img src="/images/image.png" alt="Biznify Logo" className="w-8 h-8" />
            <span className="text-xl font-semibold text-black">Biznify</span>
          </div>

          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-black mb-2">
              {isSignUp ? "Create Account" : "Welcome Back!"}
            </h1>
            <p className="text-gray-600">
              {isSignUp 
                ? "Please enter your details below to create your account"
                : "Please enter log in details below"
              }
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required={isSignUp}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required={isSignUp}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>
            )}

            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {!isSignUp && (
              <div className="text-right">
                <button type="button" className="text-sm text-gray-600 hover:text-black">
                  Forget password?
                </button>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </div>
              ) : (
                isSignUp ? "Create Account" : "Sign in"
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or continue</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full bg-white border border-gray-300 text-black py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">G</div>
              <span>Log in with Google</span>
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleToggleMode}
                className="text-sm text-gray-600 hover:text-black"
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign Up"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column - Promotional Section */}
      <div className="hidden lg:flex lg:w-2/5 bg-gray-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M30 30c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20zm0 0c0 11.046 8.954 20 20 20s20-8.954 20-20-8.954-20-20-20-20 8.954-20 20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Floating Shapes */}
        <div className="absolute top-20 left-10 w-8 h-8 bg-purple-400 rounded-lg transform rotate-45 opacity-60"></div>
        <div className="absolute top-10 right-10 w-4 h-4 border-2 border-yellow-400 rounded transform rotate-45 opacity-60"></div>
        <div className="absolute bottom-20 left-10 w-6 h-6 border-2 border-green-400 transform rotate-45 opacity-60"></div>
        <div className="absolute bottom-10 right-20 w-8 h-8 border-2 border-teal-400 rounded-full opacity-60"></div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center">
          {/* 3D Illustration Placeholder */}
          <div className="mb-8 relative">
            <div className="w-64 h-64 bg-gradient-to-br from-blue-400 to-green-400 rounded-full opacity-20 flex items-center justify-center">
              <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center">
                <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="w-24 h-16 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Content */}
          <h2 className="text-3xl font-bold text-white mb-4">
            Manage your Business Anywhere
          </h2>
          <p className="text-gray-300 text-lg max-w-sm">
            You can manage your business on the go with Biznify on the web
          </p>

          {/* Pagination Dots */}
          <div className="absolute bottom-8 flex space-x-2">
            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
} 