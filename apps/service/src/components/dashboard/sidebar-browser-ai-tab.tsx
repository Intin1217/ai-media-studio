'use client';

import { Slider } from '@ai-media-studio/ui';
import { useSettingsStore } from '@/stores/settings-store';
import type { ModelType } from '@/stores/settings-store';

const MODEL_OPTIONS: { value: ModelType; label: string }[] = [
  { value: 'coco-ssd', label: 'COCO-SSD (경량)' },
  { value: 'mediapipe-lite0', label: 'MediaPipe Lite0 (균형)' },
  { value: 'mediapipe-lite2', label: 'MediaPipe Lite2 (정확)' },
];

export function SidebarBrowserAiTab() {
  const modelType = useSettingsStore((s) => s.modelType);
  const setModelType = useSettingsStore((s) => s.setModelType);
  const confidenceThreshold = useSettingsStore((s) => s.confidenceThreshold);
  const setConfidenceThreshold = useSettingsStore(
    (s) => s.setConfidenceThreshold,
  );
  const faceAnalysisEnabled = useSettingsStore((s) => s.faceAnalysisEnabled);
  const setFaceAnalysisEnabled = useSettingsStore(
    (s) => s.setFaceAnalysisEnabled,
  );
  const ollamaEnabled = useSettingsStore((s) => s.ollamaEnabled);

  return (
    <div className="flex flex-col gap-3 px-1">
      {/* 감지 모델 선택 */}
      <div className="flex flex-col gap-1">
        <label
          htmlFor="browser-ai-model"
          className="text-muted-foreground text-xs"
        >
          감지 모델
        </label>
        <select
          id="browser-ai-model"
          value={modelType}
          onChange={(e) => setModelType(e.target.value as ModelType)}
          disabled={ollamaEnabled}
          className="bg-background border-border text-foreground focus:ring-ring w-full rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {MODEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {ollamaEnabled && (
          <p className="text-muted-foreground text-xs">
            로컬 AI 활성화 시 브라우저 모델이 비활성화됩니다
          </p>
        )}
      </div>

      {/* 인식률 필터 */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-muted-foreground text-xs">인식률 필터</label>
          <span className="text-foreground font-mono text-xs">
            {Math.round(confidenceThreshold * 100)}%
          </span>
        </div>
        <Slider
          min={0}
          max={100}
          step={5}
          value={Math.round(confidenceThreshold * 100)}
          onValueChange={(v) => setConfidenceThreshold(v / 100)}
        />
      </div>

      {/* 얼굴 분석 토글 */}
      <div className="flex items-center justify-between">
        <span className="text-foreground text-xs">얼굴 분석</span>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={faceAnalysisEnabled}
            onChange={(e) => setFaceAnalysisEnabled(e.target.checked)}
            className="peer sr-only"
            aria-label="얼굴 분석 활성화"
          />
          <div className="bg-secondary peer h-4 w-8 rounded-full transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-3 after:w-3 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-4" />
        </label>
      </div>
    </div>
  );
}
