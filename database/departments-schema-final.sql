-- Departments Table Schema (Final - No Foreign Key Issues)
-- Run this in Supabase SQL Editor

-- Step 1: Add manager_id to employees table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employees' AND column_name = 'manager_id'
    ) THEN
        ALTER TABLE employees ADD COLUMN manager_id UUID;
        CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id);
        RAISE NOTICE 'Added manager_id column to employees table';
    ELSE
        RAISE NOTICE 'manager_id column already exists in employees table';
    END IF;
END $$;

-- Step 2: Create departments table WITHOUT foreign key constraint initially
CREATE TABLE IF NOT EXISTS departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Add foreign key constraint after both tables exist
DO $$
BEGIN
    -- Only add the foreign key if it doesn't already exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'departments_manager_id_fkey'
    ) THEN
        ALTER TABLE departments 
        ADD CONSTRAINT departments_manager_id_fkey 
        FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key constraint for manager_id';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists';
    END IF;
END $$;

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);
CREATE INDEX IF NOT EXISTS idx_departments_manager_id ON departments(manager_id);

-- Step 5: Create updated_at trigger
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

-- Step 6: Enable Row Level Security (RLS)
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies
CREATE POLICY "Allow authenticated users to read departments" ON departments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert departments" ON departments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update departments" ON departments
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete departments" ON departments
    FOR DELETE USING (auth.role() = 'authenticated');

-- Step 8: Insert sample departments
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

-- Step 9: Grant permissions
GRANT ALL ON departments TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 10: Verify setup
SELECT 'Departments table created successfully!' as status; 