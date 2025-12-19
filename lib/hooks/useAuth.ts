import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { auth } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('Getting initial session...')
      const { session } = await auth.getSession()
      console.log('Initial session:', session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await auth.signIn(email, password)
    return { data, error }
  }

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const metadata = {
      first_name: firstName || '',
      last_name: lastName || ''
    }
    const { data, error } = await auth.signUp(email, password, metadata)
    return { data, error }
  }

  const signOut = async () => {
    console.log('Signing out...')
    const { error } = await auth.signOut()
    console.log('Sign out result:', { error })
    if (!error) {
      router.push('/login')
    }
    return { error }
  }

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
  }
} 