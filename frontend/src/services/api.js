import axios from "axios";

const resolvedBaseUrl =
  process.env.REACT_APP_API_BASE_URL ||
  `http://${window.location.hostname || "127.0.0.1"}:8000`;

const api = axios.create({
  baseURL: resolvedBaseUrl,
  timeout: 12000
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.code === "ECONNABORTED") {
      error.message = "Backend request timed out. Check if backend is running.";
    } else if (!error?.response) {
      error.message = "Cannot connect to backend API. Start backend on port 8000.";
    }
    return Promise.reject(error);
  }
);

export const uploadDataset = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/upload-dataset", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data;
};

export const addBatch = async (payload) => {
  const response = await api.post("/add-batch", payload);
  return response.data;
};

export const predictBatch = async (payload) => {
  const response = await api.post("/predict", payload);
  return response.data;
};

export const retrainModel = async () => {
  const response = await api.post("/retrain-model");
  return response.data;
};

export const getSchedule = async () => {
  const response = await api.get("/schedule");
  return response.data;
};

export const getAnalytics = async () => {
  const response = await api.get("/analytics");
  return response.data;
};

export const getDataset = async (limit = 300) => {
  const response = await api.get(`/dataset?limit=${limit}`);
  return response.data;
};

export const getModelStatus = async () => {
  const response = await api.get("/model-status");
  return response.data;
};

export const getFeatureImportance = async () => {
  const response = await api.get("/model-feature-importance");
  return response.data;
};

export const getBottlenecks = async () => {
  const response = await api.get("/bottlenecks");
  return response.data;
};

export const getProductionForecast = async () => {
  const response = await api.get("/production-forecast");
  return response.data;
};

export const getTrainingHistory = async () => {
  const response = await api.get("/model-training-history");
  return response.data;
};

export const getMachineEfficiency = async () => {
  const response = await api.get("/machine-efficiency");
  return response.data;
};

export const simulateProduction = async (payload) => {
  const response = await api.post("/simulate-production", payload);
  return response.data;
};

export const exportScheduleCsv = async () => {
  const response = await api.get("/export/schedule", { responseType: "blob" });
  return response.data;
};

export const exportAnalyticsCsv = async () => {
  const response = await api.get("/export/analytics", { responseType: "blob" });
  return response.data;
};

export const runWhatIfScenario = async (payload) => {
  const response = await api.post("/what-if-scenario", payload);
  return response.data;
};

export const getMaintenanceAlerts = async () => {
  const response = await api.get("/maintenance-alerts");
  return response.data;
};

export const getBatchRiskAnalysis = async () => {
  const response = await api.get("/batch-risk-analysis");
  return response.data;
};

export const getWorkerProductivity = async () => {
  const response = await api.get("/worker-productivity");
  return response.data;
};

export const getProductionCost = async () => {
  const response = await api.get("/production-cost");
  return response.data;
};

export const getSmartRecommendations = async () => {
  const response = await api.get("/smart-recommendations");
  return response.data;
};
