import { describe, it, expect, vi } from 'vitest';
import { extractTextBlocks } from '../text-extractor';
import type { PDFPageProxy } from 'pdfjs-dist';

/**
 * pdfjs TextItem 형태의 mock 객체를 생성하는 헬퍼
 *
 * transform = [scaleX, skewY, skewX, scaleY, x, y]
 * scaleY의 절댓값이 fontSize, x/y가 좌표
 */
function createTextItem(options: {
  str: string;
  x?: number;
  y?: number;
  fontSize?: number;
  width?: number;
  height?: number;
  fontName?: string;
}) {
  const {
    str,
    x = 0,
    y = 0,
    fontSize = 12,
    width = 50,
    height = 12,
    fontName = 'Arial',
  } = options;
  return {
    str,
    transform: [1, 0, 0, -fontSize, x, y], // scaleY를 음수로 설정해도 절댓값으로 처리됨을 검증
    width,
    height,
    fontName,
    dir: 'ltr',
    hasEOL: false,
  };
}

/**
 * PDFPageProxy mock을 생성하는 헬퍼
 */
function createMockPage(items: unknown[]): PDFPageProxy {
  return {
    getTextContent: vi.fn().mockResolvedValue({ items }),
  } as unknown as PDFPageProxy;
}

describe('extractTextBlocks', () => {
  it('텍스트 아이템을 TextBlock으로 변환해야 한다', async () => {
    const items = [
      createTextItem({
        str: '안녕하세요',
        x: 10,
        y: 100,
        fontSize: 14,
        width: 80,
        height: 14,
        fontName: 'NanumGothic',
      }),
    ];
    const page = createMockPage(items);

    const blocks = await extractTextBlocks(page);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].text).toBe('안녕하세요');
    expect(blocks[0].x).toBe(10);
    expect(blocks[0].y).toBe(100);
    expect(blocks[0].fontSize).toBe(14);
    expect(blocks[0].width).toBe(80);
    expect(blocks[0].height).toBe(14);
    expect(blocks[0].fontFamily).toBe('NanumGothic');
  });

  it('여러 텍스트 아이템을 모두 추출해야 한다', async () => {
    const items = [
      createTextItem({ str: '첫 번째', x: 0, y: 800 }),
      createTextItem({ str: '두 번째', x: 0, y: 780 }),
      createTextItem({ str: '세 번째', x: 0, y: 760 }),
    ];
    const page = createMockPage(items);

    const blocks = await extractTextBlocks(page);

    expect(blocks).toHaveLength(3);
    expect(blocks[0].text).toBe('첫 번째');
    expect(blocks[1].text).toBe('두 번째');
    expect(blocks[2].text).toBe('세 번째');
  });

  it('빈 문자열 아이템은 결과에서 제외해야 한다', async () => {
    const items = [
      createTextItem({ str: '내용 있음' }),
      createTextItem({ str: '' }), // 빈 문자열
      createTextItem({ str: '   ' }), // 공백만 있는 문자열
      createTextItem({ str: '내용2' }),
    ];
    const page = createMockPage(items);

    const blocks = await extractTextBlocks(page);

    expect(blocks).toHaveLength(2);
    expect(blocks[0].text).toBe('내용 있음');
    expect(blocks[1].text).toBe('내용2');
  });

  it('scaleY가 음수인 경우 fontSize는 절댓값으로 처리해야 한다', async () => {
    const item = createTextItem({ str: '텍스트', fontSize: 16 }); // transform에 -16이 들어감
    const page = createMockPage([item]);

    const blocks = await extractTextBlocks(page);

    expect(blocks[0].fontSize).toBe(16);
  });

  it('str은 있지만 transform이 없는 아이템(TextMarkedContent)은 무시해야 한다', async () => {
    const items = [
      createTextItem({ str: '정상 텍스트' }),
      // TextMarkedContent 형태 (transform 없음)
      { type: 'beginMarkedContent', tag: 'Artifact' },
    ];
    const page = createMockPage(items);

    const blocks = await extractTextBlocks(page);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].text).toBe('정상 텍스트');
  });

  it('텍스트가 없으면 빈 배열을 반환해야 한다', async () => {
    const page = createMockPage([]);

    const blocks = await extractTextBlocks(page);

    expect(blocks).toHaveLength(0);
    expect(blocks).toEqual([]);
  });

  describe('이미지 기반 PDF 감지', () => {
    it('텍스트 블록이 5개 미만이면 isImageBased 판단을 위한 블록 수가 5개 미만이어야 한다', async () => {
      // 이 테스트는 parser가 isImageBased를 판단하는 로직을 간접 검증
      // text-extractor는 블록만 반환하고, parser에서 length < 5 조건으로 판단
      const items = [
        createTextItem({ str: '블록1' }),
        createTextItem({ str: '블록2' }),
        createTextItem({ str: '블록3' }),
        createTextItem({ str: '블록4' }),
      ];
      const page = createMockPage(items);

      const blocks = await extractTextBlocks(page);

      // 4개 미만이면 parser에서 isImageBased: true로 설정됨
      expect(blocks.length).toBeLessThan(5);
    });

    it('텍스트 블록이 5개 이상이면 일반 텍스트 PDF로 판단할 수 있다', async () => {
      const items = Array.from({ length: 10 }, (_, i) =>
        createTextItem({ str: `블록${i + 1}` }),
      );
      const page = createMockPage(items);

      const blocks = await extractTextBlocks(page);

      expect(blocks.length).toBeGreaterThanOrEqual(5);
    });
  });
});
