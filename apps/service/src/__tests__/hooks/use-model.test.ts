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

const mockMediaPipeDetect = vi.fn().mockReturnValue({
  detections: [
    {
      categories: [{ categoryName: 'person', score: 0.9 }],
      boundingBox: { originX: 10, originY: 20, width: 100, height: 200 },
    },
  ],
});
const mockMediaPipeDetector = {
  detectForVideo: mockMediaPipeDetect,
  close: vi.fn(),
};
const mockCreateFromOptions = vi.fn().mockResolvedValue(mockMediaPipeDetector);

vi.mock('@mediapipe/tasks-vision', () => ({
  ObjectDetector: {
    createFromOptions: mockCreateFromOptions,
  },
  FilesetResolver: {
    forVisionTasks: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock('@/stores/detection-store', () => ({
  useDetectionStore: vi.fn(() => ({
    setModelStatus: vi.fn(),
    modelStatus: 'idle',
  })),
}));

vi.mock('@/stores/settings-store', () => ({
  useSettingsStore: Object.assign(
    vi.fn(() => ({ modelType: 'coco-ssd' })),
    {
      getState: vi.fn(() => ({ modelType: 'coco-ssd' })),
      subscribe: vi.fn(() => () => {}),
    },
  ),
}));

describe('use-model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('coco-ssd: mobilenet_v2 base로 모델을 로드한다', async () => {
    const { useSettingsStore } = await import('@/stores/settings-store');
    vi.mocked(useSettingsStore.getState).mockReturnValue({
      modelType: 'coco-ssd',
      confidenceThreshold: 0.5,
      bboxColors: {},
      setConfidenceThreshold: vi.fn(),
      setBboxColor: vi.fn(),
      resetBboxColors: vi.fn(),
      setModelType: vi.fn(),
    });

    const { useModel } = await import('@/hooks/use-model');
    const { renderHook } = await import('@testing-library/react');

    const { result } = renderHook(() => useModel());
    await result.current.loadModel();

    expect(mockLoad).toHaveBeenCalledWith({ base: 'mobilenet_v2' });
  });

  it('coco-ssd: 두 번 호출해도 모델을 한 번만 로드한다', async () => {
    const { useSettingsStore } = await import('@/stores/settings-store');
    vi.mocked(useSettingsStore.getState).mockReturnValue({
      modelType: 'coco-ssd',
      confidenceThreshold: 0.5,
      bboxColors: {},
      setConfidenceThreshold: vi.fn(),
      setBboxColor: vi.fn(),
      resetBboxColors: vi.fn(),
      setModelType: vi.fn(),
    });

    const { useModel } = await import('@/hooks/use-model');
    const { renderHook } = await import('@testing-library/react');

    const { result } = renderHook(() => useModel());
    await result.current.loadModel();
    await result.current.loadModel();

    // 싱글톤이므로 두 번째 호출은 캐시 반환
    expect(mockLoad).toHaveBeenCalledTimes(1);
  });

  it('mediapipe-lite0: ObjectDetector.createFromOptions를 호출한다', async () => {
    const { useSettingsStore } = await import('@/stores/settings-store');
    vi.mocked(useSettingsStore.getState).mockReturnValue({
      modelType: 'mediapipe-lite0',
      confidenceThreshold: 0.5,
      bboxColors: {},
      setConfidenceThreshold: vi.fn(),
      setBboxColor: vi.fn(),
      resetBboxColors: vi.fn(),
      setModelType: vi.fn(),
    });

    const { useModel } = await import('@/hooks/use-model');
    const { renderHook } = await import('@testing-library/react');

    const { result } = renderHook(() => useModel());
    const model = await result.current.loadModel();

    expect(mockCreateFromOptions).toHaveBeenCalledTimes(1);
    expect(model).not.toBeNull();
  });

  it('mediapipe-lite2: lite2 모델 URL로 ObjectDetector를 생성한다', async () => {
    const { useSettingsStore } = await import('@/stores/settings-store');
    vi.mocked(useSettingsStore.getState).mockReturnValue({
      modelType: 'mediapipe-lite2',
      confidenceThreshold: 0.5,
      bboxColors: {},
      setConfidenceThreshold: vi.fn(),
      setBboxColor: vi.fn(),
      resetBboxColors: vi.fn(),
      setModelType: vi.fn(),
    });

    const { useModel } = await import('@/hooks/use-model');
    const { renderHook } = await import('@testing-library/react');

    const { result } = renderHook(() => useModel());
    await result.current.loadModel();

    const callArgs = mockCreateFromOptions.mock.calls[0];
    expect(callArgs[1].baseOptions.modelAssetPath).toContain(
      'efficientdet_lite2',
    );
  });
});
