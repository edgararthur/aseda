-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
CREATE TYPE user_role AS ENUM ('admin', 'accountant', 'manager');
CREATE TYPE account_type AS ENUM (
    'asset',
    'liability',
    'equity',
    'revenue',
    'expense'
);

-- 1. Organizations Table (Multi-tenant)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    business_type business_type DEFAULT 'company',
    registration_number TEXT,
    tax_number TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    logo_url TEXT,
    fiscal_year_start DATE DEFAULT '2024-01-01',
    fiscal_year_end DATE DEFAULT '2024-12-31',
    base_currency TEXT DEFAULT 'GHS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'accountant',
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Unified Contacts Table (Customers & Suppliers)
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

-- 4. Chart of Accounts Table
CREATE TABLE chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    account_code TEXT NOT NULL,
    account_name TEXT NOT NULL,
    account_type account_type NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES chart_of_accounts(id),
    status TEXT DEFAULT 'active',
    is_bank_account BOOLEAN DEFAULT false,
    current_balance DECIMAL(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, account_code)
);

-- 5. Invoices Table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id),
    invoice_number TEXT NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal DECIMAL(15, 2) DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) DEFAULT 0,
    currency TEXT DEFAULT 'GHS',
    exchange_rate DECIMAL(15, 6) DEFAULT 1,
    status document_status DEFAULT 'draft',
    notes TEXT,
    terms TEXT,
    created_by UUID REFERENCES profiles(id),
    posted_at TIMESTAMP WITH TIME ZONE,
    posted_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, invoice_number)
);

-- 6. Invoice Items Table
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(15, 4) NOT NULL DEFAULT 1,
    unit_price DECIMAL(15, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(15, 2) DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Fixed Assets Table
CREATE TABLE fixed_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    asset_code TEXT NOT NULL,
    asset_name TEXT NOT NULL,
    category_id UUID,
    description TEXT,
    purchase_date DATE,
    purchase_cost DECIMAL(15, 2),
    salvage_value DECIMAL(15, 2) DEFAULT 0,
    useful_life_years INTEGER DEFAULT 5,
    depreciation_method TEXT DEFAULT 'straight_line',
    status TEXT DEFAULT 'active',
    location TEXT,
    serial_number TEXT,
    warranty_expiry DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    disposal_date DATE,
    disposal_value DECIMAL(15, 2),
    accumulated_depreciation DECIMAL(15, 2) DEFAULT 0,
    current_book_value DECIMAL(15, 2),
    last_depreciation_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, asset_code)
);

-- 8. Tax Types Table
CREATE TABLE tax_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rate DECIMAL(5, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('sales', 'purchase')),
    description TEXT,
    account_id UUID REFERENCES chart_of_accounts(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Departments Table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    manager_id UUID,
    budget DECIMAL(15, 2) DEFAULT 0,
    employee_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, code)
);

-- 10. Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'inventory' CHECK (type IN ('inventory', 'non_inventory', 'service')),
    sales_price DECIMAL(15, 2) DEFAULT 0,
    purchase_price DECIMAL(15, 2) DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    unit TEXT DEFAULT 'each',
    quantity_on_hand DECIMAL(15, 4) DEFAULT 0,
    reorder_point DECIMAL(15, 4) DEFAULT 0,
    sales_account_id UUID REFERENCES chart_of_accounts(id),
    purchase_account_id UUID REFERENCES chart_of_accounts(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, sku)
);

-- Create indexes for performance
CREATE INDEX idx_contacts_type ON contacts(type);
CREATE INDEX idx_contacts_organization ON contacts(organization_id);
CREATE INDEX idx_invoices_contact ON invoices(contact_id);
CREATE INDEX idx_invoices_date ON invoices(issue_date);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_fixed_assets_category ON fixed_assets(category_id);
CREATE INDEX idx_fixed_assets_status ON fixed_assets(status);
CREATE INDEX idx_chart_accounts_org ON chart_of_accounts(organization_id);
CREATE INDEX idx_tax_types_org ON tax_types(organization_id);
CREATE INDEX idx_products_org ON products(organization_id);
CREATE INDEX idx_profiles_org ON profiles(organization_id);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to main tables
DO $$
DECLARE 
    t text;
BEGIN 
    FOR t IN SELECT unnest(ARRAY[
        'organizations',
        'profiles',
        'contacts',
        'chart_of_accounts',
        'invoices',
        'fixed_assets',
        'tax_types',
        'departments',
        'products'
    ]) LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', t, t);
        EXECUTE format(
            'CREATE TRIGGER update_%I_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW
             EXECUTE FUNCTION update_updated_at_column()',
            t, t
        );
    END LOOP;
END $$;

-- Create basic RLS policies
CREATE POLICY "Users can access their organization data" ON organizations
    FOR ALL USING (id = (SELECT organization_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization profiles" ON profiles
    FOR ALL USING (organization_id = (SELECT organization_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization contacts" ON contacts
    FOR ALL USING (organization_id = (SELECT organization_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization accounts" ON chart_of_accounts
    FOR ALL USING (organization_id = (SELECT organization_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization invoices" ON invoices
    FOR ALL USING (organization_id = (SELECT organization_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization invoice items" ON invoice_items
    FOR ALL USING (invoice_id IN (
        SELECT id FROM invoices WHERE organization_id = (
            SELECT organization_id FROM profiles WHERE user_id = auth.uid()
        )
    ));

CREATE POLICY "Users can access their organization assets" ON fixed_assets
    FOR ALL USING (organization_id = (SELECT organization_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization tax types" ON tax_types
    FOR ALL USING (organization_id = (SELECT organization_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization departments" ON departments
    FOR ALL USING (organization_id = (SELECT organization_id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization products" ON products
    FOR ALL USING (organization_id = (SELECT organization_id FROM profiles WHERE user_id = auth.uid()));