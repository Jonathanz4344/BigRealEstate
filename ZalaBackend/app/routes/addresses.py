from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.db.crud import address as address_crud
from app.schemas.address import AddressCreate, AddressPublic

router = APIRouter(prefix="/addresses", tags=["Addresses"])

@router.post("/", response_model=AddressPublic)
def create_address(address_in: AddressCreate, db: Session = Depends(get_db)):
    return address_crud.create_address(db=db, address_in=address_in)

@router.get("/", response_model=List[AddressPublic])
def read_addresses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return address_crud.get_addresses(db=db, skip=skip, limit=limit)

@router.get("/{address_id}", response_model=AddressPublic)
def read_address(address_id: int, db: Session = Depends(get_db)):
    db_address = address_crud.get_address(db=db, address_id=address_id)
    if not db_address:
        raise HTTPException(status_code=404, detail="Address not found")
    return db_address

@router.put("/{address_id}", response_model=AddressPublic)
def update_address(address_id: int, address_in: AddressCreate, db: Session = Depends(get_db)):
    db_address = address_crud.update_address(db=db, address_id=address_id, address_in=address_in)
    if not db_address:
        raise HTTPException(status_code=404, detail="Address not found")
    return db_address

@router.delete("/{address_id}", response_model=AddressPublic)
def delete_address(address_id: int, db: Session = Depends(get_db)):
    db_address = address_crud.delete_address(db=db, address_id=address_id)
    if not db_address:
        raise HTTPException(status_code=404, detail="Address not found")
    return db_address