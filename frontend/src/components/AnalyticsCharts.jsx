import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatDuration } from "../utils/time";

const COLORS = ["#2dd4bf", "#22d3ee", "#3b82f6", "#a78bfa", "#f59e0b", "#ef4444"];

const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid hsl(var(--tooltip-border))",
  background: "hsl(var(--tooltip-bg))",
  boxShadow: "0 8px 32px -8px rgba(0,0,0,0.25)",
  fontSize: "11px"
};

function AnalyticsCharts({ analytics, dataset }) {
  const utilData = analytics.machine_utilization || [];
  const histogram = analytics.production_time_histogram || [];
  const timeline = analytics.batch_completion_timeline || [];
  const workers = analytics.worker_allocation || [];
  const trends = analytics.prediction_trends || [];

  const priorityData = ["High", "Medium", "Low"].map((priority) => ({
    name: priority,
    value: (dataset || []).filter((item) => item.Production_Priority === priority).length
  }));

  const formatTooltipValue = (value, name) => {
    const timeFields = ["cumulative_minutes", "processing_time"];
    if (timeFields.includes(name)) {
      return formatDuration(value);
    }
    return value;
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="chart-container animate-slide-up">
        <h4 className="section-heading mb-4">Machine Utilization</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={utilData} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" vertical={false} />
            <XAxis dataKey="Machine_ID" tick={{ fontSize: 11, fill: "hsl(var(--chart-tick))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--chart-tick))" }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip contentStyle={tooltipStyle} formatter={formatTooltipValue} />
            <Bar dataKey="Utilization" radius={[6, 6, 0, 0]}>
              {utilData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container animate-slide-up">
        <h4 className="section-heading mb-4">Processing Time Distribution</h4>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={histogram}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" vertical={false} />
            <XAxis dataKey="range" tick={{ fontSize: 11, fill: "hsl(var(--chart-tick))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--chart-tick))" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={formatTooltipValue} />
            <Area type="monotone" dataKey="count" stroke="#2dd4bf" strokeWidth={2} fill="url(#areaGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container animate-slide-up">
        <h4 className="section-heading mb-4">Batch Completion Timeline</h4>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" vertical={false} />
            <XAxis dataKey="step" tick={{ fontSize: 11, fill: "hsl(var(--chart-tick))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--chart-tick))" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={formatTooltipValue} />
            <Line type="monotone" dataKey="cumulative_minutes" stroke="#ef4444" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container animate-slide-up">
        <h4 className="section-heading mb-4">Avg Workers per Machine</h4>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={workers} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" vertical={false} />
            <XAxis dataKey="Machine_ID" tick={{ fontSize: 11, fill: "hsl(var(--chart-tick))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--chart-tick))" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={formatTooltipValue} />
            <Bar dataKey="Workers" fill="#a78bfa" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container animate-slide-up">
        <h4 className="section-heading mb-4">Priority Distribution</h4>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={priorityData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              dataKey="value"
              strokeWidth={0}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              <Cell fill="#f59e0b" />
              <Cell fill="#3b82f6" />
              <Cell fill="hsl(215, 14%, 45%)" />
            </Pie>
            <Tooltip contentStyle={tooltipStyle} formatter={formatTooltipValue} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container animate-slide-up">
        <h4 className="section-heading mb-4">Processing Time Trends</h4>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" vertical={false} />
            <XAxis dataKey="batch_index" tick={{ fontSize: 11, fill: "hsl(var(--chart-tick))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--chart-tick))" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={formatTooltipValue} />
            <Line type="monotone" dataKey="processing_time" stroke="#2dd4bf" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AnalyticsCharts;
