export const CURRENCY = {
    code: 'GHS',
    symbol: '₵',
    name: 'Ghana Cedi'
};

export const TAX_RATES = {
    VAT: 12.5,
    NHIL: 2.5,
    GETFL: 2.5,
    COVID: 1.0,
    TOTAL_VAT: 18.5, // Combined VAT + NHIL + GETFL + COVID
    WITHHOLDING: {
        STANDARD: 7.5,
        RENT: 8,
        PROFESSIONAL_SERVICES: 15,
        GOODS: 3,
    }
};

export const ACCOUNT_TYPES = [
    'ASSET',
    'LIABILITY',
    'EQUITY',
    'REVENUE',
    'EXPENSE'
] as const;

export const STANDARD_CHART_OF_ACCOUNTS = {
    ASSETS: {
        CURRENT_ASSETS: {
            CASH_AND_BANK: '1100',
            ACCOUNTS_RECEIVABLE: '1200',
            INVENTORY: '1300',
            PREPAID_EXPENSES: '1400'
        },
        FIXED_ASSETS: {
            LAND: '1510',
            BUILDINGS: '1520',
            EQUIPMENT: '1530',
            VEHICLES: '1540',
            ACCUMULATED_DEPRECIATION: '1590'
        }
    },
    LIABILITIES: {
        CURRENT_LIABILITIES: {
            ACCOUNTS_PAYABLE: '2100',
            VAT_PAYABLE: '2200',
            PAYROLL_LIABILITIES: '2300',
            SHORT_TERM_LOANS: '2400'
        },
        LONG_TERM_LIABILITIES: {
            LONG_TERM_LOANS: '2510',
            DEFERRED_TAX: '2520'
        }
    },
    EQUITY: {
        SHARE_CAPITAL: '3100',
        RETAINED_EARNINGS: '3200',
        CURRENT_YEAR_EARNINGS: '3300'
    },
    REVENUE: {
        SALES: '4100',
        SERVICE_REVENUE: '4200',
        OTHER_INCOME: '4900'
    },
    EXPENSES: {
        COST_OF_GOODS_SOLD: '5100',
        PAYROLL_EXPENSES: '5200',
        RENT_EXPENSE: '5300',
        UTILITIES: '5400',
        DEPRECIATION: '5500',
        GENERAL_AND_ADMIN: '5600'
    }
};

export const FINANCIAL_PERIODS = {
    FISCAL_YEAR_START: '01-01', // January 1st
    FISCAL_YEAR_END: '12-31',   // December 31st
    VAT_FILING_FREQUENCY: 'MONTHLY',
    CORPORATE_TAX_FILING: 'QUARTERLY'
};

export const DOCUMENT_PREFIXES = {
    INVOICE: 'INV',
    RECEIPT: 'RCP',
    PAYMENT_VOUCHER: 'PV',
    JOURNAL_ENTRY: 'JE',
    CREDIT_NOTE: 'CN',
    DEBIT_NOTE: 'DN'
};

export const BUSINESS_TYPES = [
    'SOLE_PROPRIETORSHIP',
    'PARTNERSHIP',
    'PRIVATE_LIMITED_COMPANY',
    'PUBLIC_LIMITED_COMPANY',
    'FOREIGN_COMPANY',
    'NGO'
] as const;

export const REGULATORY_BODIES = {
    GRA: 'Ghana Revenue Authority',
    RGD: 'Registrar General\'s Department',
    GSA: 'Ghana Standards Authority',
    SSNIT: 'Social Security and National Insurance Trust'
}; 