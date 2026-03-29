'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  confidenceThreshold: number;
  bboxColors: Record<string, string>;
  setConfidenceThreshold: (value: number) => void;
  setBboxColor: (className: string, color: string) => void;
  resetBboxColors: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      confidenceThreshold: 0.5,
      bboxColors: {},
      setConfidenceThreshold: (confidenceThreshold) =>
        set({ confidenceThreshold }),
      setBboxColor: (className, color) =>
        set((state) => ({
          bboxColors: { ...state.bboxColors, [className]: color },
        })),
      resetBboxColors: () => set({ bboxColors: {} }),
    }),
    { name: 'ams-settings' },
  ),
);
