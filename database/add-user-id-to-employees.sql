-- Add organization_id and user_id fields to employees table
-- This allows linking employee records to organizations and user accounts

-- Add the organization_id column
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add the user_id column
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_organization_id ON employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);

-- Add a unique constraint to ensure one employee record per user per organization
-- Note: We need to handle this carefully since IF NOT EXISTS is not supported for constraints
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'employees_user_org_unique' 
        AND table_name = 'employees'
    ) THEN
        ALTER TABLE employees ADD CONSTRAINT employees_user_org_unique UNIQUE (user_id, organization_id);
    END IF;
END $$;

-- Update RLS policies to allow users to view employee records in their organization
DROP POLICY IF EXISTS "Users can view employees in their organization" ON employees;
CREATE POLICY "Users can view employees in their organization" ON employees
FOR SELECT USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_id = employees.organization_id 
    AND user_id = auth.uid()
  )
);

-- Allow users to create their own employee record in their organization
DROP POLICY IF EXISTS "Users can create their own employee record" ON employees;
CREATE POLICY "Users can create their own employee record" ON employees
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_id = employees.organization_id 
    AND user_id = auth.uid()
  )
);

-- Allow users to update their own employee record
DROP POLICY IF EXISTS "Users can update their own employee record" ON employees;
CREATE POLICY "Users can update their own employee record" ON employees
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND user_id = auth.uid()
);

-- Allow organization admins/owners to update any employee record in their organization
DROP POLICY IF EXISTS "Admins can update employees in their organization" ON employees;
CREATE POLICY "Admins can update employees in their organization" ON employees
FOR UPDATE USING (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_id = employees.organization_id 
    AND user_id = auth.uid()
    AND role IN ('admin', 'owner')
  )
); 