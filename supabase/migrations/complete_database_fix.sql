-- COMPLETE DATABASE FIX FOR LEDGERLINK APPLICATION
-- This script addresses all CRUD operation issues by creating missing tables and fixing schema mismatches

-- ============================================================================
-- 0. UPDATE EXISTING TABLES FOR MANUAL INPUTS
-- ============================================================================

-- Add missing columns to expenses table if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'expenses') THEN
        ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS employee_name text DEFAULT '';
    END IF;
END $$;

-- ============================================================================
-- 1. FIX CONTACTS TABLE
-- ============================================================================
-- The application expects contacts table with specific fields
CREATE TABLE IF NOT EXISTS public.contacts (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    organization_id uuid NOT NULL,
    type text NOT NULL CHECK (type = ANY (ARRAY['customer'::text, 'supplier'::text, 'both'::text])),
    code text NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    address text,
    tax_number text,
    credit_limit numeric DEFAULT 0,
    payment_terms integer DEFAULT 30,
    currency text DEFAULT 'GHS'::text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT contacts_pkey PRIMARY KEY (id),
    CONSTRAINT contacts_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT unique_contact_code_per_org UNIQUE (organization_id, code)
);

-- Enable RLS on contacts table
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for organization-based access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'contacts' 
        AND policyname = 'Users can access their organization''s contacts'
    ) THEN
        CREATE POLICY "Users can access their organization's contacts" ON public.contacts
            FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_contacts_organization_id ON public.contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_contacts_type ON public.contacts(type);
CREATE INDEX IF NOT EXISTS idx_contacts_is_active ON public.contacts(is_active);

-- ============================================================================
-- 2. FIX PRODUCTS TABLE
-- ============================================================================
-- Add missing fields to products table that the application expects
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sku text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS type text DEFAULT 'inventory'::text CHECK (type = ANY (ARRAY['inventory'::text, 'non_inventory'::text, 'service'::text])),
ADD COLUMN IF NOT EXISTS sales_price numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS purchase_price numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_rate numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS unit text DEFAULT 'pcs'::text,
ADD COLUMN IF NOT EXISTS quantity_on_hand numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS reorder_point numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS sales_account_id uuid,
ADD COLUMN IF NOT EXISTS purchase_account_id uuid,
ADD COLUMN IF NOT EXISTS category_id uuid,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Update existing products if they don't have SKUs
UPDATE public.products SET sku = CONCAT('SKU-', LPAD(CAST(EXTRACT(epoch FROM created_at) AS text), 10, '0')) WHERE sku IS NULL;

-- Make sku required after updating existing records
ALTER TABLE public.products ALTER COLUMN sku SET NOT NULL;

-- Add unique constraint for SKU per organization
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_product_sku_per_org' 
        AND table_name = 'products'
    ) THEN
        ALTER TABLE public.products ADD CONSTRAINT unique_product_sku_per_org UNIQUE (organization_id, sku);
    END IF;
END $$;

-- ============================================================================
-- 3. FIX DEPARTMENTS TABLE
-- ============================================================================
-- Create departments table with all required fields
CREATE TABLE IF NOT EXISTS public.departments (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    organization_id uuid NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    manager_id uuid,
    budget numeric DEFAULT 0,
    status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text])),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT departments_pkey PRIMARY KEY (id),
    CONSTRAINT departments_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT departments_manager_id_fkey FOREIGN KEY (manager_id) REFERENCES public.employees(id),
    CONSTRAINT unique_department_code_per_org UNIQUE (organization_id, code)
);

-- Enable RLS on departments table
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for organization-based access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'departments' 
        AND policyname = 'Users can access their organization''s departments'
    ) THEN
        CREATE POLICY "Users can access their organization's departments" ON public.departments
            FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_departments_organization_id ON public.departments(organization_id);
CREATE INDEX IF NOT EXISTS idx_departments_status ON public.departments(status);

-- ============================================================================
-- 4. UPDATE EMPLOYEES TABLE
-- ============================================================================
-- Add missing fields to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS job_title text,
ADD COLUMN IF NOT EXISTS department_id uuid,
ADD COLUMN IF NOT EXISTS department_name text DEFAULT '',
ADD COLUMN IF NOT EXISTS salary numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS hourly_rate numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS emergency_contact text,
ADD COLUMN IF NOT EXISTS emergency_phone text,
ADD COLUMN IF NOT EXISTS bank_account text,
ADD COLUMN IF NOT EXISTS tax_number text,
ADD COLUMN IF NOT EXISTS social_security text,
ADD COLUMN IF NOT EXISTS birth_date date;

