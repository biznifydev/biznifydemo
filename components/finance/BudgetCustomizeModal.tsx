'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Edit2, Trash2, X } from 'lucide-react'
import { BudgetCategory } from '@/lib/services/budgetService'

interface BudgetCustomizeModalProps {
  isOpen: boolean
  onClose: () => void
  categories: BudgetCategory[]
  onAddCategory: (name: string, type: string, parentId?: string) => void
  onUpdateCategory: (id: string, name: string) => void
  onDeleteCategory: (id: string) => void
}

export function BudgetCustomizeModal({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}: BudgetCustomizeModalProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryType, setNewCategoryType] = useState<'revenue' | 'expense' | 'cogs'>('expense')
  const [newCategoryParentId, setNewCategoryParentId] = useState<string>('')
  const [editName, setEditName] = useState('')

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName, newCategoryType, newCategoryParentId || undefined)
      setShowAddForm(false)
      setNewCategoryName('')
      setNewCategoryType('expense')
      setNewCategoryParentId('')
    }
  }

  const handleEditCategory = (category: BudgetCategory) => {
    setEditingCategory(category.id)
    setEditName(category.name)
  }

  const handleSaveEdit = () => {
    if (editingCategory && editName.trim()) {
      onUpdateCategory(editingCategory, editName)
      setEditingCategory(null)
      setEditName('')
    }
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    setEditName('')
  }

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm('Are you sure you want to delete this category? This will also delete all associated budget data.')) {
      onDeleteCategory(categoryId)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'revenue': return 'bg-green-100 text-green-800'
      case 'cogs': return 'bg-orange-100 text-orange-800'
      case 'expense': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'revenue': return 'Revenue'
      case 'cogs': return 'COGS'
      case 'expense': return 'Expense'
      default: return type
    }
  }

  const parentCategories = categories.filter(cat => !cat.parent_id)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Customize Categories</h2>
            <p className="text-sm text-gray-600 mt-1">Add, edit, or remove budget categories</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Add New Category */}
          {showAddForm ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Add New Category</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newCategoryType}
                    onChange={(e) => setNewCategoryType(e.target.value as 'revenue' | 'expense' | 'cogs')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="revenue">Revenue</option>
                    <option value="cogs">Cost of Goods Sold</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Category (Optional)
                  </label>
                  <select
                    value={newCategoryParentId}
                    onChange={(e) => setNewCategoryParentId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">No parent</option>
                    {parentCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleAddCategory} className="flex-1">
                    Add Category
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              onClick={() => setShowAddForm(true)}
              className="w-full mb-6"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Category
            </Button>
          )}

          {/* Categories List */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Categories</h3>
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">No categories found</p>
                <p className="text-sm text-gray-400">Add your first category to get started</p>
              </div>
            ) : (
              categories.map((category) => (
                <Card key={category.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {editingCategory === category.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <Button size="sm" onClick={handleSaveEdit}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <span className="font-medium text-gray-900">{category.name}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(category.type)}`}>
                            {getTypeLabel(category.type)}
                          </span>
                          {category.parent_id && (
                            <span className="text-sm text-gray-500">
                              (Subcategory)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {editingCategory !== category.id && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      </div>
    </div>
  )
} 