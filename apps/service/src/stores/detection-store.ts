'use client';

import { create } from 'zustand';
import type { Detection } from '@ai-media-studio/media-utils';

interface TrackedFace {
  trackingId: string;
  bbox: { x: number; y: number; width: number; height: number };
  age: number;
  smoothedAge: number;
  gender: 'male' | 'female';
  smoothedGender: 'male' | 'female';
  genderProbability: number;
  isLooking: boolean;
  presenceTime: number;
  gazeTime: number;
}

type ModelStatus = 'idle' | 'loading' | 'ready' | 'error';
type WebcamStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'error';
type StatsMode = 'unique' | 'per-second' | 'current-frame';
type DashboardTab = 'realtime' | 'image-analysis' | 'statistics' | 'pdf';

interface PerformanceMetrics {
  fps: number;
  inferenceTime: number;
}

interface ImageAnalysisResult {
  id: string;
  file: File;
  imageUrl: string;
  detections: Detection[];
  inferenceTime: number;
  analyzedAt: number;
}

interface DetectionState {
  // 기존 상태
  modelStatus: ModelStatus;
  webcamStatus: WebcamStatus;
  detections: Detection[];
  isDetecting: boolean;
  performance: PerformanceMetrics;
  detectionCounts: Record<string, number>;

  // 새로 추가
  statsMode: StatsMode;
  dashboardTab: DashboardTab;
  previousDetections: Detection[];
  uniqueDetectionCounts: Record<string, number>;
  perSecondCounts: Record<string, number>;
  imageAnalysisResults: ImageAnalysisResult[];
  faceAnalysisResults: TrackedFace[];

  // 기존 액션
  setModelStatus: (status: ModelStatus) => void;
  setWebcamStatus: (status: WebcamStatus) => void;
  setDetections: (detections: Detection[]) => void;
  setIsDetecting: (value: boolean) => void;
  updatePerformance: (metrics: Partial<PerformanceMetrics>) => void;
  incrementDetectionCounts: (detections: Detection[]) => void;
  reset: () => void;

  // 새 액션
  setStatsMode: (mode: StatsMode) => void;
  setDashboardTab: (tab: DashboardTab) => void;
  updateUniqueDetections: (detections: Detection[]) => void;
  updatePerSecondCounts: (detections: Detection[]) => void;
  addImageAnalysisResult: (result: ImageAnalysisResult) => void;
  removeImageAnalysisResult: (id: string) => void;
  clearImageAnalysisResults: () => void;
  setFaceAnalysisResults: (faces: TrackedFace[]) => void;
}

const initialState = {
  modelStatus: 'idle' as ModelStatus,
  webcamStatus: 'idle' as WebcamStatus,
  detections: [] as Detection[],
  isDetecting: false,
  performance: { fps: 0, inferenceTime: 0 },
  detectionCounts: {} as Record<string, number>,
  statsMode: 'unique' as StatsMode,
  dashboardTab: 'realtime' as DashboardTab,
  previousDetections: [] as Detection[],
  uniqueDetectionCounts: {} as Record<string, number>,
  perSecondCounts: {} as Record<string, number>,
  imageAnalysisResults: [] as ImageAnalysisResult[],
  faceAnalysisResults: [] as TrackedFace[],
};

export const useDetectionStore = create<DetectionState>((set) => ({
  ...initialState,

  setModelStatus: (modelStatus) => set({ modelStatus }),
  setWebcamStatus: (webcamStatus) => set({ webcamStatus }),
  setDetections: (detections) =>
    set((state) => ({
      previousDetections: state.detections,
      detections,
    })),
  setIsDetecting: (isDetecting) => set({ isDetecting }),
  updatePerformance: (metrics) =>
    set((state) => ({
      performance: { ...state.performance, ...metrics },
    })),

  // 기존 incrementDetectionCounts는 매 프레임 호출되므로 current-frame 모드용으로 유지
  incrementDetectionCounts: (detections) =>
    set((state) => {
      const counts = { ...state.detectionCounts };
      for (const d of detections) {
        counts[d.class] = (counts[d.class] ?? 0) + 1;
      }
      return { detectionCounts: counts };
    }),

  // unique: 이전 프레임에 없던 새 객체만 카운트
  updateUniqueDetections: (detections) =>
    set((state) => {
      const prevClasses = new Set(state.previousDetections.map((d) => d.class));
      const counts = { ...state.uniqueDetectionCounts };
      for (const d of detections) {
        if (!prevClasses.has(d.class)) {
          counts[d.class] = (counts[d.class] ?? 0) + 1;
        }
      }
      return { uniqueDetectionCounts: counts };
    }),

  // per-second: 1초마다 리셋되는 카운트 (외부에서 interval로 리셋)
  updatePerSecondCounts: (detections) =>
    set(() => {
      const counts: Record<string, number> = {};
      for (const d of detections) {
        counts[d.class] = (counts[d.class] ?? 0) + 1;
      }
      return { perSecondCounts: counts };
    }),

  setStatsMode: (statsMode) => set({ statsMode }),
  setDashboardTab: (dashboardTab) => set({ dashboardTab }),

  addImageAnalysisResult: (result) =>
    set((state) => ({
      imageAnalysisResults: [...state.imageAnalysisResults, result],
    })),
  removeImageAnalysisResult: (id) =>
    set((state) => {
      const target = state.imageAnalysisResults.find((r) => r.id === id);
      if (target) {
        URL.revokeObjectURL(target.imageUrl);
      }
      return {
        imageAnalysisResults: state.imageAnalysisResults.filter(
          (r) => r.id !== id,
        ),
      };
    }),
  clearImageAnalysisResults: () =>
    set((state) => {
      state.imageAnalysisResults.forEach((r) =>
        URL.revokeObjectURL(r.imageUrl),
      );
      return { imageAnalysisResults: [] };
    }),

  setFaceAnalysisResults: (faceAnalysisResults) => set({ faceAnalysisResults }),

  reset: () => set(initialState),
}));

export type {
  ModelStatus,
  WebcamStatus,
  PerformanceMetrics,
  DetectionState,
  StatsMode,
  DashboardTab,
  ImageAnalysisResult,
  TrackedFace,
};
