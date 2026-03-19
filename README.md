# AI-Driven Production Batch Scheduling and Resource Allocation System

Simulation project for Zydus Pharma Oncology manufacturing workflows.

This full-stack ML system helps predict batch processing time, optimize scheduling, monitor production health, and generate actionable insights from plant data.

## Quick Start (2 Minutes)

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm

### Run Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

Optional MongoDB setup (recommended):

```bash
# PowerShell
$env:MONGODB_URI="mongodb://127.0.0.1:27017"
$env:MONGODB_DB="AI-Based-Production-Optimization-System"
python main.py
```

If MongoDB is available, user-added dataset records and model progress are persisted in MongoDB.
If MongoDB is not available, the backend falls back to local CSV/JSON files.

Backend runs at: `http://127.0.0.1:8000`

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:3000`

API docs (Swagger): `http://127.0.0.1:8000/docs`

## What This Project Does

- Predicts batch processing time using trained ML models.
- Builds optimized schedules using priority and machine constraints.
- Retrains automatically as new production records are added.
- Explains model behavior with feature importance.
- Provides operational analytics: bottlenecks, risk, maintenance, cost, productivity.
- Supports simulation, what-if analysis, and CSV exports.

## Tech Stack

- Backend: FastAPI, pandas, NumPy, scikit-learn, joblib
- Frontend: React, TailwindCSS, Recharts, axios, lucide-react
- ML: Random Forest, Gradient Boosting, permutation importance

## Project Structure

```text
production_scheduler_project
├── backend
│   ├── api/
│   ├── ml/
│   ├── services/
│   ├── data/
│   ├── models/
│   ├── main.py
│   └── requirements.txt
├── frontend
│   ├── src/components/
│   ├── src/services/api.js
│   ├── src/utils/time.js
│   └── package.json
├── notebooks/EDA.ipynb
├── docs/project_report.md
└── README.md
```

## Core Features

### 1) Prediction & Learning
- Predict processing time for incoming batches.
- Compare model candidates (Random Forest vs Gradient Boosting).
- Persist best model and training metadata.
- Auto-retrain every 20 new batch records.
- Support manual retraining from API and dashboard.

### 2) Scheduling & Monitoring
- Generate priority-aware production schedules.
- Detect bottleneck machines and efficiency issues.
- Forecast completion timelines from active schedules.
- Track machine utilization and worker productivity.

### 3) Advanced Analytics
- Batch risk scoring with severity levels.
- Maintenance alerts for machine reliability.
- Cost estimation with INR support (`₹`).
- Smart recommendations for operational actions.
- What-if scenario simulation.

### 4) Dashboard Experience
- Multi-tab dashboard (Overview, Prediction, Schedule, Analytics, Dataset, Model Insights).
- Loading indicators on all long-running actions.
- Resilient API handling (partial failures do not break the full dashboard).
- Export schedule and analytics data to CSV.

## Dataset Schema

### Required Columns
- `Batch_ID`
- `Product_Type`
- `Production_Line`
- `Machine_ID`
- `Workers_Assigned`
- `Raw_Material_Quantity`
- `Batch_Size`
- `Production_Priority`
- `Quality_Check_Level`
- `Machine_Load`
- `Temperature_Control`
- `Shift`
- `Processing_Time` (target)

### Optional Cost Columns (any supported alias)
- Wage: `Wage_Rate` or `Worker_Wage_Rate_INR_per_Min`
- Machine usage: `Machine_Usage_Cost` or `Machine_Usage_Rate_INR_per_Min`
- Material: `Raw_Material_Cost` or `Raw_Material_Cost_INR`
- Batch cost: `Batch_Cost` or `Batch_Cost_INR`

If cost columns are missing, cost cards safely show `-` instead of failing.

## API Overview

### Core APIs
- `GET /`
- `POST /upload-dataset`
- `POST /validate-dataset`
- `POST /add-batch`
- `POST /predict`
- `POST /retrain-model`
- `GET /schedule`
- `GET /analytics`
- `GET /dataset`
- `GET /model-status`

### Insights APIs
- `GET /model-feature-importance`
- `GET /model-training-history`
- `GET /machine-efficiency`
- `GET /bottlenecks`
- `GET /maintenance-alerts`
- `GET /batch-risk-analysis`
- `GET /worker-productivity`
- `GET /production-cost`
- `GET /production-forecast`
- `GET /smart-recommendations`

### Simulation & Export APIs
- `POST /simulate-production`
- `POST /what-if-scenario`
- `GET /export/schedule`
- `GET /export/analytics`

## Recommended Demo Flow

1. Start backend and frontend.
2. Upload dataset (or use existing generated dataset).
3. Check model status and feature importance.
4. Predict a new batch and add it to dataset.
5. Open schedule and analytics tabs.
6. Run what-if simulation.
7. Export schedule and analytics CSVs.

## Notes

- This is an academic and demonstration-focused project.
- Plant behavior is simulated from synthetic and uploaded datasets.
- Rules for risk, maintenance, and recommendations are intentionally interpretable.

## MongoDB Compass

Use this connection string in MongoDB Compass:
- `mongodb://127.0.0.1:27017/AI-Based-Production-Optimization-System`

Default database used by this project:
- `AI-Based-Production-Optimization-System`

Collections:
- `production_dataset` (all uploaded and user-added batches)
- `model_training_history` (training history timeline)
- `model_meta` (pending retrain counters and meta)
- `model_runs` (full model training run summaries)

## License

For academic and educational use.
 