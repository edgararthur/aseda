from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, datetime
from enum import Enum

# User Schemas
class UserBase(BaseModel):
    name: str
    email: str
    role: str

    model_config = ConfigDict(arbitrary_types_allowed=True)

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)  # Replaces `orm_mode` in Pydantic V2

# ============================
# Transactions
# ============================
class TransactionTypeEnum(str, Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    TRANSFER = "transfer"

class TransactionBase(BaseModel):
    business_id: str
    transaction_type: TransactionTypeEnum
    amount: float
    description: str
    category: str
    transaction_date: date
    status: str

    model_config = ConfigDict(arbitrary_types_allowed=True)

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Customer(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    address: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Payment(BaseModel):
    id: int
    invoice_id: int
    amount_paid: float
    payment_method: str  # e.g. "bank_transfer", "mobile_money"
    transaction_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class BillItem(BaseModel):
    id: int
    bill_id: int
    product_id: int
    quantity: float
    unit_price: float
    total_price: float
    tax_amount: float
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class Bill(BaseModel):
    id: int
    vendor_id: int
    bill_number: str
    total_amount: float
    due_date: datetime
    status: str  # e.g. "unpaid", "paid", "overdue"
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class Invoice(BaseModel):
    id: int
    invoice_date: datetime
    due_date: datetime
    total_amount: float
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

# ============================
# Tax Schemas
# ============================
class TaxType(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode: True
        

class TaxStatusEnum(str, Enum):
    PENDING = "pending"
    FILED = "filed"
    OVERDUE = "overdue"


class TaxFiling(BaseModel):
    id: int
    tax_type_id: int
    period: str
    due_date: datetime
    amount: float
    status: TaxStatusEnum
    reference: Optional[str] = None
    filed_date: Optional[datetime] = None

    class Config:
        orm_mode = True


class TaxReport(BaseModel):
    id: int
    tax_type_id: int
    total_tax_collected: float
    total_tax_paid: float
    period: str  # e.g., "Q1 2024"
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class TaxTransaction(BaseModel):
    id: int
    tax_filing_id: int  # Link to the tax filing record
    transaction_id: int
    amount: float  # Amount of tax paid
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class TaxCreate(TaxFiling):
    pass

class TaxResponse(TaxFiling):
    id: int

    class Config:
        from_attributes = True


# ============================
# BankSheet Schemas
# ============================
class BalanceSheetReport(BaseModel):
    id: int
    total_assets: float
    total_liabilities: float
    total_equity: float
    period: str  # e.g., "March 2024"
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class IncomeStatementReport(BaseModel):
    id: int
    total_revenue: float
    total_expenses: float
    net_income: float
    period: str  # e.g., "Q1 2024"
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


class CashFlowReport(BaseModel):
    id: int
    operating_activities: float
    investing_activities: float
    financing_activities: float
    net_cash_flow: float
    period: str  # e.g., "Q1 2024"
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# Ledger Account Schema
class LedgerAccountBase(BaseModel):
    name: str
    account_type: str


class LedgerAccountCreate(LedgerAccountBase):
    balance: float


class LedgerAccountResponse(LedgerAccountBase):
    id: int
    balance: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Journal Entry Schema
class JournalEntryBase(BaseModel):
    ledger_account_id: int
    entry_date: Optional[datetime]
    description: Optional[str]
    debit: float
    credit: float
    transaction_reference: Optional[str]


class JournalEntryCreate(JournalEntryBase):
    pass


class JournalEntryResponse(JournalEntryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Trial Balance Schema
class TrialBalanceBase(BaseModel):
    ledger_account_id: int
    total_debit: float
    total_credit: float
    balance: float


class TrialBalanceResponse(TrialBalanceBase):
    id: int
    generated_at: datetime

    class Config:
        from_attributes = True


# Balance Sheet Schema
class BalanceSheetBase(BaseModel):
    assets: float
    liabilities: float
    equity: float


class BalanceSheetResponse(BalanceSheetBase):
    id: int
    generated_at: datetime

    class Config:
        from_attributes = True


# Profit & Loss Statement (Income Statement) Schema
class ProfitLossBase(BaseModel):
    revenue: float
    expenses: float
    net_profit: float


class ProfitLossResponse(ProfitLossBase):
    id: int
    generated_at: datetime

    class Config:
        from_attributes = True

