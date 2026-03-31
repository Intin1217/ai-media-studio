import { describe, it, expect, vi, beforeEach } from 'vitest';
import { translateBlocks, translateText } from '../translator';
import type { TextBlock } from '../types';

const mockFetch = vi.fn();
global.fetch = mockFetch;

// 스트리밍 응답을 시뮬레이션하는 헬퍼
function makeStreamResponse(tokens: string[]): Response {
  const lines =
    tokens.map((t) => JSON.stringify({ response: t, done: false })).join('\n') +
    '\n' +
    JSON.stringify({ response: '', done: true });
  const encoder = new TextEncoder();
  const encoded = encoder.encode(lines);

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoded);
      controller.close();
    },
  });

  return {
    ok: true,
    status: 200,
    body: stream,
  } as unknown as Response;
}

// 스트리밍 응답 — 한 번에 전체 텍스트
function makeStreamResponseFull(text: string): Response {
  return makeStreamResponse([text]);
}

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
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('정상적으로 블록을 번역한다', async () => {
    mockFetch.mockResolvedValueOnce(makeStreamResponseFull('안녕하세요'));

    const results = await translateBlocks([mockBlock], baseOptions);

    expect(results).toHaveLength(1);
    expect(results[0].translatedText).toBe('안녕하세요');
    expect(results[0].originalText).toBe('Hello world');
    expect(results[0].translatedHeight).toBe(0);
  });

  it('원본 블록 필드를 유지한다', async () => {
    mockFetch.mockResolvedValueOnce(makeStreamResponseFull('안녕하세요'));

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
      .mockResolvedValueOnce(makeStreamResponseFull('첫번째\n---\n두번째'))
      .mockResolvedValueOnce(makeStreamResponseFull('세번째'));

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
    mockFetch.mockResolvedValue(makeStreamResponseFull('번역됨'));

    const onProgress = vi.fn();
    await translateBlocks([mockBlock], { ...baseOptions, onProgress });

    expect(onProgress).toHaveBeenCalledWith(1, 1);
  });

  it('여러 배치에서 onProgress가 누적 호출된다', async () => {
    mockFetch
      .mockResolvedValueOnce(makeStreamResponseFull('A\n---\nB'))
      .mockResolvedValueOnce(makeStreamResponseFull('C'));

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

  it('HTTP 에러 시 3회 재시도 후 원문을 반환한다', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });

    const promise = translateBlocks([mockBlock], baseOptions);

    // 재시도 딜레이(2s, 4s) 진행
    await vi.runAllTimersAsync();

    const results = await promise;
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(results[0].translatedText).toBe('Hello world');
    expect(results[0].originalText).toBe('Hello world');
  });

  it('스트림 읽기 실패 시 재시도 후 원문을 반환한다', async () => {
    const brokenResponse = {
      ok: true,
      body: null,
    } as unknown as Response;

    mockFetch.mockResolvedValue(brokenResponse);

    const promise = translateBlocks([mockBlock], baseOptions);
    await vi.runAllTimersAsync();

    const results = await promise;
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(results[0].translatedText).toBe('Hello world');
  });

  it('구분자 없이 응답이 온 경우 첫 번째 블록에 전체 번역을 할당하고 나머지는 원문을 반환한다', async () => {
    mockFetch.mockResolvedValueOnce(
      makeStreamResponseFull('구분자없는전체번역'),
    );

    const blocks: TextBlock[] = [
      { ...mockBlock, text: 'Hello' },
      { ...mockBlock, text: 'World' },
    ];

    const results = await translateBlocks(blocks, {
      ...baseOptions,
      batchSize: 5,
    });
    expect(results[0].translatedText).toBe('구분자없는전체번역');
    expect(results[1].translatedText).toBe('World');
  });

  it('올바른 fetch URL과 stream:true body로 요청한다', async () => {
    mockFetch.mockResolvedValueOnce(makeStreamResponseFull('번역됨'));

    await translateBlocks([mockBlock], baseOptions);

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:11434/api/generate',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"stream":true'),
      }),
    );
  });

  it('batchSize 기본값이 5이다', async () => {
    const blocks: TextBlock[] = Array.from({ length: 6 }, (_, i) => ({
      ...mockBlock,
      text: `Text ${i + 1}`,
    }));

    mockFetch
      .mockResolvedValueOnce(
        makeStreamResponseFull(
          Array.from({ length: 5 }, (_, i) => `번역 ${i + 1}`).join('\n---\n'),
        ),
      )
      .mockResolvedValueOnce(makeStreamResponseFull('번역 6'));

    await translateBlocks(blocks, baseOptions);

    // 기본 batchSize=5이면 6개 블록은 2번 요청
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('허용되지 않는 엔드포인트에서 에러를 던진다', async () => {
    await expect(
      translateBlocks([mockBlock], {
        ...baseOptions,
        endpoint: 'http://evil.com',
      }),
    ).rejects.toThrow('허용되지 않는 번역 엔드포인트입니다');
  });

  it('유효하지 않은 모델명에서 에러를 던진다', async () => {
    await expect(
      translateBlocks([mockBlock], {
        ...baseOptions,
        model: 'invalid model name!',
      }),
    ).rejects.toThrow('유효하지 않은 모델명입니다');
  });

  it('멀티 토큰 스트리밍 응답을 올바르게 조합한다', async () => {
    mockFetch.mockResolvedValueOnce(makeStreamResponse(['안녕', '하세요']));

    const results = await translateBlocks([mockBlock], baseOptions);

    expect(results[0].translatedText).toBe('안녕하세요');
  });
});

describe('translateText', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('단일 텍스트를 번역한다', async () => {
    mockFetch.mockResolvedValueOnce(makeStreamResponseFull('안녕하세요'));

    const result = await translateText('Hello', baseOptions);
    expect(result).toBe('안녕하세요');
  });

  it('번역 실패 시 원문을 반환한다', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 503 });

    const promise = translateText('Hello', baseOptions);
    await vi.runAllTimersAsync();

    const result = await promise;
    expect(result).toBe('Hello');
  });
});
