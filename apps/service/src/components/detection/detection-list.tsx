'use client';

import { Card, CardHeader, CardTitle, CardContent, Badge } from '@ai-media-studio/ui';
import { useDetectionStore } from '@/stores/detection-store';

export function DetectionList() {
  const detections = useDetectionStore((s) => s.detections);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">현재 감지 목록</CardTitle>
      </CardHeader>
      <CardContent>
        {detections.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">감지된 객체가 없습니다</p>
        ) : (
          <ul className="space-y-2">
            {detections.map((d, i) => (
              <li key={`${d.class}-${i}`} className="flex items-center justify-between text-sm">
                <Badge variant="secondary">{d.class}</Badge>
                <span className="tabular-nums text-muted-foreground">
                  {Math.round(d.score * 100)}%
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
