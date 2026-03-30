import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('ollama-client', () => {
  beforeEach(() => {
    vi.resetModules();
    globalThis.fetch = vi.fn();
  });

  describe('checkOllamaConnection', () => {
    it('서버 응답 ok이면 true를 반환한다', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
      } as Response);

      const { checkOllamaConnection } = await import('@/lib/ollama-client');
      const result = await checkOllamaConnection('http://localhost:11434');
      expect(result).toBe(true);
    });

    it('서버 응답 ok가 아니면 false를 반환한다', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: false,
      } as Response);

      const { checkOllamaConnection } = await import('@/lib/ollama-client');
      const result = await checkOllamaConnection('http://localhost:11434');
      expect(result).toBe(false);
    });

    it('fetch 실패 시 false를 반환한다', async () => {
      vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Network error'));

      const { checkOllamaConnection } = await import('@/lib/ollama-client');
      const result = await checkOllamaConnection('http://localhost:11434');
      expect(result).toBe(false);
    });
  });

  describe('getOllamaModels', () => {
    it('모델 목록을 이름 배열로 반환한다', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          models: [{ name: 'llava:latest' }, { name: 'qwen2-vl:7b' }],
        }),
      } as Response);

      const { getOllamaModels } = await import('@/lib/ollama-client');
      const models = await getOllamaModels('http://localhost:11434');
      expect(models).toEqual(['llava:latest', 'qwen2-vl:7b']);
    });

    it('models 필드가 없으면 빈 배열을 반환한다', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      const { getOllamaModels } = await import('@/lib/ollama-client');
      const models = await getOllamaModels('http://localhost:11434');
      expect(models).toEqual([]);
    });

    it('fetch 실패 시 빈 배열을 반환한다', async () => {
      vi.mocked(globalThis.fetch).mockRejectedValue(new Error('Network error'));

      const { getOllamaModels } = await import('@/lib/ollama-client');
      const models = await getOllamaModels('http://localhost:11434');
      expect(models).toEqual([]);
    });
  });

  describe('analyzeImageWithOllama', () => {
    it('성공 시 응답 텍스트를 반환한다', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          model: 'llava',
          response: '이미지에 고양이가 있습니다.',
          done: true,
        }),
      } as Response);

      const { analyzeImageWithOllama } = await import('@/lib/ollama-client');
      const result = await analyzeImageWithOllama(
        'base64data',
        'http://localhost:11434',
        'llava',
      );
      expect(result).toBe('이미지에 고양이가 있습니다.');
    });

    it('올바른 엔드포인트와 페이로드로 fetch를 호출한다', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          model: 'llava',
          response: '분석 결과',
          done: true,
        }),
      } as Response);

      const { analyzeImageWithOllama } = await import('@/lib/ollama-client');
      await analyzeImageWithOllama(
        'base64data',
        'http://localhost:11434',
        'llava',
      );

      expect(globalThis.fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/generate',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('"images":["base64data"]'),
        }),
      );
    });

    it('커스텀 프롬프트를 전달할 수 있다', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          model: 'llava',
          response: '결과',
          done: true,
        }),
      } as Response);

      const { analyzeImageWithOllama } = await import('@/lib/ollama-client');
      await analyzeImageWithOllama(
        'base64data',
        'http://localhost:11434',
        'llava',
        'What do you see?',
      );

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"prompt":"What do you see?"'),
        }),
      );
    });

    it('응답 상태가 ok가 아니면 에러를 throw한다', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      const { analyzeImageWithOllama } = await import('@/lib/ollama-client');
      await expect(
        analyzeImageWithOllama('base64data', 'http://localhost:11434', 'llava'),
      ).rejects.toThrow('Ollama 응답 오류: 500');
    });
  });

  describe('URL 검증', () => {
    it('localhost가 아닌 외부 URL은 차단된다', async () => {
      const { checkOllamaConnection } = await import('@/lib/ollama-client');
      const result = await checkOllamaConnection('http://evil.com:11434');
      expect(result).toBe(false);
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });

    it('file:// 프로토콜은 차단된다', async () => {
      const { checkOllamaConnection } = await import('@/lib/ollama-client');
      const result = await checkOllamaConnection('file:///etc/passwd');
      expect(result).toBe(false);
    });

    it('사설 IP는 허용된다', async () => {
      vi.mocked(globalThis.fetch).mockResolvedValue({ ok: true } as Response);
      const { checkOllamaConnection } = await import('@/lib/ollama-client');
      const result = await checkOllamaConnection('http://192.168.1.100:11434');
      expect(result).toBe(true);
    });
  });
});
