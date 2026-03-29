'use client';

import { WebcamView } from '@/components/webcam/webcam-view';
import { DetectionList } from '@/components/detection/detection-list';
import { DetectionStats } from '@/components/detection/detection-stats';
import { ModelLoader } from '@/components/detection/model-loader';
import { PerformanceMonitor } from '@/components/dashboard/performance-monitor';
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs';
import { ImageAnalysisView } from '@/components/image-analysis/image-analysis-view';
import { useDetectionStore } from '@/stores/detection-store';
import { Badge } from '@ai-media-studio/ui';

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
            <Badge variant={webcamStatus === 'active' ? 'default' : 'outline'}>
              카메라: {webcamStatus === 'active' ? '활성' : '비활성'}
            </Badge>
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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
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
        {dashboardTab === 'image-analysis' && <ImageAnalysisView />}
      </main>
    </div>
  );
}
