'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { Detection } from '@ai-media-studio/media-utils';
import { drawDetections } from '@ai-media-studio/media-utils';
import { useDetectionStore } from '@/stores/detection-store';
import { useModel } from './use-model';

export function useDetector(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  isActive: boolean,
) {
  const { model: modelRef, loadModel } = useModel();
  const rafRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(0);
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

    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

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
      rafRef.current = requestAnimationFrame(detectLoop);
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      setIsDetecting(false);
    };
  }, [isActive, detectLoop, setIsDetecting, modelRef]);

  return { loadModel, modelRef };
}
