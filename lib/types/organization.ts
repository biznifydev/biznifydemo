export interface Organization {
  id: string
  name: string
  slug: string
  domain?: string
  plan_type: 'free' | 'pro' | 'enterprise'
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  role: 'user' | 'admin' | 'owner'
  created_at: string
  updated_at: string
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  status: 'active' | 'invited' | 'suspended'
  invited_by?: string
  invited_at: string
  joined_at?: string
  created_at: string
  updated_at: string
  user?: UserProfile
}

export interface FinancialAccount {
  id: string
  organization_id: string
  name: string
  type: 'revenue' | 'expense' | 'asset' | 'liability'
  parent_id?: string
  level: number // 0=section, 1=category, 2=subcategory
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FinancialData {
  id: string
  organization_id: string
  account_id: string
  period: string // '2025-01', '2025-02', etc.
  amount: number
  is_manual: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer'
export type OrganizationPlan = 'free' | 'pro' | 'enterprise'
export type MemberStatus = 'active' | 'invited' | 'suspended' 