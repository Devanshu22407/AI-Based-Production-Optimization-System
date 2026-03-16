import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Loader2, Moon, RefreshCw, Sun } from "lucide-react";
import AppSidebar from "./AppSidebar";
import StatCard from "./StatCard";
import BatchPrediction from "./BatchPrediction";
import SchedulerTable from "./SchedulerTable";
import AnalyticsCharts from "./AnalyticsCharts";
import ModelPanel from "./ModelPanel";
import DatasetViewer from "./DatasetViewer";
import UploadDataset from "./UploadDataset";
import MachineMonitoringPanel from "./MachineMonitoringPanel";
import ProductionForecastCard from "./ProductionForecastCard";
import ModelInsights from "./ModelInsights";
import ScenarioSimulator from "./ScenarioSimulator";
import AdvancedAnalyticsPanel from "./AdvancedAnalyticsPanel";
import {
  exportAnalyticsCsv,
  exportScheduleCsv,
  getAnalytics,
  getBottlenecks,
  getBatchRiskAnalysis,
  getDataset,
  getFeatureImportance,
  getMaintenanceAlerts,
  getMachineEfficiency,
  getModelStatus,
  getProductionForecast,
  getProductionCost,
  getSchedule,
  getSmartRecommendations,
  getTrainingHistory,
  getWorkerProductivity,
} from "../services/api";
import { formatDuration } from "../utils/time";