-- Add foreign key constraint for department
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'employees_department_id_fkey' 
        AND table_name = 'employees'
    ) THEN
        ALTER TABLE public.employees ADD CONSTRAINT employees_department_id_fkey 
        FOREIGN KEY (department_id) REFERENCES public.departments(id);
    END IF;
END $$;

-- Update existing employees to split name into first_name and last_name if needed
DO $$
BEGIN
    -- Only update if the 'name' column exists (for backward compatibility)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employees' AND column_name = 'name') THEN
        UPDATE public.employees 
        SET first_name = SPLIT_PART(name, ' ', 1),
            last_name = CASE 
                WHEN POSITION(' ' IN name) > 0 
                THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
                ELSE ''
            END
        WHERE first_name IS NULL AND name IS NOT NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- If update fails, continue without error
    NULL;
END $$;

-- ============================================================================
-- 5. FIX INVOICES TABLE 
-- ============================================================================
-- Add missing fields to invoices table that the application expects
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS contact_id uuid,
ADD COLUMN IF NOT EXISTS customer_name text DEFAULT '',
ADD COLUMN IF NOT EXISTS invoice_number text,
ADD COLUMN IF NOT EXISTS issue_date date,
ADD COLUMN IF NOT EXISTS due_date date,
ADD COLUMN IF NOT EXISTS subtotal numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount numeric,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'GHS'::text,
ADD COLUMN IF NOT EXISTS exchange_rate numeric DEFAULT 1,
ADD COLUMN IF NOT EXISTS terms text,
ADD COLUMN IF NOT EXISTS created_by uuid,
ADD COLUMN IF NOT EXISTS posted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS posted_by uuid;

-- Add foreign key constraints
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'invoices_contact_id_fkey' 
        AND table_name = 'invoices'
    ) THEN
        ALTER TABLE public.invoices ADD CONSTRAINT invoices_contact_id_fkey 
        FOREIGN KEY (contact_id) REFERENCES public.contacts(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'invoices_created_by_fkey' 
        AND table_name = 'invoices'
    ) THEN
        ALTER TABLE public.invoices ADD CONSTRAINT invoices_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES public.profiles(id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'invoices_posted_by_fkey' 
        AND table_name = 'invoices'
    ) THEN
        ALTER TABLE public.invoices ADD CONSTRAINT invoices_posted_by_fkey 
        FOREIGN KEY (posted_by) REFERENCES public.profiles(id);
    END IF;
END $$;

-- Migrate data from old fields to new fields if they exist (with error handling)
DO $$
BEGIN
    -- Check if old columns exist before migrating
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'customerid') THEN
        UPDATE public.invoices 
        SET contact_id = CASE 
                WHEN customerid IS NOT NULL AND customerid != '' 
                THEN customerid::uuid 
                ELSE NULL 
            END,
            invoice_number = COALESCE(invoicenumber, 'INV-' || id),
            issue_date = CASE 
                WHEN date IS NOT NULL 
                THEN date::date 
                ELSE CURRENT_DATE 
            END,
            due_date = CASE 
                WHEN duedate IS NOT NULL 
                THEN duedate::date 
                ELSE CURRENT_DATE + INTERVAL '30 days' 
            END,
            total_amount = COALESCE(total, 0)
        WHERE contact_id IS NULL;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- If migration fails, continue without error
    NULL;
END $$;

-- Add unique constraint for invoice number per organization
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_invoice_number_per_org' 
        AND table_name = 'invoices'
    ) THEN
        ALTER TABLE public.invoices ADD CONSTRAINT unique_invoice_number_per_org 
        UNIQUE (organization_id, invoice_number);
    END IF;
END $$;

