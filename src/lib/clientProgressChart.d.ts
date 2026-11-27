export function getClientProgressSeries(
  history: readonly { date: string; plannedPercentage?: number; actualPercentage?: number }[],
  period: 'daily' | 'weekly' | 'monthly',
  now?: Date,
): Array<{ date: string; plannedPercentage?: number; actualPercentage?: number }>;
