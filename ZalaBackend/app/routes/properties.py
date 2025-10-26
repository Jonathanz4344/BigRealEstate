from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.db.crud import property as property_crud
from app.schemas.property import PropertyCreate, PropertyUpdate, PropertyPublic

router = APIRouter(prefix="/addresses/{address_id}/properties", tags=["Properties"])


@router.post("/", response_model=PropertyPublic, status_code=status.HTTP_201_CREATED)
def create_property(address_id: int, property_in: PropertyCreate, db: Session = Depends(get_db)):
    return property_crud.create_property(db=db, property_in=property_in, address_id=address_id)


@router.get("/", response_model=List[PropertyPublic])
def read_properties(address_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return property_crud.get_properties(db=db, address_id=address_id, skip=skip, limit=limit)


@router.get("/{property_id}", response_model=PropertyPublic)
def read_property(address_id: int, property_id: int, db: Session = Depends(get_db)):
    db_property = property_crud.get_property(db=db, address_id=address_id, property_id=property_id)
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
    return db_property


@router.put("/{property_id}", response_model=PropertyPublic)
def update_property(address_id: int, property_id: int, property_in: PropertyUpdate, db: Session = Depends(get_db)):
    db_property = property_crud.update_property(db=db, address_id=address_id, property_id=property_id, property_in=property_in)
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
    return db_property


@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_property(address_id: int, property_id: int, db: Session = Depends(get_db)):
    db_property = property_crud.delete_property(db=db, address_id=address_id, property_id=property_id)
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
    return None
