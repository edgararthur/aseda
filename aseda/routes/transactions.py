from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas import Transaction, TransactionCreate, TransactionUpdate
from controllers.transactions import create_transaction, get_transaction, get_transactions, update_transaction, delete_transaction

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/transactions/", response_model=Transaction, tags=["Transactions"])
def create_transaction_endpoint(transaction: TransactionCreate, db: Session = Depends(get_db)):
    return create_transaction(db=db, transaction=transaction)

@router.get("/transactions/{transaction_id}", response_model=Transaction, tags=["Transactions"])
def read_transaction(transaction_id: str, db: Session = Depends(get_db)):
    db_transaction = get_transaction(db, transaction_id=transaction_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return db_transaction

@router.get('/get-transactions/', response_model=list[Transaction], tags=["Transactions"])
def get_all_transactions(db: Session = Depends(get_db)):
    return get_transactions(db)  # Call the CRUD function to get all transactions

@router.get("/transactions/", response_model=list[Transaction], tags=["Transactions"])
def read_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_transactions(db, skip=skip, limit=limit)

@router.put("/transactions/{transaction_id}", response_model=Transaction, tags=["Transactions"])
def update_transaction_endpoint(transaction_id: str, transaction: TransactionUpdate, db: Session = Depends(get_db)):
    db_transaction = update_transaction(db, transaction_id=transaction_id, transaction=transaction)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return db_transaction

@router.delete("/transactions/{transaction_id}", response_model=Transaction, tags=["Transactions"])
def delete_transaction_endpoint(transaction_id: str, db: Session = Depends(get_db)):
    db_transaction = delete_transaction(db, transaction_id=transaction_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return db_transaction