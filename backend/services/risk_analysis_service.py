from __future__ import annotations

from typing import Any, Dict, List

import pandas as pd

from services.dataset_service import load_dataset


def _score_row(row: pd.Series, batch_size_threshold: float) -> float:
    score = 0.0
    score += 0.35 if float(row["Machine_Load"]) > 0.85 else 0.0
    score += 0.25 if str(row["Quality_Check_Level"]) == "Strict" else 0.0
    score += 0.25 if float(row["Batch_Size"]) > batch_size_threshold else 0.0
    score += 0.15 if str(row["Shift"]) == "Night" else 0.0
    return min(1.0, score)


def _risk_level(score: float) -> str:
    if score >= 0.7:
        return "HIGH"
    if score >= 0.4:
        return "MEDIUM"
    return "LOW"


def get_batch_risk_analysis(limit: int = 120) -> Dict[str, List[Dict[str, Any]]]:
    df = load_dataset()
    if df.empty:
        return {"batch_risk_analysis": []}

    subset = df.tail(max(1, min(limit, 2000))).copy().reset_index(drop=True)
    threshold = float(subset["Batch_Size"].quantile(0.75))

    analysis: List[Dict[str, Any]] = []
    for _, row in subset.iterrows():
        score = _score_row(row, batch_size_threshold=threshold)
        analysis.append(
            {
                "batch_id": row["Batch_ID"],
                "risk_score": round(score, 2),
                "risk_level": _risk_level(score),
                "machine": row["Machine_ID"],
            }
        )

    analysis.sort(key=lambda item: item["risk_score"], reverse=True)
    return {"batch_risk_analysis": analysis[:50]}
