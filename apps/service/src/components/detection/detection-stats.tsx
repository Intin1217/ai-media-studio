'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from '@ai-media-studio/ui';
import { useDetectionStore } from '@/stores/detection-store';
import { StatsModeSelector } from './stats-mode-selector';
import { getKoreanLabel } from '@/lib/class-labels';

export function DetectionStats() {
  const statsMode = useDetectionStore((s) => s.statsMode);
  const uniqueDetectionCounts = useDetectionStore(
    (s) => s.uniqueDetectionCounts,
  );
  const perSecondCounts = useDetectionStore((s) => s.perSecondCounts);
  const detections = useDetectionStore((s) => s.detections);

  // statsMode에 따른 데이터 선택
  let counts: Record<string, number>;
  let suffix: string;

  switch (statsMode) {
    case 'unique':
      counts = uniqueDetectionCounts;
      suffix = '회';
      break;
    case 'per-second':
      counts = perSecondCounts;
      suffix = '개/초';
      break;
    case 'current-frame':
      // 현재 프레임의 감지 결과를 집계
      counts = {};
      for (const d of detections) {
        counts[d.class] = (counts[d.class] ?? 0) + 1;
      }
      suffix = '개';
      break;
  }

  const entries = Object.entries(counts).sort(([, a], [, b]) => b - a);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">감지 통계</CardTitle>
          <StatsModeSelector />
        </div>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-xs">
            아직 통계가 없습니다
          </p>
        ) : (
          <ul className="space-y-2">
            {entries.slice(0, 8).map(([cls, count]) => (
              <li
                key={cls}
                className="flex items-center justify-between text-sm"
              >
                <Badge>{getKoreanLabel(cls)}</Badge>
                <span className="text-muted-foreground font-mono tabular-nums">
                  {count.toLocaleString()}
                  {suffix}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
