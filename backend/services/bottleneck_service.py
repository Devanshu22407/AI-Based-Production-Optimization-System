from __future__ import annotations

from typing import Any, Dict, List

import pandas as pd

from ml.train_model import DATA_PATH


def detect_bottlenecks() -> Dict[str, List[Dict[str, Any]]]:
    df = pd.read_csv(DATA_PATH)
    if df.empty:
        return {"bottleneck_machines": []}

    system_avg_processing_time = float(df["Processing_Time"].mean())
    machine_summary = (
        df.groupby("Machine_ID", as_index=False)
        .agg(
            utilization=("Machine_Load", "mean"),
            avg_processing_time=("Processing_Time", "mean"),
        )
        .sort_values(by="utilization", ascending=False)
    )

    bottlenecks = []
    for _, row in machine_summary.iterrows():
        if float(row["utilization"]) > 0.85 and float(row["avg_processing_time"]) > system_avg_processing_time:
            bottlenecks.append(
                {
                    "machine": row["Machine_ID"],
                    "utilization": round(float(row["utilization"]), 3),
                    "avg_processing_time": round(float(row["avg_processing_time"]), 2),
                }
            )

    return {"bottleneck_machines": bottlenecks}
