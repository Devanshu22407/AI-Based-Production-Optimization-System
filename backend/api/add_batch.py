from __future__ import annotations

import uuid
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ml.train_model import append_batch_record, predict_from_features


router = APIRouter(tags=["batches"])


class BatchPayload(BaseModel):
    Product_Type: str = "Oncology_Drug_A"
    Production_Line: str = "Line_1"
    Machine_ID: str
    Workers_Assigned: int = Field(ge=1)
    Raw_Material_Quantity: float = Field(gt=0)
    Batch_Size: int = Field(gt=0)
    Production_Priority: str
    Quality_Check_Level: str
    Machine_Load: float = Field(ge=0.0, le=1.0)
    Temperature_Control: str
    Shift: str
    Processing_Time: Optional[float] = Field(default=None, gt=0)


@router.post("/add-batch")
def add_batch(payload: BatchPayload):
    try:
        batch_id = f"B{str(uuid.uuid4().int)[:6]}"
        payload_dict = payload.model_dump()

        prediction_features = {
            "Machine_ID": payload_dict["Machine_ID"],
            "Workers_Assigned": payload_dict["Workers_Assigned"],
            "Batch_Size": payload_dict["Batch_Size"],
            "Raw_Material_Quantity": payload_dict["Raw_Material_Quantity"],
            "Production_Priority": payload_dict["Production_Priority"],
            "Machine_Load": payload_dict["Machine_Load"],
            "Quality_Check_Level": payload_dict["Quality_Check_Level"],
            "Shift": payload_dict["Shift"],
            "Temperature_Control": payload_dict["Temperature_Control"],
        }
        predicted_time = predict_from_features(prediction_features)

        full_record = {
            "Batch_ID": batch_id,
            **payload_dict,
            "Processing_Time": payload_dict["Processing_Time"] or predicted_time,
        }

        auto_retrained, pending_records = append_batch_record(full_record)
        return {
            "message": "Batch added successfully",
            "batch_id": batch_id,
            "predicted_processing_time": predicted_time,
            "auto_retrained": auto_retrained,
            "pending_records_for_auto_retrain": pending_records,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to add batch: {exc}") from exc
