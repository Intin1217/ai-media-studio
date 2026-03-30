'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { Detection } from '@ai-media-studio/media-utils';
import { drawDetections } from '@ai-media-studio/media-utils';
import { useDetectionStore } from '@/stores/detection-store';
import { useSettingsStore } from '@/stores/settings-store';
import { getKoreanLabel } from '@/lib/class-labels';
import {
  saveDetectionLog,
  startSession,
  endSession,
} from '@/lib/detection-history';
import { useModel, disposeModelCache } from './use-model';
import type { ModelType } from '@/stores/settings-store';
import type { DetectionResult } from '@/workers/detection-worker';

function syncCanvasSize(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): void {
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

type WorkerOutMessage =
  | { type: 'loaded' }
  | { type: 'result'; detections: DetectionResult[]; inferenceTime: number }
  | { type: 'error'; message: string };

/**
 * Worker 기반 추론 훅.
 *
 * 1순위: Web Worker + WASM 백엔드로 메인 스레드 분리
 * 2순위: Worker 초기화 실패 시 메인 스레드 폴백 (기존 WebGL 방식)
 *
 * 렌더링 루프(rAF, ~60fps)와 추론 루프는 완전히 분리됩니다.
 * - 렌더링: 비디오 프레임 드로잉 + 바운딩 박스 오버레이
 * - 추론: Worker로 전송 → 결과 수신 → latestDetectionsRef 업데이트
 *
 * showDetectionsRef: VideoControls에서 관리하는 ref. false이면 바운딩 박스를 그리지 않습니다.
 */
export function useDetector(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  isActive: boolean,
  showDetectionsRef: React.MutableRefObject<boolean>,
) {
  const { model: modelRef, loadModel } = useModel();
  const modelType = useSettingsStore((s) => s.modelType);
  const prevModelTypeRef = useRef<ModelType>(modelType);

  const renderRafRef = useRef<number>(0);
  const detectRafRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(0);
  const sessionIdRef = useRef<string | null>(null);
  const lastLogTimeRef = useRef<number>(0);
  const perSecondIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const latestDetectionsRef = useRef<Detection[]>([]);
  const isDetectingRef = useRef<boolean>(false);

  // Worker 관련 refs
  const workerRef = useRef<Worker | null>(null);
  const workerReadyRef = useRef<boolean>(false);
  const workerPendingRef = useRef<boolean>(false);
  const useWorkerRef = useRef<boolean>(false);

  const {
    setDetections,
    setIsDetecting,
    updatePerformance,
    updateUniqueDetections,
    updatePerSecondCounts,
  } = useDetectionStore();

  // 추론 결과 공통 처리 (Worker / 메인 스레드 양쪽에서 사용)
  const handleDetectionResult = useCallback(
    (detections: Detection[], inferenceTime: number) => {
      latestDetectionsRef.current = detections;
      setDetections(detections);

      const logNow = performance.now();
      if (sessionIdRef.current && logNow - lastLogTimeRef.current >= 1000) {
        lastLogTimeRef.current = logNow;
        saveDetectionLog({
          sessionId: sessionIdRef.current,
          timestamp: Date.now(),
          detections: detections.map((d) => ({
            class: d.class,
            score: d.score,
          })),
          fps: useDetectionStore.getState().performance.fps,
          inferenceTime: Math.round(inferenceTime),
        });
      }

      updateUniqueDetections(detections);

      frameCountRef.current++;
      const now = performance.now();
      if (now - lastFpsUpdateRef.current >= 100) {
        const elapsed = (now - lastFpsUpdateRef.current) / 1000;
        const fps = Math.round(frameCountRef.current / elapsed);
        updatePerformance({ fps, inferenceTime: Math.round(inferenceTime) });
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }
    },
    [setDetections, updateUniqueDetections, updatePerformance],
  );

  // 렌더링 루프 — ~60fps
  // showDetectionsRef.current === false 이면 바운딩 박스를 그리지 않습니다.
  const renderLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    syncCanvasSize(canvas, video.videoWidth, video.videoHeight);
    ctx.drawImage(video, 0, 0);

    if (showDetectionsRef.current) {
      drawDetections(ctx, latestDetectionsRef.current, {
        labelFormatter: getKoreanLabel,
      });
    }

    renderRafRef.current = requestAnimationFrame(renderLoop);
  }, [videoRef, canvasRef, showDetectionsRef]);

  // Worker 기반 추론 루프
  const workerDetectLoop = useCallback(async () => {
    if (!isDetectingRef.current) return;

    const video = videoRef.current;
    const worker = workerRef.current;

    if (!video || !worker || video.readyState < 2) {
      detectRafRef.current = requestAnimationFrame(workerDetectLoop);
      return;
    }

    if (workerPendingRef.current) {
      detectRafRef.current = requestAnimationFrame(workerDetectLoop);
      return;
    }

    try {
      workerPendingRef.current = true;
      const threshold = useSettingsStore.getState().confidenceThreshold;
      const bitmap = await createImageBitmap(video);

      worker.postMessage({ type: 'detect', bitmap, maxBoxes: 20, threshold }, [
        bitmap,
      ]);
    } catch {
      workerPendingRef.current = false;
      if (isDetectingRef.current) {
        detectRafRef.current = requestAnimationFrame(workerDetectLoop);
      }
    }
  }, [videoRef]);

  // 메인 스레드 폴백 추론 루프 (Worker 실패 시)
  const mainThreadDetectLoop = useCallback(async () => {
    const video = videoRef.current;
    const model = modelRef.current;

    if (!isDetectingRef.current) return;

    if (!video || !model || video.readyState < 2) {
      detectRafRef.current = requestAnimationFrame(mainThreadDetectLoop);
      return;
    }

    const threshold = useSettingsStore.getState().confidenceThreshold;
    const startTime = performance.now();
    const predictions = await model.detect(video, 20, threshold);
    const inferenceTime = performance.now() - startTime;

    const detections: Detection[] = predictions.map((p) => ({
      class: p.class,
      score: p.score,
      bbox: {
        x: p.bbox[0],
        y: p.bbox[1],
        width: p.bbox[2],
        height: p.bbox[3],
      },
    }));

    handleDetectionResult(detections, inferenceTime);

    if (isDetectingRef.current) {
      detectRafRef.current = requestAnimationFrame(mainThreadDetectLoop);
    }
  }, [videoRef, modelRef, handleDetectionResult]);

  // Worker 초기화 — SSR 안전 guard 포함
  useEffect(() => {
    if (typeof Worker === 'undefined') return;

    const worker = new Worker(
      new URL('../workers/detection-worker.ts', import.meta.url),
    );

    worker.onmessage = (event: MessageEvent<WorkerOutMessage>) => {
      const data = event.data;

      if (data.type === 'loaded') {
        workerReadyRef.current = true;
        useWorkerRef.current = true;
      } else if (data.type === 'result') {
        workerPendingRef.current = false;

        const detections: Detection[] = data.detections.map((d) => ({
          class: d.class,
          score: d.score,
          bbox: d.bbox,
        }));

        handleDetectionResult(detections, data.inferenceTime);

        if (isDetectingRef.current) {
          detectRafRef.current = requestAnimationFrame(workerDetectLoop);
        }
      } else if (data.type === 'error') {
        workerPendingRef.current = false;
        // mediapipe는 Worker 미지원 → 메인 스레드에서 처리
        if (data.message === 'mediapipe-worker-unsupported') {
          useWorkerRef.current = false;
          workerReadyRef.current = false;
          // 메인 스레드에서 MediaPipe 모델 로드
          loadModel();
        } else {
          useWorkerRef.current = false;
          workerReadyRef.current = false;
        }
      }
    };

    worker.onerror = () => {
      useWorkerRef.current = false;
      workerReadyRef.current = false;
    };

    workerRef.current = worker;
    const initialModelType = useSettingsStore.getState().modelType;
    worker.postMessage({ type: 'load', modelType: initialModelType });

    return () => {
      worker.postMessage({ type: 'dispose' });
      worker.terminate();
      workerRef.current = null;
      workerReadyRef.current = false;
      useWorkerRef.current = false;
    };
  }, [handleDetectionResult, workerDetectLoop, loadModel]);

  useEffect(() => {
    loadModel();
  }, [loadModel]);

  // modelType 변경 감지 — 모델 교체 시 이전 모델 dispose 후 재로드
  useEffect(() => {
    const prevModelType = prevModelTypeRef.current;
    if (prevModelType === modelType) return;

    prevModelTypeRef.current = modelType;
    let cancelled = false;

    // 1. 현재 감지 루프 즉시 중단
    isDetectingRef.current = false;
    if (detectRafRef.current) {
      cancelAnimationFrame(detectRafRef.current);
      detectRafRef.current = 0;
    }

    // 2. 이전 모델 dispose
    disposeModelCache(prevModelType);

    // 3. Worker에 새 모델 타입으로 재로드 요청
    const worker = workerRef.current;
    if (worker) {
      workerReadyRef.current = false;
      useWorkerRef.current = false;
      worker.postMessage({ type: 'load', modelType });
    }

    // 4. 메인 스레드 새 모델 로드 완료 후 isActive이면 detectLoop 재시작
    loadModel()
      .then(() => {
        if (cancelled) return;
        if (isActive) {
          isDetectingRef.current = true;
          workerPendingRef.current = false;
          if (workerReadyRef.current) {
            detectRafRef.current = requestAnimationFrame(workerDetectLoop);
          } else {
            detectRafRef.current = requestAnimationFrame(mainThreadDetectLoop);
          }
        }
      })
      .catch(() => {
        // toast는 use-model.ts에서 처리
      });

    return () => {
      cancelled = true;
    };
  }, [modelType, loadModel, isActive, workerDetectLoop, mainThreadDetectLoop]);

  // per-second 카운트 업데이트: 1초 간격
  useEffect(() => {
    if (isActive) {
      perSecondIntervalRef.current = setInterval(() => {
        updatePerSecondCounts(latestDetectionsRef.current);
      }, 1000);
    }

    return () => {
      if (perSecondIntervalRef.current) {
        clearInterval(perSecondIntervalRef.current);
        perSecondIntervalRef.current = null;
      }
    };
  }, [isActive, updatePerSecondCounts]);

  useEffect(() => {
    if (!isActive) {
      isDetectingRef.current = false;

      if (renderRafRef.current) {
        cancelAnimationFrame(renderRafRef.current);
        renderRafRef.current = 0;
      }
      if (detectRafRef.current) {
        cancelAnimationFrame(detectRafRef.current);
        detectRafRef.current = 0;
      }

      if (sessionIdRef.current) {
        endSession(sessionIdRef.current);
        sessionIdRef.current = null;
      }
      setIsDetecting(false);
      return;
    }

    const canStartWorker = workerReadyRef.current;
    const canStartMainThread = !!modelRef.current;

    if (!canStartWorker && !canStartMainThread) return;

    isDetectingRef.current = true;
    setIsDetecting(true);
    lastFpsUpdateRef.current = performance.now();
    frameCountRef.current = 0;
    workerPendingRef.current = false;

    startSession().then((id) => {
      sessionIdRef.current = id;
    });

    renderRafRef.current = requestAnimationFrame(renderLoop);

    if (canStartWorker) {
      detectRafRef.current = requestAnimationFrame(workerDetectLoop);
    } else {
      detectRafRef.current = requestAnimationFrame(mainThreadDetectLoop);
    }

    return () => {
      isDetectingRef.current = false;

      if (renderRafRef.current) {
        cancelAnimationFrame(renderRafRef.current);
        renderRafRef.current = 0;
      }
      if (detectRafRef.current) {
        cancelAnimationFrame(detectRafRef.current);
        detectRafRef.current = 0;
      }

      if (sessionIdRef.current) {
        endSession(sessionIdRef.current);
        sessionIdRef.current = null;
      }
      setIsDetecting(false);
    };
  }, [
    isActive,
    renderLoop,
    workerDetectLoop,
    mainThreadDetectLoop,
    setIsDetecting,
    modelRef,
  ]);

  return { loadModel, modelRef };
}