-- ============================================================================
-- 6. CREATE INVOICE_ITEMS TABLE
-- ============================================================================
-- Create invoice items/line items table
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    invoice_id uuid NOT NULL,
    product_id uuid,
    description text NOT NULL,
    quantity numeric NOT NULL,
    unit_price numeric NOT NULL,
    line_total numeric NOT NULL,
    tax_rate numeric DEFAULT 0,
    tax_amount numeric DEFAULT 0,
    discount_rate numeric DEFAULT 0,
    discount_amount numeric DEFAULT 0,
    sort_order integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT invoice_items_pkey PRIMARY KEY (id),
    CONSTRAINT invoice_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE CASCADE
);

-- Enable RLS on invoice_items table
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for organization-based access through invoice
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'invoice_items' 
        AND policyname = 'Users can access invoice items for their organization''s invoices'
    ) THEN
        CREATE POLICY "Users can access invoice items for their organization's invoices" ON public.invoice_items
            FOR ALL USING (
                invoice_id IN (
                    SELECT id FROM public.invoices 
                    WHERE organization_id IN (
                        SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
                    )
                )
            );
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoice_items' AND column_name = 'product_id') THEN
        CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON public.invoice_items(product_id);
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- ============================================================================
-- 7. CREATE SALES_RETURNS TABLE
-- ============================================================================
-- Create sales returns table
CREATE TABLE IF NOT EXISTS public.sales_returns (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    organization_id uuid NOT NULL,
    return_number text NOT NULL,
    original_invoice_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    return_date date NOT NULL DEFAULT CURRENT_DATE,
    reason text NOT NULL CHECK (reason = ANY (ARRAY['customer_request'::text, 'damaged_goods'::text, 'wrong_item'::text, 'quality_issues'::text, 'other'::text])),
    status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'processing'::text, 'completed'::text, 'rejected'::text])),
    subtotal numeric DEFAULT 0,
    tax_amount numeric DEFAULT 0,
    total_amount numeric NOT NULL,
    refund_amount numeric NOT NULL,
    refund_method text DEFAULT 'original_payment'::text CHECK (refund_method = ANY (ARRAY['original_payment'::text, 'cash'::text, 'credit_note'::text, 'store_credit'::text])),
    notes text,
    internal_notes text,
    approved_by uuid,
    approved_date date,
    processed_by uuid,
    processed_date date,
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT sales_returns_pkey PRIMARY KEY (id),
    CONSTRAINT sales_returns_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT sales_returns_original_invoice_id_fkey FOREIGN KEY (original_invoice_id) REFERENCES public.invoices(id),
    CONSTRAINT sales_returns_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.contacts(id),
    CONSTRAINT sales_returns_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.profiles(id),
    CONSTRAINT sales_returns_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.profiles(id),
    CONSTRAINT sales_returns_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
    CONSTRAINT unique_sales_return_number_per_org UNIQUE (organization_id, return_number)
);

-- Enable RLS on sales_returns table
ALTER TABLE public.sales_returns ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for organization-based access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sales_returns' 
        AND policyname = 'Users can access their organization''s sales returns'
    ) THEN
        CREATE POLICY "Users can access their organization's sales returns" ON public.sales_returns
            FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_returns_organization_id ON public.sales_returns(organization_id);
