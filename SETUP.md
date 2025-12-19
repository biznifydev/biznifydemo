# Biznify Multi-Tenant Setup

## Database Setup

1. **Run the SQL Schema**
   ```sql
   -- Copy and paste the contents of database/schema.sql into your Supabase SQL editor
   ```

2. **Enable Row Level Security (RLS)**
   - All tables have RLS enabled with appropriate policies
   - Users can only access data from their organizations

## Environment Variables

Create `.env.local` with:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## User Flow

### 1. Authentication Flow
- User signs up/logs in at `/login`
- After successful authentication, user is redirected to `/home`
- `/home` checks if user has an organization

### 2. Organization Setup Flow
- If user has no organization, they're redirected to `/setup`
- User creates their first organization
- After organization creation, user is redirected to main dashboard

### 3. Multi-Tenant Data Access
- All data is scoped to the user's current organization
- Row Level Security ensures data isolation
- Users can only see data from organizations they're members of

## Key Features

### Organization Management
- **Organizations**: Companies/teams using the platform
- **Members**: Users belonging to organizations with roles (owner, admin, member, viewer)
- **Organization Switching**: Users can belong to multiple organizations

### Data Isolation
- **Financial Accounts**: Organization-scoped chart of accounts
- **Financial Data**: Organization-scoped financial data
- **User Profiles**: Extended user information
- **RLS Policies**: Automatic data filtering by organization

### User Roles
- **Owner**: Full control over organization
- **Admin**: Can manage members and settings
- **Member**: Can view and edit data
- **Viewer**: Read-only access

## Database Schema Overview

### Core Tables
- `organizations`: Company/team information
- `user_profiles`: Extended user data
- `organization_members`: Many-to-many relationship with roles
- `financial_accounts`: Chart of accounts (organization-scoped)
- `financial_data`: Financial data (organization-scoped)

### Security
- Row Level Security (RLS) on all tables
- Automatic user profile creation on signup
- Organization membership required for data access

## Next Steps

1. **Seed Data**: Create default financial accounts for new organizations
2. **Organization Switching**: Add UI for switching between organizations
3. **Invitations**: Implement member invitation system
4. **Billing**: Integrate with Stripe for plan management
5. **Audit Logs**: Track data changes for compliance

## Testing

1. Create a new user account
2. Verify organization setup flow
3. Test data isolation between organizations
4. Verify RLS policies work correctly 