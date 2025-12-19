"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { NAVIGATION_ITEMS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Home, FileText, Search, Megaphone, Bot, Users, DollarSign, UserCheck, Settings, LogOut, Building2, ChevronDown, User } from "lucide-react"
import { useAuthContext } from "@/components/providers/AuthProvider"
import { useOrganizationContext } from "@/components/providers/OrganizationProvider"

const iconMap = {
  Home,
  FileText,
  Megaphone,
  Bot,
  Users,
  DollarSign,
  UserCheck,
  Settings,
}

export function SideNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuthContext()
  const { currentOrganization, userProfile } = useOrganizationContext()
  const [signingOut, setSigningOut] = useState(false)
  const [showOrgMenu, setShowOrgMenu] = useState(false)
  const orgMenuRef = useRef<HTMLDivElement>(null)
  
  // Only one section can be expanded at a time
  const [expandedSection, setExpandedSection] = useState<string | null>(() => {
    // Auto-expand section that has active sub-items
    const activeSection = NAVIGATION_ITEMS.find(item => 
      'subItems' in item && item.subItems.some(subItem => pathname === subItem.href)
    )
    return activeSection ? activeSection.href : null
  })

  // Calculate the widest sub-link to set a fixed width
  const calculateMaxWidth = () => {
    let maxWidth = 0
    
    // Check main navigation items
    NAVIGATION_ITEMS.forEach(item => {
      const itemWidth = item.title.length * 7 + 60 // Reduced padding: chars * 7px + 60px
      maxWidth = Math.max(maxWidth, itemWidth)
      
      // Check sub-items if they exist
      if ('subItems' in item && item.subItems) {
        item.subItems.forEach(subItem => {
          const subItemWidth = subItem.title.length * 7 + 80 // Reduced padding: chars * 7px + 80px
          maxWidth = Math.max(maxWidth, subItemWidth)
        })
      }
    })
    
    // Add some buffer and ensure it's within reasonable bounds
    return Math.min(Math.max(maxWidth, 200), 240)
  }

  const navWidth = calculateMaxWidth()

  const handleMainLinkClick = (item: any) => {
    if ('subItems' in item && item.subItems) {
      // Toggle expansion for this section
      setExpandedSection(prev => prev === item.href ? null : item.href)
      
      // Navigate to overview page or first sub-item
      const targetHref = item.href || (item.subItems[0]?.href)
      if (targetHref && pathname !== targetHref) {
        router.push(targetHref)
      }
    } else {
      // No sub-items, just navigate
      router.push(item.href)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (orgMenuRef.current && !orgMenuRef.current.contains(event.target as Node)) {
        setShowOrgMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="flex h-full flex-col bg-gray-100" style={{ width: `${navWidth}px` }}>
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {/* Ask Biznify AI Section */}
        <Link
          href="/ai"
          className={cn(
            "flex items-center space-x-3 px-3 py-2 text-sm font-semibold transition-colors rounded-md",
            pathname === "/ai"
              ? "text-gray-900 bg-white"
              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          )}
        >
          <Bot className="h-4 w-4 flex-shrink-0" />
          <span>Ask Biznify AI</span>
        </Link>
        
        {/* Main Navigation */}
        {NAVIGATION_ITEMS.filter(item => item.href !== "/ai").map((item, index) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap]
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const hasSubItems = 'subItems' in item
          const isExpanded = expandedSection === item.href
          
          return (
            <div key={item.href} className="space-y-1">
              {/* Add divider before Integrations */}
              {item.title === "Integrations" && (
                <div className="border-t border-gray-200 my-4"></div>
              )}
              
              <div
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 text-sm font-semibold transition-colors rounded-md cursor-pointer",
                  isActive
                    ? "text-gray-900 bg-white"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                )}
                onClick={() => handleMainLinkClick(item)}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span>{item.title}</span>
              </div>
              
              {/* Sub-items */}
              {hasSubItems && isExpanded && (
                <div className="ml-6">
                  <div className="space-y-1">
                    {item.subItems
                      .filter(subItem => subItem.title !== "Overview") // Remove Overview sub-link
                      .map((subItem, subIndex) => {
                        const isSubActive = pathname === subItem.href
                        return (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={cn(
                              "flex items-center space-x-2 px-3 py-1.5 text-xs transition-colors rounded-md relative",
                              isSubActive
                                ? "text-gray-900 font-semibold bg-white"
                                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            )}
                          >
                            {/* Arrow indicator for active sub-item */}
                            {isSubActive && (
                              <div className="w-1 h-1 bg-gray-900 rounded-full flex-shrink-0"></div>
                            )}
                            <span className="ml-2">{subItem.title}</span>
                          </Link>
                        )
                      })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
} 