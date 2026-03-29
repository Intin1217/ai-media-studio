'use client';

import { Button } from '@ai-media-studio/ui';
import { useDetectionStore } from '@/stores/detection-store';
import { ImageResultCard } from './image-result-card';

export function ImageResultGallery() {
  const results = useDetectionStore((s) => s.imageAnalysisResults);
  const clearImageAnalysisResults = useDetectionStore(
    (s) => s.clearImageAnalysisResults,
  );

  if (results.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-foreground text-sm font-medium">
          분석 결과 ({results.length}장)
        </p>
        <Button variant="outline" size="sm" onClick={clearImageAnalysisResults}>
          전체 삭제
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {results.map((result) => (
          <ImageResultCard key={result.id} result={result} />
        ))}
      </div>
    </div>
  );
}