CREATE INDEX IF NOT EXISTS idx_sales_returns_original_invoice_id ON public.sales_returns(original_invoice_id);
CREATE INDEX IF NOT EXISTS idx_sales_returns_customer_id ON public.sales_returns(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_returns_status ON public.sales_returns(status);
CREATE INDEX IF NOT EXISTS idx_sales_returns_return_date ON public.sales_returns(return_date);

-- ============================================================================
-- 8. CREATE SALES_RETURN_ITEMS TABLE
-- ============================================================================
-- Create sales return items table
CREATE TABLE IF NOT EXISTS public.sales_return_items (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    sales_return_id uuid NOT NULL,
    original_invoice_item_id uuid,
    product_id uuid,
    description text NOT NULL,
    quantity_returned numeric NOT NULL,
    original_quantity numeric NOT NULL,
    unit_price numeric NOT NULL,
    line_total numeric NOT NULL,
    return_reason text,
    condition text DEFAULT 'new'::text CHECK (condition = ANY (ARRAY['new'::text, 'used'::text, 'damaged'::text, 'defective'::text])),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT sales_return_items_pkey PRIMARY KEY (id),
    CONSTRAINT sales_return_items_sales_return_id_fkey FOREIGN KEY (sales_return_id) REFERENCES public.sales_returns(id) ON DELETE CASCADE,
    CONSTRAINT sales_return_items_original_invoice_item_id_fkey FOREIGN KEY (original_invoice_item_id) REFERENCES public.invoice_items(id)
);

-- Enable RLS on sales_return_items table
ALTER TABLE public.sales_return_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for organization-based access through sales return
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'sales_return_items' 
        AND policyname = 'Users can access sales return items for their organization''s returns'
    ) THEN
        CREATE POLICY "Users can access sales return items for their organization's returns" ON public.sales_return_items
            FOR ALL USING (
                sales_return_id IN (
                    SELECT id FROM public.sales_returns 
                    WHERE organization_id IN (
                        SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
                    )
                )
            );
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sales_return_items_sales_return_id ON public.sales_return_items(sales_return_id);
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales_return_items' AND column_name = 'product_id') THEN
        CREATE INDEX IF NOT EXISTS idx_sales_return_items_product_id ON public.sales_return_items(product_id);
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- ============================================================================
-- 9. CREATE ORDERS/QUOTATIONS TABLE
-- ============================================================================
-- Create orders table (can handle both orders and quotations)
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    organization_id uuid NOT NULL,
    order_number text NOT NULL,
    type text NOT NULL CHECK (type = ANY (ARRAY['quotation'::text, 'order'::text, 'purchase_order'::text])),
    contact_id uuid NOT NULL,
    order_date date NOT NULL DEFAULT CURRENT_DATE,
    due_date date,
    valid_until date,
    status text DEFAULT 'draft'::text CHECK (status = ANY (ARRAY['draft'::text, 'sent'::text, 'accepted'::text, 'rejected'::text, 'converted'::text, 'cancelled'::text, 'fulfilled'::text])),
    subtotal numeric DEFAULT 0,
    tax_amount numeric DEFAULT 0,
    total_amount numeric NOT NULL,
    currency text DEFAULT 'GHS'::text,
    exchange_rate numeric DEFAULT 1,
    terms text,
    notes text,
    internal_notes text,
    converted_to_invoice_id uuid,
    converted_date date,
    created_by uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT orders_pkey PRIMARY KEY (id),
    CONSTRAINT orders_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT orders_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id),
    CONSTRAINT orders_converted_to_invoice_id_fkey FOREIGN KEY (converted_to_invoice_id) REFERENCES public.invoices(id),
    CONSTRAINT orders_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
    CONSTRAINT unique_order_number_per_org UNIQUE (organization_id, order_number)
);

-- Enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for organization-based access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'orders' 
        AND policyname = 'Users can access their organization''s orders'
    ) THEN
        CREATE POLICY "Users can access their organization's orders" ON public.orders
            FOR ALL USING (organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()));
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_organization_id ON public.orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_orders_contact_id ON public.orders(contact_id);
CREATE INDEX IF NOT EXISTS idx_orders_type ON public.orders(type);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON public.orders(order_date);

-- ============================================================================
-- 10. CREATE ORDER_ITEMS TABLE
-- ============================================================================
-- Create order items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    order_id uuid NOT NULL,
    product_id uuid,
    description text NOT NULL,
    quantity numeric NOT NULL,
    unit_price numeric NOT NULL,
    line_total numeric NOT NULL,
    tax_rate numeric DEFAULT 0,
    tax_amount numeric DEFAULT 0,
    discount_rate numeric DEFAULT 0,
    discount_amount numeric DEFAULT 0,
    sort_order integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT order_items_pkey PRIMARY KEY (id),
    CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE
);

-- Enable RLS on order_items table
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for organization-based access through order
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'order_items' 
        AND policyname = 'Users can access order items for their organization''s orders'
    ) THEN
        CREATE POLICY "Users can access order items for their organization's orders" ON public.order_items
            FOR ALL USING (
                order_id IN (
                    SELECT id FROM public.orders 
                    WHERE organization_id IN (
                        SELECT organization_id FROM public.profiles WHERE user_id = auth.uid()
                    )
                )
            );
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'product_id') THEN
        CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- ============================================================================
