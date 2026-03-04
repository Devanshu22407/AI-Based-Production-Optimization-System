from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

from ml.train_model import DATA_PATH, META_PATH, MODEL_PATH, train_and_save_model


def retrain_with_full_history(
    data_path: Path = DATA_PATH,
    model_path: Path = MODEL_PATH,
    meta_path: Path = META_PATH,
) -> Dict[str, Any]:
    return train_and_save_model(data_path=data_path, model_path=model_path, meta_path=meta_path)
