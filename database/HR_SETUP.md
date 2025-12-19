# HR Database Setup Guide

This guide will help you set up the HR employees database system in your Supabase project.

## 🚀 Quick Setup

### 1. Run the SQL Schema

Copy and paste the entire contents of `database/hr-employees-schema.sql` into your Supabase SQL Editor and execute it.

### 2. Update Organization IDs

After running the schema, you need to update the `organization_id` fields in the tables:

```sql
-- Replace 'your-organization-id' with your actual organization ID
UPDATE departments SET organization_id = 'your-organization-id';
UPDATE employees SET organization_id = 'your-organization-id';
```

### 3. Test the Setup

Navigate to `/hr/employees` in your application to test the employee management functionality.

## 📋 Database Schema Overview

### Core Tables

- **`departments`** - Company departments
- **`employees`** - Employee records with relationships
- **`time_off_requests`** - Leave requests and approvals
- **`leave_allowances`** - Annual leave allocations
- **`training_progress`** - Employee training tracking
- **`certifications`** - Professional certifications

### Key Features

- **Row Level Security (RLS)** - Data isolation by organization
- **Relationships** - Manager/employee hierarchies
- **Audit Trail** - Created/updated timestamps
- **Data Validation** - Check constraints for status fields

## 🔧 Advanced Setup

### Using the Setup Script

If you prefer to use the automated setup script:

```bash
# Install dependencies if not already installed
npm install

# Run the setup script
node scripts/setup-hr-database.js

# Or use direct method
node scripts/setup-hr-database.js --direct
```

### Environment Variables Required

Make sure you have these in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📊 Sample Data

The schema includes sample data for:

- 5 departments (Engineering, Marketing, Sales, HR, Product)
- 5 employees with different roles and statuses
- Sample time off requests and leave allowances
- Training progress records
- Professional certifications

## 🔒 Security Features

### Row Level Security Policies

All tables have RLS enabled with policies that:
- Allow users to view data only from their organization
- Prevent cross-organization data access
- Require proper authentication

### Data Validation

- Employee status must be one of: 'Active', 'On Leave', 'Terminated'
- Time off request status must be one of: 'Pending', 'Approved', 'Rejected'
- Leave types are restricted to predefined values
- Training progress percentages are constrained to 0-100

## 🛠️ Troubleshooting

### Common Issues

1. **RLS Policy Errors**: Make sure your user is a member of an organization
2. **Foreign Key Errors**: Ensure referenced records exist before creating relationships
3. **Permission Errors**: Check that your service role key has proper permissions

### Verification Queries

Test your setup with these queries:

```sql
-- Check if tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('employees', 'departments', 'time_off_requests');

-- Check sample data
SELECT COUNT(*) FROM employees;
SELECT COUNT(*) FROM departments;

-- Test RLS policies
SELECT * FROM employees LIMIT 5;
```

## 📈 Next Steps

1. **Customize Fields**: Add additional employee fields as needed
2. **Extend Functionality**: Add more HR features like performance reviews
3. **Integrate APIs**: Connect with external HR systems
4. **Add Reporting**: Create dashboards and analytics
5. **Implement Workflows**: Add approval processes for requests

## 🔄 Migration Notes

If you're updating an existing HR system:

1. Backup existing data before running migrations
2. Test the schema in a development environment first
3. Update any existing code to use the new field names
4. Migrate existing data to match the new schema structure

## 📞 Support

If you encounter issues:

1. Check the Supabase logs for detailed error messages
2. Verify your environment variables are correct
3. Ensure your Supabase project has the necessary permissions
4. Review the RLS policies for your specific use case 