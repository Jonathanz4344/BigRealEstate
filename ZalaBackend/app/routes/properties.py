from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.db.crud import property as property_crud
from app.schemas.property import PropertyCreate, PropertyUpdate, PropertyPublic
from app import schemas

router = APIRouter(prefix="/addresses/{address_id}/properties", tags=["Properties"])

# Public properties router for non-address-scoped endpoints
properties_public = APIRouter(prefix="/properties", tags=["Properties"]) 


@router.post("", response_model=PropertyPublic, status_code=status.HTTP_201_CREATED)
def create_property(
    address_id: int,
    property_in: PropertyCreate,
    creator_id: int = None,
    db: Session = Depends(get_db),
):
    """Create a property. If `creator_id` is provided (server-derived), the creator will be associated with the property."""
    return property_crud.create_property(db=db, property_in=property_in, address_id=address_id, creator_id=creator_id)


@router.get("", response_model=List[PropertyPublic])
def read_properties(address_id: int, skip: int = 0, limit: int = 100, created_by: int = None, db: Session = Depends(get_db)):
    """List properties for an address. Optional `created_by` filters properties associated with that user."""
    return property_crud.get_properties(db=db, address_id=address_id, skip=skip, limit=limit, creator_id=created_by)


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


@router.get(
    "/{property_id}/images",
    response_model=List[schemas.PropertyImagePublic],
    summary="List images for a property",
)
def list_property_images(address_id: int, property_id: int, db: Session = Depends(get_db)):
    db_property = property_crud.get_property(db=db, address_id=address_id, property_id=property_id)
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
    return property_crud.list_property_images(db=db, property_id=property_id)


@router.post(
    "/{property_id}/images",
    response_model=schemas.PropertyImagePublic,
    status_code=status.HTTP_201_CREATED,
)
async def upload_property_gallery_image(
    address_id: int,
    property_id: int,
    file: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    sort_order: Optional[int] = Form(None),
    db: Session = Depends(get_db),
):
    image = property_crud.add_property_image(
        db=db,
        address_id=address_id,
        property_id=property_id,
        upload=file,
        caption=caption,
        sort_order=sort_order,
    )
    await file.close()
    if not image:
        raise HTTPException(status_code=404, detail="Property not found")
    return image


@router.delete(
    "/{property_id}/images/{image_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_property_gallery_image(address_id: int, property_id: int, image_id: int, db: Session = Depends(get_db)):
    deleted = property_crud.delete_property_image(
        db=db,
        address_id=address_id,
        property_id=property_id,
        image_id=image_id,
    )
    if not deleted:
        raise HTTPException(status_code=404, detail="Property or image not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{property_id}/image", response_model=PropertyPublic)
async def upload_property_image(
    address_id: int,
    property_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    db_property = property_crud.attach_property_image(db=db, address_id=address_id, property_id=property_id, upload=file)
    await file.close()
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
    return db_property


@router.delete("/{property_id}/image", response_model=PropertyPublic)
def remove_property_image(address_id: int, property_id: int, db: Session = Depends(get_db)):
    db_property = property_crud.remove_property_image(db=db, address_id=address_id, property_id=property_id)
    if not db_property:
        raise HTTPException(status_code=404, detail="Property not found")
    return db_property


@properties_public.get("", response_model=List[PropertyPublic], summary="List properties (optionally filter by creator)")
def list_properties(created_by: int = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all properties. If `created_by` is provided, return properties linked to that user."""
    # No creator filter: return empty list to avoid returning huge dataset without address scope
    return property_crud.get_properties_no_scope(db=db, skip=skip, limit=limit, creator_id=created_by)
