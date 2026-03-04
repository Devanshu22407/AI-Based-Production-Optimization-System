# AI-Driven Production Batch Scheduling and Resource Allocation System

## 1. Project Summary

This project simulates an oncology drug manufacturing environment inspired by Zydus Pharma Oncology Pvt. Ltd. and applies machine learning for:

- Batch processing time prediction
- Dynamic retraining with new production records
- Production schedule optimization
- Resource utilization analytics

## 2. Core Objectives

- Predict `Processing_Time` using production and resource features.
- Continuously improve model performance by retraining on full historical data.
- Provide optimized schedule order to reduce machine idle time.
- Offer dashboard analytics for machine and workforce planning.

## 3. Technology Stack

- Backend: FastAPI, Python, pandas, NumPy, scikit-learn, joblib
- ML Models: Random Forest Regressor, Gradient Boosting Regressor
- Frontend: React.js, TailwindCSS, Recharts
- Data Engineering: Synthetic production data generator (5000 rows)

## 4. Dataset Design

Generated dataset columns:

`Batch_ID`, `Product_Type`, `Production_Line`, `Machine_ID`, `Workers_Assigned`, `Raw_Material_Quantity`, `Batch_Size`, `Production_Priority`, `Quality_Check_Level`, `Machine_Load`, `Temperature_Control`, `Shift`, `Processing_Time`

The `Processing_Time` target is influenced by:

- Machine load
- Workforce allocation
- Batch size and raw material quantity
- Priority and quality requirements
- Shift and thermal control conditions

## 5. Machine Learning Pipeline

1. Load and validate dataset
2. Data cleaning and type coercion
3. Categorical encoding using OneHotEncoder
4. Numerical normalization using StandardScaler
5. Train/evaluate Random Forest and Gradient Boosting models
6. Compare MAE, RMSE, and R²
7. Save best model (`model.pkl`) with metadata

## 6. Dynamic Learning Workflow

- Initial dataset upload triggers model training.
- New batch entries are appended to `production_data.csv`.
- Auto retrain triggers after every 20 new records.
- Manual retraining available through API and dashboard.

## 7. Scheduling Strategy

Greedy scheduling is applied over active batches by combining:

- Priority rank
- Predicted processing time
- Machine load
- Machine availability timeline

Output includes production order, start and end minute, and machine assignment.

## 8. Dashboard Analytics

- Overview cards: total batches, active machines, workers, average processing time
- Machine utilization chart
- Production time histogram
- Batch completion timeline
- Worker allocation by machine
- Processing time trend chart

## 9. API Endpoints

- `POST /upload-dataset`
- `POST /add-batch`
- `POST /predict`
- `POST /retrain-model`
- `GET /schedule`
- `GET /analytics`

## 10. Conclusion

This system demonstrates an industrial-grade architecture for smart production planning and continuous ML learning in pharmaceutical manufacturing environments.
