-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Create ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'accountant', 'manager', 'viewer');
CREATE TYPE transaction_type AS ENUM ('debit', 'credit');
CREATE TYPE account_type AS ENUM (
    'asset',
    'liability',
    'equity',
    'revenue',
    'expense'
);
CREATE TYPE account_status AS ENUM ('active', 'inactive', 'archived');
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
CREATE TYPE tax_period AS ENUM ('monthly', 'quarterly', 'annually');
-- 1. Core Tables
-- Users/Profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    registration_number TEXT UNIQUE,
    tax_number TEXT UNIQUE,
    email TEXT,
    phone TEXT,
    address TEXT,
    logo_url TEXT,
    fiscal_year_start DATE NOT NULL,
    fiscal_year_end DATE NOT NULL,
    base_currency TEXT DEFAULT 'GHS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_fiscal_year CHECK (fiscal_year_end > fiscal_year_start)
);
-- Organization Members
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'viewer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, user_id)
);
-- 2. Accounting Structure
-- Chart of Accounts
CREATE TABLE account_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    type account_type NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES account_groups(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, code)
);
CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    group_id UUID REFERENCES account_groups(id),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    type account_type NOT NULL,
    description TEXT,
    status account_status DEFAULT 'active',
    is_bank_account BOOLEAN DEFAULT false,
    current_balance DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, code)
);
-- 3. Transactions
-- Journal Entries
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    entry_number TEXT NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    reference TEXT,
    status document_status DEFAULT 'draft',
    posted_at TIMESTAMP WITH TIME ZONE,
    posted_by UUID REFERENCES profiles(id),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, entry_number)
);
CREATE TABLE journal_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id),
    description TEXT,
    type transaction_type NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- 4. Banking & Reconciliation
CREATE TABLE bank_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id),
    bank_name TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_name TEXT NOT NULL,
    swift_code TEXT,
    branch TEXT,
    current_balance DECIMAL(15, 2) DEFAULT 0,
    last_reconciled_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, account_number)
);
CREATE TABLE bank_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bank_account_id UUID REFERENCES bank_accounts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    reference TEXT,
    type transaction_type NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    reconciled BOOLEAN DEFAULT false,
    reconciled_at TIMESTAMP WITH TIME ZONE,
    reconciled_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- 5. Tax Management
CREATE TABLE tax_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rate DECIMAL(5, 2) NOT NULL,
    description TEXT,
    account_id UUID REFERENCES accounts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, name)
);
CREATE TABLE tax_returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    tax_type_id UUID REFERENCES tax_types(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    due_date DATE NOT NULL,
    filing_date DATE,
    status document_status DEFAULT 'draft',
    total_taxable_amount DECIMAL(15, 2) DEFAULT 0,
    total_tax_amount DECIMAL(15, 2) DEFAULT 0,
    submitted_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_period CHECK (period_end > period_start),
    CONSTRAINT valid_due_date CHECK (due_date >= period_end)
);
-- 6. Settings & Configuration
CREATE TABLE organization_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    setting_key TEXT NOT NULL,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, setting_key)
);
-- Create indexes
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_org ON organization_members(organization_id);
CREATE INDEX idx_accounts_code ON accounts(code);
CREATE INDEX idx_accounts_type ON accounts(type);
CREATE INDEX idx_journal_entries_date ON journal_entries(date);
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
CREATE INDEX idx_bank_transactions_date ON bank_transactions(date);
CREATE INDEX idx_bank_transactions_reconciled ON bank_transactions(reconciled);
CREATE INDEX idx_tax_returns_period ON tax_returns(period_start, period_end);
CREATE INDEX idx_tax_returns_status ON tax_returns(status);
-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';
-- Apply triggers to all tables
DO $$
DECLARE t text;
BEGIN FOR t IN
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE' LOOP EXECUTE format(
        'CREATE TRIGGER update_%I_updated_at
                       BEFORE UPDATE ON %I
                       FOR EACH ROW
                       EXECUTE FUNCTION update_updated_at_column()',
        t,
        t
    );
END LOOP;
END $$;
-- Enable Row Level Security
DO $$
DECLARE t text;
BEGIN FOR t IN
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE' LOOP EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
END LOOP;
END $$;
-- Create basic RLS policies
CREATE POLICY "Allow full access to admins" ON profiles FOR ALL TO authenticated USING (role = 'admin');
CREATE POLICY "Users can read their own profile" ON profiles FOR
SELECT TO authenticated USING (auth.uid() = id);
-- Insert initial admin user
INSERT INTO profiles (email, full_name, role)
VALUES (
        'admin@example.com',
        'System Administrator',
        'admin'
    );
-- Insert default organization
INSERT INTO organizations (
        name,
        fiscal_year_start,
        fiscal_year_end
    )
VALUES (
        'Default Organization',
        DATE_TRUNC('year', CURRENT_DATE),
        DATE_TRUNC('year', CURRENT_DATE) + INTERVAL '1 year' - INTERVAL '1 day'
    );