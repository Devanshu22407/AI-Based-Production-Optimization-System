from __future__ import annotations

from typing import Any, Dict

from ml.train_model import train_and_save_model


def train_model_service() -> Dict[str, Any]:
    return train_and_save_model()
