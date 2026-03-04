from __future__ import annotations

from fastapi import APIRouter, HTTPException

from ml.retrain_model import retrain_with_full_history


router = APIRouter(tags=["training"])


@router.post("/retrain-model")
def retrain_model():
    try:
        result = retrain_with_full_history()
        return {
            "message": "Model retrained successfully using full historical dataset",
            "result": result,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Retraining failed: {exc}") from exc
