import { useState } from "react";
import {
  LayoutDashboard,
  Sparkles,
  CalendarClock,
  BarChart3,
  Database,
  Brain,
  FlaskConical,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "predict", label: "Prediction", icon: Sparkles },
  { id: "schedule", label: "Schedule", icon: CalendarClock },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "data", label: "Dataset", icon: Database },
  { id: "model_insights", label: "Model Insights", icon: Brain }
];

function AppSidebar({ activeTab, onTabChange }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex flex-col border-r border-border bg-card/40 backdrop-blur-md transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      <div className="flex items-center gap-3 border-b border-border p-4">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/15">
          <FlaskConical className="h-4 w-4 text-primary" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="truncate font-display text-xs font-bold leading-tight text-foreground">Zydus Pharma</p>
            <p className="truncate text-[10px] text-muted-foreground">Oncology Division</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <p className={`mb-3 px-2 text-[9px] uppercase tracking-[0.2em] text-muted-foreground ${collapsed ? "hidden" : ""}`}>
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                isActive
                  ? "glow-border border border-primary/15 bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
              {!collapsed && <span className="truncate text-[13px] font-medium">{item.label}</span>}
              {isActive && !collapsed && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
            </button>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-border p-3">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground">
          <Settings className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="text-[13px]">Settings</span>}
        </button>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground">
          <HelpCircle className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="text-[13px]">Help</span>}
        </button>
      </div>

      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}

export default AppSidebar;
