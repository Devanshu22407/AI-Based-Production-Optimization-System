from __future__ import annotations

from typing import Any, Dict, List

from services.dataset_service import load_dataset


def calculate_machine_efficiency() -> Dict[str, List[Dict[str, Any]]]:
    df = load_dataset()
    if df.empty:
        return {"machine_efficiency": []}

    grouped = (
        df.groupby("Machine_ID", as_index=False)
        .agg(total_batch_size_processed=("Batch_Size", "sum"), total_processing_time=("Processing_Time", "sum"))
    )

    grouped["efficiency"] = grouped.apply(
        lambda row: float(row["total_batch_size_processed"]) / float(row["total_processing_time"])
        if float(row["total_processing_time"]) > 0
        else 0.0,
        axis=1,
    )

    grouped = grouped.sort_values(by="efficiency", ascending=False)

    return {
        "machine_efficiency": [
            {
                "machine": row["Machine_ID"],
                "efficiency": round(float(row["efficiency"]), 4),
            }
            for _, row in grouped.iterrows()
        ]
    }
