from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

from services.feature_engineering import build_preprocessor
from services.dataset_service import append_dataset_record, load_dataset
from services.mongodb_service import append_model_run, get_model_meta, load_dataset_records, set_model_meta
from services.preprocessing import clean_dataframe, split_features_target
from services.synthetic_data_generator import save_synthetic_dataset
from services.training_history_service import append_training_history


BASE_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = BASE_DIR / "data" / "production_data.csv"
MODEL_PATH = BASE_DIR / "models" / "model.pkl"
META_PATH = BASE_DIR / "models" / "model_meta.json"
_MODEL_CACHE: Dict[str, Any] = {"mtime": None, "artifact": None}


def _calculate_metrics(y_true: pd.Series, y_pred: np.ndarray) -> Dict[str, float]:
    mse_value = mean_squared_error(y_true, y_pred)
    return {
        "mae": round(float(mean_absolute_error(y_true, y_pred)), 4),
        "rmse": round(float(np.sqrt(mse_value)), 4),
        "r2": round(float(r2_score(y_true, y_pred)), 4),
    }


def _build_candidate_pipelines(random_state: int = 42) -> Dict[str, Pipeline]:
    preprocessor = build_preprocessor()
    return {
        "random_forest": Pipeline(
            [
                ("preprocessor", preprocessor),
                (
                    "model",
                    RandomForestRegressor(
                        n_estimators=220,
                        max_depth=16,
                        min_samples_split=4,
                        random_state=random_state,
                        n_jobs=-1,
                    ),
                ),
            ]
        ),
        "gradient_boosting": Pipeline(
            [
                ("preprocessor", build_preprocessor()),
                (
                    "model",
                    GradientBoostingRegressor(
                        n_estimators=250,
                        learning_rate=0.05,
                        max_depth=3,
                        random_state=random_state,
                    ),
                ),
            ]
        ),
    }


def ensure_dataset_exists(data_path: Path = DATA_PATH) -> Path:
    if load_dataset_records(limit=1):
        return data_path
    if not data_path.exists():
        save_synthetic_dataset(data_path, rows=5000)
    return data_path


def _load_dataframe(data_path: Path = DATA_PATH) -> pd.DataFrame:
    ensure_dataset_exists(data_path)
    df = load_dataset()
    return clean_dataframe(df)


def _persist_meta(meta_path: Path, pending_new_records: int = 0) -> None:
    meta_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {"pending_new_records": pending_new_records}
    with meta_path.open("w", encoding="utf-8") as meta_file:
        json.dump(payload, meta_file, indent=2)
    set_model_meta(payload)


def _read_meta(meta_path: Path) -> Dict[str, Any]:
    mongo_meta = get_model_meta()
    if mongo_meta:
        return mongo_meta

    if not meta_path.exists():
        return {"pending_new_records": 0}
    with meta_path.open("r", encoding="utf-8") as meta_file:
        return json.load(meta_file)


def train_and_save_model(
    data_path: Path = DATA_PATH,
    model_path: Path = MODEL_PATH,
    meta_path: Path = META_PATH,
) -> Dict[str, Any]:
    df = _load_dataframe(data_path)
    x_data, y_data = split_features_target(df)

    x_train, x_test, y_train, y_test = train_test_split(
        x_data,
        y_data,
        test_size=0.2,
        random_state=42,
    )

    candidates = _build_candidate_pipelines()
    scores: Dict[str, Dict[str, float]] = {}
    fitted_models: Dict[str, Pipeline] = {}

    for model_name, pipeline in candidates.items():
        pipeline.fit(x_train, y_train)
        predictions = pipeline.predict(x_test)
        scores[model_name] = _calculate_metrics(y_test, predictions)
        fitted_models[model_name] = pipeline

    best_model_name = min(scores.keys(), key=lambda model: scores[model]["rmse"])
    model_artifact = {
        "model_name": best_model_name,
        "pipeline": fitted_models[best_model_name],
        "comparison_metrics": scores,
        "trained_rows": int(len(df)),
    }

    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model_artifact, model_path)
    _persist_meta(meta_path, pending_new_records=0)

    selected_metrics = scores[best_model_name]
    append_training_history(
        dataset_rows=int(len(df)),
        model_selected=best_model_name,
        rmse=selected_metrics["rmse"],
        mae=selected_metrics["mae"],
        r2=selected_metrics["r2"],
    )
    append_model_run(
        {
            "selected_model": best_model_name,
            "metrics": scores,
            "trained_rows": int(len(df)),
            "model_path": str(model_path),
        }
    )

    return {
        "selected_model": best_model_name,
        "metrics": scores,
        "trained_rows": int(len(df)),
        "model_path": str(model_path),
    }


def load_model(model_path: Path = MODEL_PATH) -> Dict[str, Any]:
    if not model_path.exists():
        train_and_save_model()
    model_mtime = model_path.stat().st_mtime
    if _MODEL_CACHE["artifact"] is not None and _MODEL_CACHE["mtime"] == model_mtime:
        return _MODEL_CACHE["artifact"]

    artifact = joblib.load(model_path)
    _MODEL_CACHE["mtime"] = model_mtime
    _MODEL_CACHE["artifact"] = artifact
    return artifact


def get_model_status(
    model_path: Path = MODEL_PATH,
    meta_path: Path = META_PATH,
) -> Dict[str, Any]:
    model_artifact = load_model(model_path)
    selected_model = model_artifact.get("model_name", "unknown")
    comparison_metrics = model_artifact.get("comparison_metrics", {})
    selected_metrics = comparison_metrics.get(selected_model, {})
    meta = _read_meta(meta_path)

    return {
        "selected_model": selected_model,
        "selected_metrics": selected_metrics,
        "comparison_metrics": comparison_metrics,
        "trained_rows": int(model_artifact.get("trained_rows", 0)),
        "pending_new_records": int(meta.get("pending_new_records", 0)),
    }


def predict_from_features(input_payload: Dict[str, Any], model_path: Path = MODEL_PATH) -> float:
    model_artifact = load_model(model_path)
    pipeline: Pipeline = model_artifact["pipeline"]
    input_frame = pd.DataFrame([input_payload])
    prediction = pipeline.predict(input_frame)[0]
    return round(float(prediction), 2)


def append_batch_record(
    batch_record: Dict[str, Any],
    data_path: Path = DATA_PATH,
    meta_path: Path = META_PATH,
    auto_retrain_threshold: int = 20,
) -> Tuple[bool, int]:
    ensure_dataset_exists(data_path)
    append_dataset_record(batch_record)

    meta = _read_meta(meta_path)
    pending_new_records = int(meta.get("pending_new_records", 0)) + 1
    should_retrain = pending_new_records >= auto_retrain_threshold

    if should_retrain:
        train_and_save_model(data_path=data_path, model_path=MODEL_PATH, meta_path=meta_path)
        pending_new_records = 0
    else:
        _persist_meta(meta_path, pending_new_records=pending_new_records)

    return should_retrain, pending_new_records
