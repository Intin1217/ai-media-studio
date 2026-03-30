'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, Badge } from '@ai-media-studio/ui';
import { drawDetections } from '@ai-media-studio/media-utils';
import type { ImageAnalysisResult } from '@/stores/detection-store';
import { useDetectionStore } from '@/stores/detection-store';
import { useSettingsStore } from '@/stores/settings-store';
import { analyzeImageWithOllama } from '@/lib/ollama-client';
import { OcrResultPanel } from './ocr-result-panel';

interface ImageResultCardProps {
  result: ImageAnalysisResult;
}

export function ImageResultCard({ result }: ImageResultCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const removeImageAnalysisResult = useDetectionStore(
    (s) => s.removeImageAnalysisResult,
  );

  const ollamaEnabled = useSettingsStore((s) => s.ollamaEnabled);
  const ollamaEndpoint = useSettingsStore((s) => s.ollamaEndpoint);
  const ollamaModel = useSettingsStore((s) => s.ollamaModel);
  const [ollamaResult, setOllamaResult] = useState<string | null>(null);
  const [ollamaLoading, setOllamaLoading] = useState(false);
  const [ollamaError, setOllamaError] = useState<string | null>(null);

  async function handleOllamaAnalyze() {
    setOllamaLoading(true);
    setOllamaError(null);
    try {
      // data URL에서 base64 부분 추출
      const base64 = result.imageUrl.split(',')[1] ?? result.imageUrl;
      const response = await analyzeImageWithOllama(
        base64,
        ollamaEndpoint,
        ollamaModel,
      );
      setOllamaResult(response);
    } catch {
      setOllamaError('Ollama가 실행 중인지 확인해주세요');
      toast.error('AI 상세 분석에 실패했습니다', {
        description: 'Ollama 서버가 실행 중인지 확인해주세요.',
      });
    } finally {
      setOllamaLoading(false);
    }
  }

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

        {/* OCR 텍스트 추출 */}
        <div className="border-border mt-3 border-t pt-3">
          <OcrResultPanel imageUrl={result.imageUrl} />
        </div>

        {ollamaEnabled && (
          <div className="border-border mt-3 border-t pt-3">
            <button
              type="button"
              onClick={handleOllamaAnalyze}
              disabled={ollamaLoading}
              className="flex items-center gap-1.5 rounded-md bg-violet-500/10 px-3 py-1.5 text-xs font-medium text-violet-400 transition-colors hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {ollamaLoading ? (
                <>
                  <svg
                    className="h-3 w-3 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  분석 중...
                </>
              ) : (
                'AI 상세 분석'
              )}
            </button>

            {ollamaError && (
              <p className="mt-2 text-xs text-red-400">{ollamaError}</p>
            )}

            {ollamaResult && !ollamaError && (
              <div className="bg-muted/50 mt-2 rounded-md p-2">
                <p className="text-foreground whitespace-pre-wrap text-xs leading-relaxed">
                  {ollamaResult}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
