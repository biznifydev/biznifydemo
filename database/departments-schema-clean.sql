-- Departments Table Schema (Clean - Handles Existing Objects)
-- Run this in Supabase SQL Editor

-- Step 1: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;

-- Step 2: Create departments table with minimal structure
CREATE TABLE IF NOT EXISTS departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create basic index (IF NOT EXISTS handles duplicates)
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);

-- Step 4: Create updated_at trigger function (OR REPLACE handles duplicates)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 5: Create trigger (DROP IF EXISTS above handles duplicates)
CREATE TRIGGER update_departments_updated_at 
    BEFORE UPDATE ON departments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Enable Row Level Security (RLS)
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Step 7: Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read departments" ON departments;
DROP POLICY IF EXISTS "Allow authenticated users to insert departments" ON departments;
DROP POLICY IF EXISTS "Allow authenticated users to update departments" ON departments;
DROP POLICY IF EXISTS "Allow authenticated users to delete departments" ON departments;

-- Step 8: Create RLS policies
CREATE POLICY "Allow authenticated users to read departments" ON departments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert departments" ON departments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update departments" ON departments
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete departments" ON departments
    FOR DELETE USING (auth.role() = 'authenticated');

-- Step 9: Insert sample departments (ON CONFLICT handles duplicates)
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

-- Step 10: Grant permissions
GRANT ALL ON departments TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 11: Verify setup
SELECT 'Departments table created successfully!' as status;
SELECT COUNT(*) as department_count FROM departments; 