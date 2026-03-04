from __future__ import annotations

from pathlib import Path

import pandas as pd
from fastapi import APIRouter, File, HTTPException, UploadFile

from ml.train_model import DATA_PATH, train_and_save_model
from services.data_validation_service import validate_dataset_quality
from services.preprocessing import validate_dataset_columns


router = APIRouter(tags=["dataset"])


@router.post("/validate-dataset")
async def validate_dataset(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    try:
        content = await file.read()
        temp_path = Path(DATA_PATH.parent) / "validation_dataset_tmp.csv"
        temp_path.write_bytes(content)
        df = pd.read_csv(temp_path)
        temp_path.unlink(missing_ok=True)
        return validate_dataset_quality(df)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to validate dataset: {exc}") from exc


@router.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    try:
        content = await file.read()
        temporary_path = Path(DATA_PATH.parent) / "uploaded_dataset_tmp.csv"
        temporary_path.write_bytes(content)
        df = pd.read_csv(temporary_path)
        validation_result = validate_dataset_quality(df)
        if validation_result["status"] == "invalid":
            temporary_path.unlink(missing_ok=True)
            raise ValueError(f"Dataset validation failed: {validation_result['warnings']}")
        validate_dataset_columns(df)

        DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(DATA_PATH, index=False)
        temporary_path.unlink(missing_ok=True)

        training_result = train_and_save_model()
        return {
            "message": "Dataset uploaded and model trained successfully",
            "rows": int(len(df)),
            "training_result": training_result,
        }
    except ValueError as validation_error:
        raise HTTPException(status_code=400, detail=str(validation_error)) from validation_error
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to upload dataset: {exc}") from exc
