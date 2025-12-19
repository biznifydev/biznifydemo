-- Fix RLS policies for forecasts - simpler version for testing

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view forecasts for their organization" ON forecasts;
DROP POLICY IF EXISTS "Users can insert forecasts for their organization" ON forecasts;
DROP POLICY IF EXISTS "Users can update forecasts for their organization" ON forecasts;
DROP POLICY IF EXISTS "Users can delete forecasts for their organization" ON forecasts;

DROP POLICY IF EXISTS "Users can view forecast entries for their organization" ON forecast_entries;
DROP POLICY IF EXISTS "Users can insert forecast entries for their organization" ON forecast_entries;
DROP POLICY IF EXISTS "Users can update forecast entries for their organization" ON forecast_entries;
DROP POLICY IF EXISTS "Users can delete forecast entries for their organization" ON forecast_entries;

DROP POLICY IF EXISTS "Users can view forecast periods for their organization" ON forecast_entry_periods;
DROP POLICY IF EXISTS "Users can insert forecast periods for their organization" ON forecast_entry_periods;
DROP POLICY IF EXISTS "Users can update forecast periods for their organization" ON forecast_entry_periods;
DROP POLICY IF EXISTS "Users can delete forecast periods for their organization" ON forecast_entry_periods;

DROP POLICY IF EXISTS "Users can view forecast edit history for their organization" ON forecast_edit_history;
DROP POLICY IF EXISTS "Users can insert forecast edit history for their organization" ON forecast_edit_history;

-- Create simpler policies for testing
CREATE POLICY "Enable all access for authenticated users" ON forecasts
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable all access for authenticated users" ON forecast_entries
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable all access for authenticated users" ON forecast_entry_periods
    FOR ALL USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable all access for authenticated users" ON forecast_edit_history
    FOR ALL USING (auth.uid() IS NOT NULL); 