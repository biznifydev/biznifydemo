"use client"

import { useState, useEffect } from "react"
import { X, Plus, Edit2, Trash2, ChevronRight, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Account {
  id: string
  name: string
  code?: string
  type: string
  level: number
  parent_id?: string
  is_active: boolean
  children?: Account[]
}

interface CustomizeModalProps {
  isOpen: boolean
  onClose: () => void
  accounts: Account[]
  financialData: any[] // Add financial data to check for existing data
  onAddAccount: (name: string, code: string, type: string, parentId?: string) => Promise<void>
  onUpdateAccount: (id: string, name: string, code: string) => Promise<void>
  onDeleteAccount: (id: string, forceDelete?: boolean) => Promise<void>
  onToggleAccount: (id: string) => Promise<void>
}

export function CustomizeModal({
  isOpen,
  onClose,
  accounts,
  financialData,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onToggleAccount
}: CustomizeModalProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['Revenue', 'Cost of Goods Sold', 'Operating Expenses'])
  // Debug logging removed for cleaner console
  const [editingAccount, setEditingAccount] = useState<string | null>(null)
  const [newAccount, setNewAccount] = useState({ 
    name: '', 
    code: '', 
    type: 'revenue', 
    parentId: '', 
    level: 1,
    section: 'revenue' // Add section field
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [addingToParent, setAddingToParent] = useState<string | null>(null)
  const [pendingExpansion, setPendingExpansion] = useState<string | null>(null)

  // Debug accounts changes
  useEffect(() => {
    // console.log('Accounts changed in CustomizeModal:', accounts.length)
    // console.log('New accounts structure:', accounts)
  }, [accounts])

  // Handle pending expansion after accounts refresh
  useEffect(() => {
    if (pendingExpansion && accounts.length > 0) {
      // console.log('Checking for pending expansion:', pendingExpansion)
      // Use a more robust check - look for the account in the hierarchical structure
      const findAccount = (accounts: Account[], id: string): boolean => {
        for (const account of accounts) {
          if (account.id === id) return true
          if (account.children) {
            if (findAccount(account.children, id)) return true
          }
        }
        return false
      }
      
      if (findAccount(accounts, pendingExpansion)) {
        // console.log('Found pending expansion account, expanding...')
        // Add a small delay to ensure the accounts are fully loaded
        setTimeout(() => {
          setExpandedSections(prev => 
            prev.includes(pendingExpansion) ? prev : [...prev, pendingExpansion]
          )
          setPendingExpansion(null)
        }, 100)
      } else {
        // console.log('Pending expansion account not found in new accounts')
      }
    }
  }, [accounts, pendingExpansion])

  if (!isOpen) return null

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const getChildren = (parentId: string) => {
    // console.log('Getting children for parentId:', parentId)
    const findChildren = (accounts: Account[], parentId: string): Account[] => {
      for (const account of accounts) {
        if (account.id === parentId) {
          // console.log('Found parent account:', account.name, 'children:', account.children?.length || 0)
          return account.children || []
        }
        if (account.children) {
          const found = findChildren(account.children, parentId)
          if (found.length > 0) return found
        }
      }
      return []
    }
    const children = findChildren(accounts, parentId)
    // console.log('Returning children:', children.length, children.map(c => c.name))
    return children
  }

  const getSectionAccounts = (sectionName: string) => {
    // console.log('Looking for section:', sectionName)
    const found = accounts.filter(account => 
      account.name === sectionName && account.level === 0
    )
    // console.log('Found section accounts:', found.length, found.map(f => f.name))
    return found
  }

  const handleAddAccount = async () => {
    // console.log('handleAddAccount called!')
    if (!newAccount.name || !newAccount.code) {
      // console.log('Validation failed - missing name or code')
      return
    }
    
    try {
      // console.log('Adding account:', newAccount)
      
      // If adding a category (level 1) without a parent, we need to find the section parent
      let parentId: string | undefined = newAccount.parentId || undefined
      if (newAccount.level === 1 && !parentId) {
        // Find the section account based on the selected section
        const sectionAccount = accounts.find(account => 
          account.name.toLowerCase().includes(newAccount.section.toLowerCase()) && account.level === 0
        )
        parentId = sectionAccount?.id
        // console.log('Found section parent:', sectionAccount?.name, 'ID:', parentId)
      }
      
      // Store the parent ID before the accounts refresh
      const parentToExpand = parentId
      // console.log('Parent to expand after add:', parentToExpand)
      
      await onAddAccount(newAccount.name, newAccount.code, newAccount.type, parentId)
      // console.log('Account added successfully')
      
      setNewAccount({ name: '', code: '', type: 'revenue', parentId: '', level: 1, section: 'revenue' })
      setShowAddForm(false)
      setAddingToParent(null)
      
      // Set pending expansion to handle after accounts refresh
      if (parentToExpand) {
        // console.log('Setting pending expansion to:', parentToExpand)
        setPendingExpansion(parentToExpand)
      }
    } catch (error) {
      // console.error('Error adding account:', error)
      alert(`Error adding account: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleUpdateAccount = async (id: string, name: string, code: string) => {
    try {
      await onUpdateAccount(id, name, code || '')
      setEditingAccount(null)
    } catch (error) {
      // console.error('Error updating account:', error)
      alert(`Error updating account: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

    const renderAccountRow = (account: Account, level: number) => {
    const children = getChildren(account.id)
    const isExpanded = expandedSections.includes(account.id)
    const isEditing = editingAccount === account.id
    const isAddingSubcategory = addingToParent === account.id

    return (
      <div key={account.id} className="space-y-0.5">
        <div 
          className={`flex items-center justify-between py-1.5 px-2 rounded ${level === 0 ? 'bg-gray-50' : level === 1 ? 'bg-white' : 'bg-gray-25'} ${children.length > 0 ? 'cursor-pointer hover:bg-gray-100' : ''}`}
          onClick={children.length > 0 ? () => toggleSection(account.id) : undefined}
        >
          <div className="flex items-center space-x-2 flex-1">
            <div style={{ paddingLeft: `${level * 12}px` }}>
              {children.length > 0 ? (
                <div className="text-gray-500">
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
              ) : (
                <div className="w-3.5" />
              )}
            </div>
            
            {isEditing ? (
              <div className="flex items-center space-x-2 flex-1">
                <input
                  type="text"
                  value={account.name}
                  onChange={(e) => {
                    const updatedAccounts = accounts.map(acc => 
                      acc.id === account.id ? { ...acc, name: e.target.value } : acc
                    )
                    // This would need to be handled by the parent component
                  }}
                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                  autoFocus
                />
                <input
                  type="text"
                  value={account.code || ''}
                  onChange={(e) => {
                    const updatedAccounts = accounts.map(acc => 
                      acc.id === account.id ? { ...acc, code: e.target.value } : acc
                    )
                    // This would need to be handled by the parent component
                  }}
                  className="w-16 px-2 py-1 text-xs border border-gray-300 rounded"
                />
                <Button
                  size="sm"
                  onClick={() => handleUpdateAccount(account.id, account.name, account.code || '')}
                  className="h-5 px-2 text-xs"
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingAccount(null)}
                  className="h-5 px-2 text-xs"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <span className={`text-xs font-medium ${!account.is_active ? 'text-gray-400 line-through' : ''}`}>
                  {account.name}
                </span>
                {account.code && (
                  <span className={`text-xs ${!account.is_active ? 'text-gray-400' : 'text-gray-500'}`}>
                    ({account.code})
                  </span>
                )}
                {!account.is_active && (
                  <span className="text-xs text-gray-400 ml-1">(inactive)</span>
                )}
              </>
            )}
          </div>
          
          {!isEditing && (
            <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
              {level < 2 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setAddingToParent(account.id)
                    
                    // Map parent type to valid database type
                    let validType = 'revenue'
                    if (account.type === 'expense' || account.type === 'Cost of Goods Sold' || account.type === 'Operating Expenses') {
                      validType = 'expense'
                    }
                    
                    setNewAccount(prev => ({ 
                      ...prev, 
                      parentId: account.id, 
                      level: level + 1,
                      type: validType,
                      section: account.type
                    }))
                    setShowAddForm(true)
                  }}
                  className="text-gray-400 hover:text-blue-600 p-1"
                  title={level === 0 ? "Add Category" : "Add Subcategory"}
                >
                  <Plus size={12} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingAccount(account.id)
                }}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Edit"
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={async (e) => {
                  e.stopPropagation()
                  try {
                    await onToggleAccount(account.id)
                  } catch (error) {
                    // console.error('Error toggling account:', error)
                    alert(`Error toggling account: ${error instanceof Error ? error.message : 'Unknown error'}`)
                  }
                }}
                className={`p-1 ${account.is_active ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
                title={account.is_active ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
              >
                <div className={`w-2 h-2 rounded-full ${account.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
              </button>
              <button
                onClick={async (e) => {
                  e.stopPropagation()
                  const hasData = financialData.some(d => d.account_id === account.id)
                  let forceDelete = false
                  
                  if (hasData) {
                    const choice = confirm(
                      `"${account.name}" has financial data. Do you want to:\n\n` +
                      `• Cancel (recommended)\n` +
                      `• Delete account AND all its financial data (irreversible)`
                    )
                    if (choice) {
                      forceDelete = true
                    } else {
                      return
                    }
                  } else {
                    if (!confirm(`Are you sure you want to delete "${account.name}"? This action cannot be undone.`)) {
                      return
                    }
                  }
                  
                  try {
                    await onDeleteAccount(account.id, forceDelete)
                  } catch (error) {
                    // console.error('Error deleting account:', error)
                    alert(`Error deleting account: ${error instanceof Error ? error.message : 'Unknown error'}`)
                  }
                }}
                className="text-gray-400 hover:text-red-600 p-1"
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
        
        {isExpanded && children.map(child => renderAccountRow(child, level + 1))}
      </div>
    )
  }

  const renderSection = (sectionName: string, sectionLabel: string) => {
    const sectionAccounts = getSectionAccounts(sectionName)
    if (sectionAccounts.length === 0) return null

    const sectionAccount = sectionAccounts[0]
    const children = getChildren(sectionAccount.id)
    const isExpanded = expandedSections.includes(sectionName)

    return (
      <div key={sectionName} className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-100 py-2 px-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleSection(sectionName)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <span className="font-semibold text-gray-900 text-sm">{sectionLabel}</span>
          </div>
        </div>
        
        {isExpanded && (
          <div className="p-1 space-y-0.5">
            {children.map(child => renderAccountRow(child, 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Customize Categories</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {renderSection('Revenue', 'Revenue')}
            {renderSection('Cost of Goods Sold', 'Cost of Goods Sold')}
            {renderSection('Operating Expenses', 'Operating Expenses')}
          </div>

          {/* Add New Category Button */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Add New Category</h3>
              <Button
                size="sm"
                onClick={() => {
                  setAddingToParent(null)
                                      setNewAccount({ 
                      name: '', 
                      code: '', 
                      type: 'revenue', 
                      parentId: '', 
                      level: 1,
                      section: 'revenue'
                    })
                  setShowAddForm(true)
                }}
                className="h-7 px-3 text-xs"
              >
                <Plus size={12} className="mr-1" />
                Add Category
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Create a new top-level category under any section
            </p>
          </div>

          {/* Add New Account Form */}
          {showAddForm && (
            <div className="mt-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-xs font-semibold text-gray-900 mb-2">
                Add New {newAccount.level === 1 ? 'Category' : 'Subcategory'}
                {addingToParent && (
                  <span className="text-gray-500 font-normal ml-2">
                    (under {accounts.find(acc => acc.id === addingToParent)?.name || 'Unknown'})
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-5 gap-2">
                <input
                  type="text"
                  placeholder="Name"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddAccount()}
                />
                <input
                  type="text"
                  placeholder="Code (e.g., REV001)"
                  value={newAccount.code}
                  onChange={(e) => setNewAccount(prev => ({ ...prev, code: e.target.value }))}
                  className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddAccount()}
                />
                {!addingToParent && newAccount.level === 1 && (
                  <select
                    value={newAccount.section}
                    onChange={(e) => {
                      const section = e.target.value
                      // Map section values to correct type values for database
                      let type = 'revenue'
                      if (section === 'Cost of Goods Sold' || section === 'Operating Expenses') {
                        type = 'expense'
                      }
                      
                      setNewAccount(prev => ({ 
                        ...prev, 
                        section: section,
                        type: type
                      }))
                    }}
                    className="px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    <option value="Revenue">Revenue</option>
                    <option value="Cost of Goods Sold">Cost of Goods Sold</option>
                    <option value="Operating Expenses">Operating Expenses</option>
                  </select>
                )}
                {!addingToParent && newAccount.level === 1 && <div />}
                <Button
                  size="sm"
                  onClick={(e) => {
                    // console.log('Add button clicked!')
                    // console.log('newAccount:', newAccount)
                    // console.log('Button disabled:', !newAccount.name || !newAccount.code)
                    e.preventDefault()
                    e.stopPropagation()
                    handleAddAccount()
                  }}
                  disabled={!newAccount.name || !newAccount.code}
                  className="h-7 px-2 text-xs"
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false)
                    setAddingToParent(null)
                    setNewAccount({ name: '', code: '', type: 'revenue', parentId: '', level: 1, section: 'revenue' })
                  }}
                  className="h-7 px-2 text-xs"
                >
                  Cancel
                </Button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <p>• Name: Descriptive name for the category/subcategory</p>
                <p>• Code: Short identifier (e.g., REV001, EXP001)</p>
                {!addingToParent && newAccount.level === 1 && (
                  <p>• Section: Choose which section to add the category under</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
} 