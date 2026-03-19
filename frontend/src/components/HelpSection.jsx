import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Brain,
  CalendarClock,
  CheckCircle2,
  Database,
  Sparkles,
  Upload,
} from "lucide-react";

const steps = [
  {
    id: 1,
    title: "Open Overview",
    description: "Start from overview to confirm backend is online and baseline stats are visible.",
    tabId: "overview",
    tabLabel: "Overview",
    checklist: [
      "Check status in top-right is 'System Online'.",
      "Verify Total Batches, Active Machines, and Avg Processing cards.",
      "Click Refresh once to pull latest data.",
    ],
  },
  {
    id: 2,
    title: "Upload or Verify Dataset",
    description: "Load your CSV and confirm records are visible before prediction and scheduling.",
    tabId: "data",
    tabLabel: "Dataset",
    checklist: [
      "Open Upload Dataset and submit a valid CSV.",
      "Check Dataset Viewer rows are populated.",
      "If needed, export Analytics/Schedule CSV for reporting.",
    ],
  },
  {
    id: 3,
    title: "Run Batch Prediction",
    description: "Predict processing time for a new batch from production input values.",
    tabId: "predict",
    tabLabel: "Prediction",
    checklist: [
      "Fill all required fields in Batch Prediction form.",
      "Submit prediction and review processing-time output.",
      "Use Scenario Simulator for what-if checks.",
    ],
  },
  {
    id: 4,
    title: "Generate Schedule",
    description: "Review optimized order and timing based on machine constraints and priority.",
    tabId: "schedule",
    tabLabel: "Schedule",
    checklist: [
      "Open Production Schedule table.",
      "Review machine-wise sequence and processing windows.",
      "Export Schedule CSV from Dataset tab when required.",
    ],
  },
  {
    id: 5,
    title: "Read Analytics",
    description: "Use analytics cards and charts to identify bottlenecks, risk, cost, and maintenance alerts.",
    tabId: "analytics",
    tabLabel: "Analytics",
    checklist: [
      "Check bottlenecks and machine efficiency first.",
      "Inspect risk analysis and maintenance alerts.",
      "Read recommendations for next operational actions.",
    ],
  },
  {
    id: 6,
    title: "Review Model Insights",
    description: "Validate model quality before relying on predictions in decision making.",
    tabId: "model_insights",
    tabLabel: "Model Insights",
    checklist: [
      "Check selected model and latest R².",
      "Review feature importance for explainability.",
      "Read training history trend and dataset growth.",
    ],
  },
];

const tabIconMap = {
  overview: Sparkles,
  data: Upload,
  predict: Sparkles,
  schedule: CalendarClock,
  analytics: BarChart3,
  model_insights: Brain,
};

function HelpSection({ onNavigateTab }) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const activeStep = steps[activeStepIndex];

  const progress = useMemo(() => {
    if (!steps.length) return 0;
    return Math.round((completedSteps.length / steps.length) * 100);
  }, [completedSteps.length]);

  const toggleDone = (stepId) => {
    setCompletedSteps((previous) =>
      previous.includes(stepId)
        ? previous.filter((id) => id !== stepId)
        : [...previous, stepId]
    );
  };

  const ActiveIcon = tabIconMap[activeStep.tabId] || Database;

  return (
    <div className="space-y-4">
      <div className="glass-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-semibold text-foreground">Help Center</h3>
            <p className="text-xs text-muted-foreground">Follow this guided flow to learn the dashboard quickly.</p>
          </div>
          <div className="glass-pane px-3 py-2 text-xs">
            <span className="text-muted-foreground">Progress: </span>
            <span className="font-semibold text-foreground">{progress}%</span>
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded bg-secondary/50">
          <div className="h-full rounded bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="glass-card p-4 xl:col-span-1">
          <h4 className="mb-3 font-display text-sm font-semibold text-foreground">Step-by-Step Guide</h4>
          <div className="space-y-2">
            {steps.map((step, index) => {
              const isActive = index === activeStepIndex;
              const isDone = completedSteps.includes(step.id);
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStepIndex(index)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-xs transition ${
                    isActive
                      ? "border-primary/50 bg-primary/10 text-foreground"
                      : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-border text-[9px]">
                        {step.id}
                      </span>
                    )}
                    <span className="font-medium">{step.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-5 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Current Step</p>
              <h4 className="font-display text-lg font-semibold text-foreground">
                Step {activeStep.id}: {activeStep.title}
              </h4>
            </div>
            <div className="glass-pane flex items-center gap-2 px-3 py-2 text-xs text-foreground">
              <ActiveIcon className="h-3.5 w-3.5" />
              <span>{activeStep.tabLabel}</span>
            </div>
          </div>

          <p className="mt-3 text-sm text-muted-foreground">{activeStep.description}</p>

          <div className="mt-4 rounded-lg border border-border bg-secondary/20 p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">What to do</p>
            <ul className="space-y-2 text-xs text-foreground">
              {activeStep.checklist.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab(activeStep.tabId)}
              className="glass-button inline-flex items-center gap-2 px-3 py-2 text-xs"
            >
              Open {activeStep.tabLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => toggleDone(activeStep.id)}
              className="glass-button inline-flex items-center gap-2 px-3 py-2 text-xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {completedSteps.includes(activeStep.id) ? "Mark as pending" : "Mark as completed"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpSection;
