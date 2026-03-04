import { formatDuration } from "../utils/time";

function ProductionForecastCard({ forecast }) {
  const completion = forecast?.estimated_completion_minutes || 0;
  const totalBatches = forecast?.total_batches || 0;

  return (
    <div className="stat-card">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">Estimated Completion Time</p>
      <p className="mt-2 font-display text-xl font-bold text-foreground">{formatDuration(completion)}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">for {totalBatches} scheduled batches</p>
    </div>
  );
}

export default ProductionForecastCard;
