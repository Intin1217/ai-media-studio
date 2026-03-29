import { describe, it, expect, beforeEach } from 'vitest';
import { useDetectionStore } from '@/stores/detection-store';

describe('useDetectionStore', () => {
  beforeEach(() => {
    useDetectionStore.getState().reset();
  });

  it('초기 상태가 올바름', () => {
    const state = useDetectionStore.getState();
    expect(state.modelStatus).toBe('idle');
    expect(state.webcamStatus).toBe('idle');
    expect(state.detections).toEqual([]);
    expect(state.isDetecting).toBe(false);
  });

  it('setModelStatus로 상태 변경', () => {
    useDetectionStore.getState().setModelStatus('loading');
    expect(useDetectionStore.getState().modelStatus).toBe('loading');
  });

  it('incrementDetectionCounts 누적 카운트', () => {
    const { incrementDetectionCounts } = useDetectionStore.getState();
    incrementDetectionCounts([
      {
        class: 'person',
        score: 0.9,
        bbox: { x: 0, y: 0, width: 1, height: 1 },
      },
      {
        class: 'person',
        score: 0.8,
        bbox: { x: 0, y: 0, width: 1, height: 1 },
      },
      { class: 'car', score: 0.7, bbox: { x: 0, y: 0, width: 1, height: 1 } },
    ]);
    expect(useDetectionStore.getState().detectionCounts).toEqual({
      person: 2,
      car: 1,
    });
  });

  it('reset으로 초기 상태 복원', () => {
    useDetectionStore.getState().setModelStatus('ready');
    useDetectionStore.getState().setIsDetecting(true);
    useDetectionStore.getState().reset();
    expect(useDetectionStore.getState().modelStatus).toBe('idle');
    expect(useDetectionStore.getState().isDetecting).toBe(false);
  });
});
