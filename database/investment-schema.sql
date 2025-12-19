-- Investment Module Schema
-- This schema handles investment rounds, investors, cap table, and related financial data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Investors Table (must be created first)
CREATE TABLE investors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'institutional', 'angel', 'strategic', 'individual', 'vc', 'pe'
    email VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    description TEXT,
    location VARCHAR(255),
    founded_year INTEGER,
    aum DECIMAL(15,2), -- Assets Under Management
    investment_focus TEXT,
    contact_person VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'prospect'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Investment Rounds Table
CREATE TABLE investment_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    round_name VARCHAR(100) NOT NULL,
    round_type VARCHAR(50) NOT NULL, -- 'pre-seed', 'seed', 'series-a', 'series-b', etc.
    date DATE NOT NULL,
    amount_raised DECIMAL(15,2) NOT NULL,
    valuation DECIMAL(15,2) NOT NULL,
    lead_investor_id UUID REFERENCES investors(id),
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'closed', 'pending', 'cancelled'
    use_of_funds TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Round Investors (Junction table for many-to-many relationship)
CREATE TABLE round_investors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_id UUID REFERENCES investment_rounds(id) ON DELETE CASCADE,
    investor_id UUID REFERENCES investors(id) ON DELETE CASCADE,
    investment_amount DECIMAL(15,2) NOT NULL,
    ownership_percentage DECIMAL(5,4), -- Percentage of company owned
    shares_issued INTEGER,
    share_price DECIMAL(10,4),
    investment_type VARCHAR(50), -- 'equity', 'convertible_note', 'safe', 'preferred'
    terms TEXT,
    board_seat BOOLEAN DEFAULT FALSE,
    pro_rata_rights BOOLEAN DEFAULT FALSE,
    anti_dilution BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(round_id, investor_id)
);

-- Cap Table Table
CREATE TABLE cap_table (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    shareholder_name VARCHAR(255) NOT NULL,
    shareholder_type VARCHAR(50) NOT NULL, -- 'founder', 'investor', 'employee', 'advisor'
    shares_owned INTEGER NOT NULL,
    ownership_percentage DECIMAL(5,4) NOT NULL,
    share_class VARCHAR(50), -- 'common', 'preferred-a', 'preferred-b', etc.
    share_price DECIMAL(10,4),
    total_value DECIMAL(15,2),
    vesting_schedule TEXT,
    vesting_start_date DATE,
    vesting_end_date DATE,
    fully_vested_date DATE,
    last_updated DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Investment Milestones Table
CREATE TABLE investment_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    milestone_name VARCHAR(255) NOT NULL,
    description TEXT,
    target_date DATE NOT NULL,
    target_amount DECIMAL(15,2),
    current_progress INTEGER DEFAULT 0, -- Percentage (0-100)
    status VARCHAR(20) DEFAULT 'planning', -- 'planning', 'in_progress', 'completed', 'cancelled'
    key_metrics TEXT[], -- Array of key metrics
    risks TEXT[], -- Array of risks
    dependencies TEXT,
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Investment Documents Table
CREATE TABLE investment_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    round_id UUID REFERENCES investment_rounds(id) ON DELETE SET NULL,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- 'term_sheet', 'pitch_deck', 'financial_model', 'due_diligence', 'legal'
    file_path VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    version VARCHAR(20),
    status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'final', 'archived'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Investment Notes Table
CREATE TABLE investment_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    round_id UUID REFERENCES investment_rounds(id) ON DELETE SET NULL,
    investor_id UUID REFERENCES investors(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    note_type VARCHAR(50), -- 'meeting', 'call', 'email', 'general'
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_investment_rounds_org_id ON investment_rounds(organization_id);
CREATE INDEX idx_investment_rounds_date ON investment_rounds(date);
CREATE INDEX idx_investment_rounds_status ON investment_rounds(status);
CREATE INDEX idx_investors_org_id ON investors(organization_id);
CREATE INDEX idx_investors_type ON investors(type);
CREATE INDEX idx_investors_status ON investors(status);
CREATE INDEX idx_round_investors_round_id ON round_investors(round_id);
CREATE INDEX idx_round_investors_investor_id ON round_investors(investor_id);
CREATE INDEX idx_cap_table_org_id ON cap_table(organization_id);
CREATE INDEX idx_cap_table_shareholder_type ON cap_table(shareholder_type);
CREATE INDEX idx_investment_milestones_org_id ON investment_milestones(organization_id);
CREATE INDEX idx_investment_milestones_status ON investment_milestones(status);
CREATE INDEX idx_investment_documents_org_id ON investment_documents(organization_id);
CREATE INDEX idx_investment_documents_round_id ON investment_documents(round_id);
CREATE INDEX idx_investment_notes_org_id ON investment_notes(organization_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_investment_rounds_updated_at BEFORE UPDATE ON investment_rounds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investors_updated_at BEFORE UPDATE ON investors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_round_investors_updated_at BEFORE UPDATE ON round_investors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cap_table_updated_at BEFORE UPDATE ON cap_table FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investment_milestones_updated_at BEFORE UPDATE ON investment_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investment_documents_updated_at BEFORE UPDATE ON investment_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investment_notes_updated_at BEFORE UPDATE ON investment_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE investment_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE round_investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE cap_table ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_notes ENABLE ROW LEVEL SECURITY;

-- Investment Rounds RLS
CREATE POLICY "Users can view investment rounds for their organization" ON investment_rounds
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert investment rounds for their organization" ON investment_rounds
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update investment rounds for their organization" ON investment_rounds
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete investment rounds for their organization" ON investment_rounds
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

-- Investors RLS
CREATE POLICY "Users can view investors for their organization" ON investors
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert investors for their organization" ON investors
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update investors for their organization" ON investors
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete investors for their organization" ON investors
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

-- Round Investors RLS
CREATE POLICY "Users can view round investors for their organization" ON round_investors
    FOR SELECT USING (
        round_id IN (
            SELECT id FROM investment_rounds WHERE organization_id IN (
                SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can insert round investors for their organization" ON round_investors
    FOR INSERT WITH CHECK (
        round_id IN (
            SELECT id FROM investment_rounds WHERE organization_id IN (
                SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update round investors for their organization" ON round_investors
    FOR UPDATE USING (
        round_id IN (
            SELECT id FROM investment_rounds WHERE organization_id IN (
                SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can delete round investors for their organization" ON round_investors
    FOR DELETE USING (
        round_id IN (
            SELECT id FROM investment_rounds WHERE organization_id IN (
                SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
            )
        )
    );

-- Cap Table RLS
CREATE POLICY "Users can view cap table for their organization" ON cap_table
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert cap table for their organization" ON cap_table
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update cap table for their organization" ON cap_table
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete cap table for their organization" ON cap_table
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

-- Investment Milestones RLS
CREATE POLICY "Users can view investment milestones for their organization" ON investment_milestones
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert investment milestones for their organization" ON investment_milestones
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update investment milestones for their organization" ON investment_milestones
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete investment milestones for their organization" ON investment_milestones
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

-- Investment Documents RLS
CREATE POLICY "Users can view investment documents for their organization" ON investment_documents
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert investment documents for their organization" ON investment_documents
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update investment documents for their organization" ON investment_documents
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete investment documents for their organization" ON investment_documents
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

-- Investment Notes RLS
CREATE POLICY "Users can view investment notes for their organization" ON investment_notes
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert investment notes for their organization" ON investment_notes
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update investment notes for their organization" ON investment_notes
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete investment notes for their organization" ON investment_notes
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE user_id = auth.uid()
        )
    ); 