/**
 * Group recorded client progress snapshots without interpolating or inventing points.
 * Future actual values are excluded from the client-facing chart.
 * @param {readonly { date: string; plannedPercentage?: number; actualPercentage?: number }[]} history
 * @param {'daily'|'weekly'|'monthly'} period
 * @param {Date} now
 */
export function getClientProgressSeries(history, period, now = new Date()) {
  const currentDay = now.toISOString().slice(0, 10);
  const sorted = (Array.isArray(history) ? history : [])
    .map((point) => ({ ...point, date: typeof point?.date === 'string' ? point.date.slice(0, 10) : '' }))
    .filter((point) => /^\d{4}-\d{2}-\d{2}$/.test(point.date) && point.date <= currentDay)
    .sort((a, b) => a.date.localeCompare(b.date));
  const bucket = (date) => {
    if (period === 'daily') return date;
    if (period === 'monthly') return date.slice(0, 7);
    const parsed = new Date(`${date}T00:00:00Z`);
    parsed.setUTCDate(parsed.getUTCDate() - ((parsed.getUTCDay() + 6) % 7));
    return parsed.toISOString().slice(0, 10);
  };
  const grouped = new Map();
  for (const point of sorted) grouped.set(bucket(point.date), point);
  return [...grouped.values()];
}
