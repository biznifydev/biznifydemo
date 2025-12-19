-- Create the first organization
INSERT INTO organizations (name, slug, plan_type)
VALUES (
  'My Company', -- Replace with your company name
  'my-company', -- Replace with your desired slug
  'free'
) ON CONFLICT (slug) DO NOTHING;

-- Get the organization ID
DO $$
DECLARE
    org_id UUID;
    user_id UUID;
BEGIN
    -- Get the organization ID
    SELECT id INTO org_id FROM organizations WHERE slug = 'my-company' LIMIT 1;
    
    -- Get the user ID (replace with your actual email)
    SELECT id INTO user_id FROM auth.users WHERE email = 'your-email@example.com' LIMIT 1;
    
    -- Link the user to the organization as owner
    IF org_id IS NOT NULL AND user_id IS NOT NULL THEN
        INSERT INTO organization_members (
            organization_id, 
            user_id, 
            role, 
            status, 
            joined_at
        ) VALUES (
            org_id,
            user_id,
            'owner',
            'active',
            NOW()
        ) ON CONFLICT (organization_id, user_id) DO NOTHING;
        
        RAISE NOTICE 'Successfully linked user % to organization %', user_id, org_id;
    ELSE
        RAISE NOTICE 'Could not find organization or user';
    END IF;
END $$; 