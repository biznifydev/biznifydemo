"use client"

import { useState, useRef, useEffect } from "react"
import { X, Save, Download, FileText, Eye, Edit3, ChevronDown, ChevronRight, Plus, Trash2, Copy, Check, Upload, FileUp } from "lucide-react"

interface ContractField {
  id: string
  label: string
  value: string
  type: 'text' | 'date' | 'number' | 'select'
  placeholder: string
  required?: boolean
  options?: string[]
}

interface ContractTemplate {
  id: string
  name: string
  content: string
  fields: ContractField[]
  styling: {
    primaryColor: string
    secondaryColor: string
    logoUrl?: string
    layout: 'modern' | 'classic' | 'minimal'
  }
}

interface ContractTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  template?: ContractTemplate
}

export function ContractTemplateModal({ isOpen, onClose, template }: ContractTemplateModalProps) {
  const [step, setStep] = useState<'template' | 'editor'>('template')
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [contractData, setContractData] = useState<ContractTemplate>(template || getDefaultTemplate())
  const [editingField, setEditingField] = useState<string | null>(null)
  const [sidebarSections, setSidebarSections] = useState({
    parties: true,
    dates: true,
    payment: true,
    legal: true,
    clauses: true
  })
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const documentRef = useRef<HTMLDivElement>(null)

  // Reset step when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('template')
    }
  }, [isOpen])

  // Quick actions
  const handleSaveAsTemplate = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    // Show success message
  }

  const handleSaveToContracts = async () => {
    setSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setSaving(false)
    // Show success message
  }

  const handleDownloadPDF = () => {
    // Implement PDF generation
    console.log('Downloading PDF...')
  }

  const handleExportWord = () => {
    // Implement Word export
    console.log('Exporting to Word...')
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Handle template type selection
  const handleTemplateTypeSelect = (templateType: string) => {
    // Load different template based on type
    const newTemplate = getTemplateByType(templateType)
    setContractData(newTemplate)
    setStep('editor')
  }

  // Field editing
  const handleFieldEdit = (fieldId: string) => {
    setEditingField(fieldId)
  }

  const handleFieldSave = (fieldId: string, value: string) => {
    setContractData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, value } : field
      )
    }))
    setEditingField(null)
  }

  const handleFieldCancel = () => {
    setEditingField(null)
  }

  // Toggle sidebar sections
  const toggleSection = (section: keyof typeof sidebarSections) => {
    setSidebarSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Render editable field
  const renderEditableField = (field: ContractField) => {
    if (editingField === field.id) {
      return (
        <div className="inline-block">
          {field.type === 'select' ? (
            <select
              value={field.value}
              onChange={(e) => handleFieldSave(field.id, e.target.value)}
              onBlur={handleFieldCancel}
              className="px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            >
              {field.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              value={field.value}
              onChange={(e) => handleFieldSave(field.id, e.target.value)}
              onBlur={handleFieldCancel}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleFieldSave(field.id, e.currentTarget.value)
                } else if (e.key === 'Escape') {
                  handleFieldCancel()
                }
              }}
              className="px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={field.placeholder}
              autoFocus
            />
          )}
        </div>
      )
    }

    return (
      <span
        onClick={() => handleFieldEdit(field.id)}
        className="inline-block px-1 py-0.5 border-b-2 border-dashed border-blue-400 bg-blue-50 rounded cursor-pointer hover:bg-blue-100 transition-colors"
        title="Click to edit"
      >
        {field.value || field.placeholder}
        <Edit3 className="inline-block w-3 h-3 ml-1 text-blue-500" />
      </span>
    )
  }

  // Render contract content with editable fields
  const renderContractContent = () => {
    let content = contractData.content
    
    // Replace placeholders with editable fields
    contractData.fields.forEach(field => {
      const placeholder = `[${field.label}]`
      const fieldElement = renderEditableField(field)
      content = content.replace(placeholder, fieldElement as any)
    })

    return (
      <div 
        ref={documentRef}
        className={`prose prose-sm max-w-none p-8 bg-white rounded-lg border ${
          isPreviewMode ? 'shadow-lg' : 'border-gray-200'
        }`}
        style={{
          fontFamily: contractData.styling.layout === 'modern' ? 'Inter, sans-serif' : 'Times New Roman, serif'
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    )
  }

  // Render template selection step
  const renderTemplateStep = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Contracts
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* App Header */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-pink-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Contract Templates</h1>
                <p className="text-gray-600">Professional contract templates for your business needs</p>
              </div>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Service Agreement */}
              <div 
                onClick={() => handleTemplateTypeSelect('service')}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                    <FileText className="h-3 w-3 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Contract Templates</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  When creating a new contract, use a <strong>service agreement</strong> template for <strong>client relationships</strong> and <strong>project deliverables</strong>
                </p>
                <button className="w-full px-3 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded hover:bg-gray-50 transition-colors">
                  Add to board
                </button>
              </div>

              {/* Employment Contract */}
              <div 
                onClick={() => handleTemplateTypeSelect('employment')}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                    <FileText className="h-3 w-3 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Contract Templates</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  When hiring new <strong>employees</strong>, create an <strong>employment contract</strong> with <strong>salary terms</strong> and <strong>benefits</strong>
                </p>
                <button className="w-full px-3 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded hover:bg-gray-50 transition-colors">
                  Add to board
                </button>
              </div>

              {/* Non-Disclosure Agreement */}
              <div 
                onClick={() => handleTemplateTypeSelect('nda')}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                    <FileText className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Contract Templates</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  When sharing <strong>confidential information</strong>, use an <strong>NDA template</strong> to protect <strong>intellectual property</strong>
                </p>
                <button className="w-full px-3 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded hover:bg-gray-50 transition-colors">
                  Add to board
                </button>
              </div>

              {/* Partnership Agreement */}
              <div 
                onClick={() => handleTemplateTypeSelect('partnership')}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-6 h-6 bg-orange-100 rounded flex items-center justify-center">
                    <FileText className="h-3 w-3 text-orange-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Contract Templates</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  When forming a <strong>business partnership</strong>, create a <strong>partnership agreement</strong> with <strong>profit sharing</strong> terms
                </p>
                <button className="w-full px-3 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded hover:bg-gray-50 transition-colors">
                  Add to board
                </button>
              </div>

              {/* License Agreement */}
              <div 
                onClick={() => handleTemplateTypeSelect('license')}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
                    <FileText className="h-3 w-3 text-red-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Contract Templates</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  When licensing <strong>intellectual property</strong>, use a <strong>license agreement</strong> with <strong>usage rights</strong> and <strong>restrictions</strong>
                </p>
                <button className="w-full px-3 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded hover:bg-gray-50 transition-colors">
                  Add to board
                </button>
              </div>

              {/* Custom Template */}
              <div 
                onClick={() => handleTemplateTypeSelect('custom')}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                    <Plus className="h-3 w-3 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Contract Templates</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  When you need a <strong>custom contract</strong>, start with a <strong>blank template</strong> and build from <strong>scratch</strong>
                </p>
                <button className="w-full px-3 py-2 bg-white border border-gray-300 text-sm font-medium text-gray-700 rounded hover:bg-gray-50 transition-colors">
                  Add to board
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (!isOpen) return null

  if (step === 'template') {
    return renderTemplateStep()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-[95vw] h-[95vh] bg-white shadow-2xl flex flex-col rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setStep('template')}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Templates
            </button>
            <h2 className="text-xl font-semibold text-gray-900">Contract Template Editor</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  isPreviewMode 
                    ? 'bg-purple-100 text-purple-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isPreviewMode ? <Eye className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                <span className="ml-1">{isPreviewMode ? 'Preview' : 'Edit'}</span>
              </button>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveAsTemplate}
              disabled={saving}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <Save className="w-3 h-3 mr-1" />
              Save as Template
            </button>
            <button
              onClick={handleSaveToContracts}
              disabled={saving}
              className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <FileText className="w-3 h-3 mr-1" />
              Save to Contracts
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 transition-colors"
            >
              <Download className="w-3 h-3 mr-1" />
              PDF
            </button>
            <button
              onClick={handleExportWord}
              className="px-3 py-1.5 bg-blue-800 text-white text-xs font-medium rounded-md hover:bg-blue-900 transition-colors"
            >
              <FileText className="w-3 h-3 mr-1" />
              Word
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 bg-gray-600 text-white text-xs font-medium rounded-md hover:bg-gray-700 transition-colors"
            >
              {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Document Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderContractContent()}
          </div>

          {/* Smart Sidebar */}
          <div className="w-80 border-l border-gray-200 overflow-y-auto">
            <div className="p-4 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Quick Edit</h3>
              
              {/* Parties Involved */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('parties')}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">Parties Involved</span>
                  {sidebarSections.parties ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {sidebarSections.parties && (
                  <div className="px-4 pb-4 space-y-3">
                    {contractData.fields.filter(f => ['company_name', 'client_name', 'contact_person'].includes(f.id)).map(field => (
                      <div key={field.id}>
                        <label className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => handleFieldSave(field.id, e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={field.placeholder}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('dates')}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">Dates</span>
                  {sidebarSections.dates ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {sidebarSections.dates && (
                  <div className="px-4 pb-4 space-y-3">
                    {contractData.fields.filter(f => ['start_date', 'end_date', 'effective_date'].includes(f.id)).map(field => (
                      <div key={field.id}>
                        <label className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
                        <input
                          type="date"
                          value={field.value}
                          onChange={(e) => handleFieldSave(field.id, e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Terms */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('payment')}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">Payment Terms</span>
                  {sidebarSections.payment ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {sidebarSections.payment && (
                  <div className="px-4 pb-4 space-y-3">
                    {contractData.fields.filter(f => ['contract_value', 'payment_terms', 'currency'].includes(f.id)).map(field => (
                      <div key={field.id}>
                        <label className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
                        {field.type === 'select' ? (
                          <select
                            value={field.value}
                            onChange={(e) => handleFieldSave(field.id, e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {field.options?.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type}
                            value={field.value}
                            onChange={(e) => handleFieldSave(field.id, e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={field.placeholder}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Legal Details */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('legal')}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">Legal Details</span>
                  {sidebarSections.legal ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {sidebarSections.legal && (
                  <div className="px-4 pb-4 space-y-3">
                    {contractData.fields.filter(f => ['governing_law', 'jurisdiction', 'dispute_resolution'].includes(f.id)).map(field => (
                      <div key={field.id}>
                        <label className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => handleFieldSave(field.id, e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={field.placeholder}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Optional Clauses */}
              <div className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleSection('clauses')}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">Optional Clauses</span>
                  {sidebarSections.clauses ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {sidebarSections.clauses && (
                  <div className="px-4 pb-4 space-y-3">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-xs text-gray-700">Non-compete clause</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-xs text-gray-700">Confidentiality agreement</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-xs text-gray-700">Force majeure clause</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-xs text-gray-700">Termination clause</span>
                      </label>
                    </div>
                    <button className="w-full px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors">
                      <Plus className="w-3 h-3 mr-1" />
                      Add Custom Clause
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to get template by type
function getTemplateByType(type: string): ContractTemplate {
  switch (type) {
    case 'service':
      return getDefaultTemplate()
    case 'employment':
      return getEmploymentTemplate()
    case 'nda':
      return getNDATemplate()
    case 'partnership':
      return getPartnershipTemplate()
    case 'license':
      return getLicenseTemplate()
    case 'custom':
      return getCustomTemplate()
    default:
      return getDefaultTemplate()
  }
}

// Helper function to get default template
function getDefaultTemplate(): ContractTemplate {
  return {
    id: 'default',
    name: 'Service Agreement',
    content: `
      <h1 style="text-align: center; color: #1f2937; margin-bottom: 2rem;">SERVICE AGREEMENT</h1>
      
      <p><strong>This Service Agreement</strong> (the "Agreement") is entered into as of [Effective Date] by and between:</p>
      
      <p><strong>[Company Name]</strong>, a company organized under the laws of [Jurisdiction], with its principal place of business at [Company Address] (the "Service Provider"); and</p>
      
      <p><strong>[Client Name]</strong>, with its principal place of business at [Client Address] (the "Client").</p>
      
      <h2>1. SERVICES</h2>
      <p>The Service Provider agrees to provide the following services to the Client: [Service Description].</p>
      
      <h2>2. TERM</h2>
      <p>This Agreement shall commence on [Start Date] and continue until [End Date], unless terminated earlier in accordance with the terms herein.</p>
      
      <h2>3. COMPENSATION</h2>
      <p>In consideration for the services provided, the Client shall pay the Service Provider [Contract Value] [Currency] according to the following payment terms: [Payment Terms].</p>
      
      <h2>4. GOVERNING LAW</h2>
      <p>This Agreement shall be governed by and construed in accordance with the laws of [Governing Law].</p>
      
      <h2>5. JURISDICTION</h2>
      <p>Any disputes arising from this Agreement shall be resolved in the courts of [Jurisdiction].</p>
      
      <p style="margin-top: 2rem;"><strong>IN WITNESS WHEREOF</strong>, the parties have executed this Agreement as of the date first above written.</p>
      
      <div style="margin-top: 2rem; display: flex; justify-content: space-between;">
        <div>
          <p><strong>Service Provider:</strong></p>
          <p>[Company Name]</p>
          <p>By: _________________</p>
          <p>Date: _________________</p>
        </div>
        <div>
          <p><strong>Client:</strong></p>
          <p>[Client Name]</p>
          <p>By: _________________</p>
          <p>Date: _________________</p>
        </div>
      </div>
    `,
    fields: [
      { id: 'company_name', label: 'Company Name', value: '', type: 'text', placeholder: 'Enter company name', required: true },
      { id: 'client_name', label: 'Client Name', value: '', type: 'text', placeholder: 'Enter client name', required: true },
      { id: 'contact_person', label: 'Contact Person', value: '', type: 'text', placeholder: 'Enter contact person', required: false },
      { id: 'effective_date', label: 'Effective Date', value: '', type: 'date', placeholder: 'Select effective date', required: true },
      { id: 'start_date', label: 'Start Date', value: '', type: 'date', placeholder: 'Select start date', required: true },
      { id: 'end_date', label: 'End Date', value: '', type: 'date', placeholder: 'Select end date', required: true },
      { id: 'contract_value', label: 'Contract Value', value: '', type: 'number', placeholder: 'Enter contract value', required: true },
      { id: 'currency', label: 'Currency', value: 'USD', type: 'select', placeholder: 'Select currency', required: true, options: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] },
      { id: 'payment_terms', label: 'Payment Terms', value: '', type: 'text', placeholder: 'e.g., Net 30 days', required: true },
      { id: 'governing_law', label: 'Governing Law', value: '', type: 'text', placeholder: 'e.g., State of California', required: true },
      { id: 'jurisdiction', label: 'Jurisdiction', value: '', type: 'text', placeholder: 'e.g., San Francisco County', required: true },
      { id: 'dispute_resolution', label: 'Dispute Resolution', value: 'Arbitration', type: 'select', placeholder: 'Select dispute resolution', required: true, options: ['Arbitration', 'Mediation', 'Court Proceedings'] }
    ],
    styling: {
      primaryColor: '#3b82f6',
      secondaryColor: '#1f2937',
      layout: 'modern'
    }
  }
}

// Helper functions for other template types
function getEmploymentTemplate(): ContractTemplate {
  return {
    ...getDefaultTemplate(),
    id: 'employment',
    name: 'Employment Agreement',
    content: `
      <h1 style="text-align: center; color: #1f2937; margin-bottom: 2rem;">EMPLOYMENT AGREEMENT</h1>
      
      <p><strong>This Employment Agreement</strong> (the "Agreement") is entered into as of [Effective Date] by and between:</p>
      
      <p><strong>[Company Name]</strong>, a company organized under the laws of [Jurisdiction] (the "Employer"); and</p>
      
      <p><strong>[Employee Name]</strong>, an individual residing at [Employee Address] (the "Employee").</p>
      
      <h2>1. POSITION AND DUTIES</h2>
      <p>The Employee shall serve as [Position] and shall perform such duties as may be assigned by the Employer.</p>
      
      <h2>2. COMPENSATION</h2>
      <p>The Employee shall receive an annual salary of [Contract Value] [Currency], payable in accordance with the Employer's standard payroll practices.</p>
      
      <h2>3. TERM</h2>
      <p>This Agreement shall commence on [Start Date] and continue until [End Date], unless terminated earlier in accordance with the terms herein.</p>
      
      <h2>4. BENEFITS</h2>
      <p>The Employee shall be eligible for such benefits as may be provided by the Employer to its employees generally.</p>
      
      <h2>5. CONFIDENTIALITY</h2>
      <p>The Employee agrees to maintain the confidentiality of all proprietary and confidential information of the Employer.</p>
      
      <p style="margin-top: 2rem;"><strong>IN WITNESS WHEREOF</strong>, the parties have executed this Agreement as of the date first above written.</p>
      
      <div style="margin-top: 2rem; display: flex; justify-content: space-between;">
        <div>
          <p><strong>Employer:</strong></p>
          <p>[Company Name]</p>
          <p>By: _________________</p>
          <p>Date: _________________</p>
        </div>
        <div>
          <p><strong>Employee:</strong></p>
          <p>[Employee Name]</p>
          <p>By: _________________</p>
          <p>Date: _________________</p>
        </div>
      </div>
    `,
    fields: [
      { id: 'company_name', label: 'Company Name', value: '', type: 'text', placeholder: 'Enter company name', required: true },
      { id: 'employee_name', label: 'Employee Name', value: '', type: 'text', placeholder: 'Enter employee name', required: true },
      { id: 'position', label: 'Position', value: '', type: 'text', placeholder: 'Enter position title', required: true },
      { id: 'effective_date', label: 'Effective Date', value: '', type: 'date', placeholder: 'Select effective date', required: true },
      { id: 'start_date', label: 'Start Date', value: '', type: 'date', placeholder: 'Select start date', required: true },
      { id: 'end_date', label: 'End Date', value: '', type: 'date', placeholder: 'Select end date', required: true },
      { id: 'contract_value', label: 'Annual Salary', value: '', type: 'number', placeholder: 'Enter annual salary', required: true },
      { id: 'currency', label: 'Currency', value: 'USD', type: 'select', placeholder: 'Select currency', required: true, options: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'] },
      { id: 'governing_law', label: 'Governing Law', value: '', type: 'text', placeholder: 'e.g., State of California', required: true },
      { id: 'jurisdiction', label: 'Jurisdiction', value: '', type: 'text', placeholder: 'e.g., San Francisco County', required: true }
    ]
  }
}

function getNDATemplate(): ContractTemplate {
  return {
    ...getDefaultTemplate(),
    id: 'nda',
    name: 'Non-Disclosure Agreement',
    content: `
      <h1 style="text-align: center; color: #1f2937; margin-bottom: 2rem;">NON-DISCLOSURE AGREEMENT</h1>
      
      <p><strong>This Non-Disclosure Agreement</strong> (the "Agreement") is entered into as of [Effective Date] by and between:</p>
      
      <p><strong>[Company Name]</strong>, a company organized under the laws of [Jurisdiction] (the "Disclosing Party"); and</p>
      
      <p><strong>[Recipient Name]</strong>, a company organized under the laws of [Jurisdiction] (the "Receiving Party").</p>
      
      <h2>1. CONFIDENTIAL INFORMATION</h2>
      <p>The Receiving Party acknowledges that it may receive confidential and proprietary information from the Disclosing Party.</p>
      
      <h2>2. NON-DISCLOSURE</h2>
      <p>The Receiving Party agrees to maintain the confidentiality of all confidential information and not to disclose such information to any third party.</p>
      
      <h2>3. TERM</h2>
      <p>This Agreement shall remain in effect for a period of [Contract Value] years from the date of disclosure.</p>
      
      <h2>4. RETURN OF MATERIALS</h2>
      <p>Upon termination of this Agreement, the Receiving Party shall return all confidential materials to the Disclosing Party.</p>
      
      <p style="margin-top: 2rem;"><strong>IN WITNESS WHEREOF</strong>, the parties have executed this Agreement as of the date first above written.</p>
      
      <div style="margin-top: 2rem; display: flex; justify-content: space-between;">
        <div>
          <p><strong>Disclosing Party:</strong></p>
          <p>[Company Name]</p>
          <p>By: _________________</p>
          <p>Date: _________________</p>
        </div>
        <div>
          <p><strong>Receiving Party:</strong></p>
          <p>[Recipient Name]</p>
          <p>By: _________________</p>
          <p>Date: _________________</p>
        </div>
      </div>
    `,
    fields: [
      { id: 'company_name', label: 'Disclosing Party', value: '', type: 'text', placeholder: 'Enter disclosing party name', required: true },
      { id: 'recipient_name', label: 'Receiving Party', value: '', type: 'text', placeholder: 'Enter receiving party name', required: true },
      { id: 'effective_date', label: 'Effective Date', value: '', type: 'date', placeholder: 'Select effective date', required: true },
      { id: 'contract_value', label: 'Duration (Years)', value: '2', type: 'number', placeholder: 'Enter duration in years', required: true },
      { id: 'governing_law', label: 'Governing Law', value: '', type: 'text', placeholder: 'e.g., State of California', required: true },
      { id: 'jurisdiction', label: 'Jurisdiction', value: '', type: 'text', placeholder: 'e.g., San Francisco County', required: true }
    ]
  }
}

function getPartnershipTemplate(): ContractTemplate {
  return getDefaultTemplate() // Placeholder
}

function getLicenseTemplate(): ContractTemplate {
  return getDefaultTemplate() // Placeholder
}

function getCustomTemplate(): ContractTemplate {
  return {
    ...getDefaultTemplate(),
    id: 'custom',
    name: 'Custom Template',
    content: `
      <h1 style="text-align: center; color: #1f2937; margin-bottom: 2rem;">CUSTOM AGREEMENT</h1>
      
      <p>This is a blank template. Start building your custom contract here.</p>
      
      <h2>1. INTRODUCTION</h2>
      <p>[Add your introduction here]</p>
      
      <h2>2. TERMS</h2>
      <p>[Add your terms here]</p>
      
      <h2>3. CONCLUSION</h2>
      <p>[Add your conclusion here]</p>
    `,
    fields: [
      { id: 'party_1', label: 'Party 1', value: '', type: 'text', placeholder: 'Enter first party name', required: true },
      { id: 'party_2', label: 'Party 2', value: '', type: 'text', placeholder: 'Enter second party name', required: true },
      { id: 'effective_date', label: 'Effective Date', value: '', type: 'date', placeholder: 'Select effective date', required: true }
    ]
  }
} 