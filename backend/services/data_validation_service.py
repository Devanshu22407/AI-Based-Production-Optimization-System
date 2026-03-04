from __future__ import annotations

from typing import Any, Dict, List

import pandas as pd

from services.preprocessing import ALL_REQUIRED_COLUMNS


VALID_PRIORITIES = {"Low", "Medium", "High"}


def validate_dataset_quality(df: pd.DataFrame) -> Dict[str, Any]:
    warnings: List[str] = []
    missing_columns = [column for column in ALL_REQUIRED_COLUMNS if column not in df.columns]
    if missing_columns:
        return {
            "status": "invalid",
            "rows": int(len(df)),
            "warnings": [f"Missing required columns: {missing_columns}"],
        }

    numeric_columns = ["Workers_Assigned", "Raw_Material_Quantity", "Batch_Size", "Machine_Load", "Processing_Time"]
    for column in numeric_columns:
        if not pd.api.types.is_numeric_dtype(df[column]):
            converted = pd.to_numeric(df[column], errors="coerce")
            if converted.isna().sum() > 0:
                warnings.append(f"Column {column} contains non-numeric values")

    if (pd.to_numeric(df["Processing_Time"], errors="coerce") < 0).any():
        warnings.append("Processing_Time contains negative values")

    invalid_priority_rows = ~df["Production_Priority"].isin(VALID_PRIORITIES)
    if invalid_priority_rows.any():
        warnings.append("Production_Priority contains invalid values")

    missing_machine_rows = df["Machine_ID"].isna() | (df["Machine_ID"].astype(str).str.strip() == "")
    if missing_machine_rows.any():
        warnings.append("Machine_ID has missing values")

    return {
        "status": "valid" if not warnings else "invalid",
        "rows": int(len(df)),
        "warnings": warnings,
    }
