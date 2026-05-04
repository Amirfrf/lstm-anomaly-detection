from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
import json, os

app = FastAPI()

@app.get("/api/experiments")
def get_experiments():
    with open("data/experiments.json") as f:
        return json.load(f)

@app.get("/api/experiment/{exp_id}")
def get_experiment(exp_id: int):
    path = f"data/experiment_{exp_id}.json"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Not found")
    with open(path) as f:
        return json.load(f)

app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")