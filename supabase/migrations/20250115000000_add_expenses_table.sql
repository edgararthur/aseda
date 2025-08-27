-- Create Expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    organization_id uuid,
    expense_number text NOT NULL,
    employee_id uuid,
    category text NOT NULL CHECK (category = ANY (ARRAY['travel'::text, 'meals'::text, 'office_supplies'::text, 'utilities'::text, 'rent'::text, 'marketing'::text, 'professional_services'::text, 'other'::text])),
    description text NOT NULL,
    amount numeric NOT NULL,
    tax_amount numeric DEFAULT 0,
    total_amount numeric NOT NULL,
    expense_date date NOT NULL DEFAULT CURRENT_DATE,
    payment_method text DEFAULT 'cash'::text CHECK (payment_method = ANY (ARRAY['cash'::text, 'credit_card'::text, 'bank_transfer'::text, 'company_card'::text])),
    status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'submitted'::text, 'approved'::text, 'rejected'::text, 'paid'::text, 'reimbursed'::text])),
    receipt_url text,
    notes text,
    approved_by uuid,
    approved_date date,
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT expenses_pkey PRIMARY KEY (id),
    CONSTRAINT expenses_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT expenses_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id),
    CONSTRAINT expenses_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.profiles(id),
    CONSTRAINT expenses_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
    CONSTRAINT unique_expense_number_per_org UNIQUE (organization_id, expense_number)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_organization_id ON public.expenses(organization_id);
CREATE INDEX IF NOT EXISTS idx_expenses_employee_id ON public.expenses(employee_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);

-- Enable RLS on expenses table
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for organization-based access
CREATE POLICY "Users can access their organization's expenses" ON public.expenses
    FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));


