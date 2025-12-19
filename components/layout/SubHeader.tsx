"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface Tab {
  id: string
  label: string
}

interface SubHeaderProps {
  className?: string
  tabs?: Tab[]
  onTabChange?: (tabId: string) => void
  activeTab?: string
  title?: string
  description?: string
  onFilterClick?: () => void
  isFilterActive?: boolean
}

export function SubHeader({ className, tabs, onTabChange, activeTab: externalActiveTab, title, description, onFilterClick, isFilterActive }: SubHeaderProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs?.[0]?.id || "")
  
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab
  
  const handleTabChange = (tabId: string) => {
    if (externalActiveTab !== undefined) {
      onTabChange?.(tabId)
    } else {
      setInternalActiveTab(tabId)
    }
  }

  // If title and description are provided, render a simple header
  if (title && description) {
    return (
      <div className={cn("w-full border-b border-gray-200", className)}>
        <div className="px-6 py-2">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    )
  }

  // Otherwise render the tabs version
  return (
    <div className={cn("w-full border-b border-gray-200", className)}>
      <div className="flex items-center justify-between px-6 h-10">
        <div className="flex h-full">
          {tabs?.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "px-4 text-sm font-medium transition-colors h-full flex items-center",
                activeTab === tab.id
                  ? "text-gray-900 border-b-2 border-purple-600"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative h-full">
            <input
              type="text"
              placeholder="Search..."
              className="pl-8 pr-3 text-xs bg-white border-l border-r border-gray-200 focus:outline-none focus:ring-0 w-48 h-full m-0 p-0"
            />
            <svg className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button 
            onClick={onFilterClick}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors border flex items-center space-x-1 ${
              isFilterActive 
                ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
            }`}
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>{isFilterActive ? 'Hide Filters' : 'Filter'}</span>
          </button>
        </div>
      </div>
    </div>
  )
} 