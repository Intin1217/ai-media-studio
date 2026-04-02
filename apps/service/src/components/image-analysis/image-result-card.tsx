'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, Badge } from '@ai-media-studio/ui';
import { drawDetections } from '@ai-media-studio/media-utils';
import type { ImageAnalysisResult } from '@/stores/detection-store';
import { useDetectionStore } from '@/stores/detection-store';
import { useSettingsStore } from '@/stores/settings-store';
import { MarkdownRenderer } from '../markdown-renderer';
import { analyzeImageWithOllama } from '@/lib/ollama-client';
import { imageUrlToBase64, cropImageToBase64 } from '@/lib/image-utils';
import { OcrResultPanel } from './ocr-result-panel';
import { useRegionSelect } from '@/hooks/use-region-select';
import { RegionSelectOverlay } from './region-select-overlay';

interface ImageResultCardProps {
  result: ImageAnalysisResult;
  externalOllamaResult?: string;
}

export function ImageResultCard({
  result,
  externalOllamaResult,
}: ImageResultCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const [regionSelectMode, setRegionSelectMode] = useState(false);

  const { region, isSelecting, resetRegion, displayRegion } = useRegionSelect({
    canvasRef,
    enabled: regionSelectMode,
  });

  const removeImageAnalysisResult = useDetectionStore(
    (s) => s.removeImageAnalysisResult,
  );

  const ollamaEnabled = useSettingsStore((s) => s.ollamaEnabled);
  const ollamaEndpoint = useSettingsStore((s) => s.ollamaEndpoint);
  const ollamaModel = useSettingsStore((s) => s.ollamaModel);
  const ollamaCustomPrompt = useSettingsStore((s) => s.ollamaCustomPrompt);
  const ollamaPromptMode = useSettingsStore((s) => s.ollamaPromptMode);

  const [ollamaResult, setOllamaResult] = useState<string | null>(null);
  const [ollamaLoading, setOllamaLoading] = useState(false);
  const [ollamaError, setOllamaError] = useState<string | null>(null);
  const [localPrompt, setLocalPrompt] = useState('');
  const [hasEdited, setHasEdited] = useState(false);

  // 글로벌 프롬프트 변경 시 로컬 프롬프트 동기화 (사용자가 직접 수정한 경우 덮어쓰지 않음)
  useEffect(() => {
    if (!hasEdited) {
      setLocalPrompt(ollamaCustomPrompt);
    }
  }, [ollamaCustomPrompt, hasEdited]);

  // 분석 결과 fade-in 애니메이션 (CSS transition 기반)
  const [resultVisible, setResultVisible] = useState(false);
  useEffect(() => {
    if (ollamaResult) {
      setResultVisible(false);
      const id = requestAnimationFrame(() => setResultVisible(true));
      return () => cancelAnimationFrame(id);
    }
  }, [ollamaResult]);

  async function handleOllamaAnalyze() {
    setOllamaLoading(true);
    setOllamaError(null);
    try {
      const base64 = region
        ? await cropImageToBase64(result.imageUrl, region)
        : await imageUrlToBase64(result.imageUrl);
      const prompt =
        ollamaPromptMode === 'per-image' && localPrompt.trim()
          ? localPrompt
          : ollamaCustomPrompt;
      const response = await analyzeImageWithOllama(
        base64,
        ollamaEndpoint,
        ollamaModel,
        prompt,
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
      const cvs = canvasRef.current;
      if (!cvs) return;
      cvs.width = img.naturalWidth;
      cvs.height = img.naturalHeight;
      const ctx = cvs.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      drawDetections(ctx, result.detections);
    };

    return () => {
      img.onload = null;
    };
  }, [result.imageUrl, result.detections]);

  // 감지 결과를 클래스별로 그룹화
  const classCounts: Record<string, number> = {};
  for (const d of result.detections) {
    classCounts[d.class] = (classCounts[d.class] ?? 0) + 1;
  }

  const displayResult = ollamaResult ?? externalOllamaResult ?? null;

  return (
    <Card className="overflow-hidden transition-shadow duration-200 hover:shadow-md">
      <div className="relative aspect-video bg-black">
        <div ref={canvasContainerRef} className="relative h-full w-full">
          <canvas
            ref={canvasRef}
            className={`h-full w-full object-contain${regionSelectMode ? 'cursor-crosshair' : ''}`}
            aria-label={`${result.file.name} 감지 결과`}
            role="img"
          />
          <RegionSelectOverlay
            displayRegion={displayRegion}
            isSelecting={isSelecting}
            containerRef={canvasContainerRef}
          />
        </div>
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
            {/* per-image 모드: 이미지별 프롬프트 입력 */}
            {ollamaPromptMode === 'per-image' && (
              <div className="mb-2">
                <label
                  htmlFor={`prompt-${result.id}`}
                  className="text-muted-foreground mb-1 block text-xs"
                >
                  이미지별 프롬프트
                </label>
                <textarea
                  id={`prompt-${result.id}`}
                  value={localPrompt}
                  onChange={(e) => {
                    setHasEdited(true);
                    setLocalPrompt(e.target.value);
                  }}
                  rows={2}
                  className="bg-background border-border text-foreground focus:ring-ring w-full resize-none rounded-md border px-2 py-1 text-xs focus:outline-none focus:ring-1"
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleOllamaAnalyze}
                disabled={ollamaLoading}
                className="flex items-center gap-1.5 rounded-md bg-sky-500/10 px-3 py-1.5 text-xs font-medium text-sky-400 transition-colors hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-50"
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
                ) : region ? (
                  '선택 영역 분석'
                ) : displayResult ? (
                  '재분석'
                ) : (
                  'AI 상세 분석'
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (regionSelectMode) {
                    setRegionSelectMode(false);
                    resetRegion();
                  } else {
                    setRegionSelectMode(true);
                  }
                }}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  regionSelectMode
                    ? 'bg-sky-500/30 text-sky-300 hover:bg-sky-500/40'
                    : 'bg-sky-500/10 text-sky-400 hover:bg-sky-500/20'
                }`}
                aria-pressed={regionSelectMode}
              >
                {regionSelectMode ? '선택 모드 종료' : '영역 선택'}
              </button>

              {region && (
                <button
                  type="button"
                  onClick={resetRegion}
                  className="flex items-center gap-1.5 rounded-md bg-zinc-500/10 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-500/20"
                >
                  영역 초기화
                </button>
              )}
            </div>

            {ollamaError && (
              <p className="mt-2 text-xs text-red-400">{ollamaError}</p>
            )}

            {displayResult && !ollamaError && (
              <div
                className="bg-muted/50 mt-2 rounded-md p-2 transition-opacity duration-300"
                style={{ opacity: resultVisible ? 1 : 0 }}
              >
                <MarkdownRenderer content={displayResult} />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
