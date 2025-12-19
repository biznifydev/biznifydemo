"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Upload, 
  Plus, 
  Search, 
  Filter,
  ArrowUpDown,
  Calendar,
  User,
  Building2,
  Shield,
  Users,
  Database,
  TrendingUp,
  FileCheck,
  Edit3,
  Trash2,
  Eye,
  Download
} from "lucide-react";

// Types
interface LegalRequirement {
  id: string;
  title: string;
  category: string;
  status: 'compliant' | 'due' | 'overdue' | 'not_started';
  deadline: string | null;
  responsible: string | null;
  documentUrl?: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  reviewDate?: string;
  notes?: string;
}

interface WizardQuestion {
  id: string;
  question: string;
  type: 'select' | 'number' | 'boolean' | 'text';
  options?: string[];
  category: string;
}

// Mock Data
const mockRequirements: LegalRequirement[] = [
  {
    id: "1",
    title: "Submit annual confirmation statement",
    category: "Corporate",
    status: "due",
    deadline: "2024-12-31",
    responsible: "John Smith",
    description: "Annual confirmation statement to Companies House",
    priority: "high",
    reviewDate: "2024-11-15"
  },
  {
    id: "2",
    title: "Have contracts for all employees",
    category: "Employment",
    status: "compliant",
    deadline: null,
    responsible: "HR Manager",
    documentUrl: "/documents/employment-contracts.pdf",
    description: "Employment contracts for all current employees",
    priority: "high"
  },
  {
    id: "3",
    title: "Register with ICO",
    category: "Data Protection",
    status: "overdue",
    deadline: "2024-10-15",
    responsible: "Data Protection Officer",
    description: "Register with Information Commissioner's Office",
    priority: "high"
  },
  {
    id: "4",
    title: "Submit SH01 for new shares",
    category: "Corporate",
    status: "not_started",
    deadline: "2024-11-30",
    responsible: "Company Secretary",
    description: "Statement of capital following share issue",
    priority: "medium"
  },
  {
    id: "5",
    title: "Review and update privacy policy",
    category: "Data Protection",
    status: "due",
    deadline: "2024-12-15",
    responsible: "Legal Team",
    description: "Annual review of privacy policy",
    priority: "medium",
    reviewDate: "2024-12-01"
  },
  {
    id: "6",
    title: "Conduct health and safety assessment",
    category: "Employment",
    status: "not_started",
    deadline: "2024-11-30",
    responsible: "Health & Safety Officer",
    description: "Workplace health and safety risk assessment",
    priority: "high"
  }
];

const wizardQuestions: WizardQuestion[] = [
  {
    id: "location",
    question: "Where is your business based?",
    type: "select",
    options: ["England & Wales", "Scotland", "Northern Ireland", "Outside UK"],
    category: "Corporate"
  },
  {
    id: "employees",
    question: "How many employees do you have?",
    type: "number",
    category: "Employment"
  },
  {
    id: "customer_data",
    question: "Do you collect customer data?",
    type: "boolean",
    category: "Data Protection"
  },
  {
    id: "investment",
    question: "Are you raising investment?",
    type: "boolean",
    category: "Corporate"
  },
  {
    id: "sector",
    question: "What sector are you in?",
    type: "select",
    options: ["Technology", "Finance", "Healthcare", "Retail", "Manufacturing", "Other"],
    category: "General"
  }
];

const suggestedRequirements = {
  "England & Wales": [
    "Submit annual confirmation statement",
    "File annual accounts",
    "Register for Corporation Tax"
  ],
  "Data Protection": [
    "Register with ICO",
    "Create privacy policy",
    "Implement data retention policy"
  ],
  "Employment": [
    "Have contracts for all employees",
    "Set up pension scheme",
    "Conduct health and safety assessment"
  ]
};

