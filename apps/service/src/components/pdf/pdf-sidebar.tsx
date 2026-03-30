'use client';

import { useRef, useEffect } from 'react';
import { Button } from '@ai-media-studio/ui';
import type { TranslatedBlock } from '@ai-media-studio/pdf-engine';

interface PdfSidebarProps {
  translatedBlocks: TranslatedBlock[];
  isOpen: boolean;
  onToggle: () => void;
}

export function PdfSidebar({
  translatedBlocks,
  isOpen,
  onToggle,
}: PdfSidebarProps) {
  const origScrollRef = useRef<HTMLDivElement>(null);
  const transScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const origEl = origScrollRef.current;
    const transEl = transScrollRef.current;
    if (!origEl || !transEl) return;

    const syncFrom = (source: HTMLDivElement, target: HTMLDivElement) => () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      target.scrollTop = source.scrollTop;
      requestAnimationFrame(() => {
        isSyncingRef.current = false;
      });
    };

    const origListener = syncFrom(origEl, transEl);
    const transListener = syncFrom(transEl, origEl);
    origEl.addEventListener('scroll', origListener);
    transEl.addEventListener('scroll', transListener);

    return () => {
      origEl.removeEventListener('scroll', origListener);
      transEl.removeEventListener('scroll', transListener);
    };
  }, []);

  return (
    <div className="border-border flex h-full flex-col border-l">
      <div className="border-border flex items-center justify-between border-b px-3 py-2">
        <h3 className="text-sm font-semibold">원문 / 번역 대조</h3>
        <Button variant="outline" size="sm" onClick={onToggle}>
          {isOpen ? '닫기' : '열기'}
        </Button>
      </div>

      {isOpen && (
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* 원문 */}
          <div
            ref={origScrollRef}
            className="flex-1 space-y-2 overflow-y-auto border-r border-gray-200 p-3 dark:border-gray-700"
          >
            <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
              원문
            </p>
            {translatedBlocks.map((block, i) => (
              <p
                key={i}
                className="text-sm leading-relaxed text-gray-700 dark:text-gray-300"
              >
                {block.originalText}
              </p>
            ))}
          </div>

          {/* 번역 */}
          <div
            ref={transScrollRef}
            className="flex-1 space-y-2 overflow-y-auto p-3"
          >
            <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
              번역
            </p>
            {translatedBlocks.map((block, i) => (
              <p
                key={i}
                className="text-sm leading-relaxed text-gray-700 dark:text-gray-300"
              >
                {block.translatedText}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
