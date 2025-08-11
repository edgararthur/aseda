-- Drop all tables in reverse order (to handle dependencies)
DROP TABLE IF EXISTS organization_settings;
DROP TABLE IF EXISTS tax_returns;
DROP TABLE IF EXISTS tax_types;
DROP TABLE IF EXISTS bank_transactions;
DROP TABLE IF EXISTS bank_accounts;
DROP TABLE IF EXISTS journal_items;
DROP TABLE IF EXISTS journal_entries;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS account_groups;
DROP TABLE IF EXISTS organization_members;
DROP TABLE IF EXISTS organizations;
DROP TABLE IF EXISTS profiles;
-- Drop the updated_at trigger function
DROP FUNCTION IF EXISTS update_updated_at_column();
-- Drop ENUM types
DROP TYPE IF EXISTS tax_period;
DROP TYPE IF EXISTS payment_method;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS document_status;
DROP TYPE IF EXISTS account_status;
DROP TYPE IF EXISTS account_type;
DROP TYPE IF EXISTS transaction_type;
DROP TYPE IF EXISTS user_role;