"""Run the saved LSTM models and write dashboard-ready JSON files."""

import os
import json
import numpy as np
import pandas as pd
import tensorflow as tf
import joblib
import kagglehub
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_score, recall_score, f1_score

WINDOW_SIZE  = 10
TRAIN_SIZE   = 400
SENSOR_COLS  = [
    "Accelerometer1RMS", "Accelerometer2RMS", "Current", "Pressure",
    "Temperature", "Thermocouple", "Voltage", "Volume Flow RateRMS",
]


def create_sequences(values, time_steps):
    n = len(values) - time_steps + 1
    return np.stack([values[i : i + time_steps] for i in range(n)])


def reconstruction_error(x_true, x_pred):
    return np.mean(np.abs(x_true - x_pred), axis=(1, 2))


print("Downloading / loading SKAB dataset...")
# kagglehub handles both the download and the local cache.
path = kagglehub.dataset_download("yuriykatser/skoltech-anomaly-benchmark-skab")

raw_files = []
for root, _, files in os.walk(os.path.join(path, "SKAB")):
    for file in sorted(files):
        if not file.endswith(".csv") or "anomaly-free" in file:
            continue
        df = pd.read_csv(
            os.path.join(root, file),
            sep=";",
            index_col="datetime",
            parse_dates=True,
        )
        raw_files.append(df)

print(f"Loaded {len(raw_files)} experiment files")

os.makedirs("data", exist_ok=True)

summary = []

for i, df in enumerate(raw_files):

    X = df.drop(["anomaly", "changepoint"], axis=1)
    y = df["anomaly"]

    _, X_test, _, y_test = train_test_split(
        X, y, train_size=TRAIN_SIZE, shuffle=False
    )

    model  = tf.keras.models.load_model(f"models/model_{i}.keras")
    scaler = joblib.load(f"models/scaler_{i}.pkl")
    ucl    = float(np.load(f"models/ucl_{i}.npy"))

    X_scaled = scaler.transform(X_test)
    X_seq    = create_sequences(X_scaled, WINDOW_SIZE)
    errors   = reconstruction_error(X_seq, model.predict(X_seq, verbose=0))

    # The first window_size - 1 rows are dropped so the labels line up with the windowed predictions.
    offset     = WINDOW_SIZE - 1
    y_true     = y_test.iloc[offset:].values.astype(int)
    timestamps = [str(t) for t in X_test.index[offset:]]
    preds      = (errors > ucl).astype(int)

    p  = float(precision_score(y_true, preds, zero_division=0))
    r  = float(recall_score(y_true,    preds, zero_division=0))
    f1 = float(f1_score(y_true,        preds, zero_division=0))

    sensor_slice = X_test.iloc[offset:][SENSOR_COLS]

    # The per-experiment payload consumed by the API and the React dashboard.
    experiment = {
        "id":           i,
        "threshold":    ucl,
        "metrics":      {"precision": p, "recall": r, "f1": f1},
        "timestamps":   timestamps,
        "sensor_names": SENSOR_COLS,
        "sensors":      {col: sensor_slice[col].tolist() for col in SENSOR_COLS},
        "errors":       errors.tolist(),
        "ground_truth": y_true.tolist(),
        "predictions":  preds.tolist(),
    }

    with open(f"data/experiment_{i}.json", "w") as f:
        json.dump(experiment, f)

    summary.append({
        "id":           i,
        "f1":           f1,
        "precision":    p,
        "recall":       r,
        "threshold":    ucl,
        "anomaly_rate": float(preds.mean()),
    })

    print(f"  [{i:02d}]  P={p:.2f}  R={r:.2f}  F1={f1:.2f}")

with open("data/experiments.json", "w") as f:
    json.dump(summary, f, indent=2)

print(f"\nDone. Written {len(raw_files)} files + summary to data/")