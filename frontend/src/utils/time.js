export function formatDuration(minutesValue) {
  const numericValue = Number(minutesValue);
  if (!Number.isFinite(numericValue)) {
    return "0 min";
  }

  const totalMinutes = Math.max(0, Math.round(numericValue));
  const minutesPerDay = 24 * 60;
  const days = Math.floor(totalMinutes / minutesPerDay);
  const hours = Math.floor((totalMinutes % minutesPerDay) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days} day${days === 1 ? "" : "s"} ${hours} hour${hours === 1 ? "" : "s"} ${minutes} min`;
  }

  if (hours > 0) {
    return `${hours} hour${hours === 1 ? "" : "s"} ${minutes} min`;
  }

  return `${minutes} min`;
}
