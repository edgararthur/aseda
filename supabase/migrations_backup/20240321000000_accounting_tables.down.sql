-- Drop tables in reverse order (to handle dependencies)
DROP TABLE IF EXISTS generated_reports;
DROP TABLE IF EXISTS report_templates;
DROP TABLE IF EXISTS budget_items;
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS depreciation_schedules;
DROP TABLE IF EXISTS fixed_assets;
DROP TABLE IF EXISTS asset_categories;
DROP TABLE IF EXISTS payment_allocations;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoice_items;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS contacts;
-- Drop ENUM types
DROP TYPE IF EXISTS budget_period;
DROP TYPE IF EXISTS report_type;
DROP TYPE IF EXISTS depreciation_method;
DROP TYPE IF EXISTS asset_status;
DROP TYPE IF EXISTS invoice_type;
DROP TYPE IF EXISTS contact_type;