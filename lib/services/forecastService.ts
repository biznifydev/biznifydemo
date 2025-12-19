import { supabase } from '../supabase';
import { 
  Forecast, 
  ForecastWithEntries, 
  ForecastEntry, 
  ForecastEntryPeriod,
  ForecastEditHistory,
  CreateForecastRequest,
  UpdateForecastRequest,
  UpdateForecastEntryPeriodRequest
} from '../types/forecast';

export class ForecastService {
  // Get all forecasts for the current organization
  static async getForecasts(): Promise<Forecast[]> {
    try {
      console.log('Fetching forecasts...');
      const { data, error } = await supabase
        .from('forecasts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching forecasts:', error);
        throw error;
      }

      console.log('Forecasts fetched successfully:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('Exception in getForecasts:', error);
      throw error;
    }
  }

  // Get a single forecast with all its entries and periods
  static async getForecastWithData(forecastId: string): Promise<ForecastWithEntries | null> {
    try {
      console.log('Fetching forecast with data for ID:', forecastId);
      const { data, error } = await supabase
        .from('forecasts')
        .select(`
          *,
          forecast_entries (
            *,
            periods: forecast_entry_periods (*),
            section: budget_sections (id, name, display_order),
            category: budget_categories (id, name, display_order),
            subcategory: budget_subcategories (id, name, display_order),
            base_budget_item: budget_items (id, amount, notes)
          )
        `)
        .eq('id', forecastId)
        .single();

      if (error) {
        console.error('Error fetching forecast with data:', error);
        throw error;
      }

      console.log('Forecast with data fetched successfully');
      return data;
    } catch (error) {
      console.error('Exception in getForecastWithData:', error);
      throw error;
    }
  }

  // Create a new forecast
  static async createForecast(request: CreateForecastRequest): Promise<Forecast> {
    try {
      console.log('Creating forecast with request:', request);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        throw new Error('User not authenticated');
      }

      console.log('User authenticated:', user.id);

      // Get the user's organization
      const { data: orgMembership, error: orgError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (orgError || !orgMembership) {
        console.error('Error getting user organization:', orgError);
        throw new Error('User not associated with an organization');
      }

      console.log('User organization:', orgMembership.organization_id);

      const { data, error } = await supabase
        .from('forecasts')
        .insert({
          organization_id: orgMembership.organization_id,
          name: request.name,
          description: request.description,
          base_budget_id: request.base_budget_id,
          fiscal_year: request.fiscal_year,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating forecast:', error);
        throw error;
      }

      console.log('Forecast created successfully:', data);
      return data;
    } catch (error) {
      console.error('Exception in createForecast:', error);
      throw error;
    }
  }

  // Update a forecast
  static async updateForecast(forecastId: string, request: UpdateForecastRequest): Promise<Forecast> {
    const { data, error } = await supabase
      .from('forecasts')
      .update(request)
      .eq('id', forecastId)
      .select()
      .single();

    if (error) {
      console.error('Error updating forecast:', error);
      throw error;
    }

    return data;
  }

  // Delete a forecast
  static async deleteForecast(forecastId: string): Promise<void> {
    const { error } = await supabase
      .from('forecasts')
      .delete()
      .eq('id', forecastId);

    if (error) {
      console.error('Error deleting forecast:', error);
      throw error;
    }
  }

  // Get forecast entries for a forecast
  static async getForecastEntries(forecastId: string): Promise<ForecastEntry[]> {
    const { data, error } = await supabase
      .from('forecast_entries')
      .select('*')
      .eq('forecast_id', forecastId);

    if (error) {
      console.error('Error fetching forecast entries:', error);
      throw error;
    }

    return data || [];
  }

  // Get forecast entry periods
  static async getForecastEntryPeriods(forecastEntryId: string): Promise<ForecastEntryPeriod[]> {
    const { data, error } = await supabase
      .from('forecast_entry_periods')
      .select('*')
      .eq('forecast_entry_id', forecastEntryId)
      .order('period_year', { ascending: true })
      .order('period_month', { ascending: true });

    if (error) {
      console.error('Error fetching forecast entry periods:', error);
      throw error;
    }

    return data || [];
  }

  // Update a forecast entry period
  static async updateForecastEntryPeriod(
    periodId: string, 
    request: UpdateForecastEntryPeriodRequest
  ): Promise<ForecastEntryPeriod> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get the current period to record the change
    const { data: currentPeriod } = await supabase
      .from('forecast_entry_periods')
      .select('*, forecast_entries!inner(forecast_id)')
      .eq('id', periodId)
      .single();

    if (currentPeriod) {
      // Record the change in edit history
      await supabase
        .from('forecast_edit_history')
        .insert({
          forecast_id: currentPeriod.forecast_entries.forecast_id,
          forecast_entry_id: currentPeriod.forecast_entry_id,
          field_name: 'amount',
          old_value: currentPeriod.amount.toString(),
          new_value: request.amount.toString(),
          period_year: currentPeriod.period_year,
          period_month: currentPeriod.period_month,
          edited_by: user.id
        });
    }

    // Update the period
    const { data, error } = await supabase
      .from('forecast_entry_periods')
      .update({ amount: request.amount })
      .eq('id', periodId)
      .select()
      .single();

    if (error) {
      console.error('Error updating forecast entry period:', error);
      throw error;
    }

    return data;
  }

