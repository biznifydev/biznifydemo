-- Fix employee email constraint to be unique per organization instead of globally unique
-- This allows the same email to be used in different organizations

-- Drop the existing unique constraint on email
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_email_key;

-- Create a new unique constraint on (email, organization_id)
-- This allows the same email to be used in different organizations
ALTER TABLE employees ADD CONSTRAINT employees_email_org_unique UNIQUE (email, organization_id);

-- Add a comment explaining the constraint
COMMENT ON CONSTRAINT employees_email_org_unique ON employees IS 'Email must be unique within each organization, but can be reused across different organizations'; 