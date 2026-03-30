import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parsePdf } from '../parser';

// pdfjs-dist 전체를 mock 처리 (브라우저 전용 모듈이라 테스트 환경에서 직접 실행 불가)
vi.mock('pdfjs-dist', () => {
  return {
    version: '4.10.38',
    GlobalWorkerOptions: { workerSrc: '' },
    getDocument: vi.fn(),
  };
});

// text-extractor도 mock 처리해서 parser 로직만 격리 테스트
vi.mock('../text-extractor', () => ({
  extractTextBlocks: vi.fn().mockResolvedValue([
    {
      text: '테스트',
      x: 0,
      y: 0,
      width: 50,
      height: 12,
      fontSize: 12,
      fontFamily: 'Arial',
    },
    {
      text: '내용',
      x: 0,
      y: 20,
      width: 30,
      height: 12,
      fontSize: 12,
      fontFamily: 'Arial',
    },
    {
      text: 'A',
      x: 60,
      y: 0,
      width: 10,
      height: 12,
      fontSize: 12,
      fontFamily: 'Arial',
    },
    {
      text: 'B',
      x: 70,
      y: 0,
      width: 10,
      height: 12,
      fontSize: 12,
      fontFamily: 'Arial',
    },
    {
      text: 'C',
      x: 80,
      y: 0,
      width: 10,
      height: 12,
      fontSize: 12,
      fontFamily: 'Arial',
    },
  ]),
}));

/**
 * 테스트용 File 객체를 생성하는 헬퍼
 */
function createMockFile(options: {
  name?: string;
  size?: number;
  type?: string;
}): File {
  const { name = 'test.pdf', size = 1024, type = 'application/pdf' } = options;
  // size를 직접 지정하기 위해 Blob을 활용
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], name, { type });
}

describe('parsePdf', () => {
  let mockGetDocument: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    const pdfjs = await import('pdfjs-dist');
    mockGetDocument = vi.mocked(pdfjs.getDocument);

    // 기본 성공 시나리오 mock 설정
    mockGetDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 2,
        getPage: vi.fn().mockResolvedValue({
          getViewport: vi.fn().mockReturnValue({ width: 595, height: 842 }),
          getTextContent: vi.fn().mockResolvedValue({ items: [] }),
        }),
        getMetadata: vi.fn().mockResolvedValue({
          info: { Title: '테스트 PDF', Author: '작성자' },
        }),
      }),
    });
  });

  it('정상적인 PDF 파일을 파싱하면 페이지와 메타데이터를 반환해야 한다', async () => {
    const file = createMockFile({});
    const result = await parsePdf(file);

    expect(result.totalPages).toBe(2);
    expect(result.pages).toHaveLength(2);
    expect(result.metadata.title).toBe('테스트 PDF');
    expect(result.metadata.author).toBe('작성자');
  });

  it('각 페이지에 pageNumber, width, height가 포함되어야 한다', async () => {
    const file = createMockFile({});
    const result = await parsePdf(file);

    expect(result.pages[0].pageNumber).toBe(1);
    expect(result.pages[0].width).toBe(595);
    expect(result.pages[0].height).toBe(842);
    expect(result.pages[1].pageNumber).toBe(2);
  });

  it('PDF가 아닌 파일은 거부해야 한다', async () => {
    const file = createMockFile({ type: 'image/png', name: 'image.png' });

    await expect(parsePdf(file)).rejects.toThrow('PDF 파일만 지원합니다');
  });

  it('100MB를 초과하는 파일은 거부해야 한다', async () => {
    const oversizeBytes = 101 * 1024 * 1024; // 101MB
    const file = createMockFile({ size: oversizeBytes });

    await expect(parsePdf(file)).rejects.toThrow('파일 크기가 너무 큽니다');
  });

  it('100MB 정확히인 파일은 허용해야 한다', async () => {
    const exactLimitBytes = 100 * 1024 * 1024; // 100MB
    const file = createMockFile({ size: exactLimitBytes });

    await expect(parsePdf(file)).resolves.toBeDefined();
  });

  it('pdfjs 로딩 실패 시 사용자 친화적 에러를 던져야 한다', async () => {
    mockGetDocument.mockReturnValue({
      promise: Promise.reject(new Error('Invalid PDF structure')),
    });

    const file = createMockFile({});
    await expect(parsePdf(file)).rejects.toThrow(
      'PDF를 불러오는 데 실패했습니다',
    );
  });

  it('메타데이터 추출 실패 시에도 파싱 결과를 반환해야 한다', async () => {
    mockGetDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 1,
        getPage: vi.fn().mockResolvedValue({
          getViewport: vi.fn().mockReturnValue({ width: 595, height: 842 }),
          getTextContent: vi.fn().mockResolvedValue({ items: [] }),
        }),
        // 메타데이터 추출 실패 시뮬레이션
        getMetadata: vi.fn().mockRejectedValue(new Error('metadata error')),
      }),
    });

    const file = createMockFile({});
    const result = await parsePdf(file);

    expect(result).toBeDefined();
    expect(result.metadata).toEqual({});
  });
});
