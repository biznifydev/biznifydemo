import { supabase } from '@/lib/supabase';
import { 
  Company, 
  Contact, 
  ContactHistory, 
  CompanyHistory, 
  Attachment,
  ContactWithCompany,
  CompanyWithContacts,
  NewContact,
  NewCompany,
  NewHistoryEntry
} from '@/lib/types/crm';

export class CrmService {
  // Company operations
  static async getCompanies(organizationId: string): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('organization_id', organizationId)
      .order('company_name');

    if (error) throw error;
    return data || [];
  }

  static async getCompany(id: string): Promise<CompanyWithContacts | null> {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        *,
        contacts (*),
        company_history (*),
        attachments (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async createCompany(organizationId: string, company: NewCompany): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .insert({
        organization_id: organizationId,
        ...company
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateCompany(id: string, updates: Partial<NewCompany>): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteCompany(id: string): Promise<void> {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Contact operations
  static async getContacts(organizationId: string): Promise<ContactWithCompany[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        company:companies (*)
      `)
      .eq('organization_id', organizationId)
      .order('first_name');

    if (error) throw error;
    return data || [];
  }

  static async getContact(id: string): Promise<ContactWithCompany | null> {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        company:companies (*),
        contact_history (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async createContact(organizationId: string, contact: NewContact): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .insert({
        organization_id: organizationId,
        ...contact
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateContact(id: string, updates: Partial<NewContact>): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteContact(id: string): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // History operations
  static async addContactHistory(contactId: string, history: NewHistoryEntry): Promise<ContactHistory> {
    const { data, error } = await supabase
      .from('contact_history')
      .insert({
        contact_id: contactId,
        ...history
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async addCompanyHistory(companyId: string, history: NewHistoryEntry): Promise<CompanyHistory> {
    const { data, error } = await supabase
      .from('company_history')
      .insert({
        company_id: companyId,
        ...history
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Attachment operations
  static async uploadAttachment(
    organizationId: string,
    file: File,
    contactId?: string,
    companyId?: string
  ): Promise<Attachment> {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `attachments/${organizationId}/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('crm-attachments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('crm-attachments')
      .getPublicUrl(filePath);

    // Save attachment record
    const { data, error } = await supabase
      .from('attachments')
      .insert({
        organization_id: organizationId,
        contact_id: contactId,
        company_id: companyId,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        mime_type: file.type
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteAttachment(id: string): Promise<void> {
    const { error } = await supabase
      .from('attachments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Notes operations
  static async updateContactNotes(id: string, notes: string[]): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .update({ notes })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateCompanyNotes(id: string, notes: string[]): Promise<Company> {
    const { data, error } = await supabase
      .from('companies')
      .update({ notes })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
} 