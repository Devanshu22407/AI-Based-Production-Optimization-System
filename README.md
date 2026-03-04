# AI-Driven Production Batch Scheduling and Resource Allocation System for Zydus Pharma Oncology Pvt. Ltd.

Full-stack machine learning project that simulates pharmaceutical oncology production and provides:

- Processing time prediction
- Dynamic model retraining
- Optimized production scheduling
- Manufacturing resource analytics dashboard

## Project Structure

```
production_scheduler_project
├── backend
│   ├── main.py
│   ├── api
│   │   ├── upload_dataset.py
│   │   ├── add_batch.py
│   │   ├── prediction.py
│   │   ├── retrain_model.py
│   │   └── schedule.py
│   ├── ml
│   │   ├── train_model.py
│   │   ├── retrain_model.py
│   │   └── scheduler_engine.py
│   ├── services
│   │   ├── preprocessing.py
│   │   ├── feature_engineering.py
│   │   └── synthetic_data_generator.py
│   ├── data
│   │   └── production_data.csv
│   ├── models
│   │   └── model.pkl
│   └── requirements.txt
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── UploadDataset.jsx
│   │   │   ├── BatchPrediction.jsx
│   │   │   ├── SchedulerTable.jsx
│   │   │   └── AnalyticsCharts.jsx
│   │   ├── services
│   │   │   └── api.js
│   │   ├── pages
│   │   │   └── Home.jsx
│   │   └── App.jsx
├── notebooks
│   └── EDA.ipynb
├── docs
│   └── project_report.md
└── README.md
```

## Backend Setup

```bash
cd backend
pip install -r requirements.txt
python main.py
```

API docs: `http://127.0.0.1:8000/docs`

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

Dashboard URL: `http://localhost:3000`

## Dynamic Learning Logic

- New batch records are appended to the historical dataset.
- Auto retraining triggers every 20 newly added records.
- Manual retraining is available with `POST /retrain-model`.

## Core Endpoints

- `POST /upload-dataset` - Upload initial CSV and train model
- `POST /add-batch` - Add a new production batch record
- `POST /predict` - Predict processing time
- `POST /retrain-model` - Retrain model with full dataset
- `GET /schedule` - Fetch optimized batch schedule
- `GET /analytics` - Fetch dashboard analytics data
