-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Create ENUM types for various statuses and types
CREATE TYPE user_role AS ENUM ('admin', 'accountant', 'manager');
CREATE TYPE department_status AS ENUM ('active', 'inactive');
CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'overdue');
CREATE TYPE vat_status AS ENUM ('draft', 'submitted', 'overdue');
CREATE TYPE withholding_tax_status AS ENUM ('draft', 'submitted', 'cancelled');
CREATE TYPE tax_period AS ENUM ('monthly', 'quarterly');
CREATE TYPE depreciation_method AS ENUM ('straight_line', 'reducing_balance');
CREATE TYPE account_type AS ENUM (
    'asset',
    'liability',
    'equity',
    'revenue',
    'expense'
);
CREATE TYPE journal_status AS ENUM ('draft', 'posted');
-- 1. Profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'accountant',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- 2. Departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    manager UUID REFERENCES profiles(id),
    employee_count INTEGER DEFAULT 0,
    budget DECIMAL(15, 2) NOT NULL DEFAULT 0,
    status department_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- 3. Expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_no TEXT UNIQUE NOT NULL,
    date DATE NOT NULL,
    category TEXT NOT NULL,
    department UUID REFERENCES departments(id),
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    tax_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_method TEXT NOT NULL,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- 4. Asset Categories table
CREATE TABLE asset_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    depreciation_rate DECIMAL(5, 2) NOT NULL,
    depreciation_method depreciation_method NOT NULL,
    useful_life INTEGER NOT NULL,
    asset_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- 5. VAT Returns table
CREATE TABLE vat_returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    due_date DATE NOT NULL,
    filing_date DATE,
    total_sales DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_purchases DECIMAL(15, 2) NOT NULL DEFAULT 0,
    vat_collected DECIMAL(15, 2) NOT NULL DEFAULT 0,
    vat_paid DECIMAL(15, 2) NOT NULL DEFAULT 0,
    net_vat DECIMAL(15, 2) NOT NULL DEFAULT 0,
    status vat_status NOT NULL DEFAULT 'draft',
    submitted_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_period CHECK (period_end > period_start),
    CONSTRAINT valid_due_date CHECK (due_date >= period_end)
);
-- 6. Withholding Taxes table
CREATE TABLE withholding_taxes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    reference_no TEXT UNIQUE NOT NULL,
    supplier TEXT NOT NULL,
    description TEXT NOT NULL,
    payment_amount DECIMAL(15, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) NOT NULL,
    tax_amount DECIMAL(15, 2) NOT NULL,
    status withholding_tax_status NOT NULL DEFAULT 'draft',
    certificate_no TEXT UNIQUE,
    submitted_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- 7. Tax Settings table
CREATE TABLE tax_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vat_rate DECIMAL(5, 2) NOT NULL,
    withholding_tax_rate DECIMAL(5, 2) NOT NULL,
    tax_identification_number TEXT NOT NULL,
    tax_office TEXT NOT NULL,
    tax_period tax_period NOT NULL,
    company_name TEXT NOT NULL,
    company_address TEXT NOT NULL,
    gra_portal_username TEXT,
    gra_portal_password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- 8. Chart of Accounts table
CREATE TABLE chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    type account_type NOT NULL,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
-- 9. Journal Entries table
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    reference_no TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    debit_account UUID REFERENCES chart_of_accounts(id),
    credit_account UUID REFERENCES chart_of_accounts(id),
    amount DECIMAL(15, 2) NOT NULL,
    status journal_status NOT NULL DEFAULT 'draft',
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT different_accounts CHECK (debit_account != credit_account)
);
-- Create indexes for better query performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_departments_code ON departments(code);
CREATE INDEX idx_departments_status ON departments(status);
CREATE INDEX idx_expenses_reference ON expenses(reference_no);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_expenses_status ON expenses(payment_status);
CREATE INDEX idx_asset_categories_code ON asset_categories(code);
CREATE INDEX idx_vat_returns_period ON vat_returns(period_start, period_end);
CREATE INDEX idx_vat_returns_status ON vat_returns(status);
CREATE INDEX idx_withholding_taxes_reference ON withholding_taxes(reference_no);
CREATE INDEX idx_withholding_taxes_date ON withholding_taxes(date);
CREATE INDEX idx_withholding_taxes_status ON withholding_taxes(status);
CREATE INDEX idx_chart_of_accounts_code ON chart_of_accounts(code);
CREATE INDEX idx_chart_of_accounts_type ON chart_of_accounts(type);
CREATE INDEX idx_journal_entries_date ON journal_entries(date);
CREATE INDEX idx_journal_entries_reference ON journal_entries(reference_no);
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';
-- Apply update_updated_at_column trigger to all tables
CREATE TRIGGER update_profiles_updated_at BEFORE
UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departments_updated_at BEFORE
UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE
UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_asset_categories_updated_at BEFORE
UPDATE ON asset_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vat_returns_updated_at BEFORE
UPDATE ON vat_returns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_withholding_taxes_updated_at BEFORE
UPDATE ON withholding_taxes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tax_settings_updated_at BEFORE
UPDATE ON tax_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chart_of_accounts_updated_at BEFORE
UPDATE ON chart_of_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_journal_entries_updated_at BEFORE
UPDATE ON journal_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Create RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vat_returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE withholding_taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
-- Create policies for each table
CREATE POLICY "Allow full access to admins" ON profiles FOR ALL TO authenticated USING (auth.jwt()->>'role' = 'admin');
CREATE POLICY "Allow read access to all authenticated users" ON profiles FOR
SELECT TO authenticated USING (true);
-- Similar policies for other tables...
-- Note: You'll want to customize these policies based on your specific requirements
-- Insert default admin user
INSERT INTO profiles (email, full_name, role)
VALUES (
        'admin@example.com',
        'System Administrator',
        'admin'
    );
-- Insert default tax settings
INSERT INTO tax_settings (
        vat_rate,
        withholding_tax_rate,
        tax_identification_number,
        tax_office,
        tax_period,
        company_name,
        company_address
    )
VALUES (
        12.5,
        -- Default VAT rate for Ghana
        5.0,
        -- Default withholding tax rate
        'PENDING',
        'PENDING',
        'monthly',
        'PENDING',
        'PENDING'
    );