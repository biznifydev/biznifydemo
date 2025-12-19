-- Fix Employee Manager Relationship for PostgREST
-- Run this in your Supabase SQL editor

-- Drop the existing foreign key constraint if it exists
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_manager_id_fkey;

-- Add the foreign key constraint with a proper name
ALTER TABLE employees 
ADD CONSTRAINT employees_manager_id_fkey 
FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;

-- Create an index for better performance
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id); 