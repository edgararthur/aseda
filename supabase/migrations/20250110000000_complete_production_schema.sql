-- Complete Production Schema Migration
-- This migration creates all missing tables and updates existing ones for full functionality

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUMs
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'accountant', 'manager', 'employee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE business_type AS ENUM ('company', 'partnership', 'sole_proprietorship', 'ngo', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'void');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE account_type AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transaction_type AS ENUM ('debit', 'credit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('cash', 'bank_transfer', 'credit_card', 'mobile_money', 'cheque');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create/Update Organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    business_type business_type DEFAULT 'company'::business_type,
    registration_number text,
    tax_number text,
    email text,
    phone text,
    address text,
    logo_url text,
    fiscal_year_start date DEFAULT '2024-01-01'::date,
    fiscal_year_end date DEFAULT '2024-12-31'::date,
    base_currency text DEFAULT 'GHS'::text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT organizations_pkey PRIMARY KEY (id)
);

-- Create/Update Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    user_id uuid,
    email text NOT NULL UNIQUE,
    full_name text NOT NULL,
    role user_role DEFAULT 'accountant'::user_role,
    organization_id uuid,
    is_active boolean DEFAULT true,
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT profiles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);

-- Create Chart of Accounts table
CREATE TABLE IF NOT EXISTS public.chart_of_accounts (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    organization_id uuid,
    account_code text NOT NULL,
    account_name text NOT NULL,
    account_type account_type NOT NULL,
    description text,
    parent_id uuid,
    status text DEFAULT 'active'::text,
    is_bank_account boolean DEFAULT false,
    current_balance numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chart_of_accounts_pkey PRIMARY KEY (id),
    CONSTRAINT chart_of_accounts_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT chart_of_accounts_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.chart_of_accounts(id),
    CONSTRAINT unique_account_code_per_org UNIQUE (organization_id, account_code)
);

-- Create Contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    organization_id uuid,
    type text NOT NULL CHECK (type = ANY (ARRAY['customer'::text, 'supplier'::text, 'both'::text])),
    code text NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    address text,
    tax_number text,
    credit_limit numeric DEFAULT 0,
    payment_terms integer DEFAULT 0,
    currency text DEFAULT 'GHS'::text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT contacts_pkey PRIMARY KEY (id),
    CONSTRAINT contacts_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT unique_contact_code_per_org UNIQUE (organization_id, code)
);

-- Create Products table
CREATE TABLE IF NOT EXISTS public.products (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    organization_id uuid,
    sku text NOT NULL,
    name text NOT NULL,
    description text,
    type text DEFAULT 'inventory'::text CHECK (type = ANY (ARRAY['inventory'::text, 'non_inventory'::text, 'service'::text])),
    sales_price numeric DEFAULT 0,
    purchase_price numeric DEFAULT 0,
    tax_rate numeric DEFAULT 0,
    unit text DEFAULT 'each'::text,
    quantity_on_hand numeric DEFAULT 0,
    reorder_point numeric DEFAULT 0,
    sales_account_id uuid,
    purchase_account_id uuid,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT products_pkey PRIMARY KEY (id),
    CONSTRAINT products_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT products_sales_account_id_fkey FOREIGN KEY (sales_account_id) REFERENCES public.chart_of_accounts(id),
    CONSTRAINT products_purchase_account_id_fkey FOREIGN KEY (purchase_account_id) REFERENCES public.chart_of_accounts(id),
    CONSTRAINT unique_sku_per_org UNIQUE (organization_id, sku)
);

-- Create Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    organization_id uuid,
    contact_id uuid,
    invoice_number text NOT NULL,
    issue_date date NOT NULL DEFAULT CURRENT_DATE,
    due_date date NOT NULL,
    subtotal numeric DEFAULT 0,
    tax_amount numeric DEFAULT 0,
    total_amount numeric DEFAULT 0,
    currency text DEFAULT 'GHS'::text,
    exchange_rate numeric DEFAULT 1,
    status document_status DEFAULT 'draft'::document_status,
    notes text,
    terms text,
    created_by uuid,
    posted_at timestamp with time zone,
    posted_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT invoices_pkey PRIMARY KEY (id),
    CONSTRAINT invoices_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT invoices_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id),
    CONSTRAINT invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
    CONSTRAINT invoices_posted_by_fkey FOREIGN KEY (posted_by) REFERENCES public.profiles(id),
    CONSTRAINT unique_invoice_number_per_org UNIQUE (organization_id, invoice_number)
);

