'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { Detection } from '@ai-media-studio/media-utils';
import { drawDetections } from '@ai-media-studio/media-utils';
import { useDetectionStore } from '@/stores/detection-store';
import {
  saveDetectionLog,
  startSession,
  endSession,
} from '@/lib/detection-history';
import { useModel } from './use-model';

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

export function useDetector(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  isActive: boolean,
) {
  const { model: modelRef, loadModel } = useModel();
  const rafRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(0);
  const sessionIdRef = useRef<string | null>(null);
  const lastLogTimeRef = useRef<number>(0);
  const perSecondIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const latestDetectionsRef = useRef<Detection[]>([]);

  const {
    setDetections,
    setIsDetecting,
    updatePerformance,
    updateUniqueDetections,
    updatePerSecondCounts,
  } = useDetectionStore();

  const detect = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const model = modelRef.current;

    if (!video || !canvas || !model || video.readyState < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    syncCanvasSize(canvas, video.videoWidth, video.videoHeight);

    const startTime = performance.now();
    const predictions = await model.detect(video);
    const inferenceTime = performance.now() - startTime;

    const detections: Detection[] = predictions.map((p) => ({
      class: p.class,
      score: p.score,
      bbox: { x: p.bbox[0], y: p.bbox[1], width: p.bbox[2], height: p.bbox[3] },
    }));

    ctx.drawImage(video, 0, 0);
    drawDetections(ctx, detections);

    setDetections(detections);
    latestDetectionsRef.current = detections;

    // IndexedDB에 1초 간격으로 저장
    const logNow = performance.now();
    if (sessionIdRef.current && logNow - lastLogTimeRef.current >= 1000) {
      lastLogTimeRef.current = logNow;
      saveDetectionLog({
        sessionId: sessionIdRef.current,
        timestamp: Date.now(),
        detections: detections.map((d) => ({ class: d.class, score: d.score })),
        fps: useDetectionStore.getState().performance.fps,
        inferenceTime: Math.round(inferenceTime),
      });
    }

    // unique 모드: 매 프레임 새로운 객체 감지
    updateUniqueDetections(detections);

    // FPS 계산
    frameCountRef.current++;
    const now = performance.now();
    if (now - lastFpsUpdateRef.current >= 100) {
      const elapsed = (now - lastFpsUpdateRef.current) / 1000;
      const fps = Math.round(frameCountRef.current / elapsed);
      updatePerformance({ fps, inferenceTime: Math.round(inferenceTime) });
      frameCountRef.current = 0;
      lastFpsUpdateRef.current = now;
    }
  }, [
    videoRef,
    canvasRef,
    modelRef,
    setDetections,
    updateUniqueDetections,
    updatePerformance,
  ]);

  const detectLoop = useCallback(() => {
    detect().then(() => {
      rafRef.current = requestAnimationFrame(detectLoop);
    });
  }, [detect]);

  useEffect(() => {
    loadModel();
  }, [loadModel]);

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
    if (isActive && modelRef.current) {
      setIsDetecting(true);
      lastFpsUpdateRef.current = performance.now();
      frameCountRef.current = 0;
      // 세션 시작
      startSession().then((id) => {
        sessionIdRef.current = id;
      });
      rafRef.current = requestAnimationFrame(detectLoop);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      // 세션 종료
      if (sessionIdRef.current) {
        endSession(sessionIdRef.current);
        sessionIdRef.current = null;
      }
      setIsDetecting(false);
    };
  }, [isActive, detectLoop, setIsDetecting, modelRef]);

  return { loadModel, modelRef };
}
