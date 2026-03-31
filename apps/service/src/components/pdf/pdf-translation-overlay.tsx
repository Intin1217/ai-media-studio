'use client';

import type { TranslatedBlock } from '@ai-media-studio/pdf-engine';

interface PdfTranslationOverlayProps {
  translatedBlocks: TranslatedBlock[];
  scale: number;
  pageWidth: number;
  pageHeight: number;
}

export function PdfTranslationOverlay({
  translatedBlocks,
  scale,
  pageWidth: _pageWidth,
  pageHeight: _pageHeight,
}: PdfTranslationOverlayProps) {
  if (translatedBlocks.length === 0) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-label="번역 오버레이"
    >
      {translatedBlocks.map((block, index) => {
        const scaledWidth = block.width * scale;
        const scaledOriginalHeight = block.height * scale;
        const scaledFontSize = Math.max(
          8,
          (block.fontSize ?? 14) * scale * 0.85,
        );
        const maxHeight = scaledOriginalHeight * 2.5;

        return (
          <div
            key={`${block.x}-${block.y}-${block.originalText.slice(0, 20)}`}
            className="group pointer-events-auto absolute"
            style={{
              left: block.x * scale,
              top: block.y * scale,
              width: scaledWidth,
              maxHeight,
            }}
          >
            {/* 번역 텍스트 */}
            <div
              className="overflow-hidden rounded bg-yellow-100/90 px-1 leading-snug text-gray-800 dark:bg-yellow-900/80 dark:text-gray-100"
              style={{
                fontSize: `${scaledFontSize}px`,
                overflowWrap: 'break-word',
                wordBreak: 'break-all',
                maxHeight,
              }}
            >
              {block.translatedText}
            </div>

            {/* 원문 tooltip */}
            <div className="absolute bottom-full left-0 z-10 mb-1 hidden max-w-xs group-hover:block">
              <div className="rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg">
                <span className="text-[10px] text-gray-400">원문</span>
                <p className="mt-0.5">{block.originalText}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