-- Create Invoice Items table
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    invoice_id uuid,
    product_id uuid,
    description text NOT NULL,
    quantity numeric NOT NULL DEFAULT 1,
    unit_price numeric NOT NULL,
    tax_rate numeric DEFAULT 0,
    tax_amount numeric DEFAULT 0,
    total_amount numeric NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT invoice_items_pkey PRIMARY KEY (id),
    CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE,
    CONSTRAINT invoice_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- Create Departments table
CREATE TABLE IF NOT EXISTS public.departments (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    organization_id uuid,
    code text NOT NULL,
    name text NOT NULL,
    manager_id uuid,
    budget numeric DEFAULT 0,
    employee_count integer DEFAULT 0,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT departments_pkey PRIMARY KEY (id),
    CONSTRAINT departments_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT unique_dept_code_per_org UNIQUE (organization_id, code)
);

-- Create Employees table
CREATE TABLE IF NOT EXISTS public.employees (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    organization_id uuid,
    employee_number text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text,
    phone text,
    hire_date date NOT NULL,
    job_title text,
    department_id uuid,
    salary numeric DEFAULT 0,
    hourly_rate numeric DEFAULT 0,
    status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'terminated'::text])),
    address text,
    emergency_contact text,
    emergency_phone text,
    bank_account text,
    tax_number text,
    social_security text,
    birth_date date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT employees_pkey PRIMARY KEY (id),
    CONSTRAINT employees_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT employees_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
    CONSTRAINT unique_employee_number_per_org UNIQUE (organization_id, employee_number)
);

-- Update departments to reference employees as managers
ALTER TABLE public.departments DROP CONSTRAINT IF EXISTS departments_manager_id_fkey;
ALTER TABLE public.departments ADD CONSTRAINT departments_manager_id_fkey 
    FOREIGN KEY (manager_id) REFERENCES public.employees(id);

-- Create Fixed Assets table
CREATE TABLE IF NOT EXISTS public.fixed_assets (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    organization_id uuid,
    asset_code text NOT NULL,
    asset_name text NOT NULL,
    category_id uuid,
    description text,
    purchase_date date,
    purchase_cost numeric,
    salvage_value numeric DEFAULT 0,
    useful_life_years integer DEFAULT 5,
    depreciation_method text DEFAULT 'straight_line'::text,
    status text DEFAULT 'active'::text,
    location text,
    serial_number text,
    warranty_expiry date,
    last_maintenance_date date,
    next_maintenance_date date,
    disposal_date date,
    disposal_value numeric,
    accumulated_depreciation numeric DEFAULT 0,
    current_book_value numeric,
    last_depreciation_date date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fixed_assets_pkey PRIMARY KEY (id),
    CONSTRAINT fixed_assets_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT unique_asset_code_per_org UNIQUE (organization_id, asset_code)
);

-- Create Asset Categories table
CREATE TABLE IF NOT EXISTS public.asset_categories (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    organization_id uuid,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    depreciation_rate numeric DEFAULT 0,
    useful_life_years integer DEFAULT 5,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT asset_categories_pkey PRIMARY KEY (id),
    CONSTRAINT asset_categories_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT unique_asset_category_code_per_org UNIQUE (organization_id, code)
);

-- Update fixed assets to reference asset categories
ALTER TABLE public.fixed_assets DROP CONSTRAINT IF EXISTS fixed_assets_category_id_fkey;
ALTER TABLE public.fixed_assets ADD CONSTRAINT fixed_assets_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES public.asset_categories(id);

