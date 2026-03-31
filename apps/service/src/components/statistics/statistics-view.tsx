'use client';

import { useState } from 'react';
import {
  Button,
  Skeleton,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@ai-media-studio/ui';
import {
  useDetectionHistory,
  type TimeRange,
} from '@/hooks/use-detection-history';
import type { FaceAnalysisLog } from '@/lib/db';
import { DetectionFrequencyChart } from './detection-frequency-chart';
import { CategoryPieChart } from './category-pie-chart';
import { DetectionTrendChart } from './detection-trend-chart';
import { PerformanceHistoryChart } from './performance-history-chart';
import { SettingsPanel } from './settings-panel';
import { ExportPanel } from './export-panel';

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}초`;
  return `${Math.floor(seconds / 60)}분 ${seconds % 60}초`;
}

function FaceAnalysisStats({ logs }: { logs: FaceAnalysisLog[] }) {
  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">얼굴 분석 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-4 text-center text-xs">
            얼굴 분석 데이터가 없습니다
          </p>
        </CardContent>
      </Card>
    );
  }

  // 성별 분포
  const maleCount = logs.filter((l) => l.gender === 'male').length;
  const femaleCount = logs.length - maleCount;
  const malePercent = Math.round((maleCount / logs.length) * 100);
  const femalePercent = 100 - malePercent;

  // 연령대 분포 (10대 단위 그룹핑)
  const ageGroups: Record<string, number> = {};
  for (const log of logs) {
    const decade = `${Math.floor(log.age / 10) * 10}대`;
    ageGroups[decade] = (ageGroups[decade] ?? 0) + 1;
  }
  const sortedAgeGroups = Object.entries(ageGroups).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const maxAgeGroupCount = Math.max(...Object.values(ageGroups), 1);

  // 평균 체류·응시 시간
  const avgPresence =
    logs.reduce((sum, l) => sum + l.presenceTime, 0) / logs.length;
  const avgGaze = logs.reduce((sum, l) => sum + l.gazeTime, 0) / logs.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">얼굴 분석 통계</CardTitle>
        <p className="text-muted-foreground text-xs">{logs.length}건 분석</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* 성별 분포 */}
        <div>
          <p className="text-muted-foreground mb-2 text-xs font-medium">
            성별 분포
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-8 text-right text-xs text-blue-400">
              {malePercent}%
            </span>
            <div className="flex h-4 flex-1 overflow-hidden rounded-full">
              <div
                className="bg-blue-500 transition-all"
                style={{ width: `${malePercent}%` }}
                title={`남성 ${maleCount}건`}
              />
              <div
                className="bg-pink-500 transition-all"
                style={{ width: `${femalePercent}%` }}
                title={`여성 ${femaleCount}건`}
              />
            </div>
            <span className="w-8 text-xs text-pink-400">{femalePercent}%</span>
          </div>
          <div className="text-muted-foreground mt-1 flex gap-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              남성 {maleCount}건
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-pink-500" />
              여성 {femaleCount}건
            </span>
          </div>
        </div>

        {/* 연령대 분포 */}
        <div>
          <p className="text-muted-foreground mb-2 text-xs font-medium">
            연령대 분포
          </p>
          <div className="flex flex-col gap-1.5">
            {sortedAgeGroups.map(([label, count]) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-muted-foreground w-10 text-right text-xs">
                  {label}
                </span>
                <div className="bg-muted h-3 flex-1 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${(count / maxAgeGroupCount) * 100}%` }}
                  />
                </div>
                <span className="text-muted-foreground w-6 text-xs">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 평균 시간 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border-border bg-muted/30 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">평균 체류 시간</p>
            <p className="mt-1 text-sm font-medium">
              {formatDuration(Math.round(avgPresence))}
            </p>
          </div>
          <div className="border-border bg-muted/30 rounded-lg border p-3">
            <p className="text-muted-foreground text-xs">평균 응시 시간</p>
            <p className="mt-1 text-sm font-medium">
              {formatDuration(Math.round(avgGaze))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  today: '오늘',
  '7days': '최근 7일',
  all: '전체',
};

export function StatisticsView() {
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const { logs, faceAnalysisLogs, isLoading, refresh, clearHistory } =
    useDetectionHistory(timeRange);

  return (
    <div className="flex flex-col gap-6">
      {/* 기간 필터 + 액션 */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {(Object.entries(TIME_RANGE_LABELS) as [TimeRange, string][]).map(
            ([value, label]) => (
              <Button
                key={value}
                variant={timeRange === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(value)}
              >
                {label}
              </Button>
            ),
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh}>
            새로고침
          </Button>
          <Button variant="outline" size="sm" onClick={clearHistory}>
            기록 삭제
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
          <Skeleton className="col-span-full h-[300px]" />
        </div>
      ) : (
        <>
          {/* 차트 그리드 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="chart-card-enter" style={{ animationDelay: '0ms' }}>
              <DetectionFrequencyChart logs={logs} />
            </div>
            <div
              className="chart-card-enter"
              style={{ animationDelay: '80ms' }}
            >
              <CategoryPieChart logs={logs} />
            </div>
            <div
              className="chart-card-enter"
              style={{ animationDelay: '160ms' }}
            >
              <DetectionTrendChart logs={logs} />
            </div>
            <div
              className="chart-card-enter"
              style={{ animationDelay: '240ms' }}
            >
              <PerformanceHistoryChart logs={logs} />
            </div>
          </div>

          {/* 얼굴 분석 통계 */}
          <div className="chart-card-enter" style={{ animationDelay: '320ms' }}>
            <FaceAnalysisStats logs={faceAnalysisLogs} />
          </div>

          {/* 설정 + 내보내기 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div
              className="chart-card-enter"
              style={{ animationDelay: '400ms' }}
            >
              <SettingsPanel />
            </div>
            <div
              className="chart-card-enter"
              style={{ animationDelay: '480ms' }}
            >
              <ExportPanel logs={logs} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
