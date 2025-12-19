-- Departments Table Schema (Simple - No Foreign Keys)
-- Run this in Supabase SQL Editor

-- Create departments table without any foreign key constraints
CREATE TABLE IF NOT EXISTS departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id UUID, -- Just a UUID field, no foreign key constraint
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);
CREATE INDEX IF NOT EXISTS idx_departments_manager_id ON departments(manager_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_departments_updated_at 
    BEFORE UPDATE ON departments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to read departments" ON departments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert departments" ON departments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update departments" ON departments
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete departments" ON departments
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample departments
INSERT INTO departments (name, description) VALUES
    ('Engineering', 'Software development and technical operations'),
    ('Marketing', 'Brand management, advertising, and customer acquisition'),
    ('Sales', 'Customer acquisition and revenue generation'),
    ('Human Resources', 'Employee management, recruitment, and workplace culture'),
    ('Finance', 'Financial planning, accounting, and budget management'),
    ('Operations', 'Business operations and process optimization'),
    ('Customer Support', 'Customer service and technical support'),
    ('Product Management', 'Product strategy, planning, and development oversight')
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL ON departments TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verify setup
SELECT 'Departments table created successfully!' as status; 