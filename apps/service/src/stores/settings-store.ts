'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { validateOllamaUrl } from '@/lib/ollama-client';

export type ModelType = 'coco-ssd' | 'mediapipe-lite0' | 'mediapipe-lite2';

interface SettingsState {
  confidenceThreshold: number;
  bboxColors: Record<string, string>;
  modelType: ModelType;
  ollamaEndpoint: string;
  ollamaModel: string;
  ollamaEnabled: boolean;
  ollamaCustomPrompt: string;
  ollamaPromptMode: 'all' | 'per-image';
  faceAnalysisEnabled: boolean;
  setConfidenceThreshold: (value: number) => void;
  setBboxColor: (className: string, color: string) => void;
  resetBboxColors: () => void;
  setModelType: (type: ModelType) => void;
  setOllamaEndpoint: (url: string) => void;
  setOllamaModel: (model: string) => void;
  setOllamaEnabled: (enabled: boolean) => void;
  setOllamaCustomPrompt: (prompt: string) => void;
  setOllamaPromptMode: (mode: 'all' | 'per-image') => void;
  setFaceAnalysisEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      confidenceThreshold: 0.5,
      bboxColors: {},
      modelType: 'mediapipe-lite0',
      ollamaEndpoint: 'http://localhost:11434',
      ollamaModel: 'qwen3-vl:8b',
      ollamaEnabled: false,
      ollamaCustomPrompt:
        '이 이미지에서 보이는 모든 객체와 장면을 한국어로 자세히 설명해주세요.',
      ollamaPromptMode: 'all',
      faceAnalysisEnabled: false,
      setConfidenceThreshold: (confidenceThreshold) =>
        set({ confidenceThreshold }),
      setBboxColor: (className, color) =>
        set((state) => ({
          bboxColors: { ...state.bboxColors, [className]: color },
        })),
      resetBboxColors: () => set({ bboxColors: {} }),
      setModelType: (modelType) => set({ modelType }),
      setOllamaEndpoint: (url) => {
        try {
          new URL(url);
          // 완전한 URL이면 보안 검증 후 저장
          if (validateOllamaUrl(url)) {
            set({ ollamaEndpoint: url });
          }
          // 유효하지 않은 완전한 URL은 저장하지 않음
        } catch {
          // URL parse 실패 = 아직 타이핑 중 → 저장 허용
          set({ ollamaEndpoint: url });
        }
      },
      setOllamaModel: (ollamaModel) => set({ ollamaModel }),
      setOllamaEnabled: (ollamaEnabled) => set({ ollamaEnabled }),
      setOllamaCustomPrompt: (ollamaCustomPrompt) =>
        set({ ollamaCustomPrompt }),
      setOllamaPromptMode: (ollamaPromptMode) => set({ ollamaPromptMode }),
      setFaceAnalysisEnabled: (faceAnalysisEnabled) =>
        set({ faceAnalysisEnabled }),
    }),
    { name: 'ams-settings' },
  ),
);
