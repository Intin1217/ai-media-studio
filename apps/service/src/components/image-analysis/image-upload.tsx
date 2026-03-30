'use client';

import { useCallback, useRef, useState } from 'react';
import { Card, CardContent } from '@ai-media-studio/ui';
import { useImageDetector } from '@/hooks/use-image-detector';
import { useDetectionStore } from '@/stores/detection-store';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function ImageUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { analyzeMultipleImages } = useImageDetector();
  const modelStatus = useDetectionStore((s) => s.modelStatus);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const allImageFiles = Array.from(files).filter((f) =>
        f.type.startsWith('image/'),
      );
      const imageFiles = allImageFiles.filter((f) => f.size <= MAX_FILE_SIZE);
      const oversizedFiles = allImageFiles.filter(
        (f) => f.size > MAX_FILE_SIZE,
      );

      if (oversizedFiles.length > 0) {
        // 파일 크기 초과 항목은 무시하고 유효한 파일만 처리
      }

      if (imageFiles.length === 0) return;

      setIsAnalyzing(true);
      await analyzeMultipleImages(imageFiles);
      setIsAnalyzing(false);
    },
    [analyzeMultipleImages],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles],
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
        e.target.value = '';
      }
    },
    [handleFiles],
  );

  const isReady = modelStatus === 'ready';

  return (
    <Card>
      <CardContent className="p-4">
        <div
          role="button"
          tabIndex={0}
          onClick={isReady && !isAnalyzing ? handleClick : undefined}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              if (isReady && !isAnalyzing) handleClick();
            }
          }}
          onDragOver={isReady ? handleDragOver : undefined}
          onDragLeave={isReady ? handleDragLeave : undefined}
          onDrop={isReady ? handleDrop : undefined}
          className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors ${
            !isReady
              ? 'border-border/50 cursor-not-allowed opacity-50'
              : isDragging
                ? 'border-primary bg-primary/5 cursor-pointer'
                : isAnalyzing
                  ? 'border-border cursor-wait'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer'
          }`}
        >
          {isAnalyzing ? (
            <>
              <div className="border-primary h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
              <p className="text-muted-foreground text-sm">분석 중...</p>
            </>
          ) : (
            <>
              <svg
                className="text-muted-foreground h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 3 3 0 013.824 3.476A3.75 3.75 0 0118 19.5H6.75z"
                />
              </svg>
              <div className="text-center">
                <p className="text-foreground text-sm font-medium">
                  {isReady
                    ? '이미지를 드래그하거나 클릭하여 업로드'
                    : '모델 로딩 중...'}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  JPG, PNG, WebP 지원 · 여러 장 동시 업로드 가능
                </p>
              </div>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
}
