-- Departments Table Schema (Robust - Checks and Fixes Everything)
-- Run this in Supabase SQL Editor

-- Step 1: Check if employees table exists and create it if needed
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'employees') THEN
        -- Create employees table if it doesn't exist
        CREATE TABLE employees (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            employee_id VARCHAR(50) UNIQUE NOT NULL,
            first_name VARCHAR(255) NOT NULL,
            last_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            phone VARCHAR(50),
            position VARCHAR(255) NOT NULL,
            department_id UUID,
            manager_id UUID,
            status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave', 'Terminated')),
            start_date DATE NOT NULL,
            location VARCHAR(255),
            avatar_initials VARCHAR(10),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Created employees table';
    ELSE
        RAISE NOTICE 'Employees table already exists';
    END IF;
END $$;

-- Step 2: Check and add manager_id column to employees if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employees' AND column_name = 'manager_id'
    ) THEN
        ALTER TABLE employees ADD COLUMN manager_id UUID;
        RAISE NOTICE 'Added manager_id column to employees table';
    ELSE
        RAISE NOTICE 'manager_id column already exists in employees table';
    END IF;
END $$;

-- Step 3: Check and add department_id column to employees if missing
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'employees' AND column_name = 'department_id'
    ) THEN
        ALTER TABLE employees ADD COLUMN department_id UUID;
        RAISE NOTICE 'Added department_id column to employees table';
    ELSE
        RAISE NOTICE 'department_id column already exists in employees table';
    END IF;
END $$;

-- Step 4: Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Add foreign key constraints (only if they don't exist)
DO $$
BEGIN
    -- Add foreign key for departments.manager_id -> employees.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'departments_manager_id_fkey'
    ) THEN
        ALTER TABLE departments 
        ADD CONSTRAINT departments_manager_id_fkey 
        FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key constraint for departments.manager_id';
    ELSE
        RAISE NOTICE 'Foreign key constraint for departments.manager_id already exists';
    END IF;
    
    -- Add foreign key for employees.department_id -> departments.id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'employees_department_id_fkey'
    ) THEN
        ALTER TABLE employees 
        ADD CONSTRAINT employees_department_id_fkey 
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key constraint for employees.department_id';
    ELSE
        RAISE NOTICE 'Foreign key constraint for employees.department_id already exists';
    END IF;
    
    -- Add foreign key for employees.manager_id -> employees.id (self-reference)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'employees_manager_id_fkey'
    ) THEN
        ALTER TABLE employees 
        ADD CONSTRAINT employees_manager_id_fkey 
        FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key constraint for employees.manager_id';
    ELSE
        RAISE NOTICE 'Foreign key constraint for employees.manager_id already exists';
    END IF;
END $$;

-- Step 6: Create indexes
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);
CREATE INDEX IF NOT EXISTS idx_departments_manager_id ON departments(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id);

-- Step 7: Create updated_at trigger
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

CREATE TRIGGER update_employees_updated_at 
    BEFORE UPDATE ON employees 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Enable Row Level Security (RLS)
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies for departments
CREATE POLICY "Allow authenticated users to read departments" ON departments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert departments" ON departments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update departments" ON departments
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete departments" ON departments
    FOR DELETE USING (auth.role() = 'authenticated');

-- Step 10: Create RLS policies for employees
CREATE POLICY "Allow authenticated users to read employees" ON employees
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert employees" ON employees
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update employees" ON employees
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete employees" ON employees
    FOR DELETE USING (auth.role() = 'authenticated');

-- Step 11: Insert sample departments
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

-- Step 12: Grant permissions
GRANT ALL ON departments TO authenticated;
GRANT ALL ON employees TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Step 13: Verify setup
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as department_count FROM departments;
SELECT COUNT(*) as employee_count FROM employees; 