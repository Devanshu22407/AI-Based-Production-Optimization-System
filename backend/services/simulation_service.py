from __future__ import annotations

from typing import Any, Dict, List

import pandas as pd

from ml.train_model import load_model
from services.preprocessing import FEATURE_COLUMNS
from services.synthetic_data_generator import generate_synthetic_production_data


def simulate_production(machines: int, workers: int, number_of_batches: int) -> Dict[str, Any]:
    machine_count = max(1, min(machines, 10))
    worker_budget = max(1, workers)
    batch_count = max(1, min(number_of_batches, 2000))

    simulated_df = generate_synthetic_production_data(rows=batch_count)
    valid_machines = [f"M{index}" for index in range(1, machine_count + 1)]
    simulated_df["Machine_ID"] = simulated_df["Machine_ID"].apply(
        lambda value: valid_machines[hash(str(value)) % len(valid_machines)]
    )

    max_workers_per_batch = max(1, worker_budget // machine_count)
    simulated_df["Workers_Assigned"] = simulated_df["Workers_Assigned"].clip(lower=1, upper=max_workers_per_batch)

    model_artifact = load_model()
    pipeline = model_artifact["pipeline"]
    simulated_df["Predicted_Processing_Time"] = pipeline.predict(simulated_df[FEATURE_COLUMNS]).round(2)

    prioritized = simulated_df.sort_values(
        by=["Production_Priority", "Predicted_Processing_Time", "Machine_Load"],
        ascending=[True, True, True],
    )

    machine_clock: Dict[str, float] = {}
    for _, row in prioritized.iterrows():
        machine = row["Machine_ID"]
        machine_clock[machine] = machine_clock.get(machine, 0.0) + float(row["Predicted_Processing_Time"])

    estimated_completion_time = max(machine_clock.values()) if machine_clock else 0.0

    return {
        "machines": machine_count,
        "workers": worker_budget,
        "batches": batch_count,
        "estimated_completion_time": round(estimated_completion_time, 2),
    }
