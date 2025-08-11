-- Drop triggers
DO $$
DECLARE t text;
BEGIN FOR t IN
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name IN (
        'organizations',
        'profiles',
        'contacts',
        'chart_of_accounts',
        'invoices',
        'fixed_assets',
        'tax_types'
    ) LOOP EXECUTE format(
        'DROP TRIGGER IF EXISTS update_%I_updated_at ON %I',
        t,
        t
    );
END LOOP;
END $$;
-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column();
-- Drop indexes
DROP INDEX IF EXISTS idx_contacts_type;
DROP INDEX IF EXISTS idx_contacts_organization;
DROP INDEX IF EXISTS idx_invoices_contact;
DROP INDEX IF EXISTS idx_invoices_date;
DROP INDEX IF EXISTS idx_invoices_status;
DROP INDEX IF EXISTS idx_fixed_assets_category;
DROP INDEX IF EXISTS idx_fixed_assets_status;
DROP INDEX IF EXISTS idx_chart_accounts_org;
DROP INDEX IF EXISTS idx_tax_types_org;
-- Revert tax_types modifications
ALTER TABLE tax_types DROP COLUMN IF EXISTS organization_id,
    DROP COLUMN IF EXISTS rate,
    DROP COLUMN IF EXISTS description,
    DROP COLUMN IF EXISTS account_id;
-- Revert fixed_assets modifications
ALTER TABLE fixed_assets DROP COLUMN IF EXISTS organization_id,
    DROP COLUMN IF EXISTS category_id,
    DROP COLUMN IF EXISTS description,
    DROP COLUMN IF EXISTS purchase_date,
    DROP COLUMN IF EXISTS purchase_cost,
    DROP COLUMN IF EXISTS salvage_value,
    DROP COLUMN IF EXISTS status,
    DROP COLUMN IF EXISTS location,
    DROP COLUMN IF EXISTS serial_number,
    DROP COLUMN IF EXISTS warranty_expiry,
    DROP COLUMN IF EXISTS last_maintenance_date,
    DROP COLUMN IF EXISTS next_maintenance_date,
    DROP COLUMN IF EXISTS disposal_date,
    DROP COLUMN IF EXISTS disposal_value,
    DROP COLUMN IF EXISTS accumulated_depreciation,
    DROP COLUMN IF EXISTS current_book_value,
    DROP COLUMN IF EXISTS last_depreciation_date;
-- Revert invoices modifications
ALTER TABLE invoices DROP COLUMN IF EXISTS organization_id,
    DROP COLUMN IF EXISTS contact_id,
    DROP COLUMN IF EXISTS currency,
    DROP COLUMN IF EXISTS exchange_rate,
    DROP COLUMN IF EXISTS status,
    DROP COLUMN IF EXISTS created_by,
    DROP COLUMN IF EXISTS posted_at,
    DROP COLUMN IF EXISTS posted_by;
-- Revert chart_of_accounts modifications
ALTER TABLE chart_of_accounts DROP COLUMN IF EXISTS description,
    DROP COLUMN IF EXISTS parent_id,
    DROP COLUMN IF EXISTS status,
    DROP COLUMN IF EXISTS is_bank_account,
    DROP COLUMN IF EXISTS current_balance,
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at;
-- Drop contacts table (data will be preserved in original customers and suppliers tables)
DROP TABLE IF EXISTS contacts;
-- Revert profiles modifications
ALTER TABLE profiles DROP COLUMN IF EXISTS full_name,
    DROP COLUMN IF EXISTS role,
    DROP COLUMN IF EXISTS is_active,
    DROP COLUMN IF EXISTS last_login,
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at;
-- Revert organizations modifications
ALTER TABLE organizations DROP COLUMN IF EXISTS business_type,
    DROP COLUMN IF EXISTS registration_number,
    DROP COLUMN IF EXISTS tax_number,
    DROP COLUMN IF EXISTS email,
    DROP COLUMN IF EXISTS phone,
    DROP COLUMN IF EXISTS address,
    DROP COLUMN IF EXISTS logo_url,
    DROP COLUMN IF EXISTS fiscal_year_start,
    DROP COLUMN IF EXISTS fiscal_year_end,
    DROP COLUMN IF EXISTS base_currency,
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at;
-- Drop ENUM types
DROP TYPE IF EXISTS payment_method;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS document_status;
DROP TYPE IF EXISTS transaction_type;
DROP TYPE IF EXISTS business_type;