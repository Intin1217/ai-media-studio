'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@ai-media-studio/ui';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { DetectionLog } from '@/lib/db';

const COLORS = [
  '#00FF88',
  '#FF6B6B',
  '#4ECDC4',
  '#FFE66D',
  '#A78BFA',
  '#F472B6',
  '#34D399',
  '#60A5FA',
];

interface Props {
  logs: DetectionLog[];
}

export function DetectionFrequencyChart({ logs }: Props) {
  const frequencyMap: Record<string, number> = {};
  for (const log of logs) {
    for (const d of log.detections) {
      frequencyMap[d.class] = (frequencyMap[d.class] ?? 0) + 1;
    }
  }

  const data = Object.entries(frequencyMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">객체별 감지 빈도</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-xs">
            데이터가 없습니다
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={data}
              margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
            >
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
