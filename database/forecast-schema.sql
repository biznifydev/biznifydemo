-- Forecast Database Schema
-- This creates a proper structure for forecasts separate from budgets

-- 1. Create forecasts table (main forecast records)
CREATE TABLE IF NOT EXISTS forecasts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    fiscal_year INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create forecast_entries table (individual forecast line items)
CREATE TABLE IF NOT EXISTS forecast_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    forecast_id UUID NOT NULL REFERENCES forecasts(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES budget_sections(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
    subcategory_id UUID NOT NULL REFERENCES budget_subcategories(id) ON DELETE CASCADE,
    base_budget_item_id UUID REFERENCES budget_items(id) ON DELETE SET NULL, -- Reference to original budget item
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create forecast_entry_periods table (monthly forecast values)
CREATE TABLE IF NOT EXISTS forecast_entry_periods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    forecast_entry_id UUID NOT NULL REFERENCES forecast_entries(id) ON DELETE CASCADE,
    period_year INTEGER NOT NULL,
    period_month INTEGER NOT NULL CHECK (period_month >= 1 AND period_month <= 12),
    amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(forecast_entry_id, period_year, period_month)
);

-- 4. Create forecast_edit_history table (track changes to forecasts)
CREATE TABLE IF NOT EXISTS forecast_edit_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    forecast_id UUID NOT NULL REFERENCES forecasts(id) ON DELETE CASCADE,
    forecast_entry_id UUID REFERENCES forecast_entries(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL, -- 'amount', 'notes', etc.
    old_value TEXT,
    new_value TEXT,
    period_year INTEGER,
    period_month INTEGER,
    edited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_forecasts_organization_id ON forecasts(organization_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_base_budget_id ON forecasts(base_budget_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_status ON forecasts(status);
CREATE INDEX IF NOT EXISTS idx_forecasts_fiscal_year ON forecasts(fiscal_year);

CREATE INDEX IF NOT EXISTS idx_forecast_entries_forecast_id ON forecast_entries(forecast_id);
CREATE INDEX IF NOT EXISTS idx_forecast_entries_section_id ON forecast_entries(section_id);
CREATE INDEX IF NOT EXISTS idx_forecast_entries_category_id ON forecast_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_forecast_entries_subcategory_id ON forecast_entries(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_forecast_entries_base_budget_item_id ON forecast_entries(base_budget_item_id);

CREATE INDEX IF NOT EXISTS idx_forecast_entry_periods_entry_id ON forecast_entry_periods(forecast_entry_id);
CREATE INDEX IF NOT EXISTS idx_forecast_entry_periods_period ON forecast_entry_periods(period_year, period_month);

CREATE INDEX IF NOT EXISTS idx_forecast_edit_history_forecast_id ON forecast_edit_history(forecast_id);
CREATE INDEX IF NOT EXISTS idx_forecast_edit_history_entry_id ON forecast_edit_history(forecast_entry_id);
CREATE INDEX IF NOT EXISTS idx_forecast_edit_history_edited_at ON forecast_edit_history(edited_at);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_entry_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_edit_history ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for forecasts
CREATE POLICY "Users can view forecasts for their organization" ON forecasts
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can insert forecasts for their organization" ON forecasts
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can update forecasts for their organization" ON forecasts
    FOR UPDATE USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can delete forecasts for their organization" ON forecasts
    FOR DELETE USING (
        organization_id IN (
            SELECT organization_id FROM organization_members 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- 8. Create RLS policies for forecast_entries
CREATE POLICY "Users can view forecast entries for their organization" ON forecast_entries
    FOR SELECT USING (
        forecast_id IN (
            SELECT f.id FROM forecasts f
            JOIN organization_members om ON f.organization_id = om.organization_id
            WHERE om.user_id = auth.uid() AND om.status = 'active'
        )
    );

CREATE POLICY "Users can insert forecast entries for their organization" ON forecast_entries
    FOR INSERT WITH CHECK (
        forecast_id IN (
            SELECT f.id FROM forecasts f
            JOIN organization_members om ON f.organization_id = om.organization_id
            WHERE om.user_id = auth.uid() AND om.status = 'active'
        )
    );

CREATE POLICY "Users can update forecast entries for their organization" ON forecast_entries
    FOR UPDATE USING (
        forecast_id IN (
            SELECT f.id FROM forecasts f
            JOIN organization_members om ON f.organization_id = om.organization_id
            WHERE om.user_id = auth.uid() AND om.status = 'active'
        )
    );

CREATE POLICY "Users can delete forecast entries for their organization" ON forecast_entries
    FOR DELETE USING (
        forecast_id IN (
            SELECT f.id FROM forecasts f
            JOIN organization_members om ON f.organization_id = om.organization_id
            WHERE om.user_id = auth.uid() AND om.status = 'active'
        )
    );

-- 9. Create RLS policies for forecast_entry_periods
CREATE POLICY "Users can view forecast periods for their organization" ON forecast_entry_periods
    FOR SELECT USING (
        forecast_entry_id IN (
            SELECT fe.id FROM forecast_entries fe
            JOIN forecasts f ON fe.forecast_id = f.id
            JOIN organization_members om ON f.organization_id = om.organization_id
            WHERE om.user_id = auth.uid() AND om.status = 'active'
        )
    );

CREATE POLICY "Users can insert forecast periods for their organization" ON forecast_entry_periods
    FOR INSERT WITH CHECK (
        forecast_entry_id IN (
            SELECT fe.id FROM forecast_entries fe
            JOIN forecasts f ON fe.forecast_id = f.id
            JOIN organization_members om ON f.organization_id = om.organization_id
            WHERE om.user_id = auth.uid() AND om.status = 'active'
        )
    );

CREATE POLICY "Users can update forecast periods for their organization" ON forecast_entry_periods
    FOR UPDATE USING (
        forecast_entry_id IN (
            SELECT fe.id FROM forecast_entries fe
            JOIN forecasts f ON fe.forecast_id = f.id
            JOIN organization_members om ON f.organization_id = om.organization_id
            WHERE om.user_id = auth.uid() AND om.status = 'active'
        )
    );

CREATE POLICY "Users can delete forecast periods for their organization" ON forecast_entry_periods
    FOR DELETE USING (
        forecast_entry_id IN (
            SELECT fe.id FROM forecast_entries fe
            JOIN forecasts f ON fe.forecast_id = f.id
            JOIN organization_members om ON f.organization_id = om.organization_id
            WHERE om.user_id = auth.uid() AND om.status = 'active'
        )
    );

-- 10. Create RLS policies for forecast_edit_history
CREATE POLICY "Users can view forecast edit history for their organization" ON forecast_edit_history
    FOR SELECT USING (
        forecast_id IN (
            SELECT f.id FROM forecasts f
            JOIN organization_members om ON f.organization_id = om.organization_id
            WHERE om.user_id = auth.uid() AND om.status = 'active'
        )
    );

CREATE POLICY "Users can insert forecast edit history for their organization" ON forecast_edit_history
    FOR INSERT WITH CHECK (
        forecast_id IN (
            SELECT f.id FROM forecasts f
            JOIN organization_members om ON f.organization_id = om.organization_id
            WHERE om.user_id = auth.uid() AND om.status = 'active'
        )
    );

-- 11. Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_forecasts_updated_at BEFORE UPDATE ON forecasts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forecast_entries_updated_at BEFORE UPDATE ON forecast_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forecast_entry_periods_updated_at BEFORE UPDATE ON forecast_entry_periods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12. Create function to automatically create forecast entries when a forecast is created
CREATE OR REPLACE FUNCTION create_forecast_entries_from_budget()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert forecast entries for each budget item in the base budget
    INSERT INTO forecast_entries (
        forecast_id,
        section_id,
        category_id,
        subcategory_id,
        base_budget_item_id,
        notes,
        created_by
    )
    SELECT 
        NEW.id,
        bi.section_id,
        bi.category_id,
        bi.subcategory_id,
        bi.id,
        bi.notes,
        NEW.created_by
    FROM budget_items bi
    WHERE bi.budget_id = NEW.base_budget_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_forecast_entries_trigger
    AFTER INSERT ON forecasts
    FOR EACH ROW
    EXECUTE FUNCTION create_forecast_entries_from_budget();

-- 13. Create function to copy budget periods to forecast periods
CREATE OR REPLACE FUNCTION copy_budget_periods_to_forecast()
RETURNS TRIGGER AS $$
BEGIN
    -- Copy budget item periods to forecast entry periods
    INSERT INTO forecast_entry_periods (
        forecast_entry_id,
        period_year,
        period_month,
        amount
    )
    SELECT 
        NEW.id,
        bip.period_year,
        bip.period_month,
        bip.amount
    FROM budget_item_periods bip
    WHERE bip.budget_item_id = NEW.base_budget_item_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER copy_budget_periods_trigger
    AFTER INSERT ON forecast_entries
    FOR EACH ROW
    EXECUTE FUNCTION copy_budget_periods_to_forecast(); 