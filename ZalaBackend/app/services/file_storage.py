from __future__ import annotations

import os
import shutil
from pathlib import Path
from typing import Optional
from uuid import uuid4

import boto3
from botocore.exceptions import ClientError
from fastapi import HTTPException, UploadFile, status

BASE_DIR = Path(__file__).resolve().parent.parent
_DEFAULT_UPLOAD_ROOT = os.getenv("ZALA_UPLOAD_ROOT")
UPLOAD_ROOT = Path(_DEFAULT_UPLOAD_ROOT) if _DEFAULT_UPLOAD_ROOT else BASE_DIR.parent / "uploads"

S3_BUCKET = os.getenv("S3_UPLOADS_BUCKET")
S3_REGION = os.getenv("S3_UPLOADS_REGION", "us-east-1")

_s3_client = None


def _get_s3():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client("s3", region_name=S3_REGION)
    return _s3_client


_ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"}
_CONTENT_TYPE_FALLBACK = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/bmp": ".bmp",
}


def get_upload_root() -> Path:
    """Ensure the upload directory exists and return it."""
    UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
    return UPLOAD_ROOT


def _safe_category(category: str) -> str:
    name = Path(category).name
    if name != category:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid upload category")
    return name


def _determine_extension(upload: UploadFile) -> str:
    original = Path(upload.filename or "").suffix.lower()
    if original in _ALLOWED_EXTENSIONS:
        return original
    if upload.content_type in _CONTENT_TYPE_FALLBACK:
        return _CONTENT_TYPE_FALLBACK[upload.content_type]
    return ".jpg"


def save_upload_file(upload: UploadFile, category: str) -> str:
    """Persist an uploaded image and return its public URL path."""
    if not upload.content_type or not upload.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, detail="Only image uploads allowed")

    safe_category = _safe_category(category)
    extension = _determine_extension(upload)
    filename = f"{uuid4().hex}{extension}"

    upload.file.seek(0)

    # Use S3 if configured, otherwise fall back to local filesystem
    if S3_BUCKET:
        s3_key = f"{safe_category}/{filename}"
        _get_s3().upload_fileobj(
            upload.file,
            S3_BUCKET,
            s3_key,
            ExtraArgs={"ContentType": upload.content_type},
        )
        return f"https://{S3_BUCKET}.s3.amazonaws.com/{s3_key}"

    folder = get_upload_root() / safe_category
    folder.mkdir(parents=True, exist_ok=True)

    destination = folder / filename
    with destination.open("wb") as buffer:
        shutil.copyfileobj(upload.file, buffer)

    return f"/uploads/{safe_category}/{filename}"


def remove_upload(public_path: Optional[str]) -> None:
    """Remove an uploaded file if it exists."""
    if not public_path:
        return

    # S3 path: extract key from full URL
    if S3_BUCKET and S3_BUCKET in (public_path or ""):
        prefix = f"https://{S3_BUCKET}.s3.amazonaws.com/"
        if public_path.startswith(prefix):
            s3_key = public_path[len(prefix):]
            try:
                _get_s3().delete_object(Bucket=S3_BUCKET, Key=s3_key)
            except ClientError:
                pass
            return

    # Local filesystem path
    marker = "/uploads/"
    relative_part: Optional[str] = None

    if public_path.startswith("http://") or public_path.startswith("https://") or public_path.startswith("//"):
        if marker in public_path:
            relative_part = public_path.split(marker, 1)[1]
    elif public_path.startswith("/uploads/"):
        relative_part = public_path[len(marker):]
    else:
        relative_part = public_path.lstrip("/")
        if relative_part.startswith("uploads/"):
            relative_part = relative_part[len("uploads/"):]

    if not relative_part:
        return

    target = get_upload_root() / relative_part
    try:
        if target.is_file():
            target.unlink()
    except OSError:
        pass