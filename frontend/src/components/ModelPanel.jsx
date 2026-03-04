import { Brain, RotateCcw, TrendingUp, Loader2 } from "lucide-react";
import { useState } from "react";
import { retrainModel } from "../services/api";
import { formatDuration } from "../utils/time";

function ProgressRing({ value, size = 80, stroke = 6, color = "hsl(168, 80%, 48%)" }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90 transform">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(225, 16%, 15%)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
}

function ModelPanel({ modelStatus, onRefresh }) {
  const [retraining, setRetraining] = useState(false);
  if (!modelStatus) return null;

  const metrics = modelStatus.selected_metrics || {};
  const r2 = Number(metrics.r2 || 0);
  const mae = Number(metrics.mae || 0);
  const rmse = Number(metrics.rmse || 0);

  const handleRetrain = async () => {
    try {
      setRetraining(true);
      await retrainModel();
      await onRefresh();
    } finally {
      setRetraining(false);
    }
  };

  return (
    <div className="glass-card animate-slide-up p-5">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/15 bg-primary/10">
            <Brain className="h-3.5 w-3.5 text-primary" />
          </div>
          ML Model Performance
        </h3>
        <button
          onClick={handleRetrain}
          disabled={retraining}
          className="flex h-8 items-center rounded-lg border border-primary/20 bg-primary/10 px-3 text-xs text-primary hover:bg-primary/20"
        >
          {retraining ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <RotateCcw className="mr-1 h-3 w-3" />} 
          {retraining ? "Retraining..." : `Retrain (${modelStatus.pending_new_records || 0})`}
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative flex-shrink-0">
          <ProgressRing value={r2 * 100} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-lg font-bold glow-text">{r2.toFixed(3)}</span>
            <span className="text-[8px] uppercase text-muted-foreground">R² Score</span>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-secondary/40 p-3">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">MAE</p>
            <p className="font-mono text-sm font-bold text-foreground">{formatDuration(mae)}</p>
            <p className="text-[9px] text-muted-foreground">avg error</p>
          </div>
          <div className="rounded-lg border border-border bg-secondary/40 p-3">
            <p className="text-[9px] uppercase tracking-wider text-muted-foreground">RMSE</p>
            <p className="font-mono text-sm font-bold text-foreground">{formatDuration(rmse)}</p>
            <p className="text-[9px] text-muted-foreground">root mean sq error</p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> active model: {modelStatus.selected_model}
          </span>
          <span>|</span>
          <span>{modelStatus.trained_rows || 0} records</span>
        </div>
        <span>Updated now</span>
      </div>
    </div>
  );
}

export default ModelPanel;