function Dashboard() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem("ui-theme");
    return savedTheme === "light" ? "light" : "dark";
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [analytics, setAnalytics] = useState({});
  const [schedule, setSchedule] = useState([]);
  const [dataset, setDataset] = useState([]);
  const [modelStatus, setModelStatus] = useState(null);
  const [featureImportance, setFeatureImportance] = useState([]);
  const [trainingHistory, setTrainingHistory] = useState([]);
  const [bottlenecks, setBottlenecks] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [machineEfficiency, setMachineEfficiency] = useState([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState([]);
  const [riskAnalysis, setRiskAnalysis] = useState([]);
  const [workerProductivity, setWorkerProductivity] = useState([]);
  const [costAnalytics, setCostAnalytics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [connectionError, setConnectionError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    const [analyticsRes, scheduleRes, datasetRes, modelRes, importanceRes, historyRes, bottleneckRes, forecastRes, efficiencyRes, maintenanceRes, riskRes, workerRes, costRes, recommendationRes] = await Promise.allSettled([
      getAnalytics(),
      getSchedule(),
      getDataset(500),
      getModelStatus(),
      getFeatureImportance(),
      getTrainingHistory(),
      getBottlenecks(),
      getProductionForecast(),
      getMachineEfficiency(),
      getMaintenanceAlerts(),
      getBatchRiskAnalysis(),
      getWorkerProductivity(),
      getProductionCost(),
      getSmartRecommendations(),
    ]);

    if (analyticsRes.status === "fulfilled") {
      setAnalytics(analyticsRes.value || {});
    }
    if (scheduleRes.status === "fulfilled") {
      setSchedule(scheduleRes.value?.optimized_schedule || []);
    }
    if (datasetRes.status === "fulfilled") {
      setDataset(datasetRes.value?.records || []);
    }
    if (modelRes.status === "fulfilled") {
      setModelStatus(modelRes.value || null);
    }
    if (importanceRes.status === "fulfilled") {
      setFeatureImportance(importanceRes.value?.feature_importance || []);
    }
    if (historyRes.status === "fulfilled") {
      setTrainingHistory(historyRes.value?.history || []);
    }
    if (bottleneckRes.status === "fulfilled") {
      setBottlenecks(bottleneckRes.value?.bottleneck_machines || []);
    }
    if (forecastRes.status === "fulfilled") {
      setForecast(forecastRes.value || null);
    }
    if (efficiencyRes.status === "fulfilled") {
      setMachineEfficiency(efficiencyRes.value?.machine_efficiency || []);
    }
    if (maintenanceRes.status === "fulfilled") {
      setMaintenanceAlerts(maintenanceRes.value?.maintenance_alerts || []);
    }
    if (riskRes.status === "fulfilled") {
      setRiskAnalysis(riskRes.value?.batch_risk_analysis || []);
    }
    if (workerRes.status === "fulfilled") {
      setWorkerProductivity(workerRes.value?.worker_productivity || []);
    }
    if (costRes.status === "fulfilled") {
      setCostAnalytics(costRes.value || null);
    }
    if (recommendationRes.status === "fulfilled") {
      setRecommendations(recommendationRes.value?.recommendations || []);
    }

    const criticalFailures = [analyticsRes, scheduleRes, modelRes].filter((item) => item.status === "rejected");
    if (criticalFailures.length === 3) {
      const firstError = criticalFailures[0]?.reason;
      setConnectionError(firstError?.message || "Cannot connect to backend API. Start backend on port 8000.");
    } else {
      setConnectionError("");
    }
    setIsRefreshing(false);
    setIsInitialLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem("ui-theme", theme);
  }, [theme]);

  const overview = analytics?.overview || {};
  const avgWorkers = useMemo(() => {
    if (!dataset.length) return 0;
    return Math.round((dataset.reduce((sum, item) => sum + Number(item.Workers_Assigned || 0), 0) / dataset.length) * 10) / 10;
  }, [dataset]);

  const tabTitles = {
    overview: "Production Overview",
    predict: "Batch Prediction",
    schedule: "Production Schedule",
    analytics: "Production Analytics",
    data: "Dataset Management",
    model_insights: "Model Insights"
  };

  const downloadBlob = (blobData, filename) => {
    const url = window.URL.createObjectURL(blobData);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExportSchedule = async () => {
    const blob = await exportScheduleCsv();
    downloadBlob(blob, "schedule.csv");
  };

  const handleExportAnalytics = async () => {
    const blob = await exportAnalyticsCsv();
    downloadBlob(blob, "analytics_report.csv");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard title="Total Batches" value={overview.total_batches || 0} icon="batches" subtitle="In production dataset" color="primary" />
              <StatCard title="Active Machines" value={overview.active_machines || 0} icon="machines" subtitle="Unique machines online" color="accent" />
              <StatCard title="Avg Workers" value={avgWorkers} icon="workers" subtitle="Per production batch" color="success" />
              <StatCard title="Avg Processing" value={formatDuration(overview.avg_processing_time || 0)} icon="time" subtitle="Per production batch" color="warning" />
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <ProductionForecastCard forecast={forecast} />
              <div className="glass-card p-5 lg:col-span-2">
                <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Machine Efficiency</h3>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  {machineEfficiency.slice(0, 3).map((item) => (
                    <div key={item.machine} className="glass-pane px-3 py-2 text-xs">
                      <p className="text-muted-foreground">{item.machine}</p>
                      <p className="font-mono text-foreground">{item.efficiency}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <ModelPanel modelStatus={modelStatus} onRefresh={refresh} />
              <BatchPrediction onRefresh={refresh} />
            </div>
            <MachineMonitoringPanel machineUtilization={analytics?.machine_utilization || []} bottlenecks={bottlenecks} />
            <SchedulerTable schedule={schedule} />
          </div>
        );
      case "predict":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <BatchPrediction onRefresh={refresh} />
              <ModelPanel modelStatus={modelStatus} onRefresh={refresh} />
            </div>
            <ScenarioSimulator />
          </div>
        );
      case "schedule":
        return <SchedulerTable schedule={schedule} />;
      case "analytics":
        return (
          <div className="space-y-4">
            <AnalyticsCharts analytics={analytics} dataset={dataset} />
            <AdvancedAnalyticsPanel
              maintenanceAlerts={maintenanceAlerts}
              riskAnalysis={riskAnalysis}
              workerProductivity={workerProductivity}
              costAnalytics={costAnalytics}
              recommendations={recommendations}
            />
          </div>
        );
      case "data":
        return (
          <div className="space-y-4">
            <UploadDataset onRefresh={refresh} />
            <div className="flex flex-wrap gap-2">
              <button onClick={handleExportSchedule} className="glass-button px-3 py-2 text-xs">
                Export Schedule CSV
              </button>
              <button onClick={handleExportAnalytics} className="glass-button px-3 py-2 text-xs">
                Export Analytics CSV
              </button>
            </div>
            <DatasetViewer dataset={dataset} />
          </div>
        );
      case "model_insights":
        return <ModelInsights featureImportance={featureImportance} trainingHistory={trainingHistory} modelStatus={modelStatus} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <AppSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <header className="glass-header flex h-14 flex-shrink-0 items-center justify-between border-b border-border px-6">
          <div>
            <h1 className="font-display text-sm font-bold text-foreground">{tabTitles[activeTab]}</h1>
            <p className="text-[10px] text-muted-foreground">AI-Driven Batch Scheduling System</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="mr-4 flex items-center gap-1.5">
              <div className="pulse-dot" />
              <span className="text-[10px] font-medium text-muted-foreground">
                {connectionError ? "Backend Offline" : "System Online"}
              </span>
            </div>
            <button onClick={refresh} className="glass-button flex h-8 w-8 items-center justify-center text-xs">
              {isRefreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={() => setTheme((previous) => (previous === "dark" ? "light" : "dark"))}
              className={`theme-switch ${theme === "light" ? "is-light" : ""}`}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <span className="theme-switch-knob" />
              <Sun className="theme-switch-track-icon theme-switch-track-sun" />
              <Moon className="theme-switch-track-icon theme-switch-track-moon" />
            </button>
            <button className="glass-button relative flex h-8 w-8 items-center justify-center text-xs">
              <Bell className="h-3.5 w-3.5" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-destructive" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {connectionError && (
            <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/15 px-3 py-2 text-xs text-destructive backdrop-blur-md">
              {connectionError} Run backend: `cd backend` then `python main.py`
            </div>
          )}
          {isInitialLoading ? (
            <div className="glass-card flex min-h-[280px] items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Loading dashboard data...
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
