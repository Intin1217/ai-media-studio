'use client';

import { useState, useCallback } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@ai-media-studio/ui';
import {
  parsePdf,
  translateBlocks,
  computeTranslatedLayouts,
} from '@ai-media-studio/pdf-engine';
import type {
  PdfParseResult,
  TranslatedBlock,
} from '@ai-media-studio/pdf-engine';
import { useSettingsStore } from '@/stores/settings-store';
import { PdfToolbar } from './pdf-toolbar';
import { PdfViewer } from './pdf-viewer';
import { PdfSidebar } from './pdf-sidebar';

export function PdfTranslatorView() {
  const ollamaEndpoint = useSettingsStore((s) => s.ollamaEndpoint);
  const ollamaModel = useSettingsStore((s) => s.ollamaModel);

  const [parseResult, setParseResult] = useState<PdfParseResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [translatedBlocks, setTranslatedBlocks] = useState<TranslatedBlock[]>(
    [],
  );
  const [isTranslating, setIsTranslating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showTranslation, setShowTranslation] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setTranslatedBlocks([]);
    setCurrentPage(1);
    try {
      const result = await parsePdf(file);
      setParseResult(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'PDF 파싱 오류가 발생했습니다');
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) void handleFile(file);
    },
    [handleFile],
  );

  const handleTranslate = useCallback(async () => {
    if (!parseResult) return;
    setIsTranslating(true);
    setProgress(0);
    setError(null);

    try {
      const currentPageData = parseResult.pages[currentPage - 1];
      if (!currentPageData) return;

      const translated = await translateBlocks(currentPageData.textBlocks, {
        endpoint: ollamaEndpoint,
        model: ollamaModel,
        sourceLang: '영어',
        targetLang: '한국어',
        batchSize: 10,
        onProgress: (done, total) => {
          setProgress((done / total) * 100);
        },
      });

      const withLayouts = await computeTranslatedLayouts(translated);
      setTranslatedBlocks(withLayouts);
      setShowTranslation(true);
      setSidebarOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : '번역 오류가 발생했습니다');
    } finally {
      setIsTranslating(false);
      setProgress(0);
    }
  }, [parseResult, currentPage, ollamaEndpoint, ollamaModel]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (!parseResult) return;
      setCurrentPage(Math.max(1, Math.min(parseResult.totalPages, page)));
      setTranslatedBlocks([]);
    },
    [parseResult],
  );

  const currentPageData = parseResult?.pages[currentPage - 1] ?? null;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>PDF 번역기</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 파일 업로드 영역 */}
          {!parseResult && (
            <div
              className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('pdf-file-input')?.click()}
              role="button"
              tabIndex={0}
              aria-label="PDF 파일 업로드"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  document.getElementById('pdf-file-input')?.click();
                }
              }}
            >
              <input
                id="pdf-file-input"
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFile(file);
                }}
              />
              <p className="text-muted-foreground text-lg">
                PDF 파일을 드래그하거나 클릭하여 업로드
              </p>
              <p className="text-muted-foreground mt-1 text-sm">최대 100MB</p>
            </div>
          )}

          {/* 오류 메시지 */}
          {error && (
            <div className="bg-destructive/10 text-destructive mt-4 rounded-md p-3 text-sm">
              {error}
            </div>
          )}

          {/* PDF 뷰어 + 툴바 */}
          {parseResult && (
            <div className="flex flex-col gap-0 overflow-hidden rounded-md border">
              <PdfToolbar
                currentPage={currentPage}
                totalPages={parseResult.totalPages}
                scale={scale}
                onScaleChange={setScale}
                onPageChange={handlePageChange}
                onTranslate={() => void handleTranslate()}
                isTranslating={isTranslating}
                progress={progress}
                hasTranslation={translatedBlocks.length > 0}
                showTranslation={showTranslation}
                onToggleTranslation={() => setShowTranslation((v) => !v)}
              />

              <div className="flex overflow-hidden">
                {/* 뷰어 */}
                <div className="flex-1 overflow-auto bg-gray-50 p-4 dark:bg-gray-900">
                  <PdfViewer
                    page={currentPageData}
                    scale={scale}
                    translatedBlocks={translatedBlocks}
                    showTranslation={showTranslation}
                  />
                </div>

                {/* 사이드바 */}
                {translatedBlocks.length > 0 && (
                  <div className="w-80 flex-shrink-0">
                    <PdfSidebar
                      translatedBlocks={translatedBlocks}
                      isOpen={sidebarOpen}
                      onToggle={() => setSidebarOpen((v) => !v)}
                    />
                  </div>
                )}
              </div>

              {/* 파일 초기화 */}
              <div className="border-t p-2 text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setParseResult(null);
                    setTranslatedBlocks([]);
                    setError(null);
                  }}
                >
                  다른 파일 열기
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
