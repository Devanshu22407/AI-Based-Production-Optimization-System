from __future__ import annotations

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler


CATEGORICAL_FEATURES = [
    "Machine_ID",
    "Production_Priority",
    "Quality_Check_Level",
    "Shift",
    "Temperature_Control",
]

NUMERICAL_FEATURES = [
    "Workers_Assigned",
    "Batch_Size",
    "Raw_Material_Quantity",
    "Machine_Load",
]


def build_preprocessor() -> ColumnTransformer:
    return ColumnTransformer(
        transformers=[
            ("categorical", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
            ("numeric", StandardScaler(), NUMERICAL_FEATURES),
        ],
        remainder="drop",
    )
