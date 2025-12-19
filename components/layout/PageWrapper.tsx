"use client"

import { ReactNode } from "react"

interface PageWrapperProps {
  title: string
  children: ReactNode
  headerButtons?: ReactNode
  subHeader?: ReactNode
}

export function PageWrapper({ title, children, headerButtons, subHeader }: PageWrapperProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        {headerButtons && (
          <div className="flex items-center space-x-3">
            {headerButtons}
          </div>
        )}
      </div>
      
      {subHeader && subHeader}
      
      <div className="p-6">
        {children}
      </div>
    </div>
  )
} 