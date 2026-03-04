from __future__ import annotations

from pathlib import Path
import numpy as np
import pandas as pd


PRODUCT_TYPES = ["Oncology_Drug_A", "Oncology_Drug_B", "Oncology_Drug_C", "Oncology_Drug_D"]
PRODUCTION_LINES = ["Line_1", "Line_2", "Line_3"]
MACHINES = ["M1", "M2", "M3", "M4", "M5"]
PRIORITIES = ["Low", "Medium", "High"]
QUALITY_LEVELS = ["Standard", "Enhanced", "Strict"]
TEMP_CONTROL = ["Stable", "Moderate", "Sensitive"]
SHIFTS = ["Morning", "Evening", "Night"]


def _priority_factor(priority: str) -> float:
    return {"Low": 0.95, "Medium": 1.0, "High": 1.12}[priority]


def _quality_factor(level: str) -> float:
    return {"Standard": 0.96, "Enhanced": 1.05, "Strict": 1.16}[level]


def _shift_factor(shift: str) -> float:
    return {"Morning": 0.98, "Evening": 1.0, "Night": 1.05}[shift]


def _temp_factor(temp: str) -> float:
    return {"Stable": 0.98, "Moderate": 1.03, "Sensitive": 1.1}[temp]


def generate_synthetic_production_data(rows: int = 5000, seed: int = 42) -> pd.DataFrame:
    rng = np.random.default_rng(seed)

    batch_ids = [f"B{1000 + i}" for i in range(rows)]
    product_type = rng.choice(PRODUCT_TYPES, size=rows, p=[0.35, 0.25, 0.25, 0.15])
    production_line = rng.choice(PRODUCTION_LINES, size=rows, p=[0.4, 0.35, 0.25])
    machine_id = rng.choice(MACHINES, size=rows)
    workers = rng.integers(3, 10, size=rows)
    raw_material_qty = rng.normal(150, 28, size=rows).clip(80, 250).round(2)
    batch_size = rng.normal(120, 35, size=rows).clip(50, 240).round(0).astype(int)
    priority = rng.choice(PRIORITIES, size=rows, p=[0.2, 0.5, 0.3])
    quality = rng.choice(QUALITY_LEVELS, size=rows, p=[0.45, 0.35, 0.2])
    machine_load = rng.uniform(0.35, 0.98, size=rows).round(3)
    temp_control = rng.choice(TEMP_CONTROL, size=rows, p=[0.6, 0.3, 0.1])
    shift = rng.choice(SHIFTS, size=rows, p=[0.4, 0.35, 0.25])

    line_speed = {"Line_1": 1.0, "Line_2": 0.95, "Line_3": 1.08}
    machine_factor = {"M1": 0.98, "M2": 1.02, "M3": 1.0, "M4": 1.06, "M5": 0.94}
    product_complexity = {
        "Oncology_Drug_A": 1.0,
        "Oncology_Drug_B": 1.08,
        "Oncology_Drug_C": 0.96,
        "Oncology_Drug_D": 1.14,
    }

    processing_time = []
    for i in range(rows):
        base_time = 28 + (batch_size[i] * 0.11) + (raw_material_qty[i] * 0.045)
        load_impact = 1 + ((machine_load[i] - 0.5) * 0.75)
        worker_impact = max(0.78, 1.15 - (workers[i] * 0.04))

        time_value = (
            base_time
            * load_impact
            * worker_impact
            * line_speed[production_line[i]]
            * machine_factor[machine_id[i]]
            * product_complexity[product_type[i]]
            * _priority_factor(priority[i])
            * _quality_factor(quality[i])
            * _shift_factor(shift[i])
            * _temp_factor(temp_control[i])
        )
        noise = rng.normal(0, 2.8)
        processing_time.append(round(max(12.0, time_value + noise), 2))

    df = pd.DataFrame(
        {
            "Batch_ID": batch_ids,
            "Product_Type": product_type,
            "Production_Line": production_line,
            "Machine_ID": machine_id,
            "Workers_Assigned": workers,
            "Raw_Material_Quantity": raw_material_qty,
            "Batch_Size": batch_size,
            "Production_Priority": priority,
            "Quality_Check_Level": quality,
            "Machine_Load": machine_load,
            "Temperature_Control": temp_control,
            "Shift": shift,
            "Processing_Time": processing_time,
        }
    )
    return df


def save_synthetic_dataset(output_path: Path, rows: int = 5000) -> Path:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df = generate_synthetic_production_data(rows=rows)
    df.to_csv(output_path, index=False)
    return output_path


if __name__ == "__main__":
    default_path = Path(__file__).resolve().parents[1] / "data" / "production_data.csv"
    save_synthetic_dataset(default_path, rows=5000)
    print(f"Synthetic dataset generated at: {default_path}")
