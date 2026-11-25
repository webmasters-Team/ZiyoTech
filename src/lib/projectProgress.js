function timestamp(value) {
  if (!(value instanceof Date) && typeof value !== 'string') return Number.NaN;
  if (typeof value === 'string' && value.trim() === '') return Number.NaN;
  return value instanceof Date ? value.getTime() : Date.parse(value);
}

export function calculateElapsedPercentage(startDate, endDate, now = new Date()) {
  const start = timestamp(startDate);
  const end = timestamp(endDate);
  const current = timestamp(now);
  if (![start, end, current].every(Number.isFinite) || end <= start) return null;
  return Math.round(Math.max(0, Math.min(100, ((current - start) / (end - start)) * 100)) * 10) / 10;
}

export function calculateCalendarDaysBetween(fromDate, toDate) {
  const from = calendarDayTimestamp(fromDate);
  const to = calendarDayTimestamp(toDate);
  if (![from, to].every(Number.isFinite)) return null;
  return Math.max(0, Math.floor((to - from) / 86_400_000));
}

export function calculateRemainingCalendarDays(deadline, now = new Date()) {
  const due = calendarDayTimestamp(deadline);
  const current = calendarDayTimestamp(now);
  if (![due, current].every(Number.isFinite)) return null;
  return Math.max(0, Math.floor((due - current) / 86_400_000));
}

function calendarDayTimestamp(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    const day = utcDate(value.trim());
    return day?.getTime() ?? Number.NaN;
  }
  const parsed = timestamp(value);
  if (!Number.isFinite(parsed)) return Number.NaN;
  const date = new Date(parsed);
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function utcDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) ? date : null;
}

function dateKey(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/** Build a chart-friendly series from progress history, grouped by calendar period.
 * Actual values after `now` are discarded so the chart cannot imply future work.
 */
export function transformProgressHistory({ history, startDate, endDate, now = new Date(), period = 'weekly' }) {
  const start = utcDate(startDate);
  const end = utcDate(endDate);
  const current = now instanceof Date ? now : new Date(now);
  if (!start || !end || !Number.isFinite(current.getTime()) || end <= start) return [];

  const currentDay = new Date(Date.UTC(current.getFullYear(), current.getMonth(), current.getDate()));
  const stepDays = period === 'daily' ? 1 : period === 'monthly' ? null : 7;
  const first = period === 'daily' ? new Date(Math.max(start.getTime(), addDays(currentDay, -13).getTime())) : start;
  const dates = [];
  if (period === 'monthly') {
    const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
    while (cursor <= end) {
      dates.push(new Date(Math.min(end.getTime(), cursor.getTime())));
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
  } else {
    for (let cursor = first; cursor <= end; cursor = addDays(cursor, stepDays)) dates.push(cursor);
  }
  if (!dates.some((date) => dateKey(date) === dateKey(end))) dates.push(end);
  if (currentDay >= start && currentDay <= end && !dates.some((date) => dateKey(date) === dateKey(currentDay))) dates.push(currentDay);
  dates.sort((a, b) => a - b);

  const validHistory = (Array.isArray(history) ? history : []).map((point) => ({
    date: utcDate(point?.date),
    planned: Number.isFinite(point?.plannedPercentage) ? Math.max(0, Math.min(100, point.plannedPercentage)) : undefined,
    actual: Number.isFinite(point?.actualPercentage) ? Math.max(0, Math.min(100, point.actualPercentage)) : undefined,
  })).filter((point) => point.date && point.date >= start && point.date <= end)
    .sort((a, b) => a.date - b.date);

  const interpolate = (date, key) => {
    const points = validHistory.filter((point) => Number.isFinite(point[key]) && (key !== 'actual' || point.date <= currentDay));
    if (!points.length) return undefined;
    const before = [...points].reverse().find((point) => point.date <= date);
    const after = points.find((point) => point.date >= date);
    if (!before) return key === 'actual' ? undefined : points[0][key];
    if (!after) return key === 'actual' && date.getTime() !== before.date.getTime() ? undefined : before[key];
    if (before.date.getTime() === after.date.getTime()) return before[key];
    const fraction = (date - before.date) / (after.date - before.date);
    return Math.round((before[key] + (after[key] - before[key]) * fraction) * 10) / 10;
  };

  return dates.map((date) => ({
    date: dateKey(date),
    plannedPercentage: interpolate(date, 'planned'),
    actualPercentage: date <= currentDay ? interpolate(date, 'actual') : undefined,
  }));
}

export function calculateWeightedProgress(milestones) {
  if (!Array.isArray(milestones)) return 0;
  const usable = milestones.filter((m) => m && Number.isFinite(m.weight) && m.weight > 0 && Number.isFinite(m.completionPercentage));
  const totalWeight = usable.reduce((sum, m) => sum + m.weight, 0);
  if (!totalWeight) return 0;
  const value = usable.reduce((sum, m) => sum + m.weight * Math.max(0, Math.min(100, m.completionPercentage)), 0) / totalWeight;
  return Math.round(value * 10) / 10;
}

function deadlineTimestamp(value) {
  const parsed = timestamp(value);
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) return parsed + 86_400_000;
  return parsed;
}

export function getMilestoneStatus(milestone, now = new Date()) {
  const completion = Number.isFinite(milestone?.completionPercentage) ? Math.max(0, Math.min(100, milestone.completionPercentage)) : 0;
  if (completion >= 100) return 'completed';
  if (milestone?.blocked === true) return 'blocked';
  const due = deadlineTimestamp(milestone?.dueDate);
  const current = timestamp(now);
  if (Number.isFinite(due) && Number.isFinite(current) && due < current) return 'delayed';
  return completion > 0 ? 'in_progress' : 'upcoming';
}

export function getProjectDeliveryStatus(deadline, completionPercentage, now = new Date()) {
  if (Number.isFinite(completionPercentage) && completionPercentage >= 100) return 'completed';
  const due = deadlineTimestamp(deadline);
  const current = timestamp(now);
  return Number.isFinite(due) && Number.isFinite(current) && due < current ? 'delayed' : 'in_progress';
}

export function getScheduleStatus(plannedPercentage, actualPercentage, deadline, now = new Date()) {
  if (Number.isFinite(actualPercentage) && actualPercentage >= 100) return 'completed';
  const due = deadlineTimestamp(deadline);
  const current = timestamp(now);
  if (Number.isFinite(due) && Number.isFinite(current) && due < current) return 'delayed';
  if (!Number.isFinite(plannedPercentage) || !Number.isFinite(actualPercentage)) return 'unknown';
  return actualPercentage + 10 < plannedPercentage ? 'at_risk' : 'on_track';
}

export function getRemainingWorkPercentage(completionPercentage) {
  const completion = Number.isFinite(completionPercentage) ? Math.max(0, Math.min(100, completionPercentage)) : 0;
  return Math.round((100 - completion) * 10) / 10;
}
