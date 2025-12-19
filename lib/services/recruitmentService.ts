import { supabase } from '@/lib/supabase'
import {
  JobPosting,
  Candidate,
  Interview,
  PipelineStage,
  CandidateHistory,
  CandidateAttachment,
  InterviewFeedback,
  NewJobPosting,
  UpdateJobPosting,
  NewCandidate,
  UpdateCandidate,
  NewInterview,
  UpdateInterview,
  NewPipelineStage,
  UpdatePipelineStage,
  JobStats,
  PipelineStats,
  InterviewStats,
  CandidateWithRelations,
  InterviewWithRelations
} from '@/lib/types/recruitment'

export class RecruitmentService {
  // Job Postings
  static async getJobPostings(): Promise<JobPosting[]> {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getJobPosting(id: string): Promise<JobPosting | null> {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async createJobPosting(jobPosting: NewJobPosting): Promise<JobPosting> {
    const { data, error } = await supabase
      .from('job_postings')
      .insert([jobPosting])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateJobPosting(id: string, updates: UpdateJobPosting): Promise<JobPosting> {
    const { data, error } = await supabase
      .from('job_postings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteJobPosting(id: string): Promise<void> {
    const { error } = await supabase
      .from('job_postings')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Candidates
  static async getCandidates(): Promise<CandidateWithRelations[]> {
    const { data, error } = await supabase
      .from('candidates')
      .select(`
        *,
        current_stage:pipeline_stages(*),
        job_posting:job_postings(*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getCandidate(id: string): Promise<CandidateWithRelations | null> {
    const { data, error } = await supabase
      .from('candidates')
      .select(`
        *,
        current_stage:pipeline_stages(*),
        job_posting:job_postings(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async createCandidate(candidate: NewCandidate): Promise<Candidate> {
    const { data, error } = await supabase
      .from('candidates')
      .insert([candidate])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateCandidate(id: string, updates: UpdateCandidate): Promise<Candidate> {
    const { data, error } = await supabase
      .from('candidates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteCandidate(id: string): Promise<void> {
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  static async moveCandidateToStage(candidateId: string, stageId: string): Promise<Candidate> {
    const { data, error } = await supabase
      .from('candidates')
      .update({ current_stage_id: stageId })
      .eq('id', candidateId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Interviews
  static async getInterviews(): Promise<InterviewWithRelations[]> {
    const { data, error } = await supabase
      .from('interviews')
      .select(`
        *,
        candidate:candidates(*),
        job_posting:job_postings(*)
      `)
      .order('scheduled_date', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getInterview(id: string): Promise<InterviewWithRelations | null> {
    const { data, error } = await supabase
      .from('interviews')
      .select(`
        *,
        candidate:candidates(*),
        job_posting:job_postings(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async createInterview(interview: NewInterview): Promise<Interview> {
    const { data, error } = await supabase
      .from('interviews')
      .insert([interview])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateInterview(id: string, updates: UpdateInterview): Promise<Interview> {
    const { data, error } = await supabase
      .from('interviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteInterview(id: string): Promise<void> {
    const { error } = await supabase
      .from('interviews')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Pipeline Stages
  static async getPipelineStages(): Promise<PipelineStage[]> {
    const { data, error } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('is_active', true)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async createPipelineStage(stage: NewPipelineStage): Promise<PipelineStage> {
    const { data, error } = await supabase
      .from('pipeline_stages')
      .insert([stage])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updatePipelineStage(id: string, updates: UpdatePipelineStage): Promise<PipelineStage> {
    const { data, error } = await supabase
      .from('pipeline_stages')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deletePipelineStage(id: string): Promise<void> {
    const { error } = await supabase
      .from('pipeline_stages')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Candidate History
  static async getCandidateHistory(candidateId: string): Promise<CandidateHistory[]> {
    const { data, error } = await supabase
      .from('candidate_history')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Attachments
  static async getCandidateAttachments(candidateId: string): Promise<CandidateAttachment[]> {
    const { data, error } = await supabase
      .from('candidate_attachments')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('uploaded_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async uploadAttachment(attachment: Omit<CandidateAttachment, 'id' | 'uploaded_at'>): Promise<CandidateAttachment> {
    const { data, error } = await supabase
      .from('candidate_attachments')
      .insert([attachment])
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteAttachment(id: string): Promise<void> {
    const { error } = await supabase
      .from('candidate_attachments')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Interview Feedback
  static async getInterviewFeedback(interviewId: string): Promise<InterviewFeedback[]> {
    const { data, error } = await supabase
      .from('interview_feedback')
      .select('*')
      .eq('interview_id', interviewId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async addInterviewFeedback(feedback: Omit<InterviewFeedback, 'id' | 'created_at'>): Promise<InterviewFeedback> {
    const { data, error } = await supabase
      .from('interview_feedback')
      .insert([feedback])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Statistics
  static async getJobStats(): Promise<JobStats> {
    const { data: jobs, error } = await supabase
      .from('job_postings')
      .select('*')

    if (error) throw error

    const total = jobs?.length || 0
    const open = jobs?.filter(job => job.status === 'Open').length || 0
    const closed = jobs?.filter(job => job.status === 'Closed').length || 0
    const draft = jobs?.filter(job => job.status === 'Draft').length || 0
    const totalApplications = jobs?.reduce((sum, job) => sum + job.applications_count, 0) || 0
    const totalInterviews = jobs?.reduce((sum, job) => sum + job.interviews_count, 0) || 0
    const totalHired = jobs?.reduce((sum, job) => sum + job.hired_count, 0) || 0

    return {
      total,
      open,
      closed,
      draft,
      totalApplications,
      totalInterviews,
      totalHired
    }
  }

  static async getPipelineStats(): Promise<PipelineStats> {
    const { data: candidates, error } = await supabase
      .from('candidates')
      .select('current_stage_id')

    if (error) throw error

    const candidatesByStage: { [stageId: string]: number } = {}
    candidates?.forEach(candidate => {
      if (candidate.current_stage_id) {
        candidatesByStage[candidate.current_stage_id] = (candidatesByStage[candidate.current_stage_id] || 0) + 1
      }
    })

    return {
      totalCandidates: candidates?.length || 0,
      candidatesByStage
    }
  }

  static async getInterviewStats(): Promise<InterviewStats> {
    const { data: interviews, error } = await supabase
      .from('interviews')
      .select('status')

    if (error) throw error

    const scheduled = interviews?.filter(i => i.status === 'Scheduled').length || 0
    const completed = interviews?.filter(i => i.status === 'Completed').length || 0
    const cancelled = interviews?.filter(i => i.status === 'Cancelled').length || 0
    const total = interviews?.length || 0

    return {
      scheduled,
      completed,
      cancelled,
      total
    }
  }

  // Search and Filter
  static async searchCandidates(query: string): Promise<CandidateWithRelations[]> {
    const { data, error } = await supabase
      .from('candidates')
      .select(`
        *,
        current_stage:pipeline_stages(*),
        job_posting:job_postings(*)
      `)
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,position.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getCandidatesByJobPosting(jobPostingId: string): Promise<CandidateWithRelations[]> {
    const { data, error } = await supabase
      .from('candidates')
      .select(`
        *,
        current_stage:pipeline_stages(*),
        job_posting:job_postings(*)
      `)
      .eq('job_posting_id', jobPostingId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getCandidatesByStage(stageId: string): Promise<CandidateWithRelations[]> {
    const { data, error } = await supabase
      .from('candidates')
      .select(`
        *,
        current_stage:pipeline_stages(*),
        job_posting:job_postings(*)
      `)
      .eq('current_stage_id', stageId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Utility functions
  static generateAvatarInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  static formatDateTime(dateString: string, timeString: string): string {
    const date = new Date(`${dateString}T${timeString}`)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
} 