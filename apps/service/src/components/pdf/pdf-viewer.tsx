'use client';

import { useEffect, useRef } from 'react';
import type { PdfPage, TranslatedBlock } from '@ai-media-studio/pdf-engine';
import { PdfTranslationOverlay } from './pdf-translation-overlay';

interface PdfViewerProps {
  page: PdfPage | null;
  scale: number;
  translatedBlocks?: TranslatedBlock[];
  showTranslation: boolean;
}

export function PdfViewer({
  page,
  scale,
  translatedBlocks,
  showTranslation,
}: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!page || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaledWidth = Math.round(page.width * scale);
    const scaledHeight = Math.round(page.height * scale);
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, scaledWidth, scaledHeight);

    ctx.fillStyle = '#1a1a1a';
    for (const block of page.textBlocks) {
      const fs = block.fontSize * scale;
      ctx.font = `${fs}px ${block.fontFamily || 'sans-serif'}`;
      ctx.fillText(
        block.text,
        block.x * scale,
        (block.y + block.fontSize) * scale,
      );
    }
  }, [page, scale]);

  if (!page) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400">
        페이지를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <canvas ref={canvasRef} className="shadow-md" />
      {showTranslation && translatedBlocks && translatedBlocks.length > 0 && (
        <PdfTranslationOverlay
          translatedBlocks={translatedBlocks}
          scale={scale}
          pageWidth={page.width}
          pageHeight={page.height}
        />
      )}
    </div>
  );
}
