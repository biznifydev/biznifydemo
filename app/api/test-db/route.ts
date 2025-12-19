import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Test if organizations table exists
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('count')
      .limit(1)

    // Test if user_profiles table exists
    const { data: profiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)

    // Test if organization_members table exists
    const { data: members, error: memberError } = await supabase
      .from('organization_members')
      .select('count')
      .limit(1)

    return NextResponse.json({
      success: true,
      tables: {
        organizations: { exists: !orgError, error: orgError?.message },
        user_profiles: { exists: !profileError, error: profileError?.message },
        organization_members: { exists: !memberError, error: memberError?.message }
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 