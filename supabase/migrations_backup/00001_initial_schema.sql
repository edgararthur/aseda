-- Enable necessary extensions
create extension if not exists "uuid-ossp";
-- Create enum types
create type user_role as enum ('ADMIN', 'ACCOUNTANT', 'MANAGER', 'VIEWER');
create type transaction_type as enum ('CASH', 'BANK', 'JOURNAL');
create type payment_status as enum ('PENDING', 'PAID', 'OVERDUE');
create type approval_status as enum ('PENDING', 'APPROVED', 'REJECTED');
create type tax_filing_type as enum (
    'VAT',
    'PAYE',
    'CORPORATE_TAX',
    'WITHHOLDING_TAX'
);
create type account_type as enum (
    'ASSET',
    'LIABILITY',
    'EQUITY',
    'REVENUE',
    'EXPENSE'
);
-- Create tables
create table profiles (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users on delete cascade,
    full_name text not null,
    email text not null unique,
    phone text,
    role user_role not null default 'VIEWER',
    tin_number text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create table company_settings (
    id uuid primary key default uuid_generate_v4(),
    company_name text not null,
    company_address text,
    company_phone text,
    company_email text,
    tin_number text not null,
    vat_number text,
    business_registration_number text,
    fiscal_year_start date not null,
    fiscal_year_end date not null,
    base_currency text default 'GHS',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create table chart_of_accounts (
    id uuid primary key default uuid_generate_v4(),
    account_code text not null unique,
    account_name text not null,
    account_type account_type not null,
    parent_account_id uuid references chart_of_accounts(id),
    description text,
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create table general_ledger (
    id uuid primary key default uuid_generate_v4(),
    entry_date date not null,
    reference_no text not null unique,
    account_code text not null references chart_of_accounts(account_code),
    account_name text not null,
    description text,
    debit numeric(15, 2) default 0,
    credit numeric(15, 2) default 0,
    running_balance numeric(15, 2) not null,
    transaction_type transaction_type not null,
    vat_applied boolean default false,
    withholding_tax_applied boolean default false,
    supporting_document text,
    created_by uuid references auth.users not null,
    approved_by uuid references auth.users,
    approval_status approval_status default 'PENDING',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create table tax_filings (
    id uuid primary key default uuid_generate_v4(),
    filing_type tax_filing_type not null,
    period_start date not null,
    period_end date not null,
    due_date date not null,
    filing_date date,
    total_amount numeric(15, 2) not null,
    payment_status payment_status default 'PENDING',
    reference_number text not null unique,
    supporting_documents text [],
    notes text,
    created_by uuid references auth.users not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create table employees (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users,
    employee_id text not null unique,
    position text not null,
    department text not null,
    hire_date date not null,
    salary numeric(15, 2) not null,
    bank_name text,
    bank_account_number text,
    tin_number text not null,
    ssnit_number text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create table payroll (
    id uuid primary key default uuid_generate_v4(),
    employee_id uuid references employees(id) not null,
    pay_period_start date not null,
    pay_period_end date not null,
    basic_salary numeric(15, 2) not null,
    overtime_pay numeric(15, 2) default 0,
    allowances numeric(15, 2) default 0,
    deductions numeric(15, 2) default 0,
    tax_withheld numeric(15, 2) default 0,
    ssnit_employee numeric(15, 2) default 0,
    ssnit_employer numeric(15, 2) default 0,
    net_pay numeric(15, 2) not null,
    payment_date date,
    status payment_status default 'PENDING',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create table products (
    id uuid primary key default uuid_generate_v4(),
    product_name text not null,
    sku text not null unique,
    category_id uuid,
    price numeric(15, 2) not null,
    unit text not null,
    tax_rate numeric(5, 2) default 18.5,
    stock_quantity integer default 0,
    reorder_point integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
create table fixed_assets (
    id uuid primary key default uuid_generate_v4(),
    asset_name text not null,
    asset_code text not null unique,
    purchase_date date not null,
    purchase_cost numeric(15, 2) not null,
    salvage_value numeric(15, 2) default 0,
    useful_life_years integer not null,
    depreciation_method text not null,
    depreciation_rate numeric(5, 2),
    accumulated_depreciation numeric(15, 2) default 0,
    current_value numeric(15, 2) not null,
    location text,
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Create indexes
create index idx_general_ledger_entry_date on general_ledger(entry_date);
create index idx_general_ledger_account_code on general_ledger(account_code);
create index idx_tax_filings_period on tax_filings(period_start, period_end);
create index idx_payroll_period on payroll(pay_period_start, pay_period_end);
create index idx_employees_department on employees(department);
-- Create functions
create or replace function update_updated_at() returns trigger as $$ begin new.updated_at = timezone('utc'::text, now());
return new;
end;
$$ language plpgsql;
-- Create triggers
create trigger set_updated_at before
update on profiles for each row execute function update_updated_at();
create trigger set_updated_at before
update on company_settings for each row execute function update_updated_at();
create trigger set_updated_at before
update on chart_of_accounts for each row execute function update_updated_at();
create trigger set_updated_at before
update on general_ledger for each row execute function update_updated_at();
create trigger set_updated_at before
update on tax_filings for each row execute function update_updated_at();
create trigger set_updated_at before
update on employees for each row execute function update_updated_at();
create trigger set_updated_at before
update on payroll for each row execute function update_updated_at();
create trigger set_updated_at before
update on products for each row execute function update_updated_at();
create trigger set_updated_at before
update on fixed_assets for each row execute function update_updated_at();
-- Create RLS policies
alter table profiles enable row level security;
alter table company_settings enable row level security;
alter table chart_of_accounts enable row level security;
alter table general_ledger enable row level security;
alter table tax_filings enable row level security;
alter table employees enable row level security;
alter table payroll enable row level security;
alter table products enable row level security;
alter table fixed_assets enable row level security;
-- Create views
create or replace view trial_balance_view as
select coa.account_code,
    coa.account_name,
    coa.account_type,
    coalesce(sum(gl.debit), 0) as debit_balance,
    coalesce(sum(gl.credit), 0) as credit_balance,
    coalesce(sum(gl.debit) - sum(gl.credit), 0) as net_balance,
    current_date as as_of_date
from chart_of_accounts coa
    left join general_ledger gl on coa.account_code = gl.account_code
where coa.is_active = true
group by coa.account_code,
    coa.account_name,
    coa.account_type;