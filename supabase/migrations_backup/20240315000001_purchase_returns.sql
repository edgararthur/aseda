create table purchase_returns (
    id uuid primary key default uuid_generate_v4(),
    reference_no text not null unique,
    supplier text not null,
    date date not null,
    total_amount numeric(15, 2) not null,
    status text not null default 'PENDING',
    paid numeric(15, 2) default 0,
    due numeric(15, 2) generated always as (total_amount - paid) stored,
    notes text,
    created_by uuid references auth.users not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
-- Create indexes
create index idx_purchase_returns_date on purchase_returns(date);
create index idx_purchase_returns_supplier on purchase_returns(supplier);
-- Create trigger for updated_at
create trigger set_updated_at before
update on purchase_returns for each row execute function update_updated_at();
-- Enable RLS
alter table purchase_returns enable row level security;