-- Recruitment System Database Schema
-- This schema supports job postings, candidates, interviews, and pipeline management

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create recruitment tables
-- ========================

-- Job Postings Table
CREATE TABLE IF NOT EXISTS job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    employment_type VARCHAR(50) NOT NULL, -- Full-time, Part-time, Contract, Internship
    status VARCHAR(50) NOT NULL DEFAULT 'Draft', -- Draft, Open, Closed, On Hold
    salary_range VARCHAR(100),
    description TEXT,
    requirements TEXT,
    responsibilities TEXT,
    benefits TEXT,
    hiring_manager VARCHAR(255),
    recruiter VARCHAR(255),
    posted_date DATE DEFAULT CURRENT_DATE,
    closing_date DATE,
    applications_count INTEGER DEFAULT 0,
    interviews_count INTEGER DEFAULT 0,
    offers_count INTEGER DEFAULT 0,
    hired_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pipeline Stages Table
CREATE TABLE IF NOT EXISTS pipeline_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280', -- Hex color code
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidates Table
CREATE TABLE IF NOT EXISTS candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    location VARCHAR(255),
    position VARCHAR(255),
    company VARCHAR(255),
    source VARCHAR(100), -- LinkedIn, Indeed, Referral, etc.
    type VARCHAR(50) DEFAULT 'External', -- Internal, External
    status VARCHAR(50) DEFAULT 'New', -- New, In Review, Interview, Offer, Hired, Rejected
    current_stage_id UUID REFERENCES pipeline_stages(id),
    job_posting_id UUID REFERENCES job_postings(id),
    resume_url TEXT,
    cover_letter TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interviews Table
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    job_posting_id UUID NOT NULL REFERENCES job_postings(id),
    interviewer_name VARCHAR(255) NOT NULL,
    interview_type VARCHAR(100) NOT NULL, -- First Interview, Second Interview, Final Interview, Technical Interview
    status VARCHAR(50) DEFAULT 'Scheduled', -- Scheduled, Completed, Cancelled, Rescheduled
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INTEGER DEFAULT 45,
    location VARCHAR(255),
    notes TEXT,
    feedback TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidate History Table (for tracking pipeline movements)
CREATE TABLE IF NOT EXISTS candidate_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    from_stage_id UUID REFERENCES pipeline_stages(id),
    to_stage_id UUID REFERENCES pipeline_stages(id),
    action VARCHAR(100) NOT NULL, -- Moved, Added, Updated, etc.
    notes TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Candidate Attachments Table
CREATE TABLE IF NOT EXISTS candidate_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interview Feedback Table (for detailed feedback)
CREATE TABLE IF NOT EXISTS interview_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interview_id UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
    feedback_type VARCHAR(50), -- Technical, Cultural, Communication, etc.
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
-- ====================================

CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_job_postings_department ON job_postings(department);
CREATE INDEX IF NOT EXISTS idx_job_postings_posted_date ON job_postings(posted_date);

CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_job_posting_id ON candidates(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_candidates_current_stage_id ON candidates(current_stage_id);
CREATE INDEX IF NOT EXISTS idx_candidates_source ON candidates(source);

CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_job_posting_id ON interviews(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_date ON interviews(scheduled_date);

CREATE INDEX IF NOT EXISTS idx_pipeline_stages_order ON pipeline_stages(order_index);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_active ON pipeline_stages(is_active);

CREATE INDEX IF NOT EXISTS idx_candidate_history_candidate_id ON candidate_history(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_history_created_at ON candidate_history(created_at);

-- Create triggers for updated_at timestamps
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_job_postings_updated_at BEFORE UPDATE ON job_postings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pipeline_stages_updated_at BEFORE UPDATE ON pipeline_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update job posting counts
-- ===========================================

CREATE OR REPLACE FUNCTION update_job_posting_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update applications count
    UPDATE job_postings 
    SET applications_count = (
        SELECT COUNT(*) FROM candidates WHERE job_posting_id = NEW.job_posting_id
    )
    WHERE id = NEW.job_posting_id;
    
    -- Update interviews count
    UPDATE job_postings 
    SET interviews_count = (
        SELECT COUNT(*) FROM interviews WHERE job_posting_id = NEW.job_posting_id
    )
    WHERE id = NEW.job_posting_id;
    
    -- Update hired count
    UPDATE job_postings 
    SET hired_count = (
        SELECT COUNT(*) FROM candidates 
        WHERE job_posting_id = NEW.job_posting_id AND status = 'Hired'
    )
    WHERE id = NEW.job_posting_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_job_counts_on_candidate_insert AFTER INSERT ON candidates FOR EACH ROW EXECUTE FUNCTION update_job_posting_counts();
CREATE TRIGGER update_job_counts_on_candidate_update AFTER UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION update_job_posting_counts();
CREATE TRIGGER update_job_counts_on_interview_insert AFTER INSERT ON interviews FOR EACH ROW EXECUTE FUNCTION update_job_posting_counts();

-- Create trigger to log candidate history
-- ======================================

CREATE OR REPLACE FUNCTION log_candidate_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Log stage changes
    IF OLD.current_stage_id IS DISTINCT FROM NEW.current_stage_id THEN
        INSERT INTO candidate_history (candidate_id, from_stage_id, to_stage_id, action, notes)
        VALUES (NEW.id, OLD.current_stage_id, NEW.current_stage_id, 'Stage Changed', 
                'Moved from ' || (SELECT name FROM pipeline_stages WHERE id = OLD.current_stage_id) || 
                ' to ' || (SELECT name FROM pipeline_stages WHERE id = NEW.current_stage_id));
    END IF;
    
    -- Log status changes
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO candidate_history (candidate_id, action, notes)
        VALUES (NEW.id, 'Status Changed', 'Status changed from ' || OLD.status || ' to ' || NEW.status);
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_candidate_changes AFTER UPDATE ON candidates FOR EACH ROW EXECUTE FUNCTION log_candidate_history();

-- Insert default pipeline stages
-- =============================

INSERT INTO pipeline_stages (name, description, color, order_index) VALUES
('New Applications', 'Candidates who have just applied', '#F59E0B', 1),
('Screening', 'Initial resume and application review', '#6B7280', 2),
('First Interview', 'First round of interviews', '#3B82F6', 3),
('Second Interview', 'Second round of interviews', '#8B5CF6', 4),
('Technical Assessment', 'Technical skills evaluation', '#EF4444', 5),
('Final Interview', 'Final round with hiring manager', '#10B981', 6),
('Reference Check', 'Checking candidate references', '#F97316', 7),
('Offer', 'Offer extended to candidate', '#EC4899', 8),
('Hired', 'Candidate has accepted offer', '#059669', 9),
('Rejected', 'Candidate not selected', '#DC2626', 10)
ON CONFLICT DO NOTHING;

-- Insert sample job postings
-- =========================

INSERT INTO job_postings (title, department, location, employment_type, status, salary_range, description, requirements, responsibilities, benefits, hiring_manager, recruiter, closing_date) VALUES
('Sales Executive', 'Sales', 'New York, NY', 'Full-time', 'Open', '$75,000 - $95,000', 'We are seeking a dynamic Sales Executive to join our growing team. The ideal candidate will have 3+ years of B2B sales experience and a proven track record of exceeding targets.', '["3+ years of B2B sales experience", "Proven track record of exceeding sales targets", "Excellent communication and presentation skills", "Bachelor''s degree in Business or related field", "Experience with CRM systems (Salesforce preferred)"]', '["Develop and maintain relationships with key clients", "Achieve monthly and quarterly sales targets", "Conduct product demonstrations and presentations", "Collaborate with marketing team on lead generation", "Prepare and deliver sales proposals"]', '["Competitive salary with commission structure", "Health, dental, and vision insurance", "401(k) with company match", "Flexible work arrangements", "Professional development opportunities"]', 'Sarah Johnson', 'Mike Chen', CURRENT_DATE + INTERVAL '30 days'),

('Sales Representative', 'Sales', 'Remote', 'Full-time', 'Open', '$60,000 - $80,000', 'Join our sales team as a Sales Representative. This role is perfect for someone who is passionate about building relationships and driving revenue growth.', '["1+ years of sales experience", "Strong interpersonal skills", "Goal-oriented and self-motivated", "High school diploma required", "Willingness to travel occasionally"]', '["Generate new business opportunities", "Manage existing client relationships", "Meet and exceed sales quotas", "Participate in sales training and development", "Maintain accurate records in CRM"]', '["Base salary plus commission", "Health insurance", "Paid time off", "Sales training and mentorship", "Career advancement opportunities"]', 'David Wilson', 'Lisa Brown', CURRENT_DATE + INTERVAL '30 days'),

('Marketing Specialist', 'Marketing', 'San Francisco, CA', 'Full-time', 'Open', '$70,000 - $90,000', 'We''re looking for a creative and data-driven Marketing Specialist to help us grow our brand presence and drive customer acquisition.', '["2+ years of digital marketing experience", "Experience with Google Analytics and AdWords", "Strong copywriting skills", "Bachelor''s degree in Marketing or related field", "Experience with social media platforms"]', '["Develop and execute marketing campaigns", "Analyze campaign performance and optimize for results", "Create engaging content for various channels", "Collaborate with design and sales teams", "Manage social media presence"]', '["Competitive salary", "Health benefits", "Flexible work environment", "Professional development budget", "Team events and activities"]', 'Emily Davis', 'Alex Rodriguez', CURRENT_DATE + INTERVAL '30 days'),

('Customer Success Manager', 'Customer Success', 'Austin, TX', 'Full-time', 'Open', '$65,000 - $85,000', 'Join our Customer Success team to help ensure our customers achieve their goals and maximize the value of our products.', '["2+ years of customer success or account management experience", "Excellent communication and problem-solving skills", "Experience with CRM systems", "Bachelor''s degree preferred", "Ability to work with technical and non-technical stakeholders"]', '["Onboard new customers and ensure successful adoption", "Build and maintain strong customer relationships", "Identify upsell and expansion opportunities", "Collaborate with product and support teams", "Monitor customer health and prevent churn"]', '["Competitive salary", "Health and wellness benefits", "Remote work options", "Professional development", "Customer success certification programs"]', 'Jennifer Lee', 'Tom Anderson', CURRENT_DATE + INTERVAL '30 days'),

('Software Engineer', 'Engineering', 'Seattle, WA', 'Full-time', 'Open', '$100,000 - $130,000', 'We are looking for a talented Software Engineer to join our engineering team and help build scalable, high-quality software solutions.', '["3+ years of software development experience", "Proficiency in JavaScript, Python, or similar languages", "Experience with modern web frameworks", "Knowledge of database design and SQL", "Experience with cloud platforms (AWS, GCP, or Azure)"]', '["Design and implement new features", "Write clean, maintainable, and well-tested code", "Collaborate with product and design teams", "Participate in code reviews and technical discussions", "Contribute to architectural decisions"]', '["Competitive salary and equity", "Comprehensive health benefits", "Flexible work arrangements", "Professional development budget", "Modern development tools and equipment"]', 'Michael Chen', 'Sarah Williams', CURRENT_DATE + INTERVAL '30 days')
ON CONFLICT DO NOTHING;

-- Insert sample candidates
-- =======================

INSERT INTO candidates (first_name, last_name, email, phone, location, position, company, source, type, status, current_stage_id, job_posting_id) VALUES
('John', 'Smith', 'john.smith@email.com', '+1-555-0123', 'New York, NY', 'Sales Executive', 'TechCorp Inc', 'LinkedIn', 'External', 'New', (SELECT id FROM pipeline_stages WHERE name = 'New Applications'), (SELECT id FROM job_postings WHERE title = 'Sales Executive' LIMIT 1)),
('Sarah', 'Johnson', 'sarah.johnson@email.com', '+1-555-0124', 'San Francisco, CA', 'Marketing Specialist', 'Digital Solutions', 'Indeed', 'External', 'Screening', (SELECT id FROM pipeline_stages WHERE name = 'Screening'), (SELECT id FROM job_postings WHERE title = 'Marketing Specialist' LIMIT 1)),
('Michael', 'Brown', 'michael.brown@email.com', '+1-555-0125', 'Austin, TX', 'Customer Success Manager', 'CloudTech', 'Referral', 'External', 'First Interview', (SELECT id FROM pipeline_stages WHERE name = 'First Interview'), (SELECT id FROM job_postings WHERE title = 'Customer Success Manager' LIMIT 1)),
('Emily', 'Davis', 'emily.davis@email.com', '+1-555-0126', 'Seattle, WA', 'Software Engineer', 'CodeWorks', 'LinkedIn', 'External', 'Technical Assessment', (SELECT id FROM pipeline_stages WHERE name = 'Technical Assessment'), (SELECT id FROM job_postings WHERE title = 'Software Engineer' LIMIT 1)),
('David', 'Wilson', 'david.wilson@email.com', '+1-555-0127', 'Remote', 'Sales Representative', 'SalesForce Inc', 'Indeed', 'External', 'Offer', (SELECT id FROM pipeline_stages WHERE name = 'Offer'), (SELECT id FROM job_postings WHERE title = 'Sales Representative' LIMIT 1)),
('Lisa', 'Anderson', 'lisa.anderson@email.com', '+1-555-0128', 'New York, NY', 'Sales Executive', 'Enterprise Solutions', 'LinkedIn', 'External', 'Hired', (SELECT id FROM pipeline_stages WHERE name = 'Hired'), (SELECT id FROM job_postings WHERE title = 'Sales Executive' LIMIT 1)),
('Robert', 'Taylor', 'robert.taylor@email.com', '+1-555-0129', 'San Francisco, CA', 'Marketing Specialist', 'Growth Marketing', 'Referral', 'External', 'Rejected', (SELECT id FROM pipeline_stages WHERE name = 'Rejected'), (SELECT id FROM job_postings WHERE title = 'Marketing Specialist' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Insert sample interviews
-- =======================

INSERT INTO interviews (candidate_id, job_posting_id, interviewer_name, interview_type, status, scheduled_date, scheduled_time, duration_minutes, location, notes) VALUES
((SELECT id FROM candidates WHERE email = 'michael.brown@email.com'), (SELECT id FROM job_postings WHERE title = 'Customer Success Manager' LIMIT 1), 'Jennifer Lee', 'First Interview', 'Scheduled', CURRENT_DATE + INTERVAL '2 days', '10:00:00', 45, 'Conference Room A', 'Focus on customer success experience and problem-solving skills'),
((SELECT id FROM candidates WHERE email = 'emily.davis@email.com'), (SELECT id FROM job_postings WHERE title = 'Software Engineer' LIMIT 1), 'Michael Chen', 'Technical Assessment', 'Scheduled', CURRENT_DATE + INTERVAL '3 days', '14:00:00', 60, 'Virtual', 'Technical coding assessment and system design discussion'),
((SELECT id FROM candidates WHERE email = 'david.wilson@email.com'), (SELECT id FROM job_postings WHERE title = 'Sales Representative' LIMIT 1), 'David Wilson', 'Final Interview', 'Completed', CURRENT_DATE - INTERVAL '1 day', '11:00:00', 45, 'Virtual', 'Final interview completed successfully. Candidate shows strong potential.'),
((SELECT id FROM candidates WHERE email = 'sarah.johnson@email.com'), (SELECT id FROM job_postings WHERE title = 'Marketing Specialist' LIMIT 1), 'Emily Davis', 'First Interview', 'Scheduled', CURRENT_DATE + INTERVAL '5 days', '15:00:00', 45, 'Conference Room B', 'Initial screening interview to assess marketing experience')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
-- ===============================

ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (basic - you may want to customize based on your auth system)
-- ================================================================================

-- Job postings policies
CREATE POLICY "Enable read access for all users" ON job_postings FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON job_postings FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON job_postings FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON job_postings FOR DELETE USING (true);

-- Candidates policies
CREATE POLICY "Enable read access for all users" ON candidates FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON candidates FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON candidates FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON candidates FOR DELETE USING (true);

-- Interviews policies
CREATE POLICY "Enable read access for all users" ON interviews FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON interviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON interviews FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON interviews FOR DELETE USING (true);

-- Pipeline stages policies
CREATE POLICY "Enable read access for all users" ON pipeline_stages FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON pipeline_stages FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON pipeline_stages FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON pipeline_stages FOR DELETE USING (true);

-- Candidate history policies
CREATE POLICY "Enable read access for all users" ON candidate_history FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON candidate_history FOR INSERT WITH CHECK (true);

-- Candidate attachments policies
CREATE POLICY "Enable read access for all users" ON candidate_attachments FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON candidate_attachments FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable delete for authenticated users" ON candidate_attachments FOR DELETE USING (true);

-- Interview feedback policies
CREATE POLICY "Enable read access for all users" ON interview_feedback FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON interview_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON interview_feedback FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON interview_feedback FOR DELETE USING (true);

-- Grant necessary permissions
-- ==========================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Grant permissions on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated; 