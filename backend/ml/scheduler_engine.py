from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List

import numpy as np
import pandas as pd

from ml.train_model import DATA_PATH, load_model
from services.preprocessing import FEATURE_COLUMNS


def _priority_rank(priority_value: str) -> int:
    return {"High": 0, "Medium": 1, "Low": 2}.get(priority_value, 1)


def build_optimized_schedule(data_path: Path = DATA_PATH, batch_window: int = 50) -> List[Dict[str, Any]]:
    df = pd.read_csv(data_path)
    active_df = df.tail(batch_window).copy().reset_index(drop=True)

    if active_df.empty:
        return []

    model_artifact = load_model()
    pipeline = model_artifact["pipeline"]
    active_df["Predicted_Processing_Time"] = pipeline.predict(active_df[FEATURE_COLUMNS]).round(2)
    active_df["Priority_Rank"] = active_df["Production_Priority"].apply(_priority_rank)
    active_df = active_df.sort_values(
        by=["Priority_Rank", "Predicted_Processing_Time", "Machine_Load"],
        ascending=[True, True, True],
    ).reset_index(drop=True)

    machine_available_time: Dict[str, float] = {}
    schedule: List[Dict[str, Any]] = []

    for _, row in active_df.iterrows():
        machine = row["Machine_ID"]
        predicted_minutes = float(row["Predicted_Processing_Time"])
        start_time = machine_available_time.get(machine, 0.0)
        end_time = start_time + predicted_minutes
        machine_available_time[machine] = end_time

        schedule.append(
            {
                "Batch_ID": row["Batch_ID"],
                "Machine_ID": machine,
                "Priority": row["Production_Priority"],
                "Predicted_Processing_Time": round(predicted_minutes, 2),
                "Start_Minute": round(start_time, 2),
                "End_Minute": round(end_time, 2),
            }
        )

    schedule.sort(key=lambda item: (item["Start_Minute"], item["End_Minute"]))
    for index, item in enumerate(schedule, start=1):
        item["Order"] = index

    return schedule


def build_analytics(data_path: Path = DATA_PATH) -> Dict[str, Any]:
    df = pd.read_csv(data_path)
    if df.empty:
        return {
            "overview": {
                "total_batches": 0,
                "active_machines": 0,
                "workers_assigned": 0,
                "avg_processing_time": 0,
            },
            "machine_utilization": [],
            "production_time_histogram": [],
            "worker_allocation": [],
            "batch_completion_timeline": [],
            "prediction_trends": [],
        }

    schedule = build_optimized_schedule(data_path=data_path, batch_window=40)
    machine_utilization = (
        df.groupby("Machine_ID", as_index=False)["Machine_Load"].mean().rename(columns={"Machine_Load": "Utilization"})
    )
    machine_utilization["Utilization"] = (machine_utilization["Utilization"] * 100).round(2)

    worker_allocation = (
        df.groupby("Machine_ID", as_index=False)["Workers_Assigned"].sum().rename(columns={"Workers_Assigned": "Workers"})
    )

    histogram_values, bin_edges = np.histogram(df["Processing_Time"], bins=10)
    histogram = []
    for index in range(len(histogram_values)):
        histogram.append(
            {
                "range": f"{round(bin_edges[index], 1)}-{round(bin_edges[index + 1], 1)}",
                "count": int(histogram_values[index]),
            }
        )

    timeline = []
    cumulative = 0.0
    for i, item in enumerate(schedule[:20], start=1):
        cumulative += float(item["Predicted_Processing_Time"])
        timeline.append(
            {
                "step": i,
                "batch": item["Batch_ID"],
                "cumulative_minutes": round(cumulative, 2),
            }
        )

    trends = (
        df.tail(120)
        .reset_index(drop=True)
        .assign(index=lambda frame: frame.index + 1)[["index", "Processing_Time"]]
        .rename(columns={"index": "batch_index", "Processing_Time": "processing_time"})
        .to_dict(orient="records")
    )

    return {
        "overview": {
            "total_batches": int(len(df)),
            "active_machines": int(df["Machine_ID"].nunique()),
            "workers_assigned": int(df.tail(25)["Workers_Assigned"].sum()),
            "avg_processing_time": round(float(df["Processing_Time"].mean()), 2),
        },
        "machine_utilization": machine_utilization.to_dict(orient="records"),
        "production_time_histogram": histogram,
        "worker_allocation": worker_allocation.to_dict(orient="records"),
        "batch_completion_timeline": timeline,
        "prediction_trends": trends,
    }
