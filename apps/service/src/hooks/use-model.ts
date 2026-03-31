'use client';

import { useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useDetectionStore } from '@/stores/detection-store';
import { useSettingsStore, type ModelType } from '@/stores/settings-store';

export interface ModelProvider {
  detect(
    input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    maxBoxes?: number,
    threshold?: number,
  ): Promise<
    Array<{
      class: string;
      score: number;
      bbox: [number, number, number, number];
    }>
  >;
  dispose?(): void;
}

// 모델 타입별 싱글톤 캐시
const modelCache: Partial<Record<ModelType, ModelProvider>> = {};
const loadingPromises: Partial<Record<ModelType, Promise<ModelProvider>>> = {};

async function loadCocoSsd(): Promise<ModelProvider> {
  await import('@tensorflow/tfjs-backend-webgl');
  const tf = await import('@tensorflow/tfjs-core');
  await tf.ready();
  const cocoSsd = await import('@tensorflow-models/coco-ssd');
  const model = await cocoSsd.load({ base: 'mobilenet_v2' });
  return model as ModelProvider;
}

const MEDIAPIPE_WASM_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';

const MEDIAPIPE_MODEL_URLS: Record<
  'mediapipe-lite0' | 'mediapipe-lite2',
  string
> = {
  'mediapipe-lite0':
    'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float32/latest/efficientdet_lite0.tflite',
  'mediapipe-lite2':
    'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite2/float32/latest/efficientdet_lite2.tflite',
};

async function loadMediaPipe(
  modelType: 'mediapipe-lite0' | 'mediapipe-lite2',
): Promise<ModelProvider> {
  const { ObjectDetector, FilesetResolver } =
    await import('@mediapipe/tasks-vision');

  const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);

  const detector = await ObjectDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MEDIAPIPE_MODEL_URLS[modelType],
      delegate: 'GPU',
    },
    scoreThreshold: 0.3,
    runningMode: 'VIDEO',
  });

  return {
    detect(
      input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
      maxBoxes = 20,
      threshold = 0.5,
    ) {
      const result = detector.detectForVideo(
        input as HTMLVideoElement,
        performance.now(),
      );
      return Promise.resolve(
        result.detections
          .filter(
            (d) =>
              (d.categories[0]?.score ?? 0) >= threshold &&
              d.boundingBox !== undefined,
          )
          .slice(0, maxBoxes)
          .map((d) => ({
            class: d.categories[0]?.categoryName ?? 'unknown',
            score: d.categories[0]?.score ?? 0,
            bbox: [
              d.boundingBox!.originX,
              d.boundingBox!.originY,
              d.boundingBox!.width,
              d.boundingBox!.height,
            ] as [number, number, number, number],
          })),
      );
    },
    dispose() {
      detector.close();
    },
  };
}

async function loadModelByType(modelType: ModelType): Promise<ModelProvider> {
  // 캐시에 있으면 반환
  const cached = modelCache[modelType];
  if (cached) return cached;

  // 이미 로딩 중이면 기존 Promise 재사용
  const inFlight = loadingPromises[modelType];
  if (inFlight) return inFlight;

  const promise = (async () => {
    let provider: ModelProvider;
    if (modelType === 'coco-ssd') {
      provider = await loadCocoSsd();
    } else {
      provider = await loadMediaPipe(modelType);
    }
    modelCache[modelType] = provider;
    return provider;
  })();

  loadingPromises[modelType] = promise;

  try {
    const model = await promise;
    return model;
  } finally {
    delete loadingPromises[modelType];
  }
}

// 모듈 레벨 함수 — React Compiler가 훅 외부 mutation 검사를 적용하지 않음
export function disposeModelCache(modelType: ModelType): void {
  const cached = modelCache[modelType];
  if (cached?.dispose) {
    cached.dispose();
  }
  delete modelCache[modelType];
}

export function useModel() {
  const modelRef = useRef<ModelProvider | null>(null);
  const setModelStatus = useDetectionStore((s) => s.setModelStatus);
  const modelStatus = useDetectionStore((s) => s.modelStatus);

  const loadModel = useCallback(async (): Promise<ModelProvider | null> => {
    const modelType = useSettingsStore.getState().modelType;

    // 이미 로드된 캐시가 있으면 즉시 반환
    const cached = modelCache[modelType];
    if (cached) {
      modelRef.current = cached;
      setModelStatus('ready');
      return cached;
    }

    try {
      setModelStatus('loading');
      const model = await loadModelByType(modelType);
      modelRef.current = model;
      setModelStatus('ready');
      return model;
    } catch {
      setModelStatus('error');
      toast.error('AI 모델을 불러올 수 없습니다', {
        description: '네트워크 연결을 확인하고 페이지를 새로고침해주세요.',
      });
      return null;
    }
  }, [setModelStatus]);

  return { model: modelRef, loadModel, modelStatus };
}

export type { CocoSsdModel };

// 하위 호환을 위한 타입 alias
type CocoSsdModel = ModelProvider;
