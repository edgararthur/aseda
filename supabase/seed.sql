-- Seed data for Aseda Accounting System
-- This file contains initial data for testing and development

-- Insert sample organization (if not exists)
INSERT INTO public.organizations (id, name, business_type, email, phone, address, base_currency)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Company Ltd',
  'company',
  'demo@company.com',
  '+233-123-456-789',
  '123 Business Street, Accra, Ghana',
  'GHS'
) ON CONFLICT (id) DO NOTHING;

-- Insert sample chart of accounts
INSERT INTO public.chart_of_accounts (id, organization_id, account_code, account_name, account_type, parent_id, is_active)
VALUES 
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '1000', 'Assets', 'asset', NULL, true),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '1100', 'Current Assets', 'asset', '10000000-0000-0000-0000-000000000001', true),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '1110', 'Cash and Bank', 'asset', '10000000-0000-0000-0000-000000000002', true),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', '1120', 'Accounts Receivable', 'asset', '10000000-0000-0000-0000-000000000002', true),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', '2000', 'Liabilities', 'liability', NULL, true),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', '2100', 'Current Liabilities', 'liability', '10000000-0000-0000-0000-000000000005', true),
  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', '2110', 'Accounts Payable', 'liability', '10000000-0000-0000-0000-000000000006', true),
  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', '3000', 'Equity', 'equity', NULL, true),
  ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', '4000', 'Revenue', 'revenue', NULL, true),
  ('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', '5000', 'Expenses', 'expense', NULL, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample contacts
INSERT INTO public.contacts (id, organization_id, name, email, phone, type, is_active)
VALUES 
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'ABC Corporation', 'contact@abc.com', '+233-200-000-001', 'customer', true),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'XYZ Suppliers Ltd', 'info@xyz.com', '+233-200-000-002', 'supplier', true),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Tech Solutions Inc', 'hello@techsol.com', '+233-200-000-003', 'both', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample products
INSERT INTO public.products (id, organization_id, sku, name, description, type, sales_price, purchase_price, unit, is_active)
VALUES 
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'PROD001', 'Consulting Services', 'Professional consulting services', 'service', 500.00, 0.00, 'hour', true),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'PROD002', 'Software License', 'Annual software license', 'non_inventory', 1200.00, 800.00, 'each', true),
  ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'PROD003', 'Office Supplies', 'General office supplies', 'inventory', 25.00, 15.00, 'pack', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample departments
INSERT INTO public.departments (id, organization_id, name, description, is_active)
VALUES 
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Finance', 'Finance and Accounting Department', true),
  ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Operations', 'Operations Department', true),
  ('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Sales', 'Sales and Marketing Department', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample tax types
INSERT INTO public.tax_types (id, organization_id, name, rate, type, is_active)
VALUES 
  ('50000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'VAT', 12.5, 'sales', true),
  ('50000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'NHIL', 2.5, 'sales', true),
  ('50000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Withholding Tax', 5.0, 'purchase', true)
ON CONFLICT (id) DO NOTHING;
