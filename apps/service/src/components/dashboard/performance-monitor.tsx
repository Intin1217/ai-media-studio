'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@ai-media-studio/ui';
import { usePerformance } from '@/hooks/use-performance';

export function PerformanceMonitor() {
  const { fps, inferenceTime, isDetecting, getFpsColor } = usePerformance();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">성능 모니터</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">FPS</span>
            <span
              className={`text-2xl font-bold tabular-nums ${isDetecting ? getFpsColor() : 'text-muted-foreground'}`}
            >
              {isDetecting ? fps : '-'}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">추론 시간</span>
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {isDetecting ? `${inferenceTime}ms` : '-'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
