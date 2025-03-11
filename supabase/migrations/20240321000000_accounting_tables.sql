-- Create additional ENUM types
CREATE TYPE contact_type AS ENUM ('customer', 'vendor', 'both');
CREATE TYPE invoice_type AS ENUM ('sale', 'purchase');
CREATE TYPE asset_status AS ENUM ('active', 'disposed', 'written_off');
CREATE TYPE depreciation_method AS ENUM (
    'straight_line',
    'reducing_balance',
    'units_of_production'
);
CREATE TYPE report_type AS ENUM (
    'balance_sheet',
    'income_statement',
    'cash_flow',
    'trial_balance'
);
CREATE TYPE budget_period AS ENUM ('monthly', 'quarterly', 'annually');
-- 1. Contacts (Customers & Vendors)
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    type contact_type NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    tax_number TEXT,
    credit_limit DECIMAL(15, 2) DEFAULT 0,
    payment_terms INTEGER DEFAULT 0,
    -- Days
    currency TEXT DEFAULT 'GHS',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, code)
);
-- 2. Bills and Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    type invoice_type NOT NULL,
    contact_id UUID REFERENCES contacts(id),
    invoice_number TEXT NOT NULL,
    reference TEXT,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    currency TEXT DEFAULT 'GHS',
    exchange_rate DECIMAL(15, 6) DEFAULT 1,
    subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(15, 2) NOT NULL DEFAULT 0,
    status document_status DEFAULT 'draft',
    notes TEXT,
    created_by UUID REFERENCES profiles(id),
    posted_at TIMESTAMP WITH TIME ZONE,
    posted_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, invoice_number),
    CONSTRAINT valid_due_date CHECK (due_date >= issue_date)
);
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(15, 2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(15, 2) NOT NULL,
    account_id UUID REFERENCES accounts(id),
    tax_type_id UUID REFERENCES tax_types(id),
    tax_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    type invoice_type NOT NULL,
    contact_id UUID REFERENCES contacts(id),
    payment_number TEXT NOT NULL,
    payment_date DATE NOT NULL,
    currency TEXT DEFAULT 'GHS',
    exchange_rate DECIMAL(15, 6) DEFAULT 1,
    amount DECIMAL(15, 2) NOT NULL,
    payment_method payment_method NOT NULL,
    reference TEXT,
    notes TEXT,
    bank_account_id UUID REFERENCES bank_accounts(id),
    status document_status DEFAULT 'draft',
    created_by UUID REFERENCES profiles(id),
    posted_at TIMESTAMP WITH TIME ZONE,
    posted_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, payment_number)
);
CREATE TABLE payment_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- 3. Fixed Assets
CREATE TABLE asset_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    depreciation_method depreciation_method NOT NULL,
    depreciation_rate DECIMAL(5, 2) NOT NULL,
    useful_life INTEGER,
    -- In months
    asset_account_id UUID REFERENCES accounts(id),
    depreciation_account_id UUID REFERENCES accounts(id),
    accumulated_depreciation_account_id UUID REFERENCES accounts(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, name)
);
CREATE TABLE fixed_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID REFERENCES asset_categories(id),
    name TEXT NOT NULL,
    description TEXT,
    purchase_date DATE NOT NULL,
    purchase_cost DECIMAL(15, 2) NOT NULL,
    salvage_value DECIMAL(15, 2) DEFAULT 0,
    status asset_status DEFAULT 'active',
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE depreciation_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES fixed_assets(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    depreciation_amount DECIMAL(15, 2) NOT NULL,
    book_value_start DECIMAL(15, 2) NOT NULL,
    book_value_end DECIMAL(15, 2) NOT NULL,
    posted BOOLEAN DEFAULT false,
    posted_at TIMESTAMP WITH TIME ZONE,
    posted_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- 4. Budgeting
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    period budget_period NOT NULL,
    fiscal_year INTEGER NOT NULL,
    description TEXT,
    status document_status DEFAULT 'draft',
    created_by UUID REFERENCES profiles(id),
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, name, fiscal_year)
);
CREATE TABLE budget_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    budget_id UUID REFERENCES budgets(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- 5. Financial Reports
CREATE TABLE report_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    type report_type NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    config JSONB NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, name)
);
CREATE TABLE generated_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    template_id UUID REFERENCES report_templates(id),
    type report_type NOT NULL,
    name TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    parameters JSONB,
    data JSONB,
    generated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- Create indexes for performance
CREATE INDEX idx_contacts_type ON contacts(type);
CREATE INDEX idx_contacts_organization ON contacts(organization_id);
CREATE INDEX idx_invoices_contact ON invoices(contact_id);
CREATE INDEX idx_invoices_date ON invoices(issue_date);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_payments_contact ON payments(contact_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_fixed_assets_category ON fixed_assets(category_id);
CREATE INDEX idx_fixed_assets_status ON fixed_assets(status);
CREATE INDEX idx_budget_items_account ON budget_items(account_id);
CREATE INDEX idx_budget_items_period ON budget_items(period_start, period_end);
CREATE INDEX idx_generated_reports_type ON generated_reports(type);
CREATE INDEX idx_generated_reports_period ON generated_reports(period_start, period_end);
-- Enable RLS on new tables
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixed_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE depreciation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_reports ENABLE ROW LEVEL SECURITY;