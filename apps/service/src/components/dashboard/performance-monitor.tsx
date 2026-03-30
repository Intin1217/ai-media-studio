'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@ai-media-studio/ui';
import { usePerformance } from '@/hooks/use-performance';
import { AnimatedCounter } from '@/components/animations/animated-counter';

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
            <span className="text-muted-foreground text-xs">FPS</span>
            {isDetecting ? (
              <AnimatedCounter
                value={fps}
                className={`text-2xl font-bold tabular-nums ${getFpsColor()}`}
              />
            ) : (
              <span className="text-muted-foreground text-2xl font-bold tabular-nums">
                -
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs">추론 시간</span>
            {isDetecting ? (
              <AnimatedCounter
                value={inferenceTime}
                suffix="ms"
                className="text-foreground text-2xl font-bold tabular-nums"
              />
            ) : (
              <span className="text-muted-foreground text-2xl font-bold tabular-nums">
                -
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
