'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, Badge } from '@ai-media-studio/ui';
import { drawDetections } from '@ai-media-studio/media-utils';
import type { ImageAnalysisResult } from '@/stores/detection-store';
import { useDetectionStore } from '@/stores/detection-store';

interface ImageResultCardProps {
  result: ImageAnalysisResult;
}

export function ImageResultCard({ result }: ImageResultCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const removeImageAnalysisResult = useDetectionStore(
    (s) => s.removeImageAnalysisResult,
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.src = result.imageUrl;
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      drawDetections(ctx, result.detections);
    };
  }, [result.imageUrl, result.detections]);

  // 감지 결과를 클래스별로 그룹화
  const classCounts: Record<string, number> = {};
  for (const d of result.detections) {
    classCounts[d.class] = (classCounts[d.class] ?? 0) + 1;
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video bg-black">
        <canvas ref={canvasRef} className="h-full w-full object-contain" />
        <button
          type="button"
          onClick={() => removeImageAnalysisResult(result.id)}
          className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white transition-colors hover:bg-black/80"
          aria-label="삭제"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <CardContent className="p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-muted-foreground max-w-[60%] truncate text-xs">
            {result.file.name}
          </p>
          <span className="text-muted-foreground text-xs">
            {result.inferenceTime}ms
          </span>
        </div>
        {result.detections.length === 0 ? (
          <p className="text-muted-foreground text-xs">감지된 객체 없음</p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {Object.entries(classCounts).map(([cls, count]) => (
              <Badge key={cls} variant="secondary" className="text-xs">
                {cls} {count > 1 ? `×${count}` : ''}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
