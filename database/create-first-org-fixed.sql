-- Create the first organization
INSERT INTO organizations (name, slug, plan_type)
VALUES (
  'My Company', -- Replace with your company name
  'my-company', -- Replace with your desired slug
  'free'
) ON CONFLICT (slug) DO NOTHING;

-- Link the user to the organization as owner
INSERT INTO organization_members (
    organization_id, 
    user_id, 
    role, 
    status, 
    joined_at
)
SELECT 
    o.id,
    u.id,
    'owner',
    'active',
    NOW()
FROM organizations o
CROSS JOIN auth.users u
WHERE o.slug = 'my-company' 
  AND u.email = 'your-email@example.com' -- Replace with your actual email
ON CONFLICT (organization_id, user_id) DO NOTHING; 