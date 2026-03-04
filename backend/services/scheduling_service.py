from __future__ import annotations

from typing import Any, Dict, List

from ml.scheduler_engine import build_analytics, build_optimized_schedule


def schedule_service() -> List[Dict[str, Any]]:
    return build_optimized_schedule()


def analytics_service() -> Dict[str, Any]:
    return build_analytics()
