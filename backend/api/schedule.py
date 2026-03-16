from __future__ import annotations

import json
from io import StringIO
import pandas as pd
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from ml.scheduler_engine import build_analytics, build_optimized_schedule
from ml.train_model import get_model_status
from services.dataset_service import load_dataset
from services.bottleneck_service import detect_bottlenecks
from services.cost_estimation_service import get_production_cost_estimation
from services.explainability_service import get_feature_importance
from services.forecast_service import build_production_forecast
from services.machine_efficiency_service import calculate_machine_efficiency
from services.maintenance_service import get_maintenance_alerts
from services.recommendations_service import get_smart_recommendations
from services.risk_analysis_service import get_batch_risk_analysis
from services.simulation_service import simulate_production
from services.training_history_service import load_training_history
from services.what_if_service import run_what_if_scenario
from services.worker_productivity_service import get_worker_productivity_analysis


router = APIRouter(tags=["scheduling"])


class SimulationPayload(BaseModel):
    machines: int = Field(ge=1, le=20)
    workers: int = Field(ge=1)
    number_of_batches: int = Field(ge=1, le=5000)


class WhatIfPayload(BaseModel):
    original_machine_id: str
    new_machine_id: str
    original_workers: int = Field(ge=1)
    new_workers: int = Field(ge=1)
    batch_size: int = Field(ge=1)
    raw_material_quantity: float = Field(gt=0)
    production_priority: str = "High"
    quality_check_level: str = "Strict"
    machine_load: float = Field(ge=0.0, le=1.0)
    temperature_control: str = "Stable"
    shift: str = "Morning"


@router.get("/schedule")
def get_schedule():
    try:
        schedule = build_optimized_schedule()
        return {
            "optimized_schedule": schedule,
            "total_batches_in_schedule": len(schedule),
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to generate schedule: {exc}") from exc


@router.get("/analytics")
def get_analytics():
    try:
        analytics = build_analytics()
        return analytics
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {exc}") from exc


@router.get("/dataset")
def get_dataset(limit: int = 300):
    try:
        df = load_dataset()
        subset = df.tail(max(1, min(limit, 5000)))
        records = json.loads(subset.to_json(orient="records", date_format="iso"))
        return {
            "records": records,
            "total_records": int(len(df)),
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch dataset: {exc}") from exc


@router.get("/model-status")
def model_status():
    try:
        return get_model_status()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch model status: {exc}") from exc


@router.get("/model-feature-importance")
def model_feature_importance():
    try:
        return get_feature_importance(top_n=12)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to compute feature importance: {exc}") from exc


@router.get("/bottlenecks")
def bottlenecks():
    try:
        return detect_bottlenecks()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to detect bottlenecks: {exc}") from exc


@router.get("/production-forecast")
def production_forecast():
    try:
        return build_production_forecast()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to generate forecast: {exc}") from exc


@router.get("/model-training-history")
def model_training_history():
    try:
        return {
            "history": load_training_history(),
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch training history: {exc}") from exc


@router.get("/machine-efficiency")
def machine_efficiency():
    try:
        return calculate_machine_efficiency()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to calculate machine efficiency: {exc}") from exc


@router.post("/simulate-production")
def simulate(payload: SimulationPayload):
    try:
        return simulate_production(
            machines=payload.machines,
            workers=payload.workers,
            number_of_batches=payload.number_of_batches,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {exc}") from exc


@router.post("/what-if-scenario")
def what_if_scenario(payload: WhatIfPayload):
    try:
        return run_what_if_scenario(payload.model_dump())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"What-if scenario failed: {exc}") from exc


@router.get("/maintenance-alerts")
def maintenance_alerts():
    try:
        return get_maintenance_alerts()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to compute maintenance alerts: {exc}") from exc


@router.get("/batch-risk-analysis")
def batch_risk_analysis():
    try:
        return get_batch_risk_analysis(limit=180)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to compute batch risk analysis: {exc}") from exc


@router.get("/worker-productivity")
def worker_productivity():
    try:
        return get_worker_productivity_analysis()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to compute worker productivity: {exc}") from exc


@router.get("/production-cost")
def production_cost():
    try:
        return get_production_cost_estimation(limit=200)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to estimate production cost: {exc}") from exc


@router.get("/smart-recommendations")
def smart_recommendations():
    try:
        return get_smart_recommendations()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {exc}") from exc


@router.get("/export/schedule")
def export_schedule():
    try:
        schedule = build_optimized_schedule()
        buffer = StringIO()
        pd.DataFrame(schedule).to_csv(buffer, index=False)
        buffer.seek(0)
        return StreamingResponse(
            iter([buffer.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=schedule.csv"},
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to export schedule: {exc}") from exc


@router.get("/export/analytics")
def export_analytics():
    try:
        analytics = build_analytics()
        flat_rows = []
        for key, value in analytics.items():
            if isinstance(value, dict):
                for sub_key, sub_value in value.items():
                    flat_rows.append({"section": key, "metric": sub_key, "value": sub_value})
            elif isinstance(value, list):
                flat_rows.append({"section": key, "metric": "records", "value": len(value)})
            else:
                flat_rows.append({"section": key, "metric": "value", "value": value})

        buffer = StringIO()
        pd.DataFrame(flat_rows).to_csv(buffer, index=False)
        buffer.seek(0)
        return StreamingResponse(
            iter([buffer.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=analytics_report.csv"},
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to export analytics: {exc}") from exc
