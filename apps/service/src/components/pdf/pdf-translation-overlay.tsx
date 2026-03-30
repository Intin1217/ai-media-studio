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
      {translatedBlocks.map((block) => (
        <div
          key={`${block.x}-${block.y}-${block.originalText.slice(0, 20)}`}
          className="group pointer-events-auto absolute"
          style={{
            left: block.x * scale,
            top: block.y * scale,
            width: block.width * scale,
            minHeight: (block.translatedHeight || block.height) * scale,
          }}
        >
          {/* 번역 텍스트 */}
          <div
            className="break-words rounded bg-yellow-100/80 px-1 leading-relaxed text-gray-800 dark:bg-yellow-900/60 dark:text-gray-100"
            style={{ fontSize: block.fontSize * scale * 0.85 }}
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
      ))}
    </div>
  );
}