-- Create Tax Types table
CREATE TABLE IF NOT EXISTS public.tax_types (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    organization_id uuid,
    name text NOT NULL,
    rate numeric NOT NULL,
    type text NOT NULL CHECK (type = ANY (ARRAY['sales'::text, 'purchase'::text])),
    description text,
    account_id uuid,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT tax_types_pkey PRIMARY KEY (id),
    CONSTRAINT tax_types_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT tax_types_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.chart_of_accounts(id)
);

-- Create Product Categories table
CREATE TABLE IF NOT EXISTS public.product_categories (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    organization_id uuid,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT product_categories_pkey PRIMARY KEY (id),
    CONSTRAINT product_categories_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT unique_product_category_code_per_org UNIQUE (organization_id, code)
);

-- Add category reference to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id uuid;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
ALTER TABLE public.products ADD CONSTRAINT products_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES public.product_categories(id);

-- Create Journal Entries table
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    organization_id uuid,
    entry_number text NOT NULL,
    date date NOT NULL DEFAULT CURRENT_DATE,
    reference text,
    description text NOT NULL,
    total_debit numeric DEFAULT 0,
    total_credit numeric DEFAULT 0,
    status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'posted'::text, 'cancelled'::text])),
    created_by uuid,
    posted_at timestamp with time zone,
    posted_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT journal_entries_pkey PRIMARY KEY (id),
    CONSTRAINT journal_entries_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT journal_entries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
    CONSTRAINT journal_entries_posted_by_fkey FOREIGN KEY (posted_by) REFERENCES public.profiles(id),
    CONSTRAINT unique_entry_number_per_org UNIQUE (organization_id, entry_number)
);

-- Create Journal Entry Lines table
CREATE TABLE IF NOT EXISTS public.journal_entry_lines (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    journal_entry_id uuid,
    account_id uuid,
    description text,
    debit_amount numeric DEFAULT 0,
    credit_amount numeric DEFAULT 0,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT journal_entry_lines_pkey PRIMARY KEY (id),
    CONSTRAINT journal_entry_lines_journal_entry_id_fkey FOREIGN KEY (journal_entry_id) REFERENCES public.journal_entries(id) ON DELETE CASCADE,
    CONSTRAINT journal_entry_lines_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.chart_of_accounts(id)
);

-- Create Bills table (Accounts Payable)
CREATE TABLE IF NOT EXISTS public.bills (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    organization_id uuid,
    contact_id uuid,
    bill_number text NOT NULL,
    issue_date date NOT NULL DEFAULT CURRENT_DATE,
    due_date date NOT NULL,
    subtotal numeric DEFAULT 0,
    tax_amount numeric DEFAULT 0,
    total_amount numeric DEFAULT 0,
    amount_paid numeric DEFAULT 0,
    amount_due numeric DEFAULT 0,
    currency text DEFAULT 'GHS'::text,
    exchange_rate numeric DEFAULT 1,
    status document_status DEFAULT 'draft'::document_status,
    notes text,
    terms text,
    created_by uuid,
    posted_at timestamp with time zone,
    posted_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bills_pkey PRIMARY KEY (id),
    CONSTRAINT bills_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT bills_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id),
    CONSTRAINT bills_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
    CONSTRAINT bills_posted_by_fkey FOREIGN KEY (posted_by) REFERENCES public.profiles(id),
    CONSTRAINT unique_bill_number_per_org UNIQUE (organization_id, bill_number)
);

-- Create Bill Items table
CREATE TABLE IF NOT EXISTS public.bill_items (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    bill_id uuid,
    product_id uuid,
    description text NOT NULL,
    quantity numeric NOT NULL DEFAULT 1,
    unit_price numeric NOT NULL,
    tax_rate numeric DEFAULT 0,
    tax_amount numeric DEFAULT 0,
    total_amount numeric NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bill_items_pkey PRIMARY KEY (id),
    CONSTRAINT bill_items_bill_id_fkey FOREIGN KEY (bill_id) REFERENCES public.bills(id) ON DELETE CASCADE,
    CONSTRAINT bill_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);

