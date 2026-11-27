import test from 'node:test';
import assert from 'node:assert/strict';
import { getClientProgressSeries } from '../src/lib/clientProgressChart.js';

test('client progress chart groups stored snapshots and drops future actual values without interpolation', () => {
  const history = [
    { date: '2026-11-02T08:00:00.000Z', plannedPercentage: 15, actualPercentage: 10 },
    { date: '2026-11-05T08:00:00.000Z', plannedPercentage: 24, actualPercentage: 20 },
    { date: '2026-11-12T08:00:00.000Z', plannedPercentage: 40, actualPercentage: 32 },
    { date: '2026-12-10T08:00:00.000Z', plannedPercentage: 80, actualPercentage: 70 },
  ];
  const points = getClientProgressSeries(history, 'weekly', new Date('2026-11-20T12:00:00Z'));

  assert.deepEqual(points.map((point) => point.date), ['2026-11-05', '2026-11-12']);
  assert.equal(points[0].actualPercentage, 20);
  assert.equal(points.some((point) => point.date === '2026-11-09'), false);
  assert.equal(points.some((point) => point.date > '2026-11-20'), false);
});
