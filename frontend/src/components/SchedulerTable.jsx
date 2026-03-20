import { CalendarClock, ArrowRight } from "lucide-react";
import { formatDuration } from "../utils/time";

const priorityClass = {
  High: "priority-high",
  Medium: "priority-medium",
  Low: "priority-low"
};

function SchedulerTable({ schedule }) {
  const top = schedule.slice(0, 15);

  return (
    <div className="glass-card animate-slide-up overflow-hidden">
      <div className="flex items-center justify-between px-5 pb-3 pt-5">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-success/15 bg-success/10">
            <CalendarClock className="h-3.5 w-3.5 text-success" />
          </div>
          Optimized Production Schedule
        </h3>
        <span className="font-mono text-[10px] text-muted-foreground">{schedule.length} batches queued</span>
      </div>

      {top.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No schedule generated yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table w-full text-xs">
            <thead>
              <tr className="glass-table-head border-y border-border">
                <th className="px-5 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Order</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Batch ID</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Machine</th>
                <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Priority</th>
                <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pred. Time</th>
                <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Timeline</th>
              </tr>
            </thead>
            <tbody>
              {top.map((s) => (
                <tr key={`${s.Batch_ID}-${s.Order}`} className="glass-row border-b border-border/30 transition-colors">
                  <td className="px-5 py-3">
                    <span className="glass-subtle inline-flex h-6 w-6 items-center justify-center font-mono text-[11px] font-semibold text-muted-foreground">
                      {s.Order}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-mono text-[12px] font-semibold text-primary">{s.Batch_ID}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-1 text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-accent/60" />
                      {s.Machine_ID}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className={priorityClass[s.Priority] || "priority-low"}>{s.Priority}</span>
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-[12px] font-semibold">{formatDuration(s.Predicted_Processing_Time)}</td>
                  <td className="px-3 py-3 text-right">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                      {formatDuration(s.Start_Minute)} <ArrowRight className="h-2.5 w-2.5" /> {formatDuration(s.End_Minute)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {schedule.length > 15 && (
            <div className="border-t border-border/30 px-5 py-3 text-center text-[10px] text-muted-foreground">
              Showing 15 of {schedule.length} scheduled batches
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SchedulerTable;
