import { describe, it, expect, vi, beforeEach } from 'vitest';

// TensorFlow 관련 모듈 mock
vi.mock('@tensorflow/tfjs-backend-webgl', () => ({}));
vi.mock('@tensorflow/tfjs-core', () => ({
  ready: vi.fn().mockResolvedValue(undefined),
}));

const mockDetect = vi
  .fn()
  .mockResolvedValue([
    { class: 'person', score: 0.9, bbox: [10, 20, 100, 200] },
  ]);
const mockLoad = vi.fn().mockResolvedValue({ detect: mockDetect });

vi.mock('@tensorflow-models/coco-ssd', () => ({
  load: mockLoad,
}));

vi.mock('@/stores/detection-store', () => ({
  useDetectionStore: vi.fn(() => ({
    setModelStatus: vi.fn(),
    modelStatus: 'idle',
  })),
}));

describe('use-model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 싱글톤 상태 초기화를 위해 모듈 재임포트
    vi.resetModules();
  });

  it('mobilenet_v2 base로 모델을 로드한다', async () => {
    // 모듈 레벨 싱글톤 초기화를 위해 매 테스트마다 재임포트
    const { useModel } = await import('@/hooks/use-model');
    const { renderHook } = await import('@testing-library/react');

    const { result } = renderHook(() => useModel());
    await result.current.loadModel();

    expect(mockLoad).toHaveBeenCalledWith({ base: 'mobilenet_v2' });
  });

  it('두 번 호출해도 모델을 한 번만 로드한다', async () => {
    const { useModel } = await import('@/hooks/use-model');
    const { renderHook } = await import('@testing-library/react');

    const { result } = renderHook(() => useModel());
    await result.current.loadModel();
    await result.current.loadModel();

    // 싱글톤이므로 두 번째 호출은 캐시 반환
    expect(mockLoad).toHaveBeenCalledTimes(1);
  });
});
