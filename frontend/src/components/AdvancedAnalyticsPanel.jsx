import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDuration } from "../utils/time";

function formatINR(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "-";
  return `₹${numeric.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function AdvancedAnalyticsPanel({ maintenanceAlerts = [], riskAnalysis = [], workerProductivity = [], costAnalytics, recommendations = [] }) {
  const topRisk = riskAnalysis.slice(0, 6);
  const topCost = (costAnalytics?.batch_cost_estimates || []).slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h3 className="mb-3 font-display text-sm font-semibold text-foreground">⚠ Maintenance Alert</h3>
          {maintenanceAlerts.length === 0 ? (
            <p className="text-xs text-muted-foreground">No maintenance alerts currently detected.</p>
          ) : (
            <div className="space-y-2 text-xs">
              {maintenanceAlerts.map((item) => (
                <div key={item.machine} className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2">
                  <p className="font-semibold text-warning">Machine {item.machine}</p>
                  <p>Utilization: {(item.utilization * 100).toFixed(1)}%</p>
                  <p>Batches Processed: {item.batches_processed}</p>
                  <p>Recommendation: {item.recommendation}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Batch Risk Analysis</h3>
          <div className="space-y-2 text-xs">
            {topRisk.map((item) => (
              <div key={item.batch_id} className="flex items-center justify-between rounded-md border border-border bg-secondary/30 px-3 py-2">
                <span>{item.batch_id}</span>
                <span className={item.risk_level === "HIGH" ? "text-warning" : item.risk_level === "MEDIUM" ? "text-accent" : "text-success"}>
                  {item.risk_level} ({item.risk_score})
                </span>
              </div>
            ))}
            {topRisk.length === 0 && <p className="text-muted-foreground">No risk data available.</p>}
          </div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="section-heading mb-4">Worker Efficiency Chart</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={workerProductivity} barSize={30}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(225, 16%, 15%)" vertical={false} />
            <XAxis dataKey="workers" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip formatter={(value) => formatDuration(value)} />
            <Bar dataKey="avg_processing_time" fill="#22d3ee" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Production Cost Analytics</h3>
          {costAnalytics?.cost_data_available ? (
            <>
              <p className="mb-2 text-xs text-muted-foreground">Average Batch Cost: {formatINR(costAnalytics.average_batch_cost)}</p>
              <div className="space-y-2 text-xs">
                {topCost.map((item) => (
                  <div key={item.batch_id} className="flex items-center justify-between rounded-md border border-border bg-secondary/30 px-3 py-2">
                    <span>{item.batch_id}</span>
                    <span>{formatINR(item.estimated_cost)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">Cost data unavailable in dataset. Showing "-" as requested.</p>
          )}
        </div>

        <div className="glass-card p-5">
          <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Smart Recommendations</h3>
          <ul className="list-disc space-y-2 pl-4 text-xs text-foreground">
            {recommendations.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
          {recommendations.length === 0 && <p className="text-xs text-muted-foreground">No recommendations generated.</p>}
        </div>
      </div>
    </div>
  );
}

export default AdvancedAnalyticsPanel;
