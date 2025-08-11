-- Create ENUM types for better data consistency
CREATE TYPE business_type AS ENUM ('company', 'sole_proprietorship', 'partnership');
CREATE TYPE transaction_type AS ENUM ('debit', 'credit');
CREATE TYPE document_status AS ENUM (
    'draft',
    'pending',
    'approved',
    'rejected',
    'posted',
    'voided'
);
CREATE TYPE payment_status AS ENUM (
    'pending',
    'partial',
    'paid',
    'overdue',
    'cancelled'
);
CREATE TYPE payment_method AS ENUM (
    'cash',
    'bank_transfer',
    'cheque',
    'mobile_money'
);
-- 1. Core Tables Improvements
-- Modify organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS business_type business_type,
    ADD COLUMN IF NOT EXISTS registration_number TEXT,
    ADD COLUMN IF NOT EXISTS tax_number TEXT,
    ADD COLUMN IF NOT EXISTS email TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS address TEXT,
    ADD COLUMN IF NOT EXISTS logo_url TEXT,
    ADD COLUMN IF NOT EXISTS fiscal_year_start DATE,
    ADD COLUMN IF NOT EXISTS fiscal_year_end DATE,
    ADD COLUMN IF NOT EXISTS base_currency TEXT DEFAULT 'GHS',
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
-- Modify profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS full_name TEXT,
    ADD COLUMN IF NOT EXISTS role TEXT,
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
    ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
-- 2. Consolidate Contacts (Customers & Suppliers)
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('customer', 'supplier', 'both')),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    tax_number TEXT,
    credit_limit DECIMAL(15, 2) DEFAULT 0,
    payment_terms INTEGER DEFAULT 0,
    currency TEXT DEFAULT 'GHS',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, code)
);
-- Migrate existing customers
INSERT INTO contacts (
        organization_id,
        type,
        code,
        name,
        email,
        phone,
        address,
        created_at,
        updated_at
    )
SELECT organization_id,
    'customer',
    id::text,
    name,
    email,
    phone,
    address,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM customers;
-- Migrate existing suppliers
INSERT INTO contacts (
        organization_id,
        type,
        code,
        name,
        email,
        phone,
        address,
        tax_number,
        created_at,
        updated_at
    )
SELECT organization_id,
    'supplier',
    id::text,
    name,
    email,
    phone,
    address,
    tax_number,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM suppliers;
-- 3. Improve Chart of Accounts
ALTER TABLE chart_of_accounts
ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES chart_of_accounts(id),
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS is_bank_account BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS current_balance DECIMAL(15, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
-- 4. Consolidate Invoices
-- Add missing columns to existing invoices table
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id),
    ADD COLUMN IF NOT EXISTS contact_id UUID,
    ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'GHS',
    ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(15, 6) DEFAULT 1,
    ADD COLUMN IF NOT EXISTS status document_status DEFAULT 'draft',
    ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id),
    ADD COLUMN IF NOT EXISTS posted_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS posted_by UUID REFERENCES profiles(id);
-- 5. Improve Fixed Assets
ALTER TABLE fixed_assets
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id),
    ADD COLUMN IF NOT EXISTS category_id UUID,
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS purchase_date DATE,
    ADD COLUMN IF NOT EXISTS purchase_cost DECIMAL(15, 2),
    ADD COLUMN IF NOT EXISTS salvage_value DECIMAL(15, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
    ADD COLUMN IF NOT EXISTS location TEXT,
    ADD COLUMN IF NOT EXISTS serial_number TEXT,
    ADD COLUMN IF NOT EXISTS warranty_expiry DATE,
    ADD COLUMN IF NOT EXISTS last_maintenance_date DATE,
    ADD COLUMN IF NOT EXISTS next_maintenance_date DATE,
    ADD COLUMN IF NOT EXISTS disposal_date DATE,
    ADD COLUMN IF NOT EXISTS disposal_value DECIMAL(15, 2),
    ADD COLUMN IF NOT EXISTS accumulated_depreciation DECIMAL(15, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS current_book_value DECIMAL(15, 2),
    ADD COLUMN IF NOT EXISTS last_depreciation_date DATE;
-- 6. Improve Tax Management
ALTER TABLE tax_types
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id),
    ADD COLUMN IF NOT EXISTS rate DECIMAL(5, 2),
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES chart_of_accounts(id);
-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);
CREATE INDEX IF NOT EXISTS idx_contacts_organization ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_contact ON invoices(contact_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_category ON fixed_assets(category_id);
CREATE INDEX IF NOT EXISTS idx_fixed_assets_status ON fixed_assets(status);
CREATE INDEX IF NOT EXISTS idx_chart_accounts_org ON chart_of_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_tax_types_org ON tax_types(organization_id);
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_types ENABLE ROW LEVEL SECURITY;
-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';
-- Apply triggers to main tables
DO $$
DECLARE t text;
BEGIN FOR t IN
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name IN (
        'organizations',
        'profiles',
        'contacts',
        'chart_of_accounts',
        'invoices',
        'fixed_assets',
        'tax_types'
    ) LOOP EXECUTE format(
        'DROP TRIGGER IF EXISTS update_%I_updated_at ON %I',
        t,
        t
    );
EXECUTE format(
    'CREATE TRIGGER update_%I_updated_at
                       BEFORE UPDATE ON %I
                       FOR EACH ROW
                       EXECUTE FUNCTION update_updated_at_column()',
    t,
    t
);
END LOOP;
END $$;