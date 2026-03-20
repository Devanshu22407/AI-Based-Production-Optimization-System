import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function Card({ title, children }) {
  return (
    <div className="chart-container">
      <h4 className="section-heading mb-4">{title}</h4>
      {children}
    </div>
  );
}

function ModelInsights({ featureImportance = [], trainingHistory = [], modelStatus }) {
  const importanceData = featureImportance.map((item) => ({
    feature: item.feature,
    importance: Number(item.importance || 0),
  }));

  const trendData = trainingHistory.map((item, index) => ({
    cycle: index + 1,
    rmse: Number(item.rmse || 0),
    rows: Number(item.dataset_rows || 0),
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass-card p-5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Selected Model</p>
          <p className="mt-2 font-display text-xl font-bold text-foreground">{modelStatus?.selected_model || "N/A"}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Latest R²</p>
          <p className="mt-2 font-display text-xl font-bold text-foreground">{modelStatus?.selected_metrics?.r2 ?? 0}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Training Records</p>
          <p className="mt-2 font-display text-xl font-bold text-foreground">{modelStatus?.trained_rows ?? 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Feature Importance">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={importanceData} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" horizontal={false} />
              <XAxis type="number" axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="feature" width={130} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="importance" fill="#22d3ee" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="RMSE Trend">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" vertical={false} />
              <XAxis dataKey="cycle" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="rmse" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Training Dataset Growth">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" vertical={false} />
            <XAxis dataKey="cycle" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="rows" stroke="#2dd4bf" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="glass-card overflow-hidden">
        <div className="border-b border-border px-5 py-3">
          <h4 className="font-display text-sm font-semibold text-foreground">Model Training History</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="glass-table-head text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">Rows</th>
                <th className="px-4 py-2">Model</th>
                <th className="px-4 py-2">RMSE</th>
                <th className="px-4 py-2">MAE</th>
                <th className="px-4 py-2">R²</th>
              </tr>
            </thead>
            <tbody>
              {trainingHistory.map((item, index) => (
                <tr key={`${item.timestamp}-${index}`} className="border-t border-border/30">
                  <td className="px-4 py-2 font-mono text-muted-foreground">{index + 1}</td>
                  <td className="px-4 py-2">{item.timestamp}</td>
                  <td className="px-4 py-2">{item.dataset_rows}</td>
                  <td className="px-4 py-2">{item.model_selected}</td>
                  <td className="px-4 py-2">{item.rmse}</td>
                  <td className="px-4 py-2">{item.mae}</td>
                  <td className="px-4 py-2">{item.r2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ModelInsights;
