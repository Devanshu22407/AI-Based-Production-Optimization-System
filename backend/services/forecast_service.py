from __future__ import annotations

from typing import Dict

from ml.scheduler_engine import build_optimized_schedule


def build_production_forecast() -> Dict[str, float]:
    schedule = build_optimized_schedule()
    if not schedule:
        return {
            "total_batches": 0,
            "estimated_completion_minutes": 0,
        }

    estimated_completion = max(float(item["End_Minute"]) for item in schedule)
    return {
        "total_batches": len(schedule),
        "estimated_completion_minutes": round(estimated_completion, 2),
    }
