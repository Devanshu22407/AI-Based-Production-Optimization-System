from __future__ import annotations

from typing import Any, Dict, List

from services.dataset_service import load_dataset


def get_maintenance_alerts() -> Dict[str, List[Dict[str, Any]]]:
    df = load_dataset()
    if df.empty:
        return {"maintenance_alerts": []}

    machine_stats = (
        df.groupby("Machine_ID", as_index=False)
        .agg(utilization=("Machine_Load", "mean"), batches_processed=("Batch_ID", "count"))
        .sort_values(by="utilization", ascending=False)
    )

    alerts = []
    for _, row in machine_stats.iterrows():
        utilization = float(row["utilization"])
        batches_processed = int(row["batches_processed"])
        if utilization > 0.90 and batches_processed > 50:
            alerts.append(
                {
                    "machine": row["Machine_ID"],
                    "utilization": round(utilization, 3),
                    "batches_processed": batches_processed,
                    "recommendation": "Maintenance Check",
                }
            )

    return {"maintenance_alerts": alerts}
