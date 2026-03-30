import { describe, it, expect, vi, beforeEach } from 'vitest';
import { computeTextHeight, computeTranslatedLayouts } from '../layout-engine';
import type { TranslatedBlock } from '../types';

// pretext-loader를 mock해서 @chenglou/pretext 패키지 존재 여부와 무관하게 테스트
vi.mock('../pretext-loader', () => ({
  loadPretextModule: vi.fn().mockResolvedValue({
    prepare: (text: string) => ({ text }),
    layout: (_prepared: unknown, _width: number, lineHeight: number) => ({
      height: 100 * lineHeight,
    }),
  }),
  _resetPretextCache: vi.fn(),
}));

const mockBlock: TranslatedBlock = {
  text: 'Hello world',
  originalText: 'Hello world',
  translatedText: '안녕하세요 세상',
  translatedHeight: 0,
  x: 10,
  y: 20,
  width: 300,
  height: 20,
  fontSize: 14,
  fontFamily: 'sans-serif',
};

describe('computeTextHeight', () => {
  it('텍스트 높이를 계산한다', () => {
    const height = computeTextHeight('안녕하세요', 300);
    expect(height).toBeGreaterThan(0);
  });

  it('긴 텍스트는 짧은 텍스트보다 높다', () => {
    const shortHeight = computeTextHeight('Hi', 100);
    const longHeight = computeTextHeight(
      'Hello world this is a very long text',
      100,
    );
    expect(longHeight).toBeGreaterThanOrEqual(shortHeight);
  });

  it('좁은 너비는 높은 높이를 반환한다', () => {
    const wideHeight = computeTextHeight('Hello world', 1000);
    const narrowHeight = computeTextHeight('Hello world', 50);
    expect(narrowHeight).toBeGreaterThanOrEqual(wideHeight);
  });

  it('커스텀 lineHeight 옵션을 적용한다', () => {
    const h1 = computeTextHeight('Hello', 300, { lineHeight: 1 });
    const h2 = computeTextHeight('Hello', 300, { lineHeight: 2 });
    expect(h2).toBeGreaterThan(h1);
  });

  it('빈 텍스트는 0을 반환한다', () => {
    const height = computeTextHeight('', 300);
    expect(height).toBe(0);
  });
});

describe('computeTranslatedLayouts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('블록별 translatedHeight를 계산한다', async () => {
    const results = await computeTranslatedLayouts([mockBlock]);

    expect(results).toHaveLength(1);
    expect(results[0].translatedHeight).toBeGreaterThan(0);
  });

  it('새 배열을 반환한다 (원본 불변)', async () => {
    const original = { ...mockBlock, translatedHeight: 0 };
    const results = await computeTranslatedLayouts([original]);

    expect(results[0]).not.toBe(original);
    expect(original.translatedHeight).toBe(0);
  });

  it('여러 블록을 처리한다', async () => {
    const blocks: TranslatedBlock[] = [
      { ...mockBlock, translatedText: '첫 번째 번역' },
      { ...mockBlock, translatedText: '두 번째 번역' },
    ];

    const results = await computeTranslatedLayouts(blocks);

    expect(results).toHaveLength(2);
    results.forEach((r) => expect(r.translatedHeight).toBeGreaterThan(0));
  });

  it('원본 블록의 다른 필드를 유지한다', async () => {
    const results = await computeTranslatedLayouts([mockBlock]);

    expect(results[0].x).toBe(mockBlock.x);
    expect(results[0].y).toBe(mockBlock.y);
    expect(results[0].width).toBe(mockBlock.width);
    expect(results[0].originalText).toBe(mockBlock.originalText);
    expect(results[0].translatedText).toBe(mockBlock.translatedText);
  });

  it('빈 배열을 처리한다', async () => {
    const results = await computeTranslatedLayouts([]);
    expect(results).toHaveLength(0);
  });

  it('커스텀 lineHeight 옵션을 적용한다', async () => {
    // mock: height = 100 * lineHeight이므로 lineHeight 1 → 100, lineHeight 3 → 300
    const r1 = await computeTranslatedLayouts([mockBlock], { lineHeight: 1 });
    const r2 = await computeTranslatedLayouts([mockBlock], { lineHeight: 3 });
    expect(r2[0].translatedHeight).toBeGreaterThan(r1[0].translatedHeight);
  });

  it('pretext 없을 때 fallback으로 동작한다', async () => {
    const { loadPretextModule } = await import('../pretext-loader');
    vi.mocked(loadPretextModule).mockResolvedValueOnce(null);

    const results = await computeTranslatedLayouts([mockBlock]);
    expect(results[0].translatedHeight).toBeGreaterThan(0);
  });
});
