'use client';

import { create } from 'zustand';
import type { Detection } from '@ai-media-studio/media-utils';

type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';
type WebcamStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'error';

interface PerformanceMetrics {
  fps: number;
  inferenceTime: number;
}

interface DetectionState {
  modelStatus: ModelStatus;
  webcamStatus: WebcamStatus;
  detections: Detection[];
  isDetecting: boolean;
  performance: PerformanceMetrics;
  detectionCounts: Record<string, number>;

  setModelStatus: (status: ModelStatus) => void;
  setWebcamStatus: (status: WebcamStatus) => void;
  setDetections: (detections: Detection[]) => void;
  setIsDetecting: (value: boolean) => void;
  updatePerformance: (metrics: Partial<PerformanceMetrics>) => void;
  incrementDetectionCounts: (detections: Detection[]) => void;
  reset: () => void;
}

const initialState = {
  modelStatus: 'idle' as ModelStatus,
  webcamStatus: 'idle' as WebcamStatus,
  detections: [] as Detection[],
  isDetecting: false,
  performance: { fps: 0, inferenceTime: 0 },
  detectionCounts: {} as Record<string, number>,
};

export const useDetectionStore = create<DetectionState>((set) => ({
  ...initialState,

  setModelStatus: (modelStatus) => set({ modelStatus }),
  setWebcamStatus: (webcamStatus) => set({ webcamStatus }),
  setDetections: (detections) => set({ detections }),
  setIsDetecting: (isDetecting) => set({ isDetecting }),
  updatePerformance: (metrics) =>
    set((state) => ({
      performance: { ...state.performance, ...metrics },
    })),
  incrementDetectionCounts: (detections) =>
    set((state) => {
      const counts = { ...state.detectionCounts };
      for (const d of detections) {
        counts[d.class] = (counts[d.class] ?? 0) + 1;
      }
      return { detectionCounts: counts };
    }),
  reset: () => set(initialState),
}));

export type { ModelStatus, WebcamStatus, PerformanceMetrics, DetectionState };
