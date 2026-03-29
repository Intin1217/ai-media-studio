'use client';

import { Card, CardHeader, CardTitle, CardContent, Badge } from '@ai-media-studio/ui';
import { useDetectionStore } from '@/stores/detection-store';

export function DetectionStats() {
  const detectionCounts = useDetectionStore((s) => s.detectionCounts);
  const entries = Object.entries(detectionCounts).sort(([, a], [, b]) => b - a);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">감지 통계</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">아직 통계가 없습니다</p>
        ) : (
          <ul className="space-y-2">
            {entries.slice(0, 8).map(([cls, count]) => (
              <li key={cls} className="flex items-center justify-between text-sm">
                <Badge>{cls}</Badge>
                <span className="tabular-nums font-mono text-muted-foreground">
                  {count.toLocaleString()}회
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
