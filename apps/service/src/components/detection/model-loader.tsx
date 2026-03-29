'use client';

import { Progress } from '@ai-media-studio/ui';
import { useDetectionStore } from '@/stores/detection-store';

export function ModelLoader() {
  const modelStatus = useDetectionStore((s) => s.modelStatus);

  if (modelStatus === 'idle') return null;

  if (modelStatus === 'loading') {
    return (
      <div className="border-border bg-card flex flex-col gap-2 rounded-lg border p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            AI 모델 로딩 중
            <span
              className="dot-loading ml-0.5 inline-flex gap-0.5"
              aria-hidden="true"
            >
              <span className="bg-muted-foreground inline-block h-1 w-1 rounded-full" />
              <span className="bg-muted-foreground inline-block h-1 w-1 rounded-full" />
              <span className="bg-muted-foreground inline-block h-1 w-1 rounded-full" />
            </span>
          </span>
          <span className="text-muted-foreground text-xs">COCO-SSD</span>
        </div>
        <Progress value={66} className="animate-pulse" />
        <p className="text-muted-foreground text-xs">
          TensorFlow.js + MobileNet V2 초기화 중
        </p>
      </div>
    );
  }

  if (modelStatus === 'error') {
    return (
      <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-4">
        <p className="text-destructive text-sm font-medium">모델 로드 실패</p>
        <p className="text-muted-foreground mt-1 text-xs">
          네트워크 연결을 확인하고 페이지를 새로고침해주세요
        </p>
      </div>
    );
  }

  // ready
  return (
    <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2">
      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
      <span className="text-xs text-green-400">모델 준비 완료</span>
    </div>
  );
}
