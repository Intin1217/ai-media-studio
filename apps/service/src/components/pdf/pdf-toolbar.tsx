'use client';

import { Button, Progress } from '@ai-media-studio/ui';

interface PdfToolbarProps {
  currentPage: number;
  totalPages: number;
  scale: number;
  onScaleChange: (scale: number) => void;
  onPageChange: (page: number) => void;
  onTranslate: () => void;
  isTranslating: boolean;
  progress: number;
  hasTranslation: boolean;
  showTranslation: boolean;
  onToggleTranslation: () => void;
}

export function PdfToolbar({
  currentPage,
  totalPages,
  scale,
  onScaleChange,
  onPageChange,
  onTranslate,
  isTranslating,
  progress,
  hasTranslation,
  showTranslation,
  onToggleTranslation,
}: PdfToolbarProps) {
  return (
    <div className="border-border bg-background flex flex-col gap-2 border-b p-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* 페이지 네비게이션 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="이전 페이지"
        >
          ‹
        </Button>
        <span className="text-muted-foreground w-20 text-center text-sm">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="다음 페이지"
        >
          ›
        </Button>

        <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600" />

        {/* 확대/축소 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onScaleChange(Math.max(0.5, parseFloat((scale - 0.1).toFixed(1))))
          }
          aria-label="축소"
        >
          −
        </Button>
        <span className="text-muted-foreground w-12 text-center text-sm">
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onScaleChange(Math.min(3, parseFloat((scale + 0.1).toFixed(1))))
          }
          aria-label="확대"
        >
          +
        </Button>

        <div className="mx-1 h-4 w-px bg-gray-300 dark:bg-gray-600" />

        {/* 번역 버튼 */}
        <Button
          size="sm"
          onClick={onTranslate}
          disabled={isTranslating || totalPages === 0}
        >
          {isTranslating ? '번역 중...' : '번역 시작'}
        </Button>

        {hasTranslation && (
          <Button variant="outline" size="sm" onClick={onToggleTranslation}>
            {showTranslation ? '번역 숨기기' : '번역 보기'}
          </Button>
        )}
      </div>

      {/* 번역 진행률 */}
      {isTranslating && (
        <div className="flex items-center gap-2">
          <Progress value={progress} className="flex-1" />
          <span className="text-muted-foreground w-10 text-right text-xs">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
}
