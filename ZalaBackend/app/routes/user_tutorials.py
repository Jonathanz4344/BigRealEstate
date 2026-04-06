from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user_tutorial import UserTutorialCreate, UserTutorialUpdate, UserTutorialPublic
from app.db.crud import user_tutorial as tutorial_crud

router = APIRouter(prefix="/user/{user_id}/tutorials", tags=["User Tutorials"])


@router.post("", response_model=UserTutorialPublic, status_code=status.HTTP_201_CREATED)
def create_tutorial_record(
        user_id: int,
        db: Session = Depends(get_db)
):
    existing = tutorial_crud.get_tutorial_by_user(db, user_id)
    if existing:
        raise HTTPException(status_code=400, detail="Tutorial record already exists for this user.")

    tutorial_in = UserTutorialCreate(user_id=user_id)
    return tutorial_crud.create_user_tutorial(db=db, tutorial=tutorial_in)


@router.get("", response_model=UserTutorialPublic)
def get_user_tutorial(user_id: int, db: Session = Depends(get_db)):
    tutorial = tutorial_crud.get_tutorial_by_user(db, user_id)
    if not tutorial:
        raise HTTPException(status_code=404, detail="Tutorial record not found.")
    return tutorial


@router.put("", response_model=UserTutorialPublic)
def update_user_tutorial(
        user_id: int,
        tutorial_update: UserTutorialUpdate,
        db: Session = Depends(get_db)
):
    updated_tutorial = tutorial_crud.update_tutorial(db, user_id, tutorial_update)
    if not updated_tutorial:
        raise HTTPException(status_code=404, detail="Tutorial record not found.")
    return updated_tutorial


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_tutorial(user_id: int, db: Session = Depends(get_db)):
    success = tutorial_crud.delete_tutorial(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tutorial record not found.")
    return None
