import { Activity, Factory, Users, Clock, Cpu, TrendingUp, Zap, BarChart3 } from "lucide-react";

const iconMap = {
  batches: Factory,
  machines: Cpu,
  workers: Users,
  time: Clock,
  cpu: Activity,
  trending: TrendingUp,
  zap: Zap,
  chart: BarChart3
};

const colorClasses = {
  primary: { bg: "bg-primary/10", border: "border-primary/15", text: "text-primary" },
  accent: { bg: "bg-accent/10", border: "border-accent/15", text: "text-accent" },
  success: { bg: "bg-success/10", border: "border-success/15", text: "text-success" },
  warning: { bg: "bg-warning/10", border: "border-warning/15", text: "text-warning" }
};

function StatCard({ title, value, subtitle, icon, color = "primary" }) {
  const Icon = iconMap[icon] || BarChart3;
  const c = colorClasses[color] || colorClasses.primary;

  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">{title}</p>
          <p className="font-display text-2xl font-bold tracking-tight text-foreground">{value}</p>
          {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={`rounded-xl border p-2.5 ${c.bg} ${c.border}`}>
          <Icon className={`h-5 w-5 ${c.text}`} />
        </div>
      </div>
      <div className="mt-3 flex h-6 items-end gap-[2px]">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-sm ${c.bg}`}
            style={{ height: `${20 + Math.sin(i * 0.8) * 40 + 25}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export default StatCard;
