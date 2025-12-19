-- Fix RLS policies for user_profiles to allow viewing other organization members
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;

-- Create a new policy that allows users to view profiles of members in their organizations
CREATE POLICY "Users can view organization member profiles" ON user_profiles
  FOR SELECT USING (
    id = auth.uid() OR -- Users can always view their own profile
    id IN (
      SELECT om.user_id 
      FROM organization_members om
      WHERE om.organization_id IN (
        SELECT om2.organization_id 
        FROM organization_members om2 
        WHERE om2.user_id = auth.uid() 
        AND om2.status = 'active'
      )
      AND om.status = 'active'
    )
  );

-- Keep the update policy as is (users can only update their own profile)
-- The existing policy is correct: "Users can update their own profile" 