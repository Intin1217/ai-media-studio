'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ModelType = 'coco-ssd' | 'mediapipe-lite0' | 'mediapipe-lite2';

interface SettingsState {
  confidenceThreshold: number;
  bboxColors: Record<string, string>;
  modelType: ModelType;
  setConfidenceThreshold: (value: number) => void;
  setBboxColor: (className: string, color: string) => void;
  resetBboxColors: () => void;
  setModelType: (type: ModelType) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      confidenceThreshold: 0.5,
      bboxColors: {},
      modelType: 'mediapipe-lite0',
      setConfidenceThreshold: (confidenceThreshold) =>
        set({ confidenceThreshold }),
      setBboxColor: (className, color) =>
        set((state) => ({
          bboxColors: { ...state.bboxColors, [className]: color },
        })),
      resetBboxColors: () => set({ bboxColors: {} }),
      setModelType: (modelType) => set({ modelType }),
    }),
    { name: 'ams-settings' },
  ),
);
