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
} from 'recharts';
import type { DetectionLog } from '@/lib/db';

interface Props {
  logs: DetectionLog[];
}

export function DetectionTrendChart({ logs }: Props) {
  const bucketSize = 60 * 1000; // 1분
  const bucketMap: Record<number, number> = {};

  for (const log of logs) {
    const bucket = Math.floor(log.timestamp / bucketSize) * bucketSize;
    const count = log.detections.length;
    bucketMap[bucket] = (bucketMap[bucket] ?? 0) + count;
  }

  const data = Object.entries(bucketMap)
    .map(([ts, count]) => ({
      time: new Date(Number(ts)).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      count,
    }))
    .slice(-60);

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">감지 추이</CardTitle>
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
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#00FF88"
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
