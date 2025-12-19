"use client"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { SubHeader } from "@/components/layout/SubHeader"
import { useState } from "react"
import { Upload, Edit2, Trash2, Download, Eye, Plus, Palette, FileText, Image, ChevronDown, ChevronRight, Save, X, Search, Filter, ArrowUpDown } from "lucide-react"

export default function BrandStorePage() {
  const [activeTab, setActiveTab] = useState("logos")
  const [editingColor, setEditingColor] = useState<string | null>(null)
  const [editingGuideline, setEditingGuideline] = useState<string | null>(null)
  const [expandedGuidelines, setExpandedGuidelines] = useState<string[]>([])
  const [isAddingColor, setIsAddingColor] = useState(false)
  const [isAddingGuideline, setIsAddingGuideline] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showSearchRow, setShowSearchRow] = useState(false)
  const [showFilterRow, setShowFilterRow] = useState(false)
  const [selectedType, setSelectedType] = useState("")
  const [selectedFormat, setSelectedFormat] = useState("")
  
  const brandTabs = [
    { id: "logos", label: "Logos" },
    { id: "colors", label: "Colors" },
    { id: "guidelines", label: "Brand Guidelines" },
  ]

  const mockLogos = [
    {
      id: "logo1",
      name: "Biznify Primary Logo",
      type: "Primary",
      format: "SVG",
      size: "2.4 MB",
      uploaded: "2024-03-01",
      preview: "/images/image.png",
      description: "Main company logo with full color"
    },
    {
      id: "logo2",
      name: "Biznify Logo - White",
      type: "Secondary",
      format: "PNG",
      size: "1.8 MB",
      uploaded: "2024-03-05",
      preview: "/images/image.png",
      description: "White version for dark backgrounds"
    },
    {
      id: "logo3",
      name: "Biznify Icon",
      type: "Icon",
      format: "SVG",
      size: "0.5 MB",
      uploaded: "2024-03-10",
      preview: "/images/image.png",
      description: "Square icon for favicon and small spaces"
    },
    {
      id: "logo4",
      name: "Biznify Logo - Black",
      type: "Secondary",
      format: "PNG",
      size: "1.8 MB",
      uploaded: "2024-03-12",
      preview: "/images/image.png",
      description: "Black version for light backgrounds"
    }
  ]

  const mockColors = [
    {
      id: "dark-blue",
      name: "Dark Blue",
      hex: "#13294B",
      cmyk: "100, 80, 0, 70",
      pms: "2767",
      category: "Primary"
    },
    {
      id: "light-gray",
      name: "Light Gray",
      hex: "#C4C9D2",
      cmyk: "20, 10, 10, 20",
      pms: "429",
      category: "Secondary"
    },
    {
      id: "dark-purple",
      name: "Dark Purple",
      hex: "#2E008B",
      cmyk: "100, 95, 0, 0",
      pms: "2736",
      category: "Secondary"
    },
    {
      id: "light-yellow",
      name: "Light Yellow",
      hex: "#FBD872",
      cmyk: "0, 10, 60, 0",
      pms: "1215",
      category: "Accent"
    },
    {
      id: "coral",
      name: "Coral",
      hex: "#F8485E",
      cmyk: "0, 80, 50, 0",
      pms: "1785",
      category: "Accent"
    }
  ]

  const colorUsageRules = [
    "It is essential to follow the rules of these proportions when creating any brand communication to maintain brand consistency.",
    "Dark Blue plays a significant role in all brand communications and should provide balance with other colors.",
    "The secondary colors are only used reasonably for illustrations and within specific contexts.",
    "Light Yellow and Coral should be used sparingly as accent colors to draw attention to important elements.",
    "Light Gray should be used for backgrounds and secondary text to maintain readability."
  ]

  const typeOptions = ["Primary", "Secondary", "Icon"]
  const formatOptions = ["SVG", "PNG", "JPG", "PDF"]

  const filteredLogos = mockLogos.filter((logo) => {
    const matchesSearch = logo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         logo.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !selectedType || logo.type === selectedType
    const matchesFormat = !selectedFormat || logo.format === selectedFormat
    return matchesSearch && matchesType && matchesFormat
  })

  const mockGuidelines = [
    {
      id: "company-overview",
      title: "Company Overview",
      category: "Company",
      content: "Biznify is a modern business management platform designed to streamline operations for growing companies. Our brand represents innovation, reliability, and simplicity.\n\nKey brand values:\n• Innovation in business solutions\n• Reliability and trustworthiness\n• Simplicity in design and functionality\n• Growth and scalability"
    },
    {
      id: "logo-usage",
      title: "Logo Usage Guidelines",
      category: "Logo",
      content: "Our logo is the cornerstone of our brand identity and must be used consistently across all applications.\n\nClear Space: Maintain clear space equal to the height of the 'B' in Biznify around all sides of the logo.\n\nMinimum Size: The logo should never be smaller than 24px in height for digital applications.\n\nBackground: Use the full-color logo on white or light backgrounds. Use the white version on dark backgrounds.\n\nDon't: Never stretch, rotate, or modify the logo colors. Don't add effects like shadows or gradients."
    },
    {
      id: "color-palette",
      title: "Color Palette",
      category: "Color",
      content: "Our color palette is designed to create a professional and trustworthy brand presence.\n\nPrimary Blue (#3B82F6): Use for main actions, buttons, and brand elements.\nSecondary Purple (#8B5CF6): Use for accents and secondary actions.\n\nStatus Colors:\n• Success Green (#10B981): Positive feedback and confirmations\n• Warning Orange (#F59E0B): Cautions and warnings\n• Error Red (#EF4444): Errors and destructive actions\n\nNeutral Gray (#6B7280): Text, borders, and secondary information."
    },
    {
      id: "typography",
      title: "Typography",
      category: "Typography",
      content: "Typography plays a crucial role in maintaining brand consistency and readability.\n\nPrimary Font: Inter for all digital applications\nSecondary Font: System fonts as fallback\n\nHeading Hierarchy:\n• H1: 32px, Bold, Primary Blue\n• H2: 24px, Semibold, Dark Gray\n• H3: 20px, Semibold, Dark Gray\n• H4: 16px, Medium, Dark Gray\n\nBody Text: 14px, Regular, Neutral Gray\nSmall Text: 12px, Regular, Light Gray\n\nLine Height: 1.5 for body text, 1.2 for headings"
    },
    {
      id: "spacing",
      title: "Spacing & Layout",
      category: "Layout",
      content: "Consistent spacing creates a clean and professional appearance.\n\nSpacing Scale:\n• 4px: Small gaps and padding\n• 8px: Standard padding\n• 16px: Section spacing\n• 24px: Component spacing\n• 32px: Page margins\n• 48px: Large section breaks\n\nGrid System: Use 8px grid for all layouts\nContainer Width: Maximum 1200px for desktop\nResponsive Breakpoints: 768px, 1024px, 1280px"
    },
    {
      id: "imagery",
      title: "Imagery & Photography",
      category: "Imagery",
      content: "Our imagery should reflect our brand values and target audience.\n\nStyle: Clean, modern, and professional\nMood: Confident, approachable, and innovative\n\nPhotography Guidelines:\n• Use high-quality, well-lit images\n• Prefer natural lighting over artificial\n• Include diverse representation\n• Focus on business and technology themes\n\nIcon Style: Simple, outlined icons with consistent stroke width\nIllustrations: Minimal, geometric style with brand colors"
    }
  ]

  const headerButtons = (
    <>
      <button className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors flex items-center space-x-1">
        <Upload className="h-3 w-3" />
        <span>Upload Asset</span>
      </button>
    </>
  )

  const toggleGuideline = (guidelineId: string) => {
    setExpandedGuidelines(prev => 
      prev.includes(guidelineId) 
        ? prev.filter(id => id !== guidelineId)
        : [...prev, guidelineId]
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case "logos":
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    {/* Filter Bar Header Row */}
                    <tr className="bg-white border-b border-gray-200">
                      <td colSpan={7} className="p-0">
                        <div className="flex items-center justify-between p-2">
                          {/* Left Section - Type Filters */}
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setSelectedType("")}
                              className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                                selectedType === ""
                                  ? "bg-gray-200 text-gray-900"
                                  : "text-gray-700 hover:text-gray-900"
                              }`}
                            >
                              All
                            </button>
                            {typeOptions.map((type) => (
                              <button
                                key={type}
                                onClick={() => setSelectedType(selectedType === type ? "" : type)}
                                className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                                  selectedType === type
                                    ? "bg-gray-200 text-gray-900"
                                    : "text-gray-700 hover:text-gray-900"
                                }`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>

                          {/* Right Section - Action Icons */}
                          <div className="flex items-center space-x-1">
                            <button 
                              onClick={() => setShowSearchRow(!showSearchRow)}
                              className={`p-1.5 rounded-md border border-gray-200 transition-colors ${
                                showSearchRow 
                                  ? "bg-purple-100 border-purple-200" 
                                  : "bg-gray-100 hover:bg-gray-200"
                              }`}
                            >
                              <Search className="h-3 w-3 text-gray-700" />
                            </button>
                            <button 
                              onClick={() => setShowFilterRow(!showFilterRow)}
                              className={`p-1.5 rounded-md border border-gray-200 transition-colors ${
                                showFilterRow 
                                  ? "bg-purple-100 border-purple-200" 
                                  : "bg-gray-100 hover:bg-gray-200"
                              }`}
                            >
                              <Filter className="h-3 w-3 text-gray-700" />
                            </button>
                            <button className="p-1.5 bg-gray-100 rounded-md border border-gray-200 hover:bg-gray-200 transition-colors">
                              <ArrowUpDown className="h-3 w-3 text-gray-700" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Search Row */}
                    {showSearchRow && (
                      <tr className="bg-purple-50 border-b border-purple-200">
                        <td colSpan={7} className="p-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                                <input
                                  type="text"
                                  placeholder="Search logos by name or description..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                            <button 
                              onClick={() => setShowSearchRow(false)}
                              className="text-xs text-gray-600 hover:text-gray-800"
                            >
                              Close
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Filter Row */}
                    {showFilterRow && (
                      <tr className="bg-purple-50 border-b border-purple-200">
                        <td colSpan={7} className="p-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Format</label>
                              <select 
                                value={selectedFormat}
                                onChange={(e) => setSelectedFormat(e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              >
                                <option value="">All Formats</option>
                                {formatOptions.map((format) => (
                                  <option key={format} value={format}>{format}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Upload Date</label>
                              <select className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                                <option value="">All Time</option>
                                <option value="7d">Last 7 days</option>
                                <option value="30d">Last 30 days</option>
                                <option value="90d">Last 90 days</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex justify-end mt-3">
                            <button 
                              onClick={() => setShowFilterRow(false)}
                              className="text-xs text-gray-600 hover:text-gray-800"
                            >
                              Close
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                    
                    {/* Table Headers */}
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs">Preview</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs">Logo Name</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs">Type</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs">Format</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs">Size</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs">Uploaded</th>
                      <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogos.length > 0 ? (
                      filteredLogos.map((logo) => (
                        <tr key={logo.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-3">
                            <div className="w-16 h-12 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                              <img src={logo.preview} alt={logo.name} className="max-w-full max-h-full object-contain" />
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{logo.name}</div>
                              <div className="text-xs text-gray-500">{logo.description}</div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              logo.type === "Primary" ? "bg-blue-50 text-blue-700" :
                              logo.type === "Secondary" ? "bg-purple-50 text-purple-700" :
                              "bg-gray-50 text-gray-700"
                            }`}>
                              {logo.type}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-sm text-gray-900">{logo.format}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-sm text-gray-900">{logo.size}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-sm text-gray-900">{new Date(logo.uploaded).toLocaleDateString()}</span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-2">
                              <button className="text-gray-400 hover:text-blue-600 p-1">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-gray-400 hover:text-green-600 p-1">
                                <Download className="h-4 w-4" />
                              </button>
                              <button className="text-gray-400 hover:text-red-600 p-1">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-gray-500">
                          No logos found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      case "colors":
        return (
          <div className="space-y-6">
            {/* Color Palette */}
            <div className="bg-white rounded-md border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Brand Color Palette</h3>
                <button 
                  onClick={() => setIsAddingColor(true)}
                  className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors flex items-center space-x-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add Color</span>
                </button>
              </div>
              
              {/* Color Swatches Row */}
              <div className="flex gap-4 mb-8">
                {mockColors.map((color) => (
                  <div key={color.id} className="flex-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {/* Color Swatch */}
                    <div 
                      className="h-32 w-full relative flex items-end justify-center pb-2"
                      style={{ backgroundColor: color.hex }}
                    >
                      <div className="text-white text-xs font-mono bg-black/20 px-2 py-1 rounded">
                        {color.hex}
                      </div>
                    </div>
                    
                    {/* Color Information */}
                    <div className="p-3">
                      <div className="text-center space-y-1">
                        <div className="text-xs font-mono text-gray-900">CMYK: {color.cmyk}</div>
                        <div className="text-xs font-mono text-gray-900">PMS: {color.pms}</div>
                        <div className="text-xs font-medium text-gray-700">{color.name}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Usage Proportions */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Usage Proportions</h4>
                <div className="space-y-3">
                  {colorUsageRules.map((rule, index) => (
                    <p key={index} className="text-sm text-gray-700 leading-relaxed">
                      {rule}
                    </p>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1">
                    <Edit2 className="h-3 w-3" />
                    <span>Edit Rules</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      case "guidelines":
        return (
          <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Brand Guidelines</h3>
              <button 
                onClick={() => setIsAddingGuideline(true)}
                className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors flex items-center space-x-1"
              >
                <Plus className="h-3 w-3" />
                <span>Add Guideline</span>
              </button>
            </div>

            {/* Accordion Guidelines */}
            <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
              {mockGuidelines.map((guideline) => (
                <div key={guideline.id} className="border-b border-gray-200 last:border-b-0">
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleGuideline(guideline.id)}
                    className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
                      expandedGuidelines.includes(guideline.id) ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 border-2 border-dashed border-gray-400 rounded-full"></div>
                      <h3 className="font-semibold text-gray-900 text-sm">{guideline.title}</h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        guideline.category === "Company" ? "bg-blue-50 text-blue-700" :
                        guideline.category === "Logo" ? "bg-purple-50 text-purple-700" :
                        guideline.category === "Color" ? "bg-green-50 text-green-700" :
                        guideline.category === "Typography" ? "bg-orange-50 text-orange-700" :
                        guideline.category === "Layout" ? "bg-indigo-50 text-indigo-700" :
                        guideline.category === "Imagery" ? "bg-pink-50 text-pink-700" :
                        "bg-gray-50 text-gray-700"
                      }`}>
                        {guideline.category}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingGuideline(editingGuideline === guideline.id ? null : guideline.id)
                        }}
                        className="text-gray-400 hover:text-blue-600 p-1"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      {expandedGuidelines.includes(guideline.id) ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </button>
                  
                  {/* Accordion Content */}
                  {expandedGuidelines.includes(guideline.id) && (
                    <div className="px-4 pb-4 bg-gray-50">
                      {editingGuideline === guideline.id ? (
                        <div className="space-y-3 pt-3">
                          <textarea 
                            value={guideline.content}
                            rows={4}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter guideline content"
                          />
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => setEditingGuideline(null)}
                              className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                            <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors">
                              Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4 pt-3">
                          <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                            {guideline.content}
                          </div>
                          <div className="flex justify-start">
                            <button className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-1">
                              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <span>Copy Text</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <PageWrapper
      title="Brand Store" 
      headerButtons={headerButtons}
      subHeader={<SubHeader tabs={brandTabs} activeTab={activeTab} onTabChange={setActiveTab} />}
    >
      {renderContent()}
    </PageWrapper>
  )
}