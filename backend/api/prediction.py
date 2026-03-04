from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ml.train_model import predict_from_features


router = APIRouter(tags=["prediction"])


class PredictionPayload(BaseModel):
    Machine_ID: str
    Workers_Assigned: int = Field(ge=1)
    Batch_Size: int = Field(gt=0)
    Raw_Material_Quantity: float = Field(gt=0)
    Production_Priority: str
    Machine_Load: float = Field(ge=0.0, le=1.0)
    Quality_Check_Level: str
    Shift: str
    Temperature_Control: str


@router.post("/predict")
def predict_processing_time(payload: PredictionPayload):
    try:
        prediction = predict_from_features(payload.model_dump())
        return {
            "predicted_processing_time_minutes": prediction,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc
