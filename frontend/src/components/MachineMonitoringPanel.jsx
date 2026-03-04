function MachineMonitoringPanel({ machineUtilization = [], bottlenecks = [] }) {
  const bottleneckSet = new Set((bottlenecks || []).map((item) => item.machine));

  const rows = machineUtilization.map((item) => {
    const utilization = Number(item.Utilization || 0);
    let status = "Active";
    if (utilization < 35) status = "Idle";
    if (bottleneckSet.has(item.Machine_ID) || utilization > 85) status = "High Load ⚠";
    return {
      machine: item.Machine_ID,
      status,
      utilization,
    };
  });

  return (
    <div className="glass-card p-5">
      <h3 className="mb-4 font-display text-sm font-semibold text-foreground">Machine Status</h3>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.machine} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2 text-xs">
            <span className="font-medium text-foreground">{row.machine}</span>
            <span className={row.status.includes("High") ? "text-warning" : row.status === "Idle" ? "text-muted-foreground" : "text-success"}>
              {row.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MachineMonitoringPanel;
