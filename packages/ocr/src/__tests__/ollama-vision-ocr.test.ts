import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { recognizeWithOllama } from '../ollama-vision-ocr';

describe('recognizeWithOllama', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('performance', { now: vi.fn().mockReturnValue(0) });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('정상 인식 시 OcrResult를 반환함', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          model: 'llava',
          response: '추출된 텍스트입니다',
          done: true,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const result = await recognizeWithOllama(
      'base64imagedata',
      'http://localhost:11434',
      'llava',
    );

    expect(result.text).toBe('추출된 텍스트입니다');
    expect(result.confidence).toBe(-1);
    expect(result.blocks).toEqual([]);
    expect(result.language).toBe('ollama');
    expect(result.processingTime).toBeGreaterThanOrEqual(0);
  });

  it('올바른 엔드포인트와 모델로 fetch를 호출함', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ model: 'llava', response: '텍스트', done: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    await recognizeWithOllama('base64data', 'http://localhost:11434', 'llava');

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:11434/api/generate',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  it('잘못된 URL을 거부함', async () => {
    await expect(
      recognizeWithOllama('base64data', 'not-a-url', 'llava'),
    ).rejects.toThrow('유효하지 않은 엔드포인트 URL입니다');
  });

  it('빈 문자열 URL을 거부함', async () => {
    await expect(
      recognizeWithOllama('base64data', '', 'llava'),
    ).rejects.toThrow('유효하지 않은 엔드포인트 URL입니다');
  });

  it('HTTP 오류 응답 시 에러를 throw함', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 500 }));

    await expect(
      recognizeWithOllama('base64data', 'http://localhost:11434', 'llava'),
    ).rejects.toThrow('Ollama 응답 오류: 500');
  });

  it('AbortError 발생 시 에러가 전파됨', async () => {
    const abortError = new DOMException(
      'The operation was aborted',
      'AbortError',
    );
    vi.mocked(fetch).mockRejectedValueOnce(abortError);

    await expect(
      recognizeWithOllama('base64data', 'http://localhost:11434', 'llava'),
    ).rejects.toThrow('The operation was aborted');
  });
});
