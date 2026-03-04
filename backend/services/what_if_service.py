from __future__ import annotations

from typing import Any, Dict

from ml.train_model import predict_from_features


def run_what_if_scenario(payload: Dict[str, Any]) -> Dict[str, Any]:
    original_features = {
        "Machine_ID": payload["original_machine_id"],
        "Workers_Assigned": payload["original_workers"],
        "Batch_Size": payload["batch_size"],
        "Raw_Material_Quantity": payload["raw_material_quantity"],
        "Production_Priority": payload["production_priority"],
        "Machine_Load": payload["machine_load"],
        "Quality_Check_Level": payload["quality_check_level"],
        "Shift": payload["shift"],
        "Temperature_Control": payload["temperature_control"],
    }
    new_features = {
        "Machine_ID": payload["new_machine_id"],
        "Workers_Assigned": payload["new_workers"],
        "Batch_Size": payload["batch_size"],
        "Raw_Material_Quantity": payload["raw_material_quantity"],
        "Production_Priority": payload["production_priority"],
        "Machine_Load": payload["machine_load"],
        "Quality_Check_Level": payload["quality_check_level"],
        "Shift": payload["shift"],
        "Temperature_Control": payload["temperature_control"],
    }

    original_time = predict_from_features(original_features)
    new_estimated_time = predict_from_features(new_features)
    improvement = round(original_time - new_estimated_time, 2)

    return {
        "original_time": original_time,
        "new_estimated_time": new_estimated_time,
        "improvement_minutes": improvement,
        "improved": improvement > 0,
    }
