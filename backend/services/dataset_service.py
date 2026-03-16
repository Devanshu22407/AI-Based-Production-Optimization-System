from __future__ import annotations

from pathlib import Path
from typing import Any, Dict

import pandas as pd

from services.mongodb_service import (
    append_dataset_record as mongo_append_dataset_record,
    load_dataset_records,
    replace_dataset_records,
)


BASE_DIR = Path(__file__).resolve().parents[1]
DATA_PATH = BASE_DIR / "data" / "production_data.csv"


def _sync_csv_to_mongo(df: pd.DataFrame) -> None:
    if df.empty:
        return
    records = df.to_dict(orient="records")
    replace_dataset_records(records)


def _persist_csv(df: pd.DataFrame) -> None:
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(DATA_PATH, index=False)


def load_dataset() -> pd.DataFrame:
    mongo_records = load_dataset_records()
    if mongo_records:
        df = pd.DataFrame(mongo_records)
        _persist_csv(df)
        return df

    if DATA_PATH.exists():
        df = pd.read_csv(DATA_PATH)
        _sync_csv_to_mongo(df)
        return df

    return pd.DataFrame()


def save_dataset(df: pd.DataFrame) -> bool:
    _persist_csv(df)
    return replace_dataset_records(df.to_dict(orient="records"))


def append_dataset_record(record: Dict[str, Any]) -> None:
    current_df = load_dataset()
    updated_df = pd.concat([current_df, pd.DataFrame([record])], ignore_index=True)
    _persist_csv(updated_df)
    if not mongo_append_dataset_record(record):
        replace_dataset_records(updated_df.to_dict(orient="records"))
