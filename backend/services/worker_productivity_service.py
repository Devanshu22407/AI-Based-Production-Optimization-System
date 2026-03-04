from __future__ import annotations

from typing import Any, Dict, List

import pandas as pd

from ml.train_model import DATA_PATH


def get_worker_productivity_analysis() -> Dict[str, List[Dict[str, Any]]]:
    df = pd.read_csv(DATA_PATH)
    if df.empty:
        return {"worker_productivity": []}

    grouped = (
        df.groupby("Workers_Assigned", as_index=False)
        .agg(
            avg_processing_time=("Processing_Time", "mean"),
            batches=("Batch_ID", "count"),
        )
        .sort_values(by="Workers_Assigned")
    )

    return {
        "worker_productivity": [
            {
                "workers": int(row["Workers_Assigned"]),
                "avg_processing_time": round(float(row["avg_processing_time"]), 2),
                "batches": int(row["batches"]),
            }
            for _, row in grouped.iterrows()
        ]
    }