-- Create Payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    organization_id uuid,
    payment_number text NOT NULL,
    payment_date date NOT NULL DEFAULT CURRENT_DATE,
    payment_method payment_method DEFAULT 'bank_transfer'::payment_method,
    reference text,
    amount numeric NOT NULL,
    currency text DEFAULT 'GHS'::text,
    exchange_rate numeric DEFAULT 1,
    from_account_id uuid,
    to_account_id uuid,
    contact_id uuid,
    description text,
    status text DEFAULT 'completed'::text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payments_pkey PRIMARY KEY (id),
    CONSTRAINT payments_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT payments_from_account_id_fkey FOREIGN KEY (from_account_id) REFERENCES public.chart_of_accounts(id),
    CONSTRAINT payments_to_account_id_fkey FOREIGN KEY (to_account_id) REFERENCES public.chart_of_accounts(id),
    CONSTRAINT payments_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id),
    CONSTRAINT payments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
    CONSTRAINT unique_payment_number_per_org UNIQUE (organization_id, payment_number)
);

-- Create Payroll table
CREATE TABLE IF NOT EXISTS public.payroll (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    organization_id uuid,
    employee_id uuid,
    payroll_period_start date NOT NULL,
    payroll_period_end date NOT NULL,
    basic_salary numeric DEFAULT 0,
    overtime_hours numeric DEFAULT 0,
    overtime_rate numeric DEFAULT 0,
    overtime_amount numeric DEFAULT 0,
    allowances numeric DEFAULT 0,
    gross_pay numeric DEFAULT 0,
    tax_deductions numeric DEFAULT 0,
    social_security_deductions numeric DEFAULT 0,
    other_deductions numeric DEFAULT 0,
    total_deductions numeric DEFAULT 0,
    net_pay numeric DEFAULT 0,
    status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'processed'::text, 'paid'::text])),
    processed_by uuid,
    processed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payroll_pkey PRIMARY KEY (id),
    CONSTRAINT payroll_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT payroll_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id),
    CONSTRAINT payroll_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.profiles(id)
);

-- Create Bank Accounts table
CREATE TABLE IF NOT EXISTS public.bank_accounts (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    organization_id uuid,
    account_name text NOT NULL,
    bank_name text NOT NULL,
    account_number text NOT NULL,
    account_type text DEFAULT 'checking'::text,
    currency text DEFAULT 'GHS'::text,
    current_balance numeric DEFAULT 0,
    is_active boolean DEFAULT true,
    chart_account_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bank_accounts_pkey PRIMARY KEY (id),
    CONSTRAINT bank_accounts_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT bank_accounts_chart_account_id_fkey FOREIGN KEY (chart_account_id) REFERENCES public.chart_of_accounts(id)
);

-- Create Bank Transactions table
CREATE TABLE IF NOT EXISTS public.bank_transactions (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    bank_account_id uuid,
    transaction_date date NOT NULL,
    description text NOT NULL,
    reference text,
    debit_amount numeric DEFAULT 0,
    credit_amount numeric DEFAULT 0,
    balance numeric DEFAULT 0,
    is_reconciled boolean DEFAULT false,
    reconciled_at timestamp with time zone,
    reconciled_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT bank_transactions_pkey PRIMARY KEY (id),
    CONSTRAINT bank_transactions_bank_account_id_fkey FOREIGN KEY (bank_account_id) REFERENCES public.bank_accounts(id),
    CONSTRAINT bank_transactions_reconciled_by_fkey FOREIGN KEY (reconciled_by) REFERENCES public.profiles(id)
);

-- Create Stock Movements table
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    organization_id uuid,
    product_id uuid,
    movement_type text NOT NULL CHECK (movement_type = ANY (ARRAY['in'::text, 'out'::text, 'adjustment'::text])),
    quantity numeric NOT NULL,
    unit_cost numeric DEFAULT 0,
    total_cost numeric DEFAULT 0,
    reference text,
    description text,
    movement_date date NOT NULL DEFAULT CURRENT_DATE,
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT stock_movements_pkey PRIMARY KEY (id),
    CONSTRAINT stock_movements_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT stock_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
    CONSTRAINT stock_movements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id)
);

