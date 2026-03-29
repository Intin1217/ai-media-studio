'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@ai-media-studio/ui';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { DetectionLog } from '@/lib/db';

interface Props {
  logs: DetectionLog[];
}

export function PerformanceHistoryChart({ logs }: Props) {
  const data = logs.slice(-100).map((log) => ({
    time: new Date(log.timestamp).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    fps: log.fps,
    inferenceTime: log.inferenceTime,
  }));

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">성능 히스토리</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-xs">
            데이터가 없습니다
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="fps" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="ms" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Legend />
              <Line
                yAxisId="fps"
                type="monotone"
                dataKey="fps"
                name="FPS"
                stroke="#4ECDC4"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="ms"
                type="monotone"
                dataKey="inferenceTime"
                name="추론시간(ms)"
                stroke="#FFE66D"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
