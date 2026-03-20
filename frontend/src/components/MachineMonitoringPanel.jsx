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
    <div className="glass-card p-4">
      <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Machine Status</h3>
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map((row) => (
          <div key={row.machine} className="glass-pane flex items-center justify-between px-2.5 py-1.5 text-[11px]">
            <span className="font-semibold text-foreground">{row.machine}</span>
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
