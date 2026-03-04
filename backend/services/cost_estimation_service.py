from __future__ import annotations

from typing import Any, Dict, List

import pandas as pd

from ml.train_model import DATA_PATH


WAGE_RATE_COLUMNS = ["Wage_Rate", "Worker_Wage_Rate_INR_per_Min"]
RAW_MATERIAL_COST_COLUMNS = ["Raw_Material_Cost", "Raw_Material_Cost_INR"]
MACHINE_USAGE_RATE_COLUMNS = ["Machine_Usage_Cost", "Machine_Usage_Rate_INR_per_Min"]
BATCH_COST_COLUMNS = ["Batch_Cost", "Batch_Cost_INR"]


def _pick_existing_column(df: pd.DataFrame, candidates: List[str]) -> str | None:
    for column in candidates:
        if column in df.columns:
            return column
    return None


def get_production_cost_estimation(limit: int = 120) -> Dict[str, Any]:
    df = pd.read_csv(DATA_PATH)
    if df.empty:
        return {
            "batch_cost_estimates": [],
            "average_batch_cost": "-",
            "cost_data_available": False,
        }

    subset = df.tail(max(1, min(limit, 1000))).copy()

    batch_cost_column = _pick_existing_column(subset, BATCH_COST_COLUMNS)
    if batch_cost_column is not None:
        subset["estimated_cost"] = pd.to_numeric(subset[batch_cost_column], errors="coerce")
    else:
        wage_column = _pick_existing_column(subset, WAGE_RATE_COLUMNS)
        raw_material_column = _pick_existing_column(subset, RAW_MATERIAL_COST_COLUMNS)
        machine_usage_column = _pick_existing_column(subset, MACHINE_USAGE_RATE_COLUMNS)

        if not all([wage_column, raw_material_column, machine_usage_column]):
            return {
                "batch_cost_estimates": [
                    {
                        "batch_id": row["Batch_ID"],
                        "estimated_cost": "-",
                    }
                    for _, row in subset.iterrows()
                ],
                "average_batch_cost": "-",
                "cost_data_available": False,
            }

        subset["estimated_cost"] = (
            pd.to_numeric(subset["Workers_Assigned"], errors="coerce")
            * pd.to_numeric(subset[wage_column], errors="coerce")
            * pd.to_numeric(subset["Processing_Time"], errors="coerce")
            + pd.to_numeric(subset[raw_material_column], errors="coerce")
            + pd.to_numeric(subset[machine_usage_column], errors="coerce")
            * pd.to_numeric(subset["Processing_Time"], errors="coerce")
        )

    subset = subset.dropna(subset=["estimated_cost"])
    if subset.empty:
        return {
            "batch_cost_estimates": [],
            "average_batch_cost": "-",
            "cost_data_available": False,
        }

    return {
        "batch_cost_estimates": [
            {
                "batch_id": row["Batch_ID"],
                "estimated_cost": round(float(row["estimated_cost"]), 2),
            }
            for _, row in subset.iterrows()
        ],
        "average_batch_cost": round(float(subset["estimated_cost"].mean()), 2),
        "cost_data_available": True,
    }
