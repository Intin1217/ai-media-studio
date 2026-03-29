'use client';

import { useDetectionStore } from '@/stores/detection-store';

export function usePerformance() {
  const performance = useDetectionStore((s) => s.performance);
  const isDetecting = useDetectionStore((s) => s.isDetecting);

  const getFpsColor = () => {
    if (performance.fps > 20) return 'text-green-400';
    if (performance.fps > 10) return 'text-yellow-400';
    return 'text-red-400';
  };

  return { ...performance, isDetecting, getFpsColor };
}
