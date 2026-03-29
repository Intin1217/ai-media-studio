'use client';

import { Progress } from '@ai-media-studio/ui';
import { useDetectionStore } from '@/stores/detection-store';

export function ModelLoader() {
  const modelStatus = useDetectionStore((s) => s.modelStatus);

  if (modelStatus === 'idle') return null;

  if (modelStatus === 'loading') {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">모델 로딩 중...</span>
          <span className="text-xs text-muted-foreground">COCO-SSD</span>
        </div>
        <Progress value={66} />
        <p className="text-xs text-muted-foreground">TensorFlow.js + MobileNet V2 초기화 중</p>
      </div>
    );
  }

  if (modelStatus === 'error') {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm font-medium text-destructive">모델 로드 실패</p>
        <p className="text-xs text-muted-foreground mt-1">
          네트워크 연결을 확인하고 페이지를 새로고침해주세요
        </p>
      </div>
    );
  }

  // ready
  return (
    <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2">
      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      <span className="text-xs text-green-400">모델 준비 완료</span>
    </div>
  );
}
