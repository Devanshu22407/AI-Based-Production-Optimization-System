from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List


BASE_DIR = Path(__file__).resolve().parents[1]
HISTORY_PATH = BASE_DIR / "data" / "model_training_history.json"


def load_training_history(history_path: Path = HISTORY_PATH) -> List[Dict[str, Any]]:
    if not history_path.exists():
        return []
    try:
        with history_path.open("r", encoding="utf-8") as history_file:
            data = json.load(history_file)
        if isinstance(data, list):
            return data
        return []
    except Exception:
        return []


def append_training_history(
    dataset_rows: int,
    model_selected: str,
    rmse: float,
    mae: float,
    r2: float,
    history_path: Path = HISTORY_PATH,
) -> Dict[str, Any]:
    history_path.parent.mkdir(parents=True, exist_ok=True)
    history = load_training_history(history_path)
    record = {
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "dataset_rows": int(dataset_rows),
        "model_selected": model_selected,
        "rmse": round(float(rmse), 4),
        "mae": round(float(mae), 4),
        "r2": round(float(r2), 4),
    }
    history.append(record)
    with history_path.open("w", encoding="utf-8") as history_file:
        json.dump(history, history_file, indent=2)
    return record
