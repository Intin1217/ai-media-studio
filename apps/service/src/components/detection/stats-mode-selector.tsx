'use client';

import { useDetectionStore } from '@/stores/detection-store';
import type { StatsMode } from '@/stores/detection-store';

const STATS_MODE_LABELS: Record<StatsMode, string> = {
  unique: '고유 감지',
  'per-second': '초당 감지',
  'current-frame': '누적 감지',
};

export function StatsModeSelector() {
  const statsMode = useDetectionStore((s) => s.statsMode);
  const setStatsMode = useDetectionStore((s) => s.setStatsMode);

  return (
    <select
      value={statsMode}
      onChange={(e) => setStatsMode(e.target.value as StatsMode)}
      className="border-border bg-background text-foreground focus:ring-ring rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-2"
    >
      {Object.entries(STATS_MODE_LABELS).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
