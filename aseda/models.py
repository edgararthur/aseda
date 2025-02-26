from datetime import datetime
from sqlalchemy import Column, DateTime, Float, String, Text, Enum, TIMESTAMP, ForeignKey, DECIMAL, Integer, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from sqlalchemy.orm import relationship, validates
from sqlalchemy.dialects.postgresql import ENUM
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(Enum('Admin', 'Accountant', 'BusinessOwner', 'Employee', name='role_enum'), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    businesses = relationship("Business", back_populates="owner")
    transactions = relationship("Transaction", back_populates="user")

class Business(Base):
    __tablename__ = "businesses"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    name = Column(String(150), nullable=False)
    tin = Column(String(20), unique=True, nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    address = Column(Text, nullable=False)
    business_type = Column(Enum('Sole Proprietor', 'Limited Liability', 'Partnership', name='business_type_enum'), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    owner = relationship("User", back_populates="businesses")
    transactions = relationship("Transaction", back_populates="business")
    tax_records = relationship("TaxRecord", back_populates="business")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    transaction_id = Column(String(150), unique=True, nullable=False)
    transaction_type = Column(String(150), nullable=False)
    amount = Column(DECIMAL(15, 2), nullable=False)
    description = Column(Text(), nullable=True)
    category = Column(String(100), nullable=False)
    transaction_date = Column(TIMESTAMP, server_default=func.now())
    status = Column(Enum('pending', 'completed', 'failed', name='transaction_status_enum'), nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    business_id = Column(UUID(as_uuid=True), ForeignKey('businesses.id'), nullable=False)

    user = relationship("User", back_populates="transactions")
    business = relationship("Business", back_populates="transactions")


# ============================
# Tax Models
# ============================

# TaxType Model
class TaxType(Base):
    __tablename__ = "tax_types"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    filings = relationship("TaxFiling", back_populates="tax_type")
    reports = relationship("TaxReport", back_populates="tax_type")

# TaxStatus Enum
class TaxStatusEnum(Enum):
    PENDING = "pending"
    FILED = "filed"
    OVERDUE = "overdue"

class TaxFiling(Base):
    __tablename__ = 'tax_filings'
    id = Column(Integer, primary_key=True)
    tax_type_id = Column(Integer, ForeignKey('tax_types.id'))
    period = Column(String)
    due_date = Column(DateTime)
    amount = Column(Float)
    status = Column(Enum(TaxStatusEnum.PENDING, TaxStatusEnum.FILED, TaxStatusEnum.OVERDUE), default=TaxStatusEnum.PENDING)
    reference = Column(String, nullable=True)
    filed_date = Column(DateTime, nullable=True)

    # Relationship with TaxType
    tax_type = relationship("TaxType", back_populates="filings")

    @validates("reference")
    def validate_reference(self, key, value):
        if not value:
            # Auto-generate reference based on tax type
            current_year = datetime.now().year
            current_month = datetime.now().month
            quarter = (current_month - 1) // 3 + 1  # Calculate the quarter of the year

            if self.tax_type.name == "VAT":
                self.reference = f"VAT-{current_year}-{str(current_month).zfill(2)}"
            elif self.tax_type.name == "Income Tax":
                self.reference = f"ITX-{current_year}-Q{quarter}"
            elif self.tax_type.name == "Withholding Tax":
                self.reference = f"WHT-{current_year}-{str(current_month).zfill(2)}"
            elif self.tax_type.name == "Property Tax":
                self.reference = f"PTX-{current_year}"
            elif self.tax_type.name == "Corporate Tax":
                self.reference = f"CTX-{current_year}"
            elif self.tax_type.name == "Excise Duty":
                self.reference = f"EDX-{current_year}"
        return value


# TaxReport Model
class TaxReport(Base):
    __tablename__ = "tax_reports"

    id = Column(Integer, primary_key=True, index=True)
    tax_type_id = Column(Integer, ForeignKey("tax_types.id"), nullable=False)
    total_tax_collected = Column(Float, nullable=False)
    total_tax_paid = Column(Float, nullable=False)
    period = Column(String, nullable=False)  # e.g., "Q1 2024"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship with TaxType
    tax_type = relationship("TaxType", back_populates="reports")


# TaxTransaction Model
class TaxTransaction(Base):
    __tablename__ = "tax_transactions"

    id = Column(Integer, primary_key=True, index=True)
    tax_filing_id = Column(Integer, ForeignKey("tax_filings.id"), nullable=False)
    transaction_id = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)  # Amount of tax paid
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship with TaxFiling
    tax_filing = relationship("TaxFiling", backref="transactions")


# Invoice Model
class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_date = Column(DateTime, default=datetime.utcnow)
    due_date = Column(DateTime, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String, nullable=False)  # "Paid" or "Unpaid"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    

# Ledger Account Model (General Ledger)
class LedgerAccount(Base):
    __tablename__ = "ledger_accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)  # e.g., "Cash", "Accounts Receivable"
    account_type = Column(Enum("Asset", "Liability", "Equity", "Revenue", "Expense", name="account_types"), nullable=False)
    balance = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    journal_entries = relationship("JournalEntry", back_populates="ledger_account")

# Journal Entry Model (Records Each Transaction)
class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id = Column(Integer, primary_key=True, index=True)
    ledger_account_id = Column(Integer, ForeignKey("ledger_accounts.id"))
    entry_date = Column(DateTime, default=datetime.utcnow)
    description = Column(String, nullable=True)  # e.g., "Purchase of Office Supplies"
    debit = Column(Float, nullable=False, default=0.0)
    credit = Column(Float, nullable=False, default=0.0)
    transaction_reference = Column(String, nullable=True)  # e.g., "INV-2024-001"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    ledger_account = relationship("LedgerAccount", back_populates="journal_entries")


# Trial Balance Model
class TrialBalance(Base):
    __tablename__ = "trial_balance"

    id = Column(Integer, primary_key=True, index=True)
    ledger_account_id = Column(Integer, ForeignKey("ledger_accounts.id"))
    total_debit = Column(Float, nullable=False, default=0.0)
    total_credit = Column(Float, nullable=False, default=0.0)
    balance = Column(Float, nullable=False, default=0.0)
    generated_at = Column(DateTime, default=datetime.utcnow)

    ledger_account = relationship("LedgerAccount")


# Function to update the trial balance (should be implemented in service logic)
def update_trial_balance(db_session):
    """
    This function will be used in the API service to update the trial balance.
    """
    accounts = db_session.query(LedgerAccount).all()
    
    for account in accounts:
        total_debit = db_session.query(JournalEntry).filter(
            JournalEntry.ledger_account_id == account.id
        ).sum(JournalEntry.debit)

        total_credit = db_session.query(JournalEntry).filter(
            JournalEntry.ledger_account_id == account.id
        ).sum(JournalEntry.credit)

        balance = total_debit - total_credit

        trial_balance_entry = db_session.query(TrialBalance).filter(
            TrialBalance.ledger_account_id == account.id
        ).first()

        if trial_balance_entry:
            trial_balance_entry.total_debit = total_debit
            trial_balance_entry.total_credit = total_credit
            trial_balance_entry.balance = balance
        else:
            new_entry = TrialBalance(
                ledger_account_id=account.id,
                total_debit=total_debit,
                total_credit=total_credit,
                balance=balance
            )
            db_session.add(new_entry)

    db_session.commit()



# ============================
# Product Models
# ============================
class Product(Base):
    __tablename__ = 'products'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(String(200), unique=True, nullable=False)
    product_name = Column(String(100), nullable=False)
    description = Column(Text(), nullable=True)
    unit_price = Column(DECIMAL(15, 2), nullable=False)
    stock_quantity = Column(Integer, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    invoice_items = relationship("InvoiceItem", back_populates="product")


# class Invoice(Base):
#     __tablename__ = 'invoices'
#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     invoice_id = Column(String(200), unique=True, nullable=False)
#     total_amount = Column(DECIMAL(15, 2), nullable=False)
#     tax_amount = Column(DECIMAL(15, 2), nullable=False)
#     status = Column(Enum('pending', 'paid', 'failed', 'overdue', name='invoice_status_enum'), nullable=False)
#     created_at = Column(TIMESTAMP, server_default=func.now())

#     invoice_items = relationship("InvoiceItem", back_populates="invoice")


class InvoiceItem(Base):
    __tablename__ = 'invoice_items'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    invoice_id = Column(UUID(as_uuid=True), ForeignKey('invoices.id'), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(DECIMAL(15, 2), nullable=False)
    total_price = Column(DECIMAL(15, 2), nullable=False)

    invoice = relationship("Invoice", back_populates="invoice_items")
    product = relationship("Product", back_populates="invoice_items")
