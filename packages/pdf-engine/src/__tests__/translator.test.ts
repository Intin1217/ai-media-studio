import { describe, it, expect, vi, beforeEach } from 'vitest';
import { translateBlocks, translateText } from '../translator';
import type { TextBlock } from '../types';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockBlock: TextBlock = {
  text: 'Hello world',
  x: 0,
  y: 0,
  width: 200,
  height: 20,
  fontSize: 14,
  fontFamily: 'sans-serif',
};

const baseOptions = {
  endpoint: 'http://localhost:11434',
  model: 'llama3',
  sourceLang: '영어',
  targetLang: '한국어',
};

describe('translateBlocks', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('정상적으로 블록을 번역한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: '안녕하세요' }),
    });

    const results = await translateBlocks([mockBlock], baseOptions);

    expect(results).toHaveLength(1);
    expect(results[0].translatedText).toBe('안녕하세요');
    expect(results[0].originalText).toBe('Hello world');
    expect(results[0].translatedHeight).toBe(0);
  });

  it('원본 블록 필드를 유지한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: '안녕하세요' }),
    });

    const results = await translateBlocks([mockBlock], baseOptions);

    expect(results[0].x).toBe(mockBlock.x);
    expect(results[0].y).toBe(mockBlock.y);
    expect(results[0].width).toBe(mockBlock.width);
    expect(results[0].height).toBe(mockBlock.height);
    expect(results[0].fontSize).toBe(mockBlock.fontSize);
  });

  it('빈 텍스트 블록을 건너뛴다', async () => {
    const emptyBlock: TextBlock = { ...mockBlock, text: '   ' };
    const results = await translateBlocks([emptyBlock], baseOptions);

    expect(results).toHaveLength(0);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('batchSize만큼 묶어서 요청한다', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: '첫번째\n---\n두번째' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: '세번째' }),
      });

    const blocks: TextBlock[] = [
      { ...mockBlock, text: 'First' },
      { ...mockBlock, text: 'Second' },
      { ...mockBlock, text: 'Third' },
    ];

    const results = await translateBlocks(blocks, {
      ...baseOptions,
      batchSize: 2,
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(results).toHaveLength(3);
    expect(results[0].translatedText).toBe('첫번째');
    expect(results[1].translatedText).toBe('두번째');
    expect(results[2].translatedText).toBe('세번째');
  });

  it('onProgress 콜백을 호출한다', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ response: '번역됨' }),
    });

    const onProgress = vi.fn();
    await translateBlocks([mockBlock], { ...baseOptions, onProgress });

    expect(onProgress).toHaveBeenCalledWith(1, 1);
  });

  it('여러 배치에서 onProgress가 누적 호출된다', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: 'A\n---\nB' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: 'C' }),
      });

    const onProgress = vi.fn();
    const blocks: TextBlock[] = [
      { ...mockBlock, text: 'First' },
      { ...mockBlock, text: 'Second' },
      { ...mockBlock, text: 'Third' },
    ];

    await translateBlocks(blocks, { ...baseOptions, batchSize: 2, onProgress });

    expect(onProgress).toHaveBeenCalledTimes(2);
    expect(onProgress).toHaveBeenNthCalledWith(1, 2, 3);
    expect(onProgress).toHaveBeenNthCalledWith(2, 3, 3);
  });

  it('HTTP 에러 시 예외를 던진다', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    await expect(translateBlocks([mockBlock], baseOptions)).rejects.toThrow(
      'Ollama 응답 오류: 500',
    );
  });

  it('응답 split 실패 시 전체 텍스트를 첫 번째 블록에 할당한다', async () => {
    // 구분자 없이 응답이 온 경우
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: '구분자없는전체번역' }),
    });

    const blocks: TextBlock[] = [
      { ...mockBlock, text: 'Hello' },
      { ...mockBlock, text: 'World' },
    ];

    const results = await translateBlocks(blocks, {
      ...baseOptions,
      batchSize: 5,
    });
    expect(results[0].translatedText).toBe('구분자없는전체번역');
    // 두 번째 블록은 원문 그대로
    expect(results[1].translatedText).toBe('World');
  });

  it('올바른 fetch URL과 body로 요청한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: '번역됨' }),
    });

    await translateBlocks([mockBlock], baseOptions);

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:11434/api/generate',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"stream":false'),
      }),
    );
  });
});

describe('translateText', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('단일 텍스트를 번역한다', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: '안녕하세요' }),
    });

    const result = await translateText('Hello', baseOptions);
    expect(result).toBe('안녕하세요');
  });

  it('번역 실패 시 예외를 전파한다', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

    await expect(translateText('Hello', baseOptions)).rejects.toThrow(
      'Ollama 응답 오류: 503',
    );
  });
});
