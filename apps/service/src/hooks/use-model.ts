'use client';

import { useCallback, useRef } from 'react';
import { useDetectionStore } from '@/stores/detection-store';

type CocoSsdModel = {
  detect: (
    input: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
  ) => Promise<
    Array<{
      class: string;
      score: number;
      bbox: [number, number, number, number];
    }>
  >;
};

// 모듈 레벨 싱글톤 — 여러 hook 인스턴스가 같은 모델 공유
let globalModel: CocoSsdModel | null = null;
let loadingPromise: Promise<CocoSsdModel> | null = null;

export function useModel() {
  const modelRef = useRef<CocoSsdModel | null>(globalModel);
  const { setModelStatus, modelStatus } = useDetectionStore();

  const loadModel = useCallback(async (): Promise<CocoSsdModel | null> => {
    // 이미 로드된 경우
    if (globalModel) {
      modelRef.current = globalModel;
      setModelStatus('ready');
      return globalModel;
    }

    // 이미 로딩 중인 경우 — 기존 Promise 재사용
    if (loadingPromise) {
      try {
        const model = await loadingPromise;
        modelRef.current = model;
        return model;
      } catch {
        return null;
      }
    }

    // 새로 로딩
    try {
      setModelStatus('loading');
      loadingPromise = (async () => {
        await import('@tensorflow/tfjs-backend-webgl');
        const tf = await import('@tensorflow/tfjs-core');
        await tf.ready();
        const cocoSsd = await import('@tensorflow-models/coco-ssd');
        const model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
        return model as CocoSsdModel;
      })();

      const model = await loadingPromise;
      globalModel = model;
      modelRef.current = model;
      setModelStatus('ready');
      return model;
    } catch {
      loadingPromise = null;
      setModelStatus('error');
      return null;
    }
  }, [setModelStatus]);

  return { model: modelRef, loadModel, modelStatus };
}

export type { CocoSsdModel };
