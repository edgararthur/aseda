# Aseda Accounting - Supabase Migration Instructions

## Migration Process Overview

We have 10 migration files that need to be applied to your Supabase database:

1. `00001_initial_schema.sql` - Basic initial schema
2. `20240315000001_purchase_returns.sql` - Purchase returns functionality
3. `20240320000000_initial_schema.sql` - Updated initial schema
4. `20240320000000_revamp_schema.sql` - Schema revamp
5. `20240321000000_accounting_tables.sql` - Accounting tables
6. `20240322000000_consolidate_schema.sql` - Consolidated schema (LATEST)

## Required Steps:

1. Create .env.local file with your Supabase credentials
2. Link to remote Supabase project
3. Push migrations to remote database
4. Verify schema creation
5. Test database connectivity

## Environment Variables Needed:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here  
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Commands to Run After Setting Up Environment:

```bash
# Link to remote project
npx supabase link --project-ref YOUR_PROJECT_REF

# Push migrations to remote
npx supabase db push

# Or reset and apply all migrations
npx supabase db reset --linked
```

