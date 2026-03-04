from __future__ import annotations

from typing import Tuple

import pandas as pd


TARGET_COLUMN = "Processing_Time"

FEATURE_COLUMNS = [
    "Machine_ID",
    "Workers_Assigned",
    "Batch_Size",
    "Raw_Material_Quantity",
    "Production_Priority",
    "Machine_Load",
    "Quality_Check_Level",
    "Shift",
    "Temperature_Control",
]

ALL_REQUIRED_COLUMNS = [
    "Batch_ID",
    "Product_Type",
    "Production_Line",
    *FEATURE_COLUMNS,
    TARGET_COLUMN,
]


def validate_dataset_columns(df: pd.DataFrame) -> None:
    missing_columns = [column for column in ALL_REQUIRED_COLUMNS if column not in df.columns]
    if missing_columns:
        raise ValueError(f"Dataset missing required columns: {missing_columns}")


def split_features_target(df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    validate_dataset_columns(df)
    x_data = df[FEATURE_COLUMNS].copy()
    y_data = df[TARGET_COLUMN].copy()
    return x_data, y_data


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    cleaned = df.copy()
    cleaned = cleaned.dropna(subset=[TARGET_COLUMN])
    cleaned["Workers_Assigned"] = pd.to_numeric(cleaned["Workers_Assigned"], errors="coerce")
    cleaned["Batch_Size"] = pd.to_numeric(cleaned["Batch_Size"], errors="coerce")
    cleaned["Raw_Material_Quantity"] = pd.to_numeric(cleaned["Raw_Material_Quantity"], errors="coerce")
    cleaned["Machine_Load"] = pd.to_numeric(cleaned["Machine_Load"], errors="coerce")
    cleaned[TARGET_COLUMN] = pd.to_numeric(cleaned[TARGET_COLUMN], errors="coerce")
    cleaned = cleaned.dropna(subset=FEATURE_COLUMNS + [TARGET_COLUMN])
    return cleaned.reset_index(drop=True)
