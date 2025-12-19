"use client"

import { PageWrapper } from "@/components/layout/PageWrapper"
import { SubHeader } from "@/components/layout/SubHeader"
import { useState, useEffect, useMemo } from "react"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { Search, Filter, ChevronLeft, FileText, User, Check, X, Mail, Phone, Plus, Building2 } from "lucide-react"
import { RecruitmentService } from "@/lib/services/recruitmentService"
import {
  JobPosting,
  Candidate,
  Interview,
  PipelineStage,
  JobStats,
  PipelineStats,
  InterviewStats,
  CandidateWithRelations,
  InterviewWithRelations
} from "@/lib/types/recruitment"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  RowSelectionState,
} from "@tanstack/react-table"

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState("candidates")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedRequisitions, setSelectedRequisitions] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [showOnlyOpenReqs, setShowOnlyOpenReqs] = useState(false)
  const [showOnlyActiveCandidates, setShowOnlyActiveCandidates] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithRelations | null>(null)
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<InterviewWithRelations | null>(null)
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false)
  const [isAddInterviewModalOpen, setIsAddInterviewModalOpen] = useState(false)
  const [pipelineSearch, setPipelineSearch] = useState("")
  const [selectedPipelineRole, setSelectedPipelineRole] = useState("all")
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null)
  const [isJobModalOpen, setIsJobModalOpen] = useState(false)
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false)
  const [jobModalTab, setJobModalTab] = useState("details")
  const [jobSearch, setJobSearch] = useState("")
  const [selectedJobStatus, setSelectedJobStatus] = useState("all")
  const [selectedJobDepartment, setSelectedJobDepartment] = useState("all")

  // Database state
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([])
  const [candidates, setCandidates] = useState<CandidateWithRelations[]>([])
  const [interviews, setInterviews] = useState<InterviewWithRelations[]>([])
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([])
  const [jobStats, setJobStats] = useState<JobStats>({ total: 0, open: 0, closed: 0, draft: 0, totalApplications: 0, totalInterviews: 0, totalHired: 0 })
  const [pipelineStats, setPipelineStats] = useState<PipelineStats>({ totalCandidates: 0, candidatesByStage: {} })
  const [interviewStats, setInterviewStats] = useState<InterviewStats>({ scheduled: 0, completed: 0, cancelled: 0, total: 0 })
  const [isLoading, setIsLoading] = useState(true)

  // TanStack Table row selection
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  
  // Column helper for TanStack Table
  const columnHelper = createColumnHelper<CandidateWithRelations>()
  
  const columns = useMemo(() => [
    columnHelper.display({
      id: 'select',
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <input
            type="checkbox"
            className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
    }),
    columnHelper.accessor('first_name', {
      header: 'Candidate Name',
      cell: ({ row }) => (
        <span className="font-medium text-gray-900 text-xs truncate block">
          {`${row.original.first_name} ${row.original.last_name}`}
        </span>
      ),
    }),
    columnHelper.accessor('position', {
      header: 'Position',
      cell: ({ getValue }) => (
        <span className="text-xs text-gray-900 truncate block">
          {getValue() || "No position"}
        </span>
      ),
    }),
    columnHelper.accessor('company', {
      header: 'Company',
      cell: ({ getValue }) => (
        <span className="text-xs text-gray-900 truncate block">
          {getValue() || "No company"}
        </span>
      ),
    }),
    columnHelper.accessor('job_posting.title', {
      header: 'Job Title',
      cell: ({ getValue }) => (
        <span className="text-xs text-gray-900 truncate block">
          {getValue() || "No job"}
        </span>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ getValue }) => (
        <span className={`text-xs font-medium text-gray-900 truncate block ${getStatusColor(getValue())}`}>
          {getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: ({ getValue }) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium truncate ${
          getValue() === 'Internal' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {getValue()}
        </span>
      ),
    }),
    columnHelper.accessor('source', {
      header: 'Source',
      cell: ({ getValue }) => (
        <span className="text-xs text-gray-900 truncate block">
          {getValue() || "No source"}
        </span>
      ),
    }),
    columnHelper.accessor('created_at', {
      header: 'Applied Date',
      cell: ({ getValue }) => (
        <span className="text-xs text-gray-900 truncate block">
          {RecruitmentService.formatDate(getValue())}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <button className="text-gray-400 hover:text-gray-600">
          <Search className="h-3 w-3" />
        </button>
      ),
    }),
  ], [])
  
  const table = useReactTable({
    data: candidates,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
  })

  // Load data from database
  const loadData = async () => {
    try {
      setIsLoading(true)
      const [jobPostingsData, candidatesData, interviewsData, pipelineStagesData, jobStatsData, pipelineStatsData, interviewStatsData] = await Promise.all([
        RecruitmentService.getJobPostings(),
        RecruitmentService.getCandidates(),
        RecruitmentService.getInterviews(),
        RecruitmentService.getPipelineStages(),
        RecruitmentService.getJobStats(),
        RecruitmentService.getPipelineStats(),
        RecruitmentService.getInterviewStats()
      ])

      setJobPostings(jobPostingsData)
      setCandidates(candidatesData)
      setInterviews(interviewsData)
      setPipelineStages(pipelineStagesData)
      setJobStats(jobStatsData)
      setPipelineStats(pipelineStatsData)
      setInterviewStats(interviewStatsData)
    } catch (error) {
      console.error('Error loading recruitment data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  
  const recruitmentTabs = [
    { id: "candidates", label: "Candidates" },
    { id: "jobs", label: "Job Postings" },
    { id: "interviews", label: "Interviews" },
    { id: "pipeline", label: "Pipeline" },
  ]

  const headerButtons = (
    <>
      {activeTab === "jobs" && (
        <button 
          onClick={() => setIsAddJobModalOpen(true)}
          className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors"
        >
          + Post Job
        </button>
      )}
      {activeTab !== "jobs" && (
    <>
      <button className="px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors border border-gray-200 flex items-center space-x-1">
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <span>Post Job</span>
      </button>
      <button className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-900 transition-colors">
        + Add New
      </button>
        </>
      )}
    </>
  )

  const requisitions = [
    { id: "REQ151", title: "Sales Exe.", count: 12 },
    { id: "REQ150", title: "Sales Rep.", count: 32 },
    { id: "REQ123", title: "Marketer", count: 22 },
    { id: "REQ412", title: "Account.", count: 8 },
    { id: "REQ368", title: "Sales Man.", count: 17 },
  ]

  const candidateStatuses = [
    { id: "background-check", label: "Background Check", count: 32 },
    { id: "first-interview", label: "First Interview", count: 48 },
    { id: "in-review", label: "In Review", count: 28 },
    { id: "invited-to-apply", label: "Invited to Apply", count: 104 },
    { id: "new-submissions", label: "New Submissions", count: 276 },
    { id: "offer", label: "Offer", count: 42 },
    { id: "second-interview", label: "Second Interview", count: 39 },
  ]

  const mockInterviews = [
    {
      id: "INT001",
      candidate: {
        name: "Caleb Poole",
        position: "Sales Representative",
        avatar: "CP"
      },
      requisition: { title: "Marketer", id: "REQ123" },
      interviewer: "Sarah Johnson",
      type: "First Interview",
      status: "Scheduled",
      date: "2024-01-15",
      time: "10:00 AM",
      duration: "45 min",
      location: "Conference Room A",
      notes: "Focus on sales experience and team collaboration",
      feedback: null
    },
    {
      id: "INT002",
      candidate: {
        name: "John Smith",
        position: "Sales Representative",
        avatar: "JS"
      },
      requisition: { title: "Sales Manager", id: "REQ368" },
      interviewer: "Mike Chen",
      type: "Second Interview",
      status: "Completed",
      date: "2024-01-12",
      time: "2:00 PM",
      duration: "60 min",
      location: "Virtual",
      notes: "Technical assessment and leadership discussion",
      feedback: "Strong technical skills, good communication. Recommend moving to final round."
    },
    {
      id: "INT003",
      candidate: {
        name: "Lee Murray",
        position: "Sales Representative",
        avatar: "LM"
      },
      requisition: { title: "Marketer", id: "REQ123" },
      interviewer: "Emily Davis",
      type: "First Interview",
      status: "Cancelled",
      date: "2024-01-14",
      time: "11:30 AM",
      duration: "45 min",
      location: "Conference Room B",
      notes: "Rescheduled due to candidate availability",
      feedback: null
    },
    {
      id: "INT004",
      candidate: {
        name: "James Oliver",
        position: "Sales Representative",
        avatar: "JO"
      },
      requisition: { title: "Account Manager", id: "REQ412" },
      interviewer: "David Wilson",
      type: "Final Interview",
      status: "Scheduled",
      date: "2024-01-18",
      time: "3:00 PM",
      duration: "90 min",
      location: "Board Room",
      notes: "Final round with leadership team",
      feedback: null
    }
  ]



  const pipelineCandidates = [
    {
      id: "PIPE001",
      name: "Caleb Poole",
      position: "Sales Representative",
      avatar: "CP",
      requisition: { title: "Marketer", id: "REQ123" },
      stage: "first-interview",
      appliedDate: "2024-01-05",
      lastActivity: "2024-01-12",
      email: "cpoole@gmail.com",
      phone: "(310) 456-1098",
      source: "Monster"
    },
    {
      id: "PIPE002",
      name: "John Smith",
      position: "Sales Representative",
      avatar: "JS",
      requisition: { title: "Sales Manager", id: "REQ368" },
      stage: "second-interview",
      appliedDate: "2024-01-03",
      lastActivity: "2024-01-10",
      email: "jsmith@yahoo.com",
      phone: "(800) 123-4567",
      source: "Career Builder"
    },
    {
      id: "PIPE003",
      name: "Lee Murray",
      position: "Sales Representative",
      avatar: "LM",
      requisition: { title: "Marketer", id: "REQ123" },
      stage: "screening",
      appliedDate: "2024-01-08",
      lastActivity: "2024-01-11",
      email: "lmurray@gmail.com",
      phone: "(818) 246-9090",
      source: "Monster"
    },
    {
      id: "PIPE004",
      name: "James Oliver",
      position: "Sales Representative",
      avatar: "JO",
      requisition: { title: "Account Manager", id: "REQ412" },
      stage: "offer",
      appliedDate: "2024-01-02",
      lastActivity: "2024-01-09",
      email: "jamesoliver@oliver.com",
      phone: "(323) 680-1234",
      source: "LinkedIn"
    },
    {
      id: "PIPE005",
      name: "Emma Wilson",
      position: "Marketing Specialist",
      avatar: "EW",
      requisition: { title: "Marketer", id: "REQ123" },
      stage: "applied",
      appliedDate: "2024-01-13",
      lastActivity: "2024-01-13",
      email: "ewilson@email.com",
      phone: "(555) 123-4567",
      source: "Indeed"
    },
    {
      id: "PIPE006",
      name: "Michael Brown",
      position: "Sales Director",
      avatar: "MB",
      requisition: { title: "Sales Manager", id: "REQ368" },
      stage: "final-interview",
      appliedDate: "2024-01-01",
      lastActivity: "2024-01-08",
      email: "mbrown@company.com",
      phone: "(555) 987-6543",
      source: "LinkedIn"
    },
    {
      id: "PIPE007",
      name: "Sarah Davis",
      position: "Account Executive",
      avatar: "SD",
      requisition: { title: "Account Manager", id: "REQ412" },
      stage: "hired",
      appliedDate: "2023-12-20",
      lastActivity: "2024-01-05",
      email: "sdavis@email.com",
      phone: "(555) 456-7890",
      source: "Monster"
    },
    {
      id: "PIPE008",
      name: "David Lee",
      position: "Sales Representative",
      avatar: "DL",
      requisition: { title: "Marketer", id: "REQ123" },
      stage: "rejected",
      appliedDate: "2024-01-06",
      lastActivity: "2024-01-10",
      email: "dlee@email.com",
      phone: "(555) 789-0123",
      source: "Career Builder"
    }
  ]

  const mockCandidates = [
    {
      id: "CAN001",
      name: "Caleb Poole",
      position: "Sales Representative",
      company: "Acme",
      email: "cpoole@gmail.com",
      phone: "(310) 456-1098",
      location: "Santa Monica, California, United States",
      requisition: { title: "Marketer", id: "REQ123" },
      status: "Background Check",
      statusUpdated: "2 days ago",
      type: "Internal",
      source: "Monster",
      submissionDate: "1/1/2018"
    },
    {
      id: "CAN002",
      name: "John Smith",
      position: "Sales Representative",
      company: "Acme",
      email: "jsmith@yahoo.com",
      phone: "(800) 123-4567",
      location: "Hollywood, California, United States",
      requisition: { title: "Sales Manager", id: "REQ368" },
      status: "In Review",
      statusUpdated: "10 days ago",
      type: "External",
      source: "Career Builder",
      submissionDate: "12/16/2017"
    },
    {
      id: "CAN003",
      name: "Lee Murray",
      position: "Sales Representative",
      company: "Acme",
      email: "lmurray@gmail.com",
      phone: "(818) 246-9090",
      location: "Scranton, Pennsylvania, United States",
      requisition: { title: "Marketer", id: "REQ123" },
      status: "Interview",
      statusUpdated: "1 days ago",
      type: "Internal",
      source: "Monster",
      submissionDate: "12/28/2017"
    },
    {
      id: "CAN004",
      name: "James Oliver",
      position: "Sales Representative",
      company: "Acme",
      email: "jamesoliver@oliver.com",
      phone: "(323) 680-1234",
      location: "New York, New York, United States",
      requisition: { title: "Account Manager", id: "REQ412" },
      status: "Background Check",
      statusUpdated: "2 days ago",
      type: "External",
      source: "Monster",
      submissionDate: "1/3/2018"
    },
    {
      id: "CAN005",
      name: "Brandon French",
      position: "Sales Representative",
      company: "Acme",
      email: "bfrench@yahoo.com",
      phone: "(800) 123-4567",
      location: "Dallas, Texas, United States",
      requisition: { title: "Coordinator", id: "REQ909" },
      status: "Interview",
      statusUpdated: "1 days ago",
      type: "External",
      source: "Career Builder",
      submissionDate: "1/2/2018"
    },
    {
      id: "CAN006",
      name: "Cornelius Singleton",
      position: "Sales Representative",
      company: "Acme",
      email: "csingleton@gmail.com",
      phone: "(626) 793-4973",
      location: "Pasadena, California, United States",
      requisition: { title: "Marketer", id: "REQ123" },
      status: "Offer Letter",
      statusUpdated: "10 days ago",
      type: "Internal",
      source: "Monster",
      submissionDate: "1/1/2018"
    },
    {
      id: "CAN007",
      name: "Fred Valdez",
      position: "Sales Representative",
      company: "Acme",
      email: "fredvaldez@gmail.com",
      phone: "(800) 123-4567",
      location: "San Francisco, California, United States",
      requisition: { title: "Sales Manager", id: "REQ368" },
      status: "In Review",
      statusUpdated: "3 days ago",
      type: "Internal",
      source: "Monster",
      submissionDate: "12/24/2017"
    }
  ]

  const mockJobs = [
    {
      id: "REQ151",
      title: "Sales Executive",
      department: "Sales",
      location: "New York, NY",
      type: "Full-time",
      status: "Open",
      postedDate: "2024-01-05",
      closingDate: "2024-02-05",
      applications: 12,
      interviews: 8,
      offers: 2,
      hired: 1,
      salary: "$75,000 - $95,000",
      description: "We are seeking a dynamic Sales Executive to join our growing team. The ideal candidate will have 3+ years of B2B sales experience and a proven track record of exceeding targets.",
      requirements: [
        "3+ years of B2B sales experience",
        "Proven track record of exceeding sales targets",
        "Excellent communication and presentation skills",
        "Bachelor's degree in Business or related field",
        "Experience with CRM systems (Salesforce preferred)"
      ],
      responsibilities: [
        "Develop and maintain relationships with key clients",
        "Achieve monthly and quarterly sales targets",
        "Conduct product demonstrations and presentations",
        "Collaborate with marketing team on lead generation",
        "Prepare and deliver sales proposals"
      ],
      benefits: [
        "Competitive salary with commission structure",
        "Health, dental, and vision insurance",
        "401(k) with company match",
        "Flexible work arrangements",
        "Professional development opportunities"
      ],
      hiringManager: "Sarah Johnson",
      recruiter: "Mike Chen"
    },
    {
      id: "REQ150",
      title: "Sales Representative",
      department: "Sales",
      location: "Remote",
      type: "Full-time",
      status: "Open",
      postedDate: "2024-01-10",
      closingDate: "2024-02-10",
      applications: 32,
      interviews: 15,
      offers: 3,
      hired: 2,
      salary: "$60,000 - $80,000",
      description: "Join our sales team as a Sales Representative. This role is perfect for someone who is passionate about building relationships and driving revenue growth.",
      requirements: [
        "1+ years of sales experience",
        "Strong interpersonal skills",
        "Goal-oriented and self-motivated",
        "High school diploma required",
        "Willingness to travel occasionally"
      ],
      responsibilities: [
        "Generate new business opportunities",
        "Manage existing client relationships",
        "Meet and exceed sales quotas",
        "Participate in sales training and development",
        "Maintain accurate records in CRM"
      ],
      benefits: [
        "Base salary plus commission",
        "Health insurance",
        "Paid time off",
        "Sales training and mentorship",
        "Career advancement opportunities"
      ],
      hiringManager: "David Wilson",
      recruiter: "Lisa Brown"
    },
    {
      id: "REQ123",
      title: "Marketer",
      department: "Marketing",
      location: "San Francisco, CA",
      type: "Full-time",
      status: "Open",
      postedDate: "2024-01-08",
      closingDate: "2024-02-08",
      applications: 22,
      interviews: 12,
      offers: 1,
      hired: 1,
      salary: "$70,000 - $90,000",
      description: "We're looking for a creative and data-driven Marketer to help us grow our brand presence and drive customer acquisition.",
      requirements: [
        "2+ years of digital marketing experience",
        "Experience with Google Analytics and AdWords",
        "Strong copywriting skills",
        "Bachelor's degree in Marketing or related field",
        "Experience with marketing automation tools"
      ],
      responsibilities: [
        "Develop and execute marketing campaigns",
        "Manage social media presence",
        "Analyze campaign performance and optimize",
        "Create compelling content for various channels",
        "Collaborate with sales team on lead generation"
      ],
      benefits: [
        "Competitive salary",
        "Comprehensive benefits package",
        "Flexible work environment",
        "Professional development budget",
        "Annual bonus potential"
      ],
      hiringManager: "Emily Davis",
      recruiter: "Sarah Johnson"
    },
    {
      id: "REQ412",
      title: "Account Manager",
      department: "Customer Success",
      location: "Chicago, IL",
      type: "Full-time",
      status: "Closed",
      postedDate: "2023-12-15",
      closingDate: "2024-01-15",
      applications: 8,
      interviews: 6,
      offers: 1,
      hired: 1,
      salary: "$65,000 - $85,000",
      description: "This position has been filled. We're no longer accepting applications.",
      requirements: [],
      responsibilities: [],
      benefits: [],
      hiringManager: "James Miller",
      recruiter: "Mike Chen"
    },
    {
      id: "REQ368",
      title: "Sales Manager",
      department: "Sales",
      location: "Boston, MA",
      type: "Full-time",
      status: "Open",
      postedDate: "2024-01-12",
      closingDate: "2024-02-12",
      applications: 17,
      interviews: 10,
      offers: 2,
      hired: 0,
      salary: "$90,000 - $120,000",
      description: "We're seeking an experienced Sales Manager to lead our regional sales team and drive revenue growth.",
      requirements: [
        "5+ years of sales experience with 2+ years in management",
        "Proven track record of leading high-performing teams",
        "Strong analytical and strategic thinking skills",
        "Bachelor's degree in Business or related field",
        "Experience with sales forecasting and pipeline management"
      ],
      responsibilities: [
        "Lead and mentor a team of sales representatives",
        "Develop and execute sales strategies",
        "Monitor and analyze sales performance metrics",
        "Build relationships with key clients and partners",
        "Collaborate with marketing and product teams"
      ],
      benefits: [
        "Competitive salary with performance bonuses",
        "Comprehensive benefits package",
        "Leadership development opportunities",
        "Stock options",
        "Flexible work arrangements"
      ],
      hiringManager: "Robert Anderson",
      recruiter: "Emily Davis"
    }
  ]

  const jobStatuses = [
    { id: "all", label: "All Statuses" },
    { id: "open", label: "Open" },
    { id: "closed", label: "Closed" },
    { id: "draft", label: "Draft" },
    { id: "on-hold", label: "On Hold" }
  ]

  const jobDepartments = [
    { id: "all", label: "All Departments" },
    { id: "sales", label: "Sales" },
    { id: "marketing", label: "Marketing" },
    { id: "customer-success", label: "Customer Success" },
    { id: "engineering", label: "Engineering" },
    { id: "hr", label: "Human Resources" }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Background Check":
        return "border-l-pink-500"
      case "In Review":
      case "Interview":
        return "border-l-orange-500"
      case "Offer Letter":
        return "border-l-blue-500"
      case "New Submissions":
        return "border-l-orange-500"
      default:
        return "border-l-gray-500"
    }
  }

  const summaryStats = [
    { label: "TOTAL CANDIDATES", value: "256", color: "" },
    { label: "NEW SUBMISSION", value: "58", color: "border-l-orange-500" },
    { label: "IN REVIEW", value: "5", color: "border-l-orange-500" },
    { label: "INTERVIEW", value: "3", color: "border-l-orange-500" },
    { label: "BACKGROUND CHECK", value: "2", color: "border-l-pink-500" },
    { label: "CLOSED", value: "74", color: "border-l-gray-500" },
  ]

  const handleRequisitionToggle = (reqId: string) => {
    setSelectedRequisitions(prev => 
      prev.includes(reqId) 
        ? prev.filter(id => id !== reqId)
        : [...prev, reqId]
    )
  }

  const handleStatusToggle = (statusId: string) => {
    setSelectedStatuses(prev => 
      prev.includes(statusId) 
        ? prev.filter(id => id !== statusId)
        : [...prev, statusId]
    )
  }

  const handleCandidateClick = (candidate: any) => {
    setSelectedCandidate(candidate)
    setIsCandidateModalOpen(true)
  }

  const handleCloseCandidateModal = () => {
    setIsCandidateModalOpen(false)
    setSelectedCandidate(null)
  }

  const getInterviewStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'Completed':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'Cancelled':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'Rescheduled':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getInterviewTypeColor = (type: string) => {
    switch (type) {
      case 'First Interview':
        return 'bg-purple-100 text-purple-800'
      case 'Second Interview':
        return 'bg-blue-100 text-blue-800'
      case 'Final Interview':
        return 'bg-green-100 text-green-800'
      case 'Technical Interview':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatInterviewDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const handleInterviewClick = (interview: any) => {
    setSelectedInterview(interview)
    setIsInterviewModalOpen(true)
  }

  const handleCloseInterviewModal = () => {
    setIsInterviewModalOpen(false)
    setSelectedInterview(null)
  }

  const handleAddInterview = () => {
    setIsAddInterviewModalOpen(true)
  }

  const handleCloseAddInterviewModal = () => {
    setIsAddInterviewModalOpen(false)
  }

  const getPipelineStats = () => {
    const total = pipelineCandidates.length
    const active = pipelineCandidates.filter(c => !['hired', 'rejected'].includes(c.stage)).length
    const hired = pipelineCandidates.filter(c => c.stage === 'hired').length
    const rejected = pipelineCandidates.filter(c => c.stage === 'rejected').length
    
    return { total, active, hired, rejected }
  }

  const getFilteredPipelineCandidates = () => {
    let filtered = pipelineCandidates

    // Filter by search term
    if (pipelineSearch) {
      filtered = filtered.filter(candidate => 
        candidate.name.toLowerCase().includes(pipelineSearch.toLowerCase()) ||
        candidate.position.toLowerCase().includes(pipelineSearch.toLowerCase()) ||
        candidate.requisition.title.toLowerCase().includes(pipelineSearch.toLowerCase())
      )
    }

    // Filter by role
    if (selectedPipelineRole !== "all") {
      filtered = filtered.filter(candidate => candidate.requisition.id === selectedPipelineRole)
    }

    return filtered
  }

  const getCandidatesForStage = (stageId: string) => {
    return getFilteredPipelineCandidates().filter(candidate => candidate.stage === stageId)
  }

  const formatPipelineDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const handleJobClick = (job: any) => {
    setSelectedJob(job)
    setIsJobModalOpen(true)
    setJobModalTab("details")
  }

  const handleCloseJobModal = () => {
    setIsJobModalOpen(false)
    setSelectedJob(null)
  }

  const handleCloseAddJobModal = () => {
    setIsAddJobModalOpen(false)
  }

  const getJobStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'Closed':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'Draft':
        return 'bg-gray-50 border-gray-200 text-gray-800'
      case 'On Hold':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getFilteredJobs = () => {
    let filtered = jobPostings

    if (jobSearch) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
        job.department.toLowerCase().includes(jobSearch.toLowerCase()) ||
        job.location.toLowerCase().includes(jobSearch.toLowerCase())
      )
    }

    if (selectedJobStatus !== "all") {
      filtered = filtered.filter(job => job.status.toLowerCase() === selectedJobStatus)
    }

    if (selectedJobDepartment !== "all") {
      filtered = filtered.filter(job => job.department.toLowerCase().replace(/\s+/g, '-') === selectedJobDepartment)
    }

    return filtered
  }

  const getJobStats = () => {
    return jobStats
  }

  // Calculate optimal column widths based on content
  const getColumnWidth = (columnId: string, data: CandidateWithRelations[]) => {
    const maxWidths = {
      select: 40, // Fixed width for checkbox
      first_name: 256, // Max width for candidate name (w-64)
      position: 200, // Max width for position
      company: 180, // Max width for company
      'job_posting_title': 400, // Max width for job title (fixed column ID)
      status: 120, // Max width for status
      type: 100, // Max width for type
      source: 120, // Max width for source
      created_at: 128, // Max width for applied date (w-32)
      actions: 60 // Fixed width for actions
    }

    const minWidths = {
      select: 40,
      first_name: 150,
      position: 100,
      company: 80,
      'job_posting_title': 100, // Fixed column ID
      status: 80,
      type: 60,
      source: 80,
      created_at: 100,
      actions: 60
    }

    if (columnId === 'select' || columnId === 'actions') {
      return maxWidths[columnId as keyof typeof maxWidths]
    }

    // Calculate content width based on longest value
    let maxContentLength = 0
    data.forEach(item => {
      let content = ''
      switch (columnId) {
        case 'first_name':
          content = `${item.first_name} ${item.last_name}`
          break
        case 'position':
          content = item.position || 'No position'
          break
        case 'company':
          content = item.company || 'No company'
          break
        case 'job_posting_title':
          content = item.job_posting?.title || 'No job'
          break
        case 'status':
          content = item.status || ''
          break
        case 'type':
          content = item.type || ''
          break
        case 'source':
          content = item.source || 'No source'
          break
        case 'created_at':
          content = RecruitmentService.formatDate(item.created_at)
          break
      }
      maxContentLength = Math.max(maxContentLength, content.length)
    })

    // Estimate width: roughly 8px per character + padding
    const estimatedWidth = Math.max(maxContentLength * 8 + 24, minWidths[columnId as keyof typeof minWidths])
    return Math.min(estimatedWidth, maxWidths[columnId as keyof typeof maxWidths])
  }

  // Get column widths
  const columnWidths = {
    select: getColumnWidth('select', candidates),
    first_name: getColumnWidth('first_name', candidates),
    position: getColumnWidth('position', candidates),
    company: getColumnWidth('company', candidates),
    'job_posting_title': getColumnWidth('job_posting_title', candidates),
    status: getColumnWidth('status', candidates),
    type: getColumnWidth('type', candidates),
    source: getColumnWidth('source', candidates),
    created_at: getColumnWidth('created_at', candidates),
    actions: getColumnWidth('actions', candidates)
  }

  // Calculate optimal column widths for job postings table
  const getJobColumnWidth = (columnId: string, data: any[]) => {
    const maxWidths = {
      select: 40, // Fixed width for checkbox
      title: 300, // Max width for job title
      department: 180, // Max width for department
      location: 150, // Max width for location
      status: 120, // Max width for status
      applications: 140, // Max width for applications count
      posted_date: 120, // Max width for posted date
      closing_date: 120 // Max width for closing date
    }

    const minWidths = {
      select: 40,
      title: 150,
      department: 100,
      location: 80,
      status: 80,
      applications: 100,
      posted_date: 100,
      closing_date: 100
    }

    if (columnId === 'select') {
      return maxWidths.select
    }

    // Calculate content width based on longest value
    let maxContentLength = 0
    data.forEach(item => {
      let content = ''
      switch (columnId) {
        case 'title':
          content = item.title || 'No title'
          break
        case 'department':
          content = item.department || 'No department'
          break
        case 'location':
          content = item.location || 'No location'
          break
        case 'status':
          content = item.status || ''
          break
        case 'applications':
          content = `${item.applications_count} | ${item.hired_count} hired`
          break
        case 'posted_date':
          content = RecruitmentService.formatDate(item.posted_date)
          break
        case 'closing_date':
          content = item.closing_date ? RecruitmentService.formatDate(item.closing_date) : 'No closing date'
          break
      }
      maxContentLength = Math.max(maxContentLength, content.length)
    })

    // Estimate width: roughly 8px per character + padding
    const estimatedWidth = Math.max(maxContentLength * 8 + 24, minWidths[columnId as keyof typeof minWidths])
    return Math.min(estimatedWidth, maxWidths[columnId as keyof typeof maxWidths])
  }

  // Calculate job posting column widths
  const jobColumnWidths = useMemo(() => {
    const jobs = getFilteredJobs()
    return {
      select: getJobColumnWidth('select', jobs),
      title: getJobColumnWidth('title', jobs),
      department: getJobColumnWidth('department', jobs),
      location: getJobColumnWidth('location', jobs),
      status: getJobColumnWidth('status', jobs),
      applications: getJobColumnWidth('applications', jobs),
      posted_date: getJobColumnWidth('posted_date', jobs),
      closing_date: getJobColumnWidth('closing_date', jobs)
    }
  }, [getFilteredJobs])

  // Calculate optimal column widths for interviews table
  const getInterviewColumnWidth = (columnId: string, data: any[]) => {
    const maxWidths = {
      select: 40, // Fixed width for checkbox
      candidate: 180, // Max width for candidate name (removed initial icon)
      job: 200, // Max width for job title
      requisition: 120, // Max width for requisition ID (reduced since job is separate)
      interviewer: 150, // Max width for interviewer name
      type: 140, // Max width for interview type
      datetime: 160, // Max width for date and time
      status: 120, // Max width for status
      location: 120 // Max width for location
    }

    const minWidths = {
      select: 40,
      candidate: 120,
      job: 150,
      requisition: 80,
      interviewer: 80,
      type: 80,
      datetime: 120,
      status: 80,
      location: 80
    }

    if (columnId === 'select') {
      return maxWidths.select
    }

    // Calculate content width based on longest value
    let maxContentLength = 0
    data.forEach(item => {
      let content = ''
      switch (columnId) {
        case 'candidate':
          content = `${item.candidate?.name || 'No name'} ${item.candidate?.position || ''}`
          break
        case 'job':
          content = item.requisition?.title || 'No job title'
          break
        case 'requisition':
          content = item.requisition?.id || 'No ID'
          break
        case 'interviewer':
          content = item.interviewer || 'No interviewer'
          break
        case 'type':
          content = item.type || ''
          break
        case 'datetime':
          content = `${formatInterviewDate(item.date)} ${item.time} (${item.duration})`
          break
        case 'status':
          content = item.status || ''
          break
        case 'location':
          content = item.location || 'No location'
          break
      }
      maxContentLength = Math.max(maxContentLength, content.length)
    })

    // Estimate width: roughly 8px per character + padding
    const estimatedWidth = Math.max(maxContentLength * 8 + 24, minWidths[columnId as keyof typeof minWidths])
    return Math.min(estimatedWidth, maxWidths[columnId as keyof typeof maxWidths])
  }

  // Calculate interview column widths
  const interviewColumnWidths = useMemo(() => {
    return {
      select: getInterviewColumnWidth('select', mockInterviews),
      candidate: getInterviewColumnWidth('candidate', mockInterviews),
      job: getInterviewColumnWidth('job', mockInterviews),
      requisition: getInterviewColumnWidth('requisition', mockInterviews),
      interviewer: getInterviewColumnWidth('interviewer', mockInterviews),
      type: getInterviewColumnWidth('type', mockInterviews),
      datetime: getInterviewColumnWidth('datetime', mockInterviews),
      status: getInterviewColumnWidth('status', mockInterviews),
      location: getInterviewColumnWidth('location', mockInterviews)
    }
  }, [mockInterviews])

  const renderContent = () => {
    switch (activeTab) {
      case "candidates":
        return (
          <div className="space-y-6">
            {/* Full Width Filter Bar */}
            {showFilters && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="grid grid-cols-4 gap-3">
                  {/* Requisition Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Requisition</label>
                    <select 
                      className="w-full text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={selectedRequisitions.length === 1 ? selectedRequisitions[0] : ''}
                      onChange={(e) => setSelectedRequisitions(e.target.value ? [e.target.value] : [])}
                    >
                      <option value="">All Requisitions</option>
                      {requisitions.map((req) => (
                        <option key={req.id} value={req.id}>
                          {req.title} ({req.id}) - {mockCandidates.filter(c => c.requisition.id === req.id).length} candidates
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <select 
                      className="w-full text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={selectedStatuses.length === 1 ? selectedStatuses[0] : ''}
                      onChange={(e) => setSelectedStatuses(e.target.value ? [e.target.value] : [])}
                    >
                      <option value="">All Statuses</option>
                      {candidateStatuses.map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.label} ({status.count})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Type Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                    <select className="w-full text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="">All Types</option>
                      <option value="internal">Internal</option>
                      <option value="external">External</option>
                    </select>
                  </div>
                  
                  {/* Source Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Source</label>
                    <select className="w-full text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="">All Sources</option>
                      <option value="monster">Monster</option>
                      <option value="career-builder">Career Builder</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="indeed">Indeed</option>
                    </select>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-200">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOnlyOpenReqs}
                        onChange={(e) => setShowOnlyOpenReqs(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs text-gray-700">Show only open requisitions</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOnlyActiveCandidates}
                        onChange={(e) => setShowOnlyActiveCandidates(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-xs text-gray-700">Show only active candidates</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedRequisitions([])
                        setSelectedStatuses([])
                        setShowOnlyOpenReqs(false)
                        setShowOnlyActiveCandidates(false)
                      }}
                      className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            )}


        
        {/* Candidates Table */}
        <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 h-10">
                  {table.getHeaderGroups().map(headerGroup => (
                    headerGroup.headers.map(header => (
                      <th 
                        key={header.id}
                        style={{ width: columnWidths[header.id as keyof typeof columnWidths] }}
                        className={`text-left py-2 px-3 font-semibold text-gray-700 text-xs ${
                          header.id === 'select' ? 'sticky left-0 bg-gray-50 z-20 border-r border-gray-200' :
                          header.id === 'first_name' ? 'sticky left-10 bg-gray-50 z-20 border-r border-gray-200' :
                          header.id === 'actions' ? '' :
                          'border-r border-gray-200'
                        }`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr 
                    key={row.id}
                    className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer h-10"
                    onClick={() => handleCandidateClick(row.original)}
                  >
                    {row.getVisibleCells().map(cell => (
                      <td 
                        key={cell.id}
                        style={{ width: columnWidths[cell.column.id as keyof typeof columnWidths] }}
                        className={`py-2 px-3 overflow-hidden ${
                          cell.column.id === 'select' ? 'sticky left-0 bg-white z-10 border-r border-gray-200' :
                          cell.column.id === 'first_name' ? 'sticky left-10 bg-white z-10 border-r border-gray-200' :
                          cell.column.id === 'actions' ? '' :
                          'border-r border-gray-200'
                        }`}
                      >
                        <div className="leading-tight">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </div>
                    </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
          </div>
        )

      case "interviews":
        return (
          <div className="space-y-6">
            {/* Interviews Table */}
            <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
              {/* Table Controls */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-4">
                  <select className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option>Date (oldest)</option>
                    <option>Date (newest)</option>
                    <option>Status</option>
                    <option>Type</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleAddInterview}
                    className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-md hover:bg-purple-700 transition-colors"
                  >
                    + Schedule Interview
                  </button>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search interviews..."
                      className="pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th 
                        style={{ width: interviewColumnWidths.select }}
                        className="sticky left-0 bg-gray-50 z-10 border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        <input
                          type="checkbox"
                          className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                        />
                      </th>
                      <th 
                        style={{ width: interviewColumnWidths.candidate }}
                        className="sticky left-10 bg-gray-50 z-10 border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        Candidate
                      </th>
                      <th 
                        style={{ width: interviewColumnWidths.job }}
                        className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        Job
                      </th>
                      <th 
                        style={{ width: interviewColumnWidths.requisition }}
                        className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        Requisition
                      </th>
                      <th 
                        style={{ width: interviewColumnWidths.interviewer }}
                        className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        Interviewer
                      </th>
                      <th 
                        style={{ width: interviewColumnWidths.type }}
                        className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        Type
                      </th>
                      <th 
                        style={{ width: interviewColumnWidths.datetime }}
                        className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        Date & Time
                      </th>
                      <th 
                        style={{ width: interviewColumnWidths.status }}
                        className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        Status
                      </th>
                      <th 
                        style={{ width: interviewColumnWidths.location }}
                        className="text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        Location
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockInterviews.map((interview) => (
                      <tr 
                        key={interview.id} 
                        className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer h-10"
                        onClick={() => handleInterviewClick(interview)}
                      >
                        <td 
                          style={{ width: interviewColumnWidths.select }}
                          className="py-2 px-3 sticky left-0 bg-white z-10 border-r border-gray-200"
                        >
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                    </td>
                        <td 
                          style={{ width: interviewColumnWidths.candidate }}
                          className="py-2 px-3 sticky left-10 bg-white z-10 border-r border-gray-200"
                        >
                          <div className="overflow-hidden leading-tight">
                            <div className="font-medium text-gray-900 text-xs truncate block">{interview.candidate.name}</div>
                            <div className="text-xs text-gray-500 truncate block">{interview.candidate.position}</div>
                      </div>
                    </td>
                        <td 
                          style={{ width: interviewColumnWidths.job }}
                          className="py-2 px-3 border-r border-gray-200"
                        >
                          <div className="overflow-hidden leading-tight">
                            <div className="text-xs text-gray-900 truncate block">{interview.requisition.title}</div>
                          </div>
                        </td>
                        <td 
                          style={{ width: interviewColumnWidths.requisition }}
                          className="py-2 px-3 border-r border-gray-200"
                        >
                          <div className="overflow-hidden leading-tight">
                            <div className="text-xs text-gray-900 truncate block">{interview.requisition.id}</div>
                          </div>
                        </td>
                        <td 
                          style={{ width: interviewColumnWidths.interviewer }}
                          className="py-2 px-3 border-r border-gray-200"
                        >
                          <span className="text-xs text-gray-900 truncate block">{interview.interviewer}</span>
                        </td>
                        <td 
                          style={{ width: interviewColumnWidths.type }}
                          className={`py-2 px-3 border-r border-gray-200 ${getInterviewTypeColor(interview.type)}`}
                        >
                          <span className="text-xs font-medium text-gray-900 truncate block">
                            {interview.type}
                      </span>
                    </td>
                        <td 
                          style={{ width: interviewColumnWidths.datetime }}
                          className="py-2 px-3 border-r border-gray-200"
                        >
                          <div className="overflow-hidden leading-tight">
                            <div className="text-xs text-gray-900 truncate block">{formatInterviewDate(interview.date)}</div>
                            <div className="text-xs text-gray-500 truncate block">{interview.time} ({interview.duration})</div>
                          </div>
                    </td>
                        <td 
                          style={{ width: interviewColumnWidths.status }}
                          className={`py-2 px-3 border-r border-gray-200 ${getInterviewStatusColor(interview.status)}`}
                        >
                          <span className="text-xs font-medium text-gray-900 truncate block">
                            {interview.status}
                          </span>
                    </td>
                        <td 
                          style={{ width: interviewColumnWidths.location }}
                          className="py-2 px-3"
                        >
                          <span className="text-xs text-gray-900 truncate block">{interview.location || 'No location'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      case "pipeline":
        const pipelineStats = getPipelineStats()
        return (
          <div className="space-y-4">
            {/* Top Controls */}
            <div className="flex items-center justify-between">
              {/* Left side - Summary */}
              <div className="text-sm text-gray-600">
                <span className="text-xl font-bold text-purple-600">{pipelineStats.total}</span> candidates with{" "}
                <span className="text-xl font-bold text-purple-600">{pipelineStats.active}</span> active in pipeline
              </div>
              
              {/* Right side - Search and Filters */}
              <div className="flex items-center space-x-3">
                <select 
                  value={selectedPipelineRole}
                  onChange={(e) => setSelectedPipelineRole(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Roles</option>
                  {requisitions.map((req) => (
                    <option key={req.id} value={req.id}>
                      {req.title} ({req.id})
                    </option>
                  ))}
                </select>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search candidates..."
                    value={pipelineSearch}
                    onChange={(e) => setPipelineSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <svg className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                </div>
              </div>
            </div>

            {/* Kanban Board */}
            <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <div className="flex min-w-max">
                  {pipelineStages.map((stage) => {
                    const stageCandidates = getCandidatesForStage(stage.id)
                    return (
                      <div key={stage.id} className="w-56 flex-shrink-0 border-r border-gray-200 last:border-r-0">
                        {/* Column Header */}
                        <div className={`p-4 ${stage.color} border-b border-gray-200`}>
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 text-sm">
                              {stage.name}
                            </h3>
                            <span className="bg-white text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
                              {stageCandidates.length}
                            </span>
                          </div>
                        </div>
                        
                        {/* Column Content */}
                        <div className="p-3 min-h-[600px]">
                          {stageCandidates.length === 0 ? (
                            <div className="text-center text-gray-400 py-8 text-sm">
                              No candidates in this stage
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {stageCandidates.map((candidate) => (
                                <div 
                                  key={candidate.id}
                                  className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow relative"
                                  onClick={() => handleCandidateClick(candidate)}
                                >
                                  {/* Candidate Name */}
                                  <div className="font-semibold text-gray-900 text-sm mb-1">{candidate.name}</div>
                                  
                                  {/* Position */}
                                  <div className="text-xs text-gray-500 mb-2">{candidate.position}</div>
                                  
                                  {/* Bottom Row */}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs text-gray-500">{candidate.requisition.title}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Mail className="h-3 w-3 text-gray-400" />
                                      <span className="text-xs text-gray-500">1</span>
                                      <Phone className="h-3 w-3 text-gray-400" />
                                      <span className="text-xs text-gray-500">1</span>
                                    </div>
                                  </div>
                                  
                                  {/* Applied Date */}
                                  <div className="mt-2 text-xs text-gray-500">
                                    Applied {formatPipelineDate(candidate.appliedDate)}
                                  </div>
                                  
                                  {/* Source */}
                                  <div className="mt-1 text-xs text-gray-500">
                                    Source: {candidate.source}
                                  </div>
                                  
                                  {/* Avatar */}
                                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-xs font-medium text-purple-600">
                                      {candidate.avatar}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Add Candidate Button */}
                          <button className="w-full mt-3 p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors text-sm">
                            <Plus className="h-4 w-4 mx-auto mb-1" />
                            Add candidate
                      </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )
      case "jobs":
        const jobStats = getJobStats()
        return (
          <div className="space-y-6">
            {/* Full Width Filter Bar */}
            {showFilters && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="grid grid-cols-3 gap-3">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <select 
                      value={selectedJobStatus}
                      onChange={(e) => setSelectedJobStatus(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {jobStatuses.map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Department Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                    <select 
                      value={selectedJobDepartment}
                      onChange={(e) => setSelectedJobDepartment(e.target.value)}
                      className="w-full text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {jobDepartments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Search */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search jobs..."
                        value={jobSearch}
                        onChange={(e) => setJobSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <svg className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-200">
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-600">
                      {getFilteredJobs().length} jobs found
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedJobStatus("all")
                        setSelectedJobDepartment("all")
                        setJobSearch("")
                      }}
                      className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Jobs Table */}
            <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th 
                        style={{ width: jobColumnWidths.select }}
                        className="sticky left-0 bg-gray-50 z-10 border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        <input
                          type="checkbox"
                          className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                        />
                      </th>
                      <th 
                        style={{ width: jobColumnWidths.title }}
                        className="sticky left-10 bg-gray-50 z-10 border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        Job Title
                      </th>
                      <th 
                        style={{ width: jobColumnWidths.department }}
                        className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        Department
                      </th>
                      <th 
                        style={{ width: jobColumnWidths.location }}
                        className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        Location
                      </th>
                      <th 
                        style={{ width: jobColumnWidths.status }}
                        className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        Status
                      </th>
                      <th 
                        style={{ width: jobColumnWidths.applications }}
                        className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        Applications
                      </th>
                      <th 
                        style={{ width: jobColumnWidths.posted_date }}
                        className="border-r border-gray-200 text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        Posted Date
                      </th>
                      <th 
                        style={{ width: jobColumnWidths.closing_date }}
                        className="text-left py-2 px-3 font-semibold text-gray-700 text-xs"
                      >
                        Closing Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredJobs().map((job) => (
                      <tr 
                        key={job.id} 
                        className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer h-10"
                        onClick={() => handleJobClick(job)}
                      >
                        <td 
                          style={{ width: jobColumnWidths.select }}
                          className="py-2 px-3 sticky left-0 bg-white z-10 border-r border-gray-200"
                        >
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              className="w-3 h-3 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </td>
                        <td 
                          style={{ width: jobColumnWidths.title }}
                          className="py-2 px-3 sticky left-10 bg-white z-10 border-r border-gray-200"
                        >
                          <div className="overflow-hidden leading-tight">
                            <div className="font-medium text-gray-900 text-xs truncate block">{job.title}</div>
                          </div>
                        </td>
                        <td 
                          style={{ width: jobColumnWidths.department }}
                          className="py-2 px-3 border-r border-gray-200"
                        >
                          <div className="flex items-center space-x-1 overflow-hidden leading-tight">
                            <Building2 className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-900 truncate block">{job.department}</span>
                          </div>
                        </td>
                        <td 
                          style={{ width: jobColumnWidths.location }}
                          className="py-2 px-3 border-r border-gray-200"
                        >
                          <span className="text-xs text-gray-900 truncate block">{job.location}</span>
                        </td>
                        <td 
                          style={{ width: jobColumnWidths.status }}
                          className={`py-2 px-3 border-r border-gray-200 ${getJobStatusColor(job.status)}`}
                        >
                          <span className="text-xs font-medium text-gray-900 truncate block">
                            {job.status}
                          </span>
                        </td>
                        <td 
                          style={{ width: jobColumnWidths.applications }}
                          className="py-2 px-3 border-r border-gray-200"
                        >
                          <div className="flex items-center space-x-2 overflow-hidden leading-tight">
                            <span className="text-xs text-gray-900 truncate block">{job.applications_count}</span>
                            <span className="text-gray-400 flex-shrink-0">|</span>
                            <span className="text-xs text-green-600 truncate block">{job.hired_count} hired</span>
                          </div>
                        </td>
                        <td 
                          style={{ width: jobColumnWidths.posted_date }}
                          className="py-2 px-3 border-r border-gray-200"
                        >
                          <span className="text-xs text-gray-900 truncate block">{RecruitmentService.formatDate(job.posted_date)}</span>
                        </td>
                        <td 
                          style={{ width: jobColumnWidths.closing_date }}
                          className="py-2 px-3"
                        >
                          <span className="text-xs text-gray-900 truncate block">{job.closing_date ? RecruitmentService.formatDate(job.closing_date) : 'No closing date'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
        )
      default:
        return null
    }
  }

  return (
    <ProtectedRoute>
      <PageWrapper 
      title="Recruitment" 
      headerButtons={headerButtons}
        subHeader={<SubHeader tabs={recruitmentTabs} activeTab={activeTab} onTabChange={setActiveTab} onFilterClick={() => setShowFilters(!showFilters)} isFilterActive={showFilters} />}
    >
      {renderContent()}
    </PageWrapper>

        {/* Candidate Details Side Modal */}
        {isCandidateModalOpen && selectedCandidate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="w-[45vw] bg-white h-full overflow-y-auto">
              {/* Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">
                        {RecruitmentService.generateAvatarInitials(selectedCandidate.first_name, selectedCandidate.last_name)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{`${selectedCandidate.first_name} ${selectedCandidate.last_name}`}</h2>
                      <p className="text-sm text-gray-600">{selectedCandidate.position || 'N/A'}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseCandidateModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex space-x-8 px-6">
                  <button className="py-3 text-sm font-medium text-purple-600 border-b-2 border-purple-600">
                    Details
                  </button>
                  <button className="py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
                    Process
                  </button>
                  <button className="py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
                    History
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Details Tab Content */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <p className="text-sm text-gray-900">{`${selectedCandidate.first_name} ${selectedCandidate.last_name}`}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                      <p className="text-sm text-gray-900">{selectedCandidate.position || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <p className="text-sm text-gray-900">{selectedCandidate.company || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <p className="text-sm text-gray-900">{selectedCandidate.location || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-sm text-gray-900">{selectedCandidate.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <p className="text-sm text-gray-900">{selectedCandidate.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        selectedCandidate.type === 'Internal' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedCandidate.type}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                      <p className="text-sm text-gray-900">{selectedCandidate.source || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Posting</label>
                    <div className="bg-gray-50 rounded-md p-3">
                      <p className="text-sm font-medium text-gray-900">{selectedCandidate.job_posting?.title || 'N/A'}</p>
                      <p className="text-xs text-gray-600">ID: {selectedCandidate.job_posting?.id || 'N/A'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Status</label>
                    <div className={`flex items-center space-x-2 p-3 rounded border-l-4 ${getStatusColor(selectedCandidate.status)}`}>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{selectedCandidate.status}</div>
                        <div className="text-xs text-gray-600">Updated {RecruitmentService.formatDate(selectedCandidate.updated_at)}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Submission Date</label>
                    <p className="text-sm text-gray-900">{selectedCandidate.submissionDate}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interview Details Side Modal */}
        {isInterviewModalOpen && selectedInterview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="w-[45vw] bg-white h-full overflow-y-auto">
              {/* Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">
                        {selectedInterview.candidate.avatar}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{selectedInterview.candidate.name}</h2>
                      <p className="text-sm text-gray-600">{selectedInterview.type} - {selectedInterview.requisition.title}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseInterviewModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex space-x-8 px-6">
                  <button className="py-3 text-sm font-medium text-purple-600 border-b-2 border-purple-600">
                    Details
                  </button>
                  <button className="py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
                    Feedback
                  </button>
                  <button className="py-3 text-sm font-medium text-gray-500 hover:text-gray-700">
                    Notes
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Details Tab Content */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Candidate</label>
                      <p className="text-sm text-gray-900">{selectedInterview.candidate.name}</p>
                      <p className="text-xs text-gray-500">{selectedInterview.candidate.position}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Interviewer</label>
                      <p className="text-sm text-gray-900">{selectedInterview.interviewer}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getInterviewTypeColor(selectedInterview.type)}`}>
                        {selectedInterview.type}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getInterviewStatusColor(selectedInterview.status)}`}>
                        {selectedInterview.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <p className="text-sm text-gray-900">{formatInterviewDate(selectedInterview.date)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <p className="text-sm text-gray-900">{selectedInterview.time} ({selectedInterview.duration})</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <p className="text-sm text-gray-900">{selectedInterview.location}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Requisition</label>
                      <p className="text-sm text-gray-900">{selectedInterview.requisition.title}</p>
                      <p className="text-xs text-gray-500">ID: {selectedInterview.requisition.id}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Interview Notes</label>
                    <div className="bg-gray-50 rounded-md p-3">
                      <p className="text-sm text-gray-900">{selectedInterview.notes}</p>
                    </div>
                  </div>

                  {selectedInterview.feedback && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Feedback</label>
                      <div className="bg-green-50 rounded-md p-3 border border-green-200">
                        <p className="text-sm text-gray-900">{selectedInterview.feedback}</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                    <button className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors">
                      Reschedule
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors">
                      Cancel
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
                      Mark Complete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Job Details Side Modal */}
        {isJobModalOpen && selectedJob && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="w-[45vw] bg-white h-full overflow-y-auto">
              {/* Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">
                        {selectedJob.title.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{selectedJob.title}</h2>
                      <p className="text-sm text-gray-600">{selectedJob.department} • {selectedJob.location}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseJobModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex space-x-8 px-6">
                  <button 
                    className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                      jobModalTab === "details" 
                        ? "text-purple-600 border-purple-600" 
                        : "text-gray-500 hover:text-gray-700 border-transparent"
                    }`}
                    onClick={() => setJobModalTab("details")}
                  >
                    Details
                  </button>
                  <button 
                    className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                      jobModalTab === "applications" 
                        ? "text-purple-600 border-purple-600" 
                        : "text-gray-500 hover:text-gray-700 border-transparent"
                    }`}
                    onClick={() => setJobModalTab("applications")}
                  >
                    Applications
                  </button>
                  <button 
                    className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                      jobModalTab === "settings" 
                        ? "text-purple-600 border-purple-600" 
                        : "text-gray-500 hover:text-gray-700 border-transparent"
                    }`}
                    onClick={() => setJobModalTab("settings")}
                  >
                    Settings
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {jobModalTab === "details" && (
                  <div className="space-y-6">
                    {/* Job Overview */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job ID</label>
                        <p className="text-sm text-gray-900">{selectedJob.id}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getJobStatusColor(selectedJob.status)}`}>
                          {selectedJob.status}
                        </span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <p className="text-sm text-gray-900">{selectedJob.department}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <p className="text-sm text-gray-900">{selectedJob.location}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <p className="text-sm text-gray-900">{selectedJob.type}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                        <p className="text-sm text-gray-900">{selectedJob.salary}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Posted Date</label>
                        <p className="text-sm text-gray-900">{new Date(selectedJob.postedDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Closing Date</label>
                        <p className="text-sm text-gray-900">{new Date(selectedJob.closingDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hiring Manager</label>
                        <p className="text-sm text-gray-900">{selectedJob.hiringManager}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Recruiter</label>
                        <p className="text-sm text-gray-900">{selectedJob.recruiter}</p>
                      </div>
                    </div>

                    {/* Job Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
                      <div className="bg-gray-50 rounded-md p-4">
                        <p className="text-sm text-gray-900">{selectedJob.description}</p>
                      </div>
                    </div>

                    {/* Requirements */}
                    {selectedJob.requirements && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
                        <div className="bg-gray-50 rounded-md p-4">
                          <div className="text-sm text-gray-900 whitespace-pre-line">{selectedJob.requirements}</div>
                        </div>
                      </div>
                    )}

                    {/* Responsibilities */}
                    {selectedJob.responsibilities && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Responsibilities</label>
                        <div className="bg-gray-50 rounded-md p-4">
                          <div className="text-sm text-gray-900 whitespace-pre-line">{selectedJob.responsibilities}</div>
                        </div>
                      </div>
                    )}

                    {/* Benefits */}
                    {selectedJob.benefits && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
                        <div className="bg-gray-50 rounded-md p-4">
                          <div className="text-sm text-gray-900 whitespace-pre-line">{selectedJob.benefits}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {jobModalTab === "applications" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Applications Overview</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600">{selectedJob.applications_count}</div>
                        <div className="text-xs text-blue-600 mt-1">Total Applications</div>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">{selectedJob.interviews_count}</div>
                        <div className="text-xs text-green-600 mt-1">Interviews</div>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-orange-600">{selectedJob.offers_count}</div>
                        <div className="text-xs text-orange-600 mt-1">Offers Made</div>
                      </div>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-600">{selectedJob.hired_count}</div>
                        <div className="text-xs text-purple-600 mt-1">Hired</div>
                      </div>
                    </div>
                    <div className="text-center text-gray-500 py-8">
                      <p>Application details will be shown here</p>
                    </div>
                  </div>
                )}

                {jobModalTab === "settings" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Job Settings</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Job Status</label>
                        <select className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                          <option value="open" selected={selectedJob.status === "Open"}>Open</option>
                          <option value="closed" selected={selectedJob.status === "Closed"}>Closed</option>
                          <option value="draft" selected={selectedJob.status === "Draft"}>Draft</option>
                          <option value="on-hold" selected={selectedJob.status === "On Hold"}>On Hold</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Closing Date</label>
                        <input 
                          type="date" 
                          defaultValue={selectedJob.closing_date}
                          className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-center space-x-3 pt-4">
                        <button className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors">
                          Save Changes
                        </button>
                        <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors">
                          Close Position
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Job Modal */}
        {isAddJobModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="bg-gray-50 border-b border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Post New Job</h2>
                      <p className="text-sm text-gray-600">Create a new job posting</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseAddJobModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Senior Software Engineer"
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                    <select className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="">Select Department</option>
                      <option value="sales">Sales</option>
                      <option value="marketing">Marketing</option>
                      <option value="engineering">Engineering</option>
                      <option value="hr">Human Resources</option>
                      <option value="customer-success">Customer Success</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                    <input 
                      type="text" 
                      placeholder="e.g., San Francisco, CA"
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employment Type *</label>
                    <select className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="">Select Type</option>
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                    <input 
                      type="text" 
                      placeholder="e.g., $80,000 - $120,000"
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Closing Date *</label>
                    <input 
                      type="date" 
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
                  <textarea 
                    rows={4}
                    placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
                  <textarea 
                    rows={3}
                    placeholder="List the key requirements and qualifications..."
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
                  <textarea 
                    rows={3}
                    placeholder="List the benefits and perks offered..."
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hiring Manager</label>
                    <input 
                      type="text" 
                      placeholder="e.g., John Smith"
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recruiter</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Sarah Johnson"
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-200 border-t border-gray-200 p-6">
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={handleCloseAddJobModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors">
                    Post Job
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </ProtectedRoute>
    )
}