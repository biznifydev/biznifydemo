// Recruitment System TypeScript Types

export interface JobPosting {
  id: string
  title: string
  department: string
  location: string
  employment_type: string
  status: 'Draft' | 'Open' | 'Closed' | 'On Hold'
  salary_range?: string
  description?: string
  requirements?: string
  responsibilities?: string
  benefits?: string
  hiring_manager?: string
  recruiter?: string
  posted_date: string
  closing_date?: string
  applications_count: number
  interviews_count: number
  offers_count: number
  hired_count: number
  created_at: string
  updated_at: string
}

export interface PipelineStage {
  id: string
  name: string
  description?: string
  color: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Candidate {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  location?: string
  position?: string
  company?: string
  source?: string
  type: 'Internal' | 'External'
  status: string
  current_stage_id?: string
  job_posting_id?: string
  resume_url?: string
  cover_letter?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface CandidateWithRelations extends Candidate {
  current_stage?: PipelineStage
  job_posting?: JobPosting
}

export interface Interview {
  id: string
  candidate_id: string
  job_posting_id: string
  interviewer_name: string
  interview_type: string
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'Rescheduled'
  scheduled_date: string
  scheduled_time: string
  duration_minutes: number
  location?: string
  notes?: string
  feedback?: string
  rating?: number
  created_at: string
  updated_at: string
}

export interface InterviewWithRelations extends Interview {
  candidate?: Candidate
  job_posting?: JobPosting
}

export interface CandidateHistory {
  id: string
  candidate_id: string
  from_stage_id?: string
  to_stage_id?: string
  action: string
  notes?: string
  created_by?: string
  created_at: string
}

export interface CandidateAttachment {
  id: string
  candidate_id: string
  file_name: string
  file_url: string
  file_type?: string
  file_size?: number
  uploaded_at: string
}

export interface InterviewFeedback {
  id: string
  interview_id: string
  feedback_type?: string
  rating?: number
  comments?: string
  created_by?: string
  created_at: string
}

// New/Update interfaces for forms
export interface NewJobPosting {
  title: string
  department: string
  location: string
  employment_type: string
  status?: string
  salary_range?: string
  description?: string
  requirements?: string
  responsibilities?: string
  benefits?: string
  hiring_manager?: string
  recruiter?: string
  closing_date?: string
}

export interface UpdateJobPosting extends Partial<NewJobPosting> {
  id: string
}

export interface NewCandidate {
  first_name: string
  last_name: string
  email: string
  phone?: string
  location?: string
  position?: string
  company?: string
  source?: string
  type?: string
  status?: string
  current_stage_id?: string
  job_posting_id?: string
  resume_url?: string
  cover_letter?: string
  notes?: string
}

export interface UpdateCandidate extends Partial<NewCandidate> {
  id: string
}

export interface NewInterview {
  candidate_id: string
  job_posting_id: string
  interviewer_name: string
  interview_type: string
  status?: string
  scheduled_date: string
  scheduled_time: string
  duration_minutes?: number
  location?: string
  notes?: string
}

export interface UpdateInterview extends Partial<NewInterview> {
  id: string
}

export interface NewPipelineStage {
  name: string
  description?: string
  color?: string
  order_index: number
  is_active?: boolean
}

export interface UpdatePipelineStage extends Partial<NewPipelineStage> {
  id: string
}

// Statistics interfaces
export interface JobStats {
  total: number
  open: number
  closed: number
  draft: number
  totalApplications: number
  totalInterviews: number
  totalHired: number
}

export interface PipelineStats {
  totalCandidates: number
  candidatesByStage: { [stageId: string]: number }
}

export interface InterviewStats {
  scheduled: number
  completed: number
  cancelled: number
  total: number
} 