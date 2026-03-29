'use client';

import { useCallback } from 'react';
import type { Detection } from '@ai-media-studio/media-utils';
import { useModel } from './use-model';
import { useDetectionStore } from '@/stores/detection-store';
import type { ImageAnalysisResult } from '@/stores/detection-store';

export function useImageDetector() {
  const { model: modelRef, loadModel } = useModel();
  const addImageAnalysisResult = useDetectionStore(
    (s) => s.addImageAnalysisResult,
  );

  const analyzeImage = useCallback(
    async (file: File): Promise<ImageAnalysisResult | null> => {
      // 모델 로드 확인
      let model = modelRef.current;
      if (!model) {
        model = await loadModel();
        if (!model) return null;
      }

      return new Promise((resolve) => {
        const img = new Image();
        const imageUrl = URL.createObjectURL(file);
        img.src = imageUrl;

        img.onload = async () => {
          const startTime = performance.now();
          const predictions = await model!.detect(img);
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

          const result: ImageAnalysisResult = {
            id: crypto.randomUUID(),
            file,
            imageUrl,
            detections,
            inferenceTime: Math.round(inferenceTime),
            analyzedAt: Date.now(),
          };

          addImageAnalysisResult(result);
          resolve(result);
        };

        img.onerror = () => {
          URL.revokeObjectURL(imageUrl);
          resolve(null);
        };
      });
    },
    [modelRef, loadModel, addImageAnalysisResult],
  );

  const analyzeMultipleImages = useCallback(
    async (files: File[]): Promise<(ImageAnalysisResult | null)[]> => {
      const results: (ImageAnalysisResult | null)[] = [];
      for (const file of files) {
        const result = await analyzeImage(file);
        results.push(result);
      }
      return results;
    },
    [analyzeImage],
  );

  return { analyzeImage, analyzeMultipleImages };
}
