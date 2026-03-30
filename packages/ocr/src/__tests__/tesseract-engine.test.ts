import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockTerminate = vi.fn().mockResolvedValue(undefined);
const mockRecognize = vi.fn().mockResolvedValue({
  data: {
    text: '안녕하세요',
    confidence: 95,
    blocks: [
      {
        text: '안녕하세요',
        confidence: 95,
        bbox: { x0: 0, y0: 0, x1: 100, y1: 20 },
      },
    ],
  },
});
const mockCreateWorker = vi.fn().mockResolvedValue({
  recognize: mockRecognize,
  terminate: mockTerminate,
});

vi.mock('tesseract.js', () => ({
  createWorker: mockCreateWorker,
}));

// mock 후에 import 해야 함
const { createOcrEngine, recognizeImage, terminateEngine } =
  await import('../tesseract-engine');

describe('createOcrEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 모듈 상태 초기화를 위해 terminateEngine 호출
  });

  it('Worker를 정상적으로 생성함', async () => {
    await terminateEngine();
    await createOcrEngine('kor+eng');
    expect(mockCreateWorker).toHaveBeenCalledWith('kor+eng');
  });

  it('같은 언어로 재호출 시 Worker를 재생성하지 않음', async () => {
    await terminateEngine();
    mockCreateWorker.mockClear();
    await createOcrEngine('kor+eng');
    await createOcrEngine('kor+eng');
    expect(mockCreateWorker).toHaveBeenCalledTimes(1);
  });

  it('Worker 초기화 실패 시 에러를 throw함', async () => {
    await terminateEngine();
    mockCreateWorker.mockRejectedValueOnce(new Error('초기화 실패'));
    await expect(createOcrEngine('kor+eng')).rejects.toThrow(
      'OCR Worker 초기화 실패',
    );
  });
});

describe('recognizeImage', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockCreateWorker.mockResolvedValue({
      recognize: mockRecognize,
      terminate: mockTerminate,
    });
    await terminateEngine();
  });

  it('이미지 인식 결과를 OcrResult 형태로 반환함', async () => {
    const result = await recognizeImage('image-data-url');

    expect(result.text).toBe('안녕하세요');
    expect(result.confidence).toBe(95);
    expect(result.blocks).toHaveLength(1);
    expect(result.blocks[0]).toMatchObject({
      text: '안녕하세요',
      confidence: 95,
      bbox: { x: 0, y: 0, width: 100, height: 20 },
    });
    expect(result.processingTime).toBeGreaterThanOrEqual(0);
    expect(result.language).toBe('kor+eng');
  });

  it('blocks가 없으면 빈 배열로 반환함', async () => {
    mockRecognize.mockResolvedValueOnce({
      data: { text: '텍스트', confidence: 80, blocks: null },
    });

    const result = await recognizeImage('image-data-url');
    expect(result.blocks).toEqual([]);
  });

  it('인식 실패 시 에러를 throw함', async () => {
    mockRecognize.mockRejectedValueOnce(new Error('인식 실패'));
    await expect(recognizeImage('image-data-url')).rejects.toThrow(
      '이미지 인식 실패',
    );
  });
});

describe('terminateEngine', () => {
  it('Worker를 종료하고 terminate를 호출함', async () => {
    await terminateEngine();
    await createOcrEngine('kor+eng');
    await terminateEngine();
    expect(mockTerminate).toHaveBeenCalled();
  });

  it('Worker가 없을 때 terminateEngine을 호출해도 에러 없음', async () => {
    await terminateEngine();
    await expect(terminateEngine()).resolves.toBeUndefined();
  });
});
