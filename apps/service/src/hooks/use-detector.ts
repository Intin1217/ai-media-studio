'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { Detection } from '@ai-media-studio/media-utils';
import { drawDetections } from '@ai-media-studio/media-utils';
import { useDetectionStore } from '@/stores/detection-store';

type CocoSsdModel = {
  detect: (video: HTMLVideoElement) => Promise<
    Array<{
      class: string;
      score: number;
      bbox: [number, number, number, number];
    }>
  >;
};

export function useDetector(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  isActive: boolean,
) {
  const modelRef = useRef<CocoSsdModel | null>(null);
  const rafRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFpsUpdateRef = useRef<number>(0);

  const {
    setModelStatus,
    setDetections,
    setIsDetecting,
    updatePerformance,
    incrementDetectionCounts,
  } = useDetectionStore();

  const loadModel = useCallback(async () => {
    if (modelRef.current) return;

    try {
      setModelStatus('loading');
      await import('@tensorflow/tfjs-backend-webgl');
      const tf = await import('@tensorflow/tfjs-core');
      await tf.ready();
      const cocoSsd = await import('@tensorflow-models/coco-ssd');
      const model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
      modelRef.current = model;
      setModelStatus('ready');
    } catch {
      setModelStatus('error');
    }
  }, [setModelStatus]);

  const detect = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const model = modelRef.current;

    if (!video || !canvas || !model || video.readyState < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas 크기를 video에 맞춤
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

    // COCO-SSD 결과를 Detection 타입으로 변환
    const detections: Detection[] = predictions.map((p) => ({
      class: p.class,
      score: p.score,
      bbox: { x: p.bbox[0], y: p.bbox[1], width: p.bbox[2], height: p.bbox[3] },
    }));

    // Canvas에 video 프레임 + 바운딩 박스 그리기
    ctx.drawImage(video, 0, 0);
    drawDetections(ctx, detections);

    // Store 업데이트
    setDetections(detections);
    incrementDetectionCounts(detections);

    // FPS 계산 (100ms 간격으로 업데이트)
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
    setDetections,
    incrementDetectionCounts,
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
  }, [isActive, detectLoop, setIsDetecting]);

  return { loadModel, modelRef };
}