  // Create a new forecast entry period
  static async createForecastEntryPeriod(
    entryId: string,
    request: {
      period_year: number;
      period_month: number;
      amount: number;
    }
  ): Promise<ForecastEntryPeriod> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Create the period
    const { data, error } = await supabase
      .from('forecast_entry_periods')
      .insert({
        forecast_entry_id: entryId,
        period_year: request.period_year,
        period_month: request.period_month,
        amount: request.amount
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating forecast entry period:', error);
      throw error;
    }

    return data;
  }

  // Update forecast entry notes
  static async updateForecastEntryNotes(
    entryId: string, 
    notes: string
  ): Promise<ForecastEntry> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get the current entry to record the change
    const { data: currentEntry } = await supabase
      .from('forecast_entries')
      .select('*')
      .eq('id', entryId)
      .single();

    if (currentEntry) {
      // Record the change in edit history
      await supabase
        .from('forecast_edit_history')
        .insert({
          forecast_id: currentEntry.forecast_id,
          forecast_entry_id: entryId,
          field_name: 'notes',
          old_value: currentEntry.notes || '',
          new_value: notes,
          edited_by: user.id
        });
    }

    // Update the entry
    const { data, error } = await supabase
      .from('forecast_entries')
      .update({ notes })
      .eq('id', entryId)
      .select()
      .single();

    if (error) {
      console.error('Error updating forecast entry notes:', error);
      throw error;
    }

    return data;
  }

  // Get edit history for a forecast
  static async getForecastEditHistory(forecastId: string): Promise<ForecastEditHistory[]> {
    const { data, error } = await supabase
      .from('forecast_edit_history')
      .select(`
        *,
        edited_by_user: user_profiles!forecast_edit_history_edited_by_fkey (first_name, last_name)
      `)
      .eq('forecast_id', forecastId)
      .order('edited_at', { ascending: false });

    if (error) {
      console.error('Error fetching forecast edit history:', error);
      throw error;
    }

    return data || [];
  }

  // Get forecast entry periods for a specific month
  static async getForecastPeriodsForMonth(
    forecastId: string, 
    year: number, 
    month: number
  ): Promise<ForecastEntryPeriod[]> {
    const { data, error } = await supabase
      .from('forecast_entry_periods')
      .select(`
        *,
        forecast_entries!inner(forecast_id)
      `)
      .eq('forecast_entries.forecast_id', forecastId)
      .eq('period_year', year)
      .eq('period_month', month);

    if (error) {
      console.error('Error fetching forecast periods for month:', error);
      throw error;
    }

    return data || [];
  }

  // Get forecast summary statistics
  static async getForecastSummary(forecastId: string): Promise<{
    totalEntries: number;
    totalPeriods: number;
    lastModified: string;
    createdBy: string;
  }> {
    // Get basic forecast info
    const { data: forecast } = await supabase
      .from('forecasts')
      .select('created_by, created_at')
      .eq('id', forecastId)
      .single();

    // Get entry count
    const { count: entryCount } = await supabase
      .from('forecast_entries')
      .select('*', { count: 'exact', head: true })
      .eq('forecast_id', forecastId);

    // Get period count
    const { count: periodCount } = await supabase
      .from('forecast_entry_periods')
      .select('*', { count: 'exact', head: true })
      .eq('forecast_entries.forecast_id', forecastId);

    // Get last edit
    const { data: lastEdit } = await supabase
      .from('forecast_edit_history')
      .select('edited_at')
      .eq('forecast_id', forecastId)
      .order('edited_at', { ascending: false })
      .limit(1)
      .single();

    return {
      totalEntries: entryCount || 0,
      totalPeriods: periodCount || 0,
      lastModified: lastEdit?.edited_at || forecast?.created_at || '',
      createdBy: forecast?.created_by || ''
    };
  }
} 