from __future__ import annotations

from typing import Dict, List

from ml.scheduler_engine import build_optimized_schedule
from services.dataset_service import load_dataset
from services.bottleneck_service import detect_bottlenecks
from services.worker_productivity_service import get_worker_productivity_analysis


def get_smart_recommendations() -> Dict[str, List[str]]:
    df = load_dataset()
    recommendations: List[str] = []

    if df.empty:
        return {"recommendations": ["No dataset available for recommendation generation."]}

    bottlenecks = detect_bottlenecks().get("bottleneck_machines", [])
    if bottlenecks:
        machine_loads = df.groupby("Machine_ID", as_index=False)["Machine_Load"].mean().sort_values(by="Machine_Load")
        least_loaded_machine = machine_loads.iloc[0]["Machine_ID"] if not machine_loads.empty else None
        if least_loaded_machine:
            recommendations.append(
                f"Move selected batches from bottleneck machines to {least_loaded_machine} to reduce idle and queue time."
            )

    productivity = get_worker_productivity_analysis().get("worker_productivity", [])
    if productivity:
        best = min(productivity, key=lambda item: item["avg_processing_time"])
        recommendations.append(
            f"Optimal workforce trend suggests {best['workers']} workers per batch for lower average processing time."
        )

    schedule = build_optimized_schedule()
    if schedule:
        non_high_early = [item for item in schedule[:5] if item.get("Priority") != "High"]
        if non_high_early:
            recommendations.append("Schedule high-priority batches earlier in the queue to improve service level compliance.")

    if df["Machine_Load"].mean() > 0.8:
        recommendations.append("Average machine load is high; consider balancing workload across additional production lines.")

    if not recommendations:
        recommendations.append("Current production setup appears balanced. Continue monitoring key utilization and quality indicators.")

    return {"recommendations": recommendations[:6]}
