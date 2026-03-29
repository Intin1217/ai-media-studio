'use client';

import { useState } from 'react';
import { Button, Skeleton } from '@ai-media-studio/ui';
import {
  useDetectionHistory,
  type TimeRange,
} from '@/hooks/use-detection-history';
import { DetectionFrequencyChart } from './detection-frequency-chart';
import { CategoryPieChart } from './category-pie-chart';
import { DetectionTrendChart } from './detection-trend-chart';
import { PerformanceHistoryChart } from './performance-history-chart';
import { SettingsPanel } from './settings-panel';
import { ExportPanel } from './export-panel';

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  today: '오늘',
  '7days': '최근 7일',
  all: '전체',
};

export function StatisticsView() {
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const { logs, isLoading, refresh, clearHistory } =
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

          {/* 설정 + 내보내기 */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div
              className="chart-card-enter"
              style={{ animationDelay: '320ms' }}
            >
              <SettingsPanel />
            </div>
            <div
              className="chart-card-enter"
              style={{ animationDelay: '400ms' }}
            >
              <ExportPanel logs={logs} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
