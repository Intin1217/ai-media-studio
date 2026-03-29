'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from '@ai-media-studio/ui';
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
          <p className="text-muted-foreground py-4 text-center text-xs">
            감지된 객체가 없습니다
          </p>
        ) : (
          <ul className="space-y-2">
            {detections.map((d, i) => (
              <li
                key={`${d.class}-${i}`}
                className="detection-item-enter flex items-center justify-between text-sm"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <Badge variant="secondary">{d.class}</Badge>
                <span className="text-muted-foreground tabular-nums">
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
