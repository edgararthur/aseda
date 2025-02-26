from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from models import TaxType
from schemas import TaxCreate, TaxResponse
from database import get_db


router = APIRouter()


# Route to create a tax entry
@router.post("/taxes", response_model=TaxResponse)
def create_tax_entry(tax_data: TaxCreate, db: Session = Depends(get_db)):
    tax_entry = TaxType(
        tax_type=tax_data.tax_type,
        period=tax_data.period,
        due_date=tax_data.due_date,
        amount=tax_data.amount,
        status=tax_data.status,
        reference=tax_data.reference,
        filed_date=tax_data.filed_date
    )
    db.add(tax_entry)
    db.commit()
    db.refresh(tax_entry)
    return tax_entry


# Route to retrieve all tax records
@router.get("/taxes", response_model=list[TaxResponse])
def get_all_taxes(db: Session = Depends(get_db)):
    taxes = db.query(TaxType).all()
    return taxes


# Route to update tax filing status
@router.put("/taxes/{tax_id}", response_model=TaxResponse)
def update_tax_status(tax_id: int, status: str, reference: Optional[str] = None, db: Session = Depends(get_db)):
    tax_entry = db.query(TaxType).filter(TaxType.id == tax_id).first()
    
    if not tax_entry:
        raise HTTPException(status_code=404, detail="Tax record not found")
    
    tax_entry.status = status
    if status.lower() == "filed":
        tax_entry.filed_date = datetime.utcnow()
        if reference:
            tax_entry.reference = reference

    db.commit()
    db.refresh(tax_entry)
    return tax_entry
