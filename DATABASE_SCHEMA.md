# Aseda Accounting - Database Schema Documentation

## Overview

The Aseda Accounting system uses a comprehensive PostgreSQL database schema designed for multi-tenant accounting operations with full compliance for African business requirements.

## Migration Files Summary

| File | Description | Lines |
|------|-------------|-------|
| `00001_initial_schema.sql` | Base schema with core tables | 212 |
| `20240315000001_purchase_returns.sql` | Purchase returns functionality | 22 |
| `20240320000000_initial_schema.sql` | Updated initial schema | 231 |
| `20240320000000_revamp_schema.sql` | Schema revamp and improvements | 266 |
| `20240321000000_accounting_tables.sql` | Additional accounting tables | 239 |
| `20240322000000_consolidate_schema.sql` | **Latest consolidated schema** | 211 |

## Core Database Schema

### 1. Authentication & User Management

#### `profiles`
- User profiles linked to Supabase auth
- Roles: admin, accountant, manager
- Organization membership

#### `organizations`
- Multi-tenant organization structure
- Business type (company, sole_proprietorship, partnership)
- Tax numbers and registration details
- Fiscal year configuration

### 2. Chart of Accounts

#### `chart_of_accounts`
- Hierarchical account structure
- Account types: asset, liability, equity, revenue, expense
- Parent-child relationships
- Bank account designation
- Current balance tracking

### 3. Contact Management

#### `contacts` (Unified Customer/Supplier)
- Single table for customers and suppliers
- Type field: 'customer', 'supplier', 'both'
- Credit limits and payment terms
- Tax numbers and addresses
- Multi-currency support

### 4. Transaction Management

#### `invoices`
- Complete invoice lifecycle
- Document status (draft, pending, approved, rejected, posted, voided)
- Multi-currency with exchange rates
- Contact relationships
- Posting and approval tracking

#### `invoice_items`
- Line item details
- Product/service references
- Tax calculations
- Quantity and pricing

### 5. Fixed Assets

#### `fixed_assets`
- Asset registration and tracking
- Purchase cost and salvage value
- Depreciation calculations
- Maintenance scheduling
- Disposal tracking
- Location and serial number management

### 6. Tax Management

#### `tax_types`
- Tax rate definitions
- Sales/purchase tax types
- Account linkages
- Organization-specific rates

### 7. Department Structure

#### `departments`
- Organizational departments
- Manager assignments
- Budget allocations
- Employee count tracking

## Key Features

### Multi-Tenancy
- Organization-based data isolation
- Row Level Security (RLS) enabled
- User access control per organization

### Data Integrity
- Foreign key constraints
- Enum types for status consistency
- Audit trails with timestamps
- Automatic updated_at triggers

### Performance Optimization
- Strategic indexes on frequently queried columns
- Optimized for reporting queries
- Efficient joins for financial data

### Compliance Features
- Ghana-specific business types
- VAT and withholding tax support
- TIN (Tax Identification Number) tracking
- Fiscal year management

## ENUM Types

```sql
-- Business types
business_type: 'company', 'sole_proprietorship', 'partnership'

-- Transaction types
transaction_type: 'debit', 'credit'

-- Document status
document_status: 'draft', 'pending', 'approved', 'rejected', 'posted', 'voided'

-- Payment status
payment_status: 'pending', 'partial', 'paid', 'overdue', 'cancelled'

-- Payment methods
payment_method: 'cash', 'bank_transfer', 'cheque', 'mobile_money'
```

## Security Features

### Row Level Security (RLS)
All tables have RLS enabled with organization-based access control:

```sql
-- Example RLS policy
CREATE POLICY "Users can access their organization data" 
ON table_name FOR ALL 
USING (organization_id = current_user_organization_id());
```

### Audit Trail
- Automatic `created_at` and `updated_at` timestamps
- User tracking for document creation and posting
- Complete change history

## Migration Instructions

### Prerequisites
1. Supabase project created
2. Environment variables configured in `.env.local`:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### Running Migrations

#### Option 1: Using the migration script
```bash
./migrate-to-supabase.sh
```

#### Option 2: Manual migration
```bash
# Link to your Supabase project
npx supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
npx supabase db push

# Or reset and apply all
npx supabase db reset --linked
```

### Verification
After migration, verify the schema:
```bash
npx supabase db status
```

## Post-Migration Setup

1. **Create Initial Organization**
   - Set up your business organization
   - Configure fiscal year dates
   - Set base currency

2. **Configure Chart of Accounts**
   - Set up account hierarchy
   - Define account codes
   - Link tax accounts

3. **User Management**
   - Create user profiles
   - Assign roles and permissions
   - Set organization access

4. **Tax Configuration**
   - Define VAT rates
   - Set up withholding tax rates
   - Configure tax accounts

## Reporting Capabilities

The schema supports comprehensive reporting:

- **Financial Statements**
  - Balance Sheet
  - Income Statement (P&L)
  - Cash Flow Statement
  - Trial Balance

- **Tax Reports**
  - VAT Returns
  - Withholding Tax Reports
  - Tax Summary Reports

- **Management Reports**
  - Customer/Supplier Aging
  - Fixed Asset Reports
  - Department Financial Reports

## Future Enhancements

The schema is designed to support:
- Multi-currency transactions
- Advanced inventory management
- Project-based accounting
- Advanced reporting and analytics
- Integration with external systems

---

*This documentation reflects the consolidated schema as of migration `20240322000000_consolidate_schema.sql`*