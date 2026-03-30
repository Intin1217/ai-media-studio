'use client';

import { useState } from 'react';
import { Progress, cn } from '@ai-media-studio/ui';
import { useDetectionStore } from '@/stores/detection-store';
import { useSettingsStore, type ModelType } from '@/stores/settings-store';
import { checkOllamaConnection, getOllamaModels } from '@/lib/ollama-client';

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

type OllamaConnectionStatus = 'idle' | 'checking' | 'connected' | 'failed';

export function ModelLoader() {
  const modelStatus = useDetectionStore((s) => s.modelStatus);
  const modelType = useSettingsStore((s) => s.modelType);
  const setModelType = useSettingsStore((s) => s.setModelType);

  const ollamaEnabled = useSettingsStore((s) => s.ollamaEnabled);
  const setOllamaEnabled = useSettingsStore((s) => s.setOllamaEnabled);
  const ollamaEndpoint = useSettingsStore((s) => s.ollamaEndpoint);
  const setOllamaEndpoint = useSettingsStore((s) => s.setOllamaEndpoint);
  const ollamaModel = useSettingsStore((s) => s.ollamaModel);
  const setOllamaModel = useSettingsStore((s) => s.setOllamaModel);

  const [ollamaStatus, setOllamaStatus] =
    useState<OllamaConnectionStatus>('idle');
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  async function handleCheckOllamaConnection() {
    setOllamaStatus('checking');
    const connected = await checkOllamaConnection(ollamaEndpoint);
    if (connected) {
      setOllamaStatus('connected');
      const models = await getOllamaModels(ollamaEndpoint);
      setAvailableModels(models);
      if (models.length > 0 && !models.includes(ollamaModel)) {
        setOllamaModel(models[0]!);
      }
    } else {
      setOllamaStatus('failed');
      setAvailableModels([]);
    }
  }

  const ollamaStatusBadge = {
    idle: null,
    checking: (
      <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
        확인 중...
      </span>
    ),
    connected: (
      <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
        연결됨
      </span>
    ),
    failed: (
      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-400">
        연결 안 됨
      </span>
    ),
  }[ollamaStatus];

  const ollamaSettings = (
    <div className="border-border bg-card rounded-lg border p-3">
      <div className="mb-2 flex items-center justify-between">
        <label className="text-muted-foreground text-xs font-medium">
          로컬 AI (Ollama)
        </label>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={ollamaEnabled}
            onChange={(e) => setOllamaEnabled(e.target.checked)}
            className="peer sr-only"
          />
          <div className="bg-muted peer h-4 w-8 rounded-full transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-3 after:w-3 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-violet-500 peer-checked:after:translate-x-4" />
        </label>
      </div>

      {ollamaEnabled && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-muted-foreground text-xs">
              Ollama 서버 주소
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={ollamaEndpoint}
                onChange={(e) => {
                  setOllamaEndpoint(e.target.value);
                  setOllamaStatus('idle');
                  setAvailableModels([]);
                }}
                placeholder="http://localhost:11434"
                className="bg-background border-border text-foreground focus:ring-ring min-w-0 flex-1 rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-1"
              />
              <button
                type="button"
                onClick={handleCheckOllamaConnection}
                disabled={ollamaStatus === 'checking'}
                className="rounded-md bg-violet-500/10 px-2 py-1 text-xs text-violet-400 transition-colors hover:bg-violet-500/20 disabled:opacity-50"
              >
                연결 확인
              </button>
            </div>
          </div>

          {ollamaStatusBadge && (
            <div className="flex items-center gap-1.5">{ollamaStatusBadge}</div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-muted-foreground text-xs">
              Vision 모델명 (예: qwen3-vl:8b, llava)
            </label>
            {ollamaStatus === 'connected' && availableModels.length > 0 ? (
              <select
                value={ollamaModel}
                onChange={(e) => setOllamaModel(e.target.value)}
                className="bg-background border-border text-foreground focus:ring-ring w-full rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-1"
              >
                {availableModels.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={ollamaModel}
                onChange={(e) => setOllamaModel(e.target.value)}
                placeholder="qwen3-vl:8b"
                className="bg-background border-border text-foreground focus:ring-ring w-full rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-1"
              />
            )}
          </div>

          <div className="text-muted-foreground flex flex-col gap-0.5 text-xs">
            <p>
              이미지 분석 탭에서 &quot;AI 상세 분석&quot; 버튼이 활성화됩니다.
            </p>
            <p>
              Ollama 설치:{' '}
              <code className="bg-muted rounded px-1 py-0.5 text-[10px]">
                ollama pull qwen3-vl:8b
              </code>
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const selectedOption = MODEL_OPTIONS.find((o) => o.value === modelType) ?? {
    value: 'mediapipe-lite0' as ModelType,
    label: 'MediaPipe Lite0 (균형)',
    description: 'EfficientDet Lite0 · 빠른 속도',
  };

  const modelSelector = (
    <div
      className={cn(
        'border-border bg-card rounded-lg border p-3',
        ollamaEnabled && 'opacity-50',
      )}
    >
      <label className="text-muted-foreground mb-2 block text-xs font-medium">
        브라우저 AI 모델 선택
      </label>
      <select
        value={modelType}
        onChange={(e) => setModelType(e.target.value as ModelType)}
        disabled={ollamaEnabled}
        className="bg-background border-border text-foreground focus:ring-ring w-full rounded-md border px-3 py-1.5 text-sm focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {MODEL_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <p className="text-muted-foreground mt-1.5 text-xs">
        {ollamaEnabled
          ? '로컬 AI 활성화 중 — 브라우저 모델 비활성화됨'
          : selectedOption.description}
      </p>
    </div>
  );

  if (modelStatus === 'idle')
    return (
      <div className="flex flex-col gap-2">
        {modelSelector}
        {ollamaSettings}
      </div>
    );

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
        {ollamaSettings}
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
        {ollamaSettings}
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
      {ollamaSettings}
    </div>
  );
}
