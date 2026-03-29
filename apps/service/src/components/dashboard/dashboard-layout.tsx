'use client';

import { WebcamView } from '@/components/webcam/webcam-view';
import { DetectionList } from '@/components/detection/detection-list';
import { DetectionStats } from '@/components/detection/detection-stats';
import { ModelLoader } from '@/components/detection/model-loader';
import { PerformanceMonitor } from '@/components/dashboard/performance-monitor';
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs';
import { ImageAnalysisView } from '@/components/image-analysis/image-analysis-view';
import dynamic from 'next/dynamic';

const StatisticsView = dynamic(
  () =>
    import('@/components/statistics/statistics-view').then((m) => ({
      default: m.StatisticsView,
    })),
  { ssr: false },
);
import { useDetectionStore } from '@/stores/detection-store';
import { Badge } from '@ai-media-studio/ui';
import { ThemeToggle } from '@/components/theme-toggle';

export function DashboardLayout() {
  const modelStatus = useDetectionStore((s) => s.modelStatus);
  const webcamStatus = useDetectionStore((s) => s.webcamStatus);
  const dashboardTab = useDetectionStore((s) => s.dashboardTab);

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="border-border border-b px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-foreground text-xl font-bold">AI Media Studio</h1>
          <div className="flex items-center gap-2">
            <Badge variant={modelStatus === 'ready' ? 'default' : 'secondary'}>
              모델:{' '}
              {modelStatus === 'ready'
                ? '준비됨'
                : modelStatus === 'loading'
                  ? '로딩 중'
                  : modelStatus === 'error'
                    ? '오류'
                    : '대기'}
            </Badge>
            <Badge
              variant={webcamStatus === 'active' ? 'default' : 'outline'}
              className={
                webcamStatus === 'active'
                  ? 'ring-primary/30 animate-pulse ring-2'
                  : ''
              }
            >
              카메라: {webcamStatus === 'active' ? '활성' : '비활성'}
            </Badge>
            <a
              href="https://github.com/Intin1217"
              target="_blank"
              rel="noopener noreferrer"
              className="border-border bg-background text-foreground hover:bg-muted inline-flex h-9 w-9 items-center justify-center rounded-md border transition-colors"
              aria-label="GitHub"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-6">
        {/* 탭 전환 */}
        <div className="mb-6">
          <DashboardTabs />
        </div>

        {/* 실시간 감지 탭 */}
        {dashboardTab === 'realtime' && (
          <div
            key="realtime"
            className="tab-content-fade grid grid-cols-1 gap-6 lg:grid-cols-5"
          >
            <div className="flex flex-col gap-4 lg:col-span-3">
              <WebcamView />
              <ModelLoader />
            </div>
            <div className="flex flex-col gap-4 lg:col-span-2">
              <PerformanceMonitor />
              <DetectionStats />
              <DetectionList />
            </div>
          </div>
        )}

        {/* 이미지 분석 탭 */}
        {dashboardTab === 'image-analysis' && (
          <div key="image-analysis" className="tab-content-fade">
            <ImageAnalysisView />
          </div>
        )}

        {/* 통계 탭 */}
        {dashboardTab === 'statistics' && (
          <div key="statistics" className="tab-content-fade">
            <StatisticsView />
          </div>
        )}
      </main>

      <footer className="border-border mt-auto border-t px-6 py-4">
        <div className="text-muted-foreground mx-auto max-w-7xl text-center text-xs">
          © 2026 Intin1217. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
