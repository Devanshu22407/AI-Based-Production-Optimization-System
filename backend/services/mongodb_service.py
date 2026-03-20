from __future__ import annotations

import os
from datetime import datetime
from typing import Any, Dict, List, Optional

import numpy as np
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database


MONGODB_URI = os.getenv(
    "MONGODB_URI",
    "mongodb://127.0.0.1:27017/AI-Based-Production-Optimization-System",
)
MONGODB_DB = os.getenv("MONGODB_DB", "AI-Based-Production-Optimization-System")

DATASET_COLLECTION = "production_dataset"
TRAINING_HISTORY_COLLECTION = "model_training_history"
MODEL_META_COLLECTION = "model_meta"
MODEL_RUNS_COLLECTION = "model_runs"

_MONGO_CLIENT: Optional[MongoClient] = None


def _to_native(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: _to_native(val) for key, val in value.items()}
    if isinstance(value, list):
        return [_to_native(item) for item in value]
    if isinstance(value, tuple):
        return [_to_native(item) for item in value]
    if isinstance(value, np.generic):
        return value.item()
    return value


def _sanitize_document(document: Dict[str, Any]) -> Dict[str, Any]:
    sanitized = _to_native(document)
    for key, value in list(sanitized.items()):
        if value != value:  # NaN-safe check without importing math/pandas.
            sanitized[key] = None
    return sanitized


def _get_client() -> Optional[MongoClient]:
    global _MONGO_CLIENT

    if _MONGO_CLIENT is not None:
        try:
            _MONGO_CLIENT.admin.command("ping")
            return _MONGO_CLIENT
        except Exception:
            _MONGO_CLIENT = None

    try:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=1500)
        client.admin.command("ping")
        _MONGO_CLIENT = client
        return _MONGO_CLIENT
    except Exception:
        return None


def get_database() -> Optional[Database]:
    client = _get_client()
    if client is None:
        return None
    return client[MONGODB_DB]


def is_mongodb_connected() -> bool:
    return get_database() is not None


def _collection(name: str) -> Optional[Collection]:
    database = get_database()
    if database is None:
        return None
    return database[name]


def replace_dataset_records(records: List[Dict[str, Any]]) -> bool:
    collection = _collection(DATASET_COLLECTION)
    if collection is None:
        return False

    collection.delete_many({})
    if records:
        payload = [_sanitize_document(record) for record in records]
        collection.insert_many(payload)
    return True


def append_dataset_record(record: Dict[str, Any]) -> bool:
    collection = _collection(DATASET_COLLECTION)
    if collection is None:
        return False

    collection.insert_one(_sanitize_document(record))
    return True


def load_dataset_records(limit: Optional[int] = None) -> List[Dict[str, Any]]:
    collection = _collection(DATASET_COLLECTION)
    if collection is None:
        return []

    cursor = collection.find({}, {"_id": 0})
    if limit is not None:
        cursor = cursor.limit(max(1, int(limit)))
    return list(cursor)


def append_training_history_record(record: Dict[str, Any]) -> bool:
    collection = _collection(TRAINING_HISTORY_COLLECTION)
    if collection is None:
        return False

    payload = _sanitize_document(record)
    payload["created_at"] = datetime.utcnow().isoformat(timespec="seconds")
    collection.insert_one(payload)
    return True


def load_training_history_records() -> List[Dict[str, Any]]:
    collection = _collection(TRAINING_HISTORY_COLLECTION)
    if collection is None:
        return []

    records = list(collection.find({}, {"_id": 0}).sort("created_at", 1))
    return records


def set_model_meta(meta: Dict[str, Any]) -> bool:
    collection = _collection(MODEL_META_COLLECTION)
    if collection is None:
        return False

    payload = _sanitize_document(meta)
    payload["updated_at"] = datetime.utcnow().isoformat(timespec="seconds")
    collection.update_one({"_id": "global"}, {"$set": payload}, upsert=True)
    return True


def get_model_meta() -> Dict[str, Any]:
    collection = _collection(MODEL_META_COLLECTION)
    if collection is None:
        return {}

    document = collection.find_one({"_id": "global"}, {"_id": 0})
    return document or {}


def append_model_run(record: Dict[str, Any]) -> bool:
    collection = _collection(MODEL_RUNS_COLLECTION)
    if collection is None:
        return False

    payload = _sanitize_document(record)
    payload["created_at"] = datetime.utcnow().isoformat(timespec="seconds")
    collection.insert_one(payload)
    return True
