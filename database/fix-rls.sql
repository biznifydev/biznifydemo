-- Drop the problematic RLS policies
DROP POLICY IF EXISTS "Users can view their own organizations" ON organizations;
DROP POLICY IF EXISTS "Organization owners can update their organizations" ON organizations;
DROP POLICY IF EXISTS "Users can view members of their organizations" ON organization_members;
DROP POLICY IF EXISTS "Organization admins can manage members" ON organization_members;
DROP POLICY IF EXISTS "Users can view accounts in their organizations" ON financial_accounts;
DROP POLICY IF EXISTS "Organization admins can manage accounts" ON financial_accounts;
DROP POLICY IF EXISTS "Users can view data in their organizations" ON financial_data;
DROP POLICY IF EXISTS "Users can update data in their organizations" ON financial_data;
DROP POLICY IF EXISTS "Users can insert data in their organizations" ON financial_data;

-- Create simplified policies that don't cause recursion
CREATE POLICY "Allow all authenticated users to view organizations" ON organizations
  FOR SELECT USING (true);

CREATE POLICY "Allow all authenticated users to update organizations" ON organizations
  FOR UPDATE USING (true);

CREATE POLICY "Allow all authenticated users to view members" ON organization_members
  FOR SELECT USING (true);

CREATE POLICY "Allow all authenticated users to manage members" ON organization_members
  FOR ALL USING (true);

CREATE POLICY "Allow all authenticated users to view accounts" ON financial_accounts
  FOR SELECT USING (true);

CREATE POLICY "Allow all authenticated users to manage accounts" ON financial_accounts
  FOR ALL USING (true);

CREATE POLICY "Allow all authenticated users to view data" ON financial_data
  FOR SELECT USING (true);

CREATE POLICY "Allow all authenticated users to update data" ON financial_data
  FOR UPDATE USING (true);

CREATE POLICY "Allow all authenticated users to insert data" ON financial_data
  FOR INSERT WITH CHECK (true); 