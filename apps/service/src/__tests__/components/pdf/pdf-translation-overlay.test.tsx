import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PdfTranslationOverlay } from '@/components/pdf/pdf-translation-overlay';
import type { TranslatedBlock } from '@ai-media-studio/pdf-engine';

const mockBlock: TranslatedBlock = {
  text: 'Hello',
  originalText: 'Hello',
  translatedText: '안녕하세요',
  translatedHeight: 20,
  x: 10,
  y: 20,
  width: 200,
  height: 20,
  fontSize: 14,
  fontFamily: 'sans-serif',
};

describe('PdfTranslationOverlay', () => {
  it('번역 블록을 렌더링한다', () => {
    render(
      <PdfTranslationOverlay
        translatedBlocks={[mockBlock]}
        scale={1}
        pageWidth={600}
        pageHeight={800}
      />,
    );
    expect(screen.getByText('안녕하세요')).toBeInTheDocument();
  });

  it('원문 텍스트를 tooltip에 포함한다', () => {
    render(
      <PdfTranslationOverlay
        translatedBlocks={[mockBlock]}
        scale={1}
        pageWidth={600}
        pageHeight={800}
      />,
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('scale=2 일 때 x좌표가 2배로 적용된다', () => {
    const { container } = render(
      <PdfTranslationOverlay
        translatedBlocks={[mockBlock]}
        scale={2}
        pageWidth={600}
        pageHeight={800}
      />,
    );
    // block.x=10, scale=2 → left: 20px
    const blockEl = container.querySelector('[style*="left: 20px"]');
    expect(blockEl).not.toBeNull();
  });

  it('scale=1 일 때 원본 좌표로 배치된다', () => {
    const { container } = render(
      <PdfTranslationOverlay
        translatedBlocks={[mockBlock]}
        scale={1}
        pageWidth={600}
        pageHeight={800}
      />,
    );
    // block.x=10, scale=1 → left: 10px
    const blockEl = container.querySelector('[style*="left: 10px"]');
    expect(blockEl).not.toBeNull();
  });

  it('빈 블록 배열은 아무것도 렌더링하지 않는다', () => {
    const { container } = render(
      <PdfTranslationOverlay
        translatedBlocks={[]}
        scale={1}
        pageWidth={600}
        pageHeight={800}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('여러 블록을 모두 렌더링한다', () => {
    const blocks: TranslatedBlock[] = [
      { ...mockBlock, translatedText: '첫 번째' },
      { ...mockBlock, translatedText: '두 번째', y: 50 },
    ];

    render(
      <PdfTranslationOverlay
        translatedBlocks={blocks}
        scale={1}
        pageWidth={600}
        pageHeight={800}
      />,
    );

    expect(screen.getByText('첫 번째')).toBeInTheDocument();
    expect(screen.getByText('두 번째')).toBeInTheDocument();
  });

  it('번역 오버레이 aria-label이 있다', () => {
    render(
      <PdfTranslationOverlay
        translatedBlocks={[mockBlock]}
        scale={1}
        pageWidth={600}
        pageHeight={800}
      />,
    );
    expect(screen.getByLabelText('번역 오버레이')).toBeInTheDocument();
  });
});
