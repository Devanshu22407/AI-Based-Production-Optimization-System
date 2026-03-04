from __future__ import annotations

from typing import Any, Dict

from ml.scheduler_engine import build_analytics


def get_analytics_service() -> Dict[str, Any]:
    return build_analytics()
