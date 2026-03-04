from __future__ import annotations

from typing import Any, Dict

from ml.train_model import predict_from_features


def predict_processing_time_service(payload: Dict[str, Any]) -> float:
    return predict_from_features(payload)