-- TRIGGER FUNCTIONS FOR AUTOMATIC UPDATED_AT
-- ============================================================================
-- Create a function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for all tables to auto-update updated_at (with proper error handling)
DO $$ 
BEGIN
    -- Contacts trigger
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_contacts_updated_at') THEN
        CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Products trigger
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_products_updated_at') THEN
        CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Departments trigger
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_departments_updated_at') THEN
        CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Employees trigger
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_employees_updated_at') THEN
        CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Invoices trigger
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_invoices_updated_at') THEN
        CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Invoice items trigger
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_invoice_items_updated_at') THEN
        CREATE TRIGGER update_invoice_items_updated_at BEFORE UPDATE ON public.invoice_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Sales returns trigger
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_sales_returns_updated_at') THEN
        CREATE TRIGGER update_sales_returns_updated_at BEFORE UPDATE ON public.sales_returns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Sales return items trigger
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_sales_return_items_updated_at') THEN
        CREATE TRIGGER update_sales_return_items_updated_at BEFORE UPDATE ON public.sales_return_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Orders trigger
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_orders_updated_at') THEN
        CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Order items trigger
    IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_order_items_updated_at') THEN
        CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON public.order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    -- Expenses trigger (if expenses table exists)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expenses') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'update_expenses_updated_at') THEN
            CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END IF;
END $$;

-- ============================================================================
-- ADD PRODUCT FOREIGN KEY CONSTRAINTS (AFTER PRODUCTS TABLE IS READY)
-- ============================================================================
-- Add product_id foreign key constraints conditionally
DO $$
BEGIN
    -- Add product_id constraint to invoice_items if products table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'invoice_items_product_id_fkey' 
            AND table_name = 'invoice_items'
        ) THEN
            ALTER TABLE public.invoice_items ADD CONSTRAINT invoice_items_product_id_fkey 
            FOREIGN KEY (product_id) REFERENCES public.products(id);
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'sales_return_items_product_id_fkey' 
            AND table_name = 'sales_return_items'
        ) THEN
            ALTER TABLE public.sales_return_items ADD CONSTRAINT sales_return_items_product_id_fkey 
            FOREIGN KEY (product_id) REFERENCES public.products(id);
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'order_items_product_id_fkey' 
            AND table_name = 'order_items'
        ) THEN
            ALTER TABLE public.order_items ADD CONSTRAINT order_items_product_id_fkey 
            FOREIGN KEY (product_id) REFERENCES public.products(id);
        END IF;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- If adding constraints fails, continue without error
    NULL;
END $$;

-- ============================================================================
-- SAMPLE DATA INSERTION (OPTIONAL)
-- ============================================================================
-- Insert sample departments (you can modify or remove this section)
INSERT INTO public.departments (organization_id, code, name, budget, status) 
SELECT 
    (SELECT id FROM public.organizations LIMIT 1),
    'HR',
    'Human Resources',
    50000,
    'active'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE code = 'HR');

INSERT INTO public.departments (organization_id, code, name, budget, status) 
SELECT 
    (SELECT id FROM public.organizations LIMIT 1),
    'IT',
    'Information Technology',
    100000,
    'active'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE code = 'IT');

INSERT INTO public.departments (organization_id, code, name, budget, status) 
SELECT 
    (SELECT id FROM public.organizations LIMIT 1),
    'SALES',
    'Sales Department',
    75000,
    'active'
WHERE NOT EXISTS (SELECT 1 FROM public.departments WHERE code = 'SALES');

-- Insert sample contacts (you can modify or remove this section)
INSERT INTO public.contacts (organization_id, type, code, name, email, phone, credit_limit, payment_terms) 
SELECT 
    (SELECT id FROM public.organizations LIMIT 1),
    'customer',
    'CUST001',
    'Sample Customer Ltd',
    'customer@example.com',
    '+233 24 123 4567',
    10000,
    30
WHERE NOT EXISTS (SELECT 1 FROM public.contacts WHERE code = 'CUST001');

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
-- This completes the database schema fixes for LedgerLink application
-- All CRUD operations should now work properly for:
-- 1. Invoice creation and management
-- 2. Sales returns creation and tracking  
-- 3. Orders/Quotations management
-- 4. Expenses tracking (from previous script)
-- 5. Customer/Contact management
-- 6. Product/Inventory management
-- 7. Employee and Department management
