from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.db.crud import unit as unit_crud
from app.schemas.unit import UnitCreate, UnitUpdate, UnitPublic


router = APIRouter(prefix="/properties/{property_id}/units", tags=["Units"])


@router.post("/", response_model=UnitPublic, status_code=status.HTTP_201_CREATED)
def create_unit(property_id: int, unit_in: UnitCreate, db: Session = Depends(get_db)):
    # property_id from path is authoritative; override any provided property_id in body
    return unit_crud.create_unit(db=db, unit_in=unit_in, property_id=property_id)


@router.get("/", response_model=List[UnitPublic])
def read_units(property_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return unit_crud.get_units(db=db, property_id=property_id, skip=skip, limit=limit)


@router.get("/{unit_id}", response_model=UnitPublic)
def read_unit(property_id: int, unit_id: int, db: Session = Depends(get_db)):
    db_unit = unit_crud.get_unit(db=db, property_id=property_id, unit_id=unit_id)
    if not db_unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    return db_unit


@router.put("/{unit_id}", response_model=UnitPublic)
def update_unit(property_id: int, unit_id: int, unit_in: UnitUpdate, db: Session = Depends(get_db)):
    db_unit = unit_crud.update_unit(db=db, property_id=property_id, unit_id=unit_id, unit_in=unit_in)
    if not db_unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    return db_unit


@router.delete("/{unit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_unit(property_id: int, unit_id: int, db: Session = Depends(get_db)):
    db_unit = unit_crud.delete_unit(db=db, property_id=property_id, unit_id=unit_id)
    if not db_unit:
        raise HTTPException(status_code=404, detail="Unit not found")
    return None
