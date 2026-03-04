from __future__ import annotations

from collections import defaultdict
from typing import Any, Dict, List

import numpy as np
import pandas as pd
from sklearn.inspection import permutation_importance

from ml.train_model import DATA_PATH, load_model
from services.preprocessing import split_features_target


def _normalize_feature_name(feature_name: str) -> str:
    if "__" in feature_name:
        base = feature_name.split("__", 1)[1]
    else:
        base = feature_name

    onehot_prefixes = [
        "Machine_ID_",
        "Production_Priority_",
        "Quality_Check_Level_",
        "Shift_",
        "Temperature_Control_",
    ]
    for prefix in onehot_prefixes:
        if base.startswith(prefix):
            return prefix[:-1]
    return base


def _group_importance(feature_names: np.ndarray, importances: np.ndarray) -> Dict[str, float]:
    grouped = defaultdict(float)
    mapping = {
        "Machine_ID": "Machine_ID",
        "Production_Priority": "Production_Priority",
        "Quality_Check_Level": "Quality_Check_Level",
        "Shift": "Shift",
        "Temperature_Control": "Temperature_Control",
        "Workers_Assigned": "Workers_Assigned",
        "Batch_Size": "Batch_Size",
        "Raw_Material_Quantity": "Raw_Material_Quantity",
        "Machine_Load": "Machine_Load",
    }

    for name, importance in zip(feature_names, importances):
        normalized = _normalize_feature_name(str(name))
        key = normalized
        for raw_name in mapping:
            if normalized.startswith(raw_name):
                key = mapping[raw_name]
                break
        grouped[key] += float(max(0.0, importance))
    return grouped


def get_feature_importance(top_n: int = 10) -> Dict[str, List[Dict[str, Any]]]:
    model_artifact = load_model()
    pipeline = model_artifact["pipeline"]
    selected_model = model_artifact.get("model_name", "random_forest")

    df = pd.read_csv(DATA_PATH)
    x_data, y_data = split_features_target(df)
    sample_size = min(1500, len(x_data))
    x_sample = x_data.tail(sample_size)
    y_sample = y_data.tail(sample_size)

    preprocessor = pipeline.named_steps["preprocessor"]
    model = pipeline.named_steps["model"]
    transformed = preprocessor.transform(x_sample)
    feature_names = preprocessor.get_feature_names_out()

    if selected_model == "random_forest" and hasattr(model, "feature_importances_"):
        importances = model.feature_importances_
    else:
        permutation_result = permutation_importance(
            model,
            transformed,
            y_sample,
            n_repeats=5,
            random_state=42,
            scoring="neg_root_mean_squared_error",
        )
        importances = permutation_result.importances_mean

    grouped_importance = _group_importance(feature_names, importances)
    total = sum(grouped_importance.values()) or 1.0
    ranked = sorted(grouped_importance.items(), key=lambda item: item[1], reverse=True)[:top_n]

    return {
        "feature_importance": [
            {
                "feature": feature,
                "importance": round(value / total, 4),
            }
            for feature, value in ranked
        ]
    }
