-- Organization Invitation Tokens Table (for existing users)
CREATE TABLE IF NOT EXISTS organization_invitation_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    used_by UUID REFERENCES auth.users(id),
    used_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for organization_invitation_tokens
CREATE INDEX IF NOT EXISTS idx_organization_invitation_tokens_organization_id ON organization_invitation_tokens(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_invitation_tokens_token ON organization_invitation_tokens(token);
CREATE INDEX IF NOT EXISTS idx_organization_invitation_tokens_expires_at ON organization_invitation_tokens(expires_at);

-- Update trigger for organization_invitation_tokens
CREATE TRIGGER update_organization_invitation_tokens_updated_at 
    BEFORE UPDATE ON organization_invitation_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security for organization_invitation_tokens
ALTER TABLE organization_invitation_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Organization owners/admins can create tokens
CREATE POLICY "Organization owners/admins can create tokens" ON organization_invitation_tokens
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
        )
    );

-- Policy: Organization owners/admins can view tokens
CREATE POLICY "Organization owners/admins can view tokens" ON organization_invitation_tokens
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
        )
    );

-- Policy: Any authenticated user can use a valid token
CREATE POLICY "Users can use valid tokens" ON organization_invitation_tokens
    FOR UPDATE USING (
        token = token AND 
        used_by IS NULL AND 
        expires_at > NOW() AND
        auth.uid() IS NOT NULL
    );

-- Function to use an invitation token
CREATE OR REPLACE FUNCTION use_invitation_token(p_token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    token_record RECORD;
BEGIN
    -- Get the token record
    SELECT * INTO token_record 
    FROM organization_invitation_tokens 
    WHERE token = p_token 
    AND used_by IS NULL 
    AND expires_at > NOW();

    -- Check if token exists and is valid
    IF token_record IS NULL THEN
        RAISE EXCEPTION 'Invalid or expired token';
    END IF;

    -- Check if user is already a member
    IF EXISTS (
        SELECT 1 FROM organization_members 
        WHERE organization_id = token_record.organization_id 
        AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'User is already a member of this organization';
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
        token_record.organization_id,
        auth.uid(),
        token_record.role,
        'active',
        token_record.created_by,
        NOW()
    );

    -- Mark token as used
    UPDATE organization_invitation_tokens 
    SET used_by = auth.uid(), used_at = NOW()
    WHERE id = token_record.id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 