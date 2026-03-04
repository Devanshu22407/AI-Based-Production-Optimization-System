from __future__ import annotations

import pandas as pd

from ml.train_model import DATA_PATH


def load_dataset() -> pd.DataFrame:
    return pd.read_csv(DATA_PATH)


def save_dataset(df: pd.DataFrame) -> None:
    df.to_csv(DATA_PATH, index=False)
