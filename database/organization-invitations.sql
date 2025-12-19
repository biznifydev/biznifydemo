-- Organization Invitations Table
CREATE TABLE IF NOT EXISTS organization_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    invitation_code TEXT NOT NULL UNIQUE,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for organization invitations
CREATE INDEX IF NOT EXISTS idx_organization_invitations_organization_id ON organization_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_email ON organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_code ON organization_invitations(invitation_code);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_status ON organization_invitations(status);

-- Update trigger for organization_invitations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organization_invitations_updated_at 
    BEFORE UPDATE ON organization_invitations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security for organization_invitations
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view invitations they created or were invited to
CREATE POLICY "Users can view their invitations" ON organization_invitations
    FOR SELECT USING (
        invited_by = auth.uid() OR 
        email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Policy: Organization owners/admins can create invitations
CREATE POLICY "Organization owners/admins can create invitations" ON organization_invitations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_id = organization_invitations.organization_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

-- Policy: Organization owners/admins can update invitations
CREATE POLICY "Organization owners/admins can update invitations" ON organization_invitations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_id = organization_invitations.organization_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

-- Policy: Organization owners/admins can delete invitations
CREATE POLICY "Organization owners/admins can delete invitations" ON organization_invitations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM organization_members 
            WHERE organization_id = organization_invitations.organization_id 
            AND user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

-- Function to generate invitation codes
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a 8-character alphanumeric code
        code := upper(substring(md5(random()::text) from 1 for 8));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM organization_invitations WHERE invitation_code = code) INTO exists;
        
        -- If code doesn't exist, return it
        IF NOT exists THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to create an invitation
CREATE OR REPLACE FUNCTION create_organization_invitation(
    p_organization_id UUID,
    p_email TEXT,
    p_role TEXT DEFAULT 'member'
)
RETURNS TEXT AS $$
DECLARE
    invitation_code TEXT;
BEGIN
    -- Check if user has permission to create invitations
    IF NOT EXISTS (
        SELECT 1 FROM organization_members 
        WHERE organization_id = p_organization_id 
        AND user_id = auth.uid() 
        AND role IN ('owner', 'admin')
        AND status = 'active'
    ) THEN
        RAISE EXCEPTION 'Insufficient permissions to create invitation';
    END IF;

    -- Generate unique invitation code
    invitation_code := generate_invitation_code();

    -- Create invitation
    INSERT INTO organization_invitations (
        organization_id,
        email,
        role,
        invitation_code,
        invited_by
    ) VALUES (
        p_organization_id,
        p_email,
        p_role,
        invitation_code,
        auth.uid()
    );

    RETURN invitation_code;
END;
$$ LANGUAGE plpgsql;

-- Function to accept an invitation
CREATE OR REPLACE FUNCTION accept_organization_invitation(
    p_invitation_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    invitation RECORD;
    user_email TEXT;
BEGIN
    -- Get current user's email
    SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();

    -- Get invitation details
    SELECT * INTO invitation 
    FROM organization_invitations 
    WHERE invitation_code = p_invitation_code 
    AND email = user_email
    AND status = 'pending'
    AND expires_at > NOW();

    -- Check if invitation exists and is valid
    IF invitation IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired invitation';
    END IF;

    -- Add user to organization
    INSERT INTO organization_members (
        organization_id,
        user_id,
        role,
        status,
        invited_by,
        joined_at
    ) VALUES (
        invitation.organization_id,
        auth.uid(),
        invitation.role,
        'active',
        invitation.invited_by,
        NOW()
    );

    -- Update invitation status
    UPDATE organization_invitations 
    SET status = 'accepted', accepted_at = NOW()
    WHERE id = invitation.id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to get member count for an organization
CREATE OR REPLACE FUNCTION get_organization_member_count(p_organization_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*) 
        FROM organization_members 
        WHERE organization_id = p_organization_id 
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql; 