export default function LegalRequirementsPage() {
  const [requirements, setRequirements] = useState<LegalRequirement[]>(mockRequirements);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<LegalRequirement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showSearchRow, setShowSearchRow] = useState(false);
  const [showFilterRow, setShowFilterRow] = useState(false);

  // Wizard state
  const [wizardAnswers, setWizardAnswers] = useState<Record<string, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [suggestedItems, setSuggestedItems] = useState<string[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'due': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle2 className="h-4 w-4" />;
      case 'due': return <Clock className="h-4 w-4" />;
      case 'overdue': return <AlertCircle className="h-4 w-4" />;
      case 'not_started': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Corporate': return <Building2 className="h-4 w-4" />;
      case 'Employment': return <Users className="h-4 w-4" />;
      case 'Data Protection': return <Shield className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRequirements = useMemo(() => {
    return requirements.filter(req => {
      const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           req.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || req.category === selectedCategory;
      const matchesStatus = selectedStatus === "all" || req.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [requirements, searchTerm, selectedCategory, selectedStatus]);

  const handleWizardAnswer = (answer: any) => {
    setWizardAnswers(prev => ({ ...prev, [wizardQuestions[currentQuestionIndex].id]: answer }));
    
    if (currentQuestionIndex < wizardQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Generate suggestions based on answers
      const suggestions: string[] = [];
      
      if (wizardAnswers.location === "England & Wales") {
        suggestions.push(...suggestedRequirements["England & Wales"]);
      }
      if (wizardAnswers.customer_data) {
        suggestions.push(...suggestedRequirements["Data Protection"]);
      }
      if (wizardAnswers.employees > 0) {
        suggestions.push(...suggestedRequirements["Employment"]);
      }
      
      setSuggestedItems([...new Set(suggestions)]);
    }
  };

  const addSuggestedRequirement = (title: string) => {
    const newRequirement: LegalRequirement = {
      id: Date.now().toString(),
      title,
      category: "General",
      status: "not_started",
      deadline: null,
      responsible: null,
      description: `Added from wizard: ${title}`,
      priority: "medium"
    };
    
    setRequirements(prev => [...prev, newRequirement]);
    setSuggestedItems(prev => prev.filter(item => item !== title));
  };

  const updateRequirementStatus = (id: string, status: LegalRequirement['status']) => {
    setRequirements(prev => 
      prev.map(req => req.id === id ? { ...req, status } : req)
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No deadline";
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilDeadline = (dateString: string | null) => {
    if (!dateString) return null;
    const deadline = new Date(dateString);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

    const headerButtons = (
    <>
      <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-1">
        <FileCheck className="h-3 w-3" />
        <span>Requirements Checker</span>
      </button>
      
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogTrigger asChild>
          <button className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center space-x-1">
            <Plus className="h-3 w-3" />
            <span>Setup Wizard</span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Legal Requirements Setup Wizard</DialogTitle>
            <DialogDescription>
              Answer a few questions to get personalized legal requirement suggestions
            </DialogDescription>
          </DialogHeader>
          
          {currentQuestionIndex < wizardQuestions.length ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  {wizardQuestions[currentQuestionIndex].question}
                </h3>
                
                {wizardQuestions[currentQuestionIndex].type === 'select' && (
                  <div className="space-y-2">
                    {wizardQuestions[currentQuestionIndex].options?.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleWizardAnswer(option)}
                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
                
                {wizardQuestions[currentQuestionIndex].type === 'number' && (
                  <div className="space-y-2">
                    <Input
                      type="number"
                      placeholder="Enter number"
                      onChange={(e) => handleWizardAnswer(parseInt(e.target.value))}
                    />
                    <Button onClick={() => handleWizardAnswer(wizardAnswers[wizardQuestions[currentQuestionIndex].id])}>
                      Next
                    </Button>
                  </div>
                )}
                
                {wizardQuestions[currentQuestionIndex].type === 'boolean' && (
                  <div className="flex space-x-3">
                    <Button onClick={() => handleWizardAnswer(true)}>
                      Yes
                    </Button>
                    <Button variant="outline" onClick={() => handleWizardAnswer(false)}>
                      No
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Suggested Legal Requirements</h3>
              <div className="space-y-3">
                {suggestedItems.map((item) => (
                  <div key={item} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <span>{item}</span>
                    <Button 
                      size="sm" 
                      onClick={() => addSuggestedRequirement(item)}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsWizardOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded-md hover:bg-gray-800 transition-colors flex items-center space-x-1"
      >
        <Plus className="h-3 w-3" />
        <span>Add Requirement</span>
      </button>
    </>
  )

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "compliant", label: "Compliant" },
    { value: "due", label: "Due" },
    { value: "overdue", label: "Overdue" },
    { value: "not_started", label: "Not Started" }
  ]

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "Corporate", label: "Corporate" },
    { value: "Employment", label: "Employment" },
    { value: "Data Protection", label: "Data Protection" }
  ]

  return (
    <PageWrapper
      title="Legal Requirements"
      headerButtons={headerButtons}
    >
      <div className="space-y-4">
        {/* Requirements Table */}
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              {/* Filter Bar Header Row */}
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <td colSpan={6} className="p-0">
                    <div className="flex items-center justify-between p-2">
                      {/* Left Section - Status Filters */}
                      <div className="flex items-center space-x-3">
                        {statusOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setSelectedStatus(option.value)}
                            className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                              selectedStatus === option.value
                                ? "bg-gray-200 text-gray-900"
                                : "text-gray-700 hover:text-gray-900"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                        <button className="text-gray-700 hover:text-gray-900 text-sm font-medium">
                          +
                        </button>
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
                    <td colSpan={6} className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search requirements by title or description..."
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
                    <td colSpan={6} className="p-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                          <select 
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            {categoryOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                          <select 
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            {statusOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Table Headers */}
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left p-4 text-sm font-medium text-gray-700 border-r border-gray-200">Requirement</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700 border-r border-gray-200">Category</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700 border-r border-gray-200">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700 border-r border-gray-200">Deadline</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700 border-r border-gray-200">Responsible</th>
                  <th className="text-left p-4 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequirements.map((requirement) => {
                  const daysUntilDeadline = getDaysUntilDeadline(requirement.deadline);
                  
                  return (
                    <tr key={requirement.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-4 border-r border-gray-200">
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{requirement.title}</div>
                          <div className="text-xs text-gray-600 mt-1">{requirement.description}</div>
                        </div>
                      </td>
                      <td className="p-4 border-r border-gray-200">
                        <div className="flex items-center space-x-2">
                          {getCategoryIcon(requirement.category)}
                          <span className="text-sm text-gray-700">{requirement.category}</span>
                        </div>
                      </td>
                      <td className="p-4 border-r border-gray-200">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(requirement.status)}
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(requirement.status)}`}>
                            {requirement.status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 border-r border-gray-200">
                        {requirement.deadline ? (
                          <div className="text-sm">
                            <div className="text-gray-900">{formatDate(requirement.deadline)}</div>
                            {daysUntilDeadline !== null && (
                              <div className={`text-xs ${daysUntilDeadline < 0 ? 'text-red-600' : daysUntilDeadline <= 7 ? 'text-yellow-600' : 'text-green-600'}`}>
                                {daysUntilDeadline < 0 ? `${Math.abs(daysUntilDeadline)} days overdue` : `${daysUntilDeadline} days left`}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No deadline</span>
                        )}
                      </td>
                      <td className="p-4 border-r border-gray-200">
                        {requirement.responsible ? (
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{requirement.responsible}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Unassigned</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {requirement.documentUrl && (
                            <button className="p-1.5 bg-gray-100 rounded-md border border-gray-200 hover:bg-gray-200 transition-colors">
                              <Eye className="h-3 w-3 text-gray-700" />
                            </button>
                          )}
                          
                          <button className="p-1.5 bg-gray-100 rounded-md border border-gray-200 hover:bg-gray-200 transition-colors">
                            <Upload className="h-3 w-3 text-gray-700" />
                          </button>
                          
                          <button className="p-1.5 bg-gray-100 rounded-md border border-gray-200 hover:bg-gray-200 transition-colors">
                            <Edit3 className="h-3 w-3 text-gray-700" />
                          </button>
                          
                          <select
                            value={requirement.status}
                            onChange={(e) => updateRequirementStatus(requirement.id, e.target.value as LegalRequirement['status'])}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="not_started">Not Started</option>
                            <option value="due">Due</option>
                            <option value="overdue">Overdue</option>
                            <option value="compliant">Compliant</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredRequirements.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No requirements found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Requirement Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Legal Requirement</DialogTitle>
            <DialogDescription>
              Add a new legal requirement to track
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Enter requirement title" />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Enter description" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <select id="category" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="Corporate">Corporate</option>
                  <option value="Employment">Employment</option>
                  <option value="Data Protection">Data Protection</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select id="priority" className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" type="date" />
              </div>
              
              <div>
                <Label htmlFor="responsible">Responsible Person</Label>
                <Input id="responsible" placeholder="Enter responsible person" />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button>
              Add Requirement
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  );
} 