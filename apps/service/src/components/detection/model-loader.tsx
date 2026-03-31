'use client';

import { Progress } from '@ai-media-studio/ui';
import { useDetectionStore } from '@/stores/detection-store';
import { useSettingsStore, type ModelType } from '@/stores/settings-store';

const MODEL_OPTIONS: {
  value: ModelType;
  label: string;
  description: string;
}[] = [
  {
    value: 'coco-ssd',
    label: 'COCO-SSD (경량)',
    description: 'TensorFlow.js · MobileNet V2',
  },
  {
    value: 'mediapipe-lite0',
    label: 'MediaPipe Lite0 (균형)',
    description: 'EfficientDet Lite0 · 빠른 속도',
  },
  {
    value: 'mediapipe-lite2',
    label: 'MediaPipe Lite2 (정확)',
    description: 'EfficientDet Lite2 · 높은 정확도',
  },
];

export function ModelLoader() {
  const modelStatus = useDetectionStore((s) => s.modelStatus);
  const modelType = useSettingsStore((s) => s.modelType);
  const setModelType = useSettingsStore((s) => s.setModelType);
  const ollamaEnabled = useSettingsStore((s) => s.ollamaEnabled);

  const selectedOption = MODEL_OPTIONS.find((o) => o.value === modelType) ?? {
    value: 'mediapipe-lite0' as ModelType,
    label: 'MediaPipe Lite0 (균형)',
    description: 'EfficientDet Lite0 · 빠른 속도',
  };

  const modelSelector = (
    <div
      className={`border-border bg-card rounded-lg border p-3${ollamaEnabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      <label className="text-muted-foreground mb-2 block text-xs font-medium">
        브라우저 AI 모델 선택
      </label>
      <select
        value={modelType}
        onChange={(e) => setModelType(e.target.value as ModelType)}
        disabled={ollamaEnabled}
        className="bg-background border-border text-foreground focus:ring-ring w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1"
      >
        {MODEL_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <p className="text-muted-foreground mt-1.5 text-xs">
        {selectedOption.description}
      </p>
      {ollamaEnabled && (
        <p className="text-muted-foreground text-xs">
          로컬 AI 사용 중에는 브라우저 모델을 변경할 수 없습니다
        </p>
      )}
    </div>
  );

  if (modelStatus === 'idle')
    return <div className="flex flex-col gap-2">{modelSelector}</div>;

  if (modelStatus === 'loading') {
    return (
      <div className="flex flex-col gap-2">
        {modelSelector}
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
            <span className="text-muted-foreground text-xs">
              {selectedOption.label}
            </span>
          </div>
          <Progress value={66} className="animate-pulse" />
          <p className="text-muted-foreground text-xs">
            {selectedOption.description} 초기화 중
          </p>
        </div>
      </div>
    );
  }

  if (modelStatus === 'error') {
    return (
      <div className="flex flex-col gap-2">
        {modelSelector}
        <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-4">
          <p className="text-destructive text-sm font-medium">모델 로드 실패</p>
          <p className="text-muted-foreground mt-1 text-xs">
            네트워크 연결을 확인하고 페이지를 새로고침해주세요
          </p>
        </div>
      </div>
    );
  }

  // ready
  return (
    <div className="flex flex-col gap-2">
      {modelSelector}
      <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
        <span className="text-xs text-green-400">모델 준비 완료</span>
      </div>
    </div>
  );
}
