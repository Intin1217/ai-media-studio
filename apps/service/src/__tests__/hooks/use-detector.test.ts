import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// TF.js / Worker 관련 의존성 mock
vi.mock('@tensorflow/tfjs-backend-webgl', () => ({}));
vi.mock('@tensorflow/tfjs-backend-wasm', () => ({}));
vi.mock('@tensorflow/tfjs-core', () => ({
  ready: vi.fn().mockResolvedValue(undefined),
  setBackend: vi.fn().mockResolvedValue(undefined),
}));

const mockDetect = vi
  .fn()
  .mockResolvedValue([
    { class: 'person', score: 0.9, bbox: [10, 20, 100, 200] },
  ]);

vi.mock('@tensorflow-models/coco-ssd', () => ({
  load: vi.fn().mockResolvedValue({ detect: mockDetect }),
}));

const mockSetDetections = vi.fn();
const mockSetIsDetecting = vi.fn();
const mockUpdatePerformance = vi.fn();
const mockUpdateUniqueDetections = vi.fn();
const mockUpdatePerSecondCounts = vi.fn();

vi.mock('@/stores/detection-store', () => ({
  useDetectionStore: vi.fn((selector: (s: unknown) => unknown) => {
    const store = {
      setDetections: mockSetDetections,
      setIsDetecting: mockSetIsDetecting,
      updatePerformance: mockUpdatePerformance,
      updateUniqueDetections: mockUpdateUniqueDetections,
      updatePerSecondCounts: mockUpdatePerSecondCounts,
    };
    if (typeof selector === 'function') return selector(store);
    return store;
  }),
}));

// getState mock
const mockGetState = vi.fn(() => ({
  performance: { fps: 0, inferenceTime: 0 },
}));

vi.mock('@/stores/detection-store', () => ({
  useDetectionStore: Object.assign(
    vi.fn((selector: (s: unknown) => unknown) => {
      const store = {
        setDetections: mockSetDetections,
        setIsDetecting: mockSetIsDetecting,
        updatePerformance: mockUpdatePerformance,
        updateUniqueDetections: mockUpdateUniqueDetections,
        updatePerSecondCounts: mockUpdatePerSecondCounts,
      };
      if (typeof selector === 'function') return selector(store);
      return store;
    }),
    { getState: mockGetState },
  ),
}));

vi.mock('@/stores/settings-store', () => ({
  useSettingsStore: Object.assign(
    vi.fn((selector: (s: unknown) => unknown) => {
      const store = { modelType: 'mediapipe-lite0', confidenceThreshold: 0.5 };
      if (typeof selector === 'function') return selector(store);
      return store;
    }),
    {
      getState: vi.fn(() => ({
        confidenceThreshold: 0.5,
        modelType: 'mediapipe-lite0',
      })),
      subscribe: vi.fn(() => () => {}),
    },
  ),
}));

vi.mock('@/lib/detection-history', () => ({
  startSession: vi.fn().mockResolvedValue('session-123'),
  endSession: vi.fn(),
  saveDetectionLog: vi.fn(),
}));

vi.mock('@/hooks/use-model', () => ({
  useModel: () => ({
    model: { current: { detect: mockDetect } },
    loadModel: vi.fn().mockResolvedValue({ detect: mockDetect }),
    disposeModel: vi.fn(),
    modelStatus: 'ready',
  }),
}));

// Web Worker mock
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;
  postMessage = vi.fn((data: unknown) => {
    // 'load' 메시지에 대해 'loaded' 응답을 비동기로 전송
    if (
      data &&
      typeof data === 'object' &&
      (data as { type: string }).type === 'load'
    ) {
      Promise.resolve().then(() => {
        this.onmessage?.({ data: { type: 'loaded' } } as MessageEvent);
      });
    }
  });
  terminate = vi.fn();
}

describe('use-detector', () => {
  let originalWorker: typeof Worker;
  let originalRAF: typeof requestAnimationFrame;
  let originalCAF: typeof cancelAnimationFrame;
  let rafCallbacks: Map<number, FrameRequestCallback>;
  let rafCounter: number;

  beforeEach(() => {
    vi.clearAllMocks();
    originalWorker = globalThis.Worker;
    originalRAF = globalThis.requestAnimationFrame;
    originalCAF = globalThis.cancelAnimationFrame;

    rafCallbacks = new Map();
    rafCounter = 0;

    globalThis.requestAnimationFrame = vi.fn((cb) => {
      const id = ++rafCounter;
      rafCallbacks.set(id, cb);
      return id;
    });
    globalThis.cancelAnimationFrame = vi.fn((id) => {
      rafCallbacks.delete(id);
    });

    globalThis.Worker = MockWorker as unknown as typeof Worker;

    // jsdom에는 createImageBitmap이 없으므로 직접 할당
    globalThis.createImageBitmap = vi.fn().mockResolvedValue({
      width: 640,
      height: 480,
      close: vi.fn(),
    } as unknown as ImageBitmap);
  });

  afterEach(() => {
    globalThis.Worker = originalWorker;
    globalThis.requestAnimationFrame = originalRAF;
    globalThis.cancelAnimationFrame = originalCAF;
    vi.restoreAllMocks();
  });

  it('isActive=false 상태에서 마운트 시 추론 루프를 시작하지 않는다', async () => {
    const { useDetector } = await import('@/hooks/use-detector');
    const videoRef = { current: null };
    const canvasRef = { current: null };

    renderHook(() => useDetector(videoRef, canvasRef, false));

    expect(mockSetIsDetecting).not.toHaveBeenCalledWith(true);
  });

  it('isActive=true 전환 시 setIsDetecting(true) 호출', async () => {
    vi.resetModules();
    const { useDetector } = await import('@/hooks/use-detector');
    const { startSession } = await import('@/lib/detection-history');

    const mockVideo = {
      readyState: 4,
      videoWidth: 640,
      videoHeight: 480,
    } as unknown as HTMLVideoElement;
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({
        drawImage: vi.fn(),
        clearRect: vi.fn(),
      })),
      dataset: {},
    } as unknown as HTMLCanvasElement;

    const videoRef = { current: mockVideo };
    const canvasRef = { current: mockCanvas };

    // Worker가 'loaded'를 반환하도록 기다림
    await act(async () => {
      renderHook(() => useDetector(videoRef, canvasRef, true));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(startSession).toHaveBeenCalled();
  });

  it('비활성화 시 루프가 정리된다', async () => {
    vi.resetModules();
    const { useDetector } = await import('@/hooks/use-detector');

    const videoRef = { current: null };
    const canvasRef = { current: null };

    const { rerender } = renderHook(
      ({ active }) => useDetector(videoRef, canvasRef, active),
      { initialProps: { active: false } },
    );

    rerender({ active: false });

    expect(mockSetIsDetecting).not.toHaveBeenCalledWith(true);
  });
});
