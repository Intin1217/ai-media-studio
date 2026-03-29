'use client';

import { Tabs, TabsList, TabsTrigger } from '@ai-media-studio/ui';
import { useDetectionStore } from '@/stores/detection-store';
import type { DashboardTab } from '@/stores/detection-store';

export function DashboardTabs() {
  const dashboardTab = useDetectionStore((s) => s.dashboardTab);
  const setDashboardTab = useDetectionStore((s) => s.setDashboardTab);

  return (
    <Tabs
      value={dashboardTab}
      onValueChange={(v) => setDashboardTab(v as DashboardTab)}
    >
      <TabsList className="w-full">
        <TabsTrigger value="realtime" className="flex-1">
          실시간 감지
        </TabsTrigger>
        <TabsTrigger value="image-analysis" className="flex-1">
          이미지 분석
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