-- Create VAT Returns table
CREATE TABLE IF NOT EXISTS public.vat_returns (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    organization_id uuid,
    period_start date NOT NULL,
    period_end date NOT NULL,
    sales_vat numeric DEFAULT 0,
    purchase_vat numeric DEFAULT 0,
    net_vat numeric DEFAULT 0,
    status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'submitted'::text, 'approved'::text])),
    submitted_at timestamp with time zone,
    submitted_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT vat_returns_pkey PRIMARY KEY (id),
    CONSTRAINT vat_returns_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT vat_returns_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.profiles(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_organization_id ON public.invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_contact_id ON public.invoices(contact_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);

CREATE INDEX IF NOT EXISTS idx_products_organization_id ON public.products(organization_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

CREATE INDEX IF NOT EXISTS idx_employees_organization_id ON public.employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON public.employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON public.employees(status);

CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_organization_id ON public.chart_of_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_account_type ON public.chart_of_accounts(account_type);

CREATE INDEX IF NOT EXISTS idx_journal_entries_organization_id ON public.journal_entries(organization_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON public.journal_entries(date);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON public.journal_entries(status);

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vat_returns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organization-based access
CREATE POLICY "Users can access their organization's data" ON public.chart_of_accounts
    FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization's data" ON public.contacts
    FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization's data" ON public.products
    FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization's data" ON public.invoices
    FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization's data" ON public.employees
    FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization's data" ON public.departments
    FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization's data" ON public.fixed_assets
    FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization's data" ON public.asset_categories
    FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization's data" ON public.product_categories
    FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization's data" ON public.journal_entries
    FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization's data" ON public.bills
    FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization's data" ON public.payments
    FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization's data" ON public.payroll
    FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization's data" ON public.bank_accounts
    FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization's data" ON public.stock_movements
    FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can access their organization's data" ON public.vat_returns
    FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

-- Profiles policies
CREATE POLICY "Users can read their own profile" ON public.profiles
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (user_id = auth.uid());

-- Organizations policies
CREATE POLICY "Users can read their organization" ON public.organizations
    FOR SELECT USING (id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage their organization" ON public.organizations
    FOR ALL USING (id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create functions for automatic totals calculation
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.invoices SET
        subtotal = (SELECT COALESCE(SUM(total_amount - tax_amount), 0) FROM public.invoice_items WHERE invoice_id = NEW.invoice_id),
        tax_amount = (SELECT COALESCE(SUM(tax_amount), 0) FROM public.invoice_items WHERE invoice_id = NEW.invoice_id),
        total_amount = (SELECT COALESCE(SUM(total_amount), 0) FROM public.invoice_items WHERE invoice_id = NEW.invoice_id)
    WHERE id = NEW.invoice_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoice_items_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
    FOR EACH ROW EXECUTE FUNCTION calculate_invoice_totals();

-- Create function for updating account balances
CREATE OR REPLACE FUNCTION update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.chart_of_accounts SET
            current_balance = current_balance + NEW.debit_amount - NEW.credit_amount
        WHERE id = NEW.account_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE public.chart_of_accounts SET
            current_balance = current_balance - OLD.debit_amount + OLD.credit_amount + NEW.debit_amount - NEW.credit_amount
        WHERE id = NEW.account_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.chart_of_accounts SET
            current_balance = current_balance - OLD.debit_amount + OLD.credit_amount
        WHERE id = OLD.account_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER journal_entry_lines_balance_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.journal_entry_lines
    FOR EACH ROW EXECUTE FUNCTION update_account_balance();

-- Create function for stock movement updates
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.movement_type = 'in' THEN
            UPDATE public.products SET quantity_on_hand = quantity_on_hand + NEW.quantity WHERE id = NEW.product_id;
        ELSIF NEW.movement_type = 'out' THEN
            UPDATE public.products SET quantity_on_hand = quantity_on_hand - NEW.quantity WHERE id = NEW.product_id;
        ELSIF NEW.movement_type = 'adjustment' THEN
            UPDATE public.products SET quantity_on_hand = NEW.quantity WHERE id = NEW.product_id;
        END IF;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER stock_movements_trigger
    AFTER INSERT ON public.stock_movements
    FOR EACH ROW EXECUTE FUNCTION update_product_stock();