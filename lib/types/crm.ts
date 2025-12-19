export interface Company {
  id: string;
  organization_id: string;
  company_name: string;
  industry?: string;
  website?: string;
  location?: string;
  employee_count?: string;
  company_size?: string;
  annual_revenue?: string;
  status: string;
  value?: number;
  notes?: string[];
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  organization_id: string;
  company_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  location?: string;
  status: string;
  value?: number;
  notes?: string[];
  created_at: string;
  updated_at: string;
}

export interface ContactHistory {
  id: string;
  contact_id: string;
  type: string;
  description?: string;
  status?: string;
  date: string;
  created_at: string;
}

export interface CompanyHistory {
  id: string;
  company_id: string;
  type: string;
  description?: string;
  status?: string;
  date: string;
  created_at: string;
}

export interface Attachment {
  id: string;
  organization_id: string;
  contact_id?: string;
  company_id?: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
}

export interface ContactWithCompany extends Contact {
  company?: Company;
  history?: ContactHistory[];
}

export interface CompanyWithContacts extends Company {
  contacts?: Contact[];
  history?: CompanyHistory[];
  attachments?: Attachment[];
}

export interface NewContact {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company_id?: string;
  position?: string;
  department?: string;
  location?: string;
}

export interface NewCompany {
  company_name: string;
  industry?: string;
  website?: string;
  location?: string;
  employee_count?: string;
  company_size?: string;
  annual_revenue?: string;
}

export interface NewHistoryEntry {
  type: string;
  description?: string;
  status?: string;
} 