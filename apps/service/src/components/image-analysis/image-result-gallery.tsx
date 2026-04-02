'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@ai-media-studio/ui';
import { useDetectionStore } from '@/stores/detection-store';
import { useSettingsStore } from '@/stores/settings-store';
import { analyzeImageWithOllama } from '@/lib/ollama-client';
import { imageUrlToBase64 } from '@/lib/image-utils';
import { ImageResultCard } from './image-result-card';

export function ImageResultGallery() {
  const results = useDetectionStore((s) => s.imageAnalysisResults);
  const clearImageAnalysisResults = useDetectionStore(
    (s) => s.clearImageAnalysisResults,
  );

  const ollamaEnabled = useSettingsStore((s) => s.ollamaEnabled);
  const ollamaEndpoint = useSettingsStore((s) => s.ollamaEndpoint);
  const ollamaModel = useSettingsStore((s) => s.ollamaModel);
  const ollamaCustomPrompt = useSettingsStore((s) => s.ollamaCustomPrompt);
  const ollamaPromptMode = useSettingsStore((s) => s.ollamaPromptMode);

  const [batchResults, setBatchResults] = useState<Record<string, string>>({});
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const prevLengthRef = useRef(0);
  const abortRef = useRef(false);
  // 새 카드 인덱스 범위 추적 (stagger CSS 애니메이션용)
  const [newCardStartIndex, setNewCardStartIndex] = useState(-1);

  // 컴포넌트 언마운트 시 진행 중인 일괄 분석 중단
  useEffect(() => {
    return () => {
      abortRef.current = true;
    };
  }, []);

  // 새로 추가된 카드 범위 기록 (stagger 등장 CSS 트리거용)
  useEffect(() => {
    if (results.length > prevLengthRef.current) {
      setNewCardStartIndex(prevLengthRef.current);
    }
    prevLengthRef.current = results.length;
  }, [results.length]);

  async function handleBatchAnalyze() {
    const eligible = results.filter((r) => !batchResults[r.id]);
    if (eligible.length === 0) return;

    abortRef.current = false;
    setBatchProgress({ current: 0, total: eligible.length });
    let failCount = 0;

    for (let i = 0; i < eligible.length; i++) {
      if (abortRef.current) break;

      const result = eligible[i]!;
      try {
        const base64 = await imageUrlToBase64(result.imageUrl);
        const response = await analyzeImageWithOllama(
          base64,
          ollamaEndpoint,
          ollamaModel,
          ollamaCustomPrompt,
        );
        setBatchResults((prev) => ({ ...prev, [result.id]: response }));
      } catch {
        failCount++;
      }
      setBatchProgress({ current: i + 1, total: eligible.length });
    }

    setBatchProgress(null);
    if (abortRef.current) {
      toast.info('분석이 중지되었습니다');
      return;
    }
    if (failCount > 0) {
      toast.warning(`${failCount}개 이미지 분석 실패`);
    }
  }

  if (results.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-foreground text-sm font-medium">
          분석 결과 ({results.length}장)
        </p>
        <div className="flex items-center gap-2">
          {ollamaEnabled && ollamaPromptMode === 'all' && (
            <>
              {batchProgress ? (
                <>
                  <span className="text-muted-foreground text-xs">
                    분석 중... ({batchProgress.current}/{batchProgress.total})
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      abortRef.current = true;
                    }}
                  >
                    중지
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBatchAnalyze}
                >
                  전체 AI 분석
                </Button>
              )}
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={clearImageAnalysisResults}
          >
            전체 삭제
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {results.map((result, index) => {
          const isNew = index >= newCardStartIndex && newCardStartIndex >= 0;
          const staggerDelay = isNew ? (index - newCardStartIndex) * 80 : 0;
          return (
            <div
              key={result.id}
              className="image-result-card"
              style={
                isNew
                  ? {
                      animation: `fadeInUp 400ms cubic-bezier(0.16, 1, 0.3, 1) ${staggerDelay}ms both`,
                    }
                  : undefined
              }
            >
              <ImageResultCard
                result={result}
                externalOllamaResult={batchResults[result.id]}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
