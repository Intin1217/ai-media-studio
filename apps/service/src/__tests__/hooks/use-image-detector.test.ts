import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';

const mockDetect = vi
  .fn()
  .mockResolvedValue([{ class: 'cat', score: 0.85, bbox: [0, 0, 50, 50] }]);

vi.mock('@/hooks/use-model', () => ({
  useModel: () => ({
    model: { current: { detect: mockDetect } },
    loadModel: vi.fn().mockResolvedValue({ detect: mockDetect }),
    modelStatus: 'ready',
  }),
}));

const mockAddImageAnalysisResult = vi.fn();

// useDetectionStore는 selector 함수를 인자로 받아 선택된 값을 반환
vi.mock('@/stores/detection-store', () => ({
  useDetectionStore: vi.fn((selector: (s: unknown) => unknown) => {
    const fakeStore = {
      addImageAnalysisResult: mockAddImageAnalysisResult,
    };
    return selector(fakeStore);
  }),
}));

vi.mock('@/stores/settings-store', () => ({
  useSettingsStore: Object.assign(
    vi.fn(() => ({})),
    {
      getState: vi.fn(() => ({ confidenceThreshold: 0.75 })),
    },
  ),
}));

// Image를 동기적으로 onload를 트리거하도록 mock
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = 100;
  naturalHeight = 100;
  private _src = '';

  get src() {
    return this._src;
  }

  set src(value: string) {
    this._src = value;
    Promise.resolve().then(() => {
      if (this.onload) this.onload();
    });
  }
}

describe('use-image-detector', () => {
  let originalImage: typeof Image;

  beforeEach(() => {
    vi.clearAllMocks();
    originalImage = globalThis.Image;
    globalThis.Image = MockImage as unknown as typeof Image;
    vi.spyOn(URL, 'createObjectURL').mockReturnValue(
      'blob:http://localhost/test',
    );
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  });

  afterEach(() => {
    globalThis.Image = originalImage;
    vi.restoreAllMocks();
  });

  it('analyzeImage가 confidenceThreshold를 detect()에 전달한다', async () => {
    const { useImageDetector } = await import('@/hooks/use-image-detector');
    const { result } = renderHook(() => useImageDetector());

    const mockFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    await result.current.analyzeImage(mockFile);

    expect(mockDetect).toHaveBeenCalledWith(expect.any(MockImage), 20, 0.75);
  });

  it('analyzeImage가 ImageAnalysisResult를 반환하고 store에 추가한다', async () => {
    const { useImageDetector } = await import('@/hooks/use-image-detector');
    const { result } = renderHook(() => useImageDetector());

    const mockFile = new File(['content'], 'photo.jpg', { type: 'image/jpeg' });
    const analysisResult = await result.current.analyzeImage(mockFile);

    expect(analysisResult).not.toBeNull();
    expect(analysisResult?.detections).toHaveLength(1);
    expect(analysisResult?.detections[0].class).toBe('cat');
    expect(mockAddImageAnalysisResult).toHaveBeenCalledTimes(1);
  });
});
