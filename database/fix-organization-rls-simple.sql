-- Fix RLS policies for organizations table (simplified to avoid infinite recursion)

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view their own organizations" ON organizations;
DROP POLICY IF EXISTS "Organization owners can update their organizations" ON organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Organization owners can delete their organizations" ON organizations;

-- Drop organization_members policies that cause recursion
DROP POLICY IF EXISTS "Users can view their own memberships" ON organization_members;
DROP POLICY IF EXISTS "Organization owners can add members" ON organization_members;
DROP POLICY IF EXISTS "Organization owners can update members" ON organization_members;
DROP POLICY IF EXISTS "Organization owners can remove members" ON organization_members;

-- Simple organizations policies (no recursion)

-- Allow authenticated users to view all organizations (we'll filter in the app)
CREATE POLICY "Authenticated users can view organizations" ON organizations
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to create organizations
CREATE POLICY "Authenticated users can create organizations" ON organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update organizations (we'll check permissions in the app)
CREATE POLICY "Authenticated users can update organizations" ON organizations
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to delete organizations (we'll check permissions in the app)
CREATE POLICY "Authenticated users can delete organizations" ON organizations
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Simple organization_members policies (no recursion)

-- Allow authenticated users to view all memberships (we'll filter in the app)
CREATE POLICY "Authenticated users can view memberships" ON organization_members
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to create memberships (we'll check permissions in the app)
CREATE POLICY "Authenticated users can create memberships" ON organization_members
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update memberships (we'll check permissions in the app)
CREATE POLICY "Authenticated users can update memberships" ON organization_members
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to delete memberships (we'll check permissions in the app)
CREATE POLICY "Authenticated users can delete memberships" ON organization_members
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Function to automatically add creator as owner when organization is created
CREATE OR REPLACE FUNCTION handle_new_organization()
RETURNS TRIGGER AS $$
BEGIN
  -- Add the creating user as an owner of the organization
  INSERT INTO organization_members (
    organization_id,
    user_id,
    role,
    status,
    joined_at
  ) VALUES (
    NEW.id,
    auth.uid(),
    'owner',
    'active',
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically add creator as owner
DROP TRIGGER IF EXISTS on_organization_created ON organizations;
CREATE TRIGGER on_organization_created
  AFTER INSERT ON organizations
  FOR EACH ROW EXECUTE FUNCTION handle_new_organization(); 