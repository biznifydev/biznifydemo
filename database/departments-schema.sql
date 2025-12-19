-- Departments Table Schema
-- Run this in Supabase SQL Editor

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
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
-- Allow all authenticated users to read departments
CREATE POLICY "Allow authenticated users to read departments" ON departments
    FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert departments
CREATE POLICY "Allow authenticated users to insert departments" ON departments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update departments
CREATE POLICY "Allow authenticated users to update departments" ON departments
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete departments
CREATE POLICY "Allow authenticated users to delete departments" ON departments
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert sample departments (only if table is empty)
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

-- Update the employees table to reference departments (if not already done)
-- This assumes you already have an employees table with a department_id column
-- If not, you'll need to add it:

-- ALTER TABLE employees ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;
-- CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees(department_id);

-- Grant necessary permissions
GRANT ALL ON departments TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 