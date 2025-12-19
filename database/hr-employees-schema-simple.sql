-- HR Employees Database Schema (Simplified)
-- Run this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    position VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES departments(id),
    manager_id UUID REFERENCES employees(id),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave', 'Terminated')),
    start_date DATE NOT NULL,
    location VARCHAR(255),
    avatar_initials VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_off_requests table
CREATE TABLE IF NOT EXISTS time_off_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Annual Leave', 'Sick Leave', 'Personal Leave', 'Maternity/Paternity')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    approved_by UUID REFERENCES employees(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leave_allowances table
CREATE TABLE IF NOT EXISTS leave_allowances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('Annual Leave', 'Sick Leave', 'Personal Leave', 'Maternity/Paternity')),
    total_days INTEGER NOT NULL,
    used_days INTEGER DEFAULT 0,
    year INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(employee_id, leave_type, year)
);

-- Create training_progress table
CREATE TABLE IF NOT EXISTS training_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    training_name VARCHAR(255) NOT NULL,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    status VARCHAR(50) DEFAULT 'In Progress' CHECK (status IN ('Not Started', 'In Progress', 'Completed')),
    start_date DATE,
    completion_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create certifications table
CREATE TABLE IF NOT EXISTS certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255),
    issue_date DATE,
    expiry_date DATE,
    certificate_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_employees_updated_at ON employees;
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_time_off_requests_updated_at ON time_off_requests;
CREATE TRIGGER update_time_off_requests_updated_at BEFORE UPDATE ON time_off_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leave_allowances_updated_at ON leave_allowances;
CREATE TRIGGER update_leave_allowances_updated_at BEFORE UPDATE ON leave_allowances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_training_progress_updated_at ON training_progress;
CREATE TRIGGER update_training_progress_updated_at BEFORE UPDATE ON training_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_certifications_updated_at ON certifications;
CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON certifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_employee_id ON time_off_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_off_requests_status ON time_off_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_allowances_employee_id ON leave_allowances(employee_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_employee_id ON training_progress(employee_id);
CREATE INDEX IF NOT EXISTS idx_certifications_employee_id ON certifications(employee_id);

-- Insert sample data
INSERT INTO departments (name, description) VALUES
('Engineering', 'Software development and technical teams'),
('Marketing', 'Marketing and communications'),
('Sales', 'Sales and business development'),
('Human Resources', 'HR and people operations'),
('Product', 'Product management and strategy');

-- Insert sample employees
INSERT INTO employees (employee_id, first_name, last_name, email, phone, position, department_id, status, start_date, location, avatar_initials) VALUES
('EMP001', 'Sarah', 'Johnson', 'sarah.johnson@company.com', '+1 (555) 123-4567', 'Senior Developer', (SELECT id FROM departments WHERE name = 'Engineering'), 'Active', '2023-01-15', 'San Francisco, CA', 'SJ'),
('EMP002', 'Mike', 'Chen', 'mike.chen@company.com', '+1 (555) 987-6543', 'Marketing Manager', (SELECT id FROM departments WHERE name = 'Marketing'), 'Active', '2022-08-20', 'New York, NY', 'MC'),
('EMP003', 'Emma', 'Wilson', 'emma.wilson@company.com', '+1 (555) 456-7890', 'Sales Representative', (SELECT id FROM departments WHERE name = 'Sales'), 'Active', '2023-03-10', 'Chicago, IL', 'EW'),
('EMP004', 'Alex', 'Thompson', 'alex.thompson@company.com', '+1 (555) 789-0123', 'HR Specialist', (SELECT id FROM departments WHERE name = 'Human Resources'), 'Active', '2022-11-05', 'Austin, TX', 'AT'),
('EMP005', 'Chris', 'Davis', 'chris.davis@company.com', '+1 (555) 321-6540', 'Product Manager', (SELECT id FROM departments WHERE name = 'Product'), 'On Leave', '2021-06-15', 'Seattle, WA', 'CD');

-- Update manager relationships
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE employee_id = 'EMP001') WHERE employee_id = 'EMP002';
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE employee_id = 'EMP001') WHERE employee_id = 'EMP003';
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE employee_id = 'EMP004') WHERE employee_id = 'EMP005';

-- Insert sample leave allowances
INSERT INTO leave_allowances (employee_id, leave_type, total_days, used_days, year) VALUES
((SELECT id FROM employees WHERE employee_id = 'EMP001'), 'Annual Leave', 25, 12, 2024),
((SELECT id FROM employees WHERE employee_id = 'EMP001'), 'Sick Leave', 10, 3, 2024),
((SELECT id FROM employees WHERE employee_id = 'EMP002'), 'Annual Leave', 25, 8, 2024),
((SELECT id FROM employees WHERE employee_id = 'EMP002'), 'Sick Leave', 10, 1, 2024),
((SELECT id FROM employees WHERE employee_id = 'EMP003'), 'Annual Leave', 25, 15, 2024),
((SELECT id FROM employees WHERE employee_id = 'EMP003'), 'Sick Leave', 10, 2, 2024),
((SELECT id FROM employees WHERE employee_id = 'EMP004'), 'Annual Leave', 25, 5, 2024),
((SELECT id FROM employees WHERE employee_id = 'EMP004'), 'Sick Leave', 10, 0, 2024),
((SELECT id FROM employees WHERE employee_id = 'EMP005'), 'Annual Leave', 25, 20, 2024),
((SELECT id FROM employees WHERE employee_id = 'EMP005'), 'Sick Leave', 10, 5, 2024);

-- Insert sample time off requests
INSERT INTO time_off_requests (employee_id, type, start_date, end_date, days_requested, reason, status) VALUES
((SELECT id FROM employees WHERE employee_id = 'EMP001'), 'Annual Leave', '2024-12-15', '2024-12-22', 6, 'Family vacation', 'Approved'),
((SELECT id FROM employees WHERE employee_id = 'EMP002'), 'Sick Leave', '2024-11-08', '2024-11-08', 1, 'Medical appointment', 'Approved'),
((SELECT id FROM employees WHERE employee_id = 'EMP003'), 'Annual Leave', '2024-10-20', '2024-10-25', 4, 'Personal time off', 'Pending'),
((SELECT id FROM employees WHERE employee_id = 'EMP004'), 'Personal Leave', '2024-09-15', '2024-09-16', 2, 'Personal matters', 'Approved');

-- Insert sample training progress
INSERT INTO training_progress (employee_id, training_name, progress_percentage, status) VALUES
((SELECT id FROM employees WHERE employee_id = 'EMP001'), 'Leadership Skills', 80, 'In Progress'),
((SELECT id FROM employees WHERE employee_id = 'EMP001'), 'Project Management', 65, 'In Progress'),
((SELECT id FROM employees WHERE employee_id = 'EMP001'), 'Technical Skills', 95, 'Completed'),
((SELECT id FROM employees WHERE employee_id = 'EMP002'), 'Marketing Strategy', 90, 'Completed'),
((SELECT id FROM employees WHERE employee_id = 'EMP002'), 'Digital Marketing', 75, 'In Progress'),
((SELECT id FROM employees WHERE employee_id = 'EMP003'), 'Sales Techniques', 85, 'In Progress'),
((SELECT id FROM employees WHERE employee_id = 'EMP004'), 'HR Management', 70, 'In Progress');

-- Insert sample certifications
INSERT INTO certifications (employee_id, name, issuing_organization, issue_date) VALUES
((SELECT id FROM employees WHERE employee_id = 'EMP001'), 'AWS Certified Solutions Architect', 'Amazon Web Services', '2024-03-15'),
((SELECT id FROM employees WHERE employee_id = 'EMP001'), 'PMP Certification', 'Project Management Institute', '2024-01-20'),
((SELECT id FROM employees WHERE employee_id = 'EMP002'), 'Google Ads Certification', 'Google', '2024-02-10'),
((SELECT id FROM employees WHERE employee_id = 'EMP003'), 'Salesforce Administrator', 'Salesforce', '2024-04-05'),
((SELECT id FROM employees WHERE employee_id = 'EMP004'), 'SHRM-CP Certification', 'Society for Human Resource Management', '2023-12-01'); 