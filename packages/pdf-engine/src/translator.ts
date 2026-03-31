import type { TextBlock, TranslatedBlock } from './types';

const MODEL_NAME_PATTERN = /^[a-zA-Z0-9._:/-]{1,100}$/;

function validateEndpoint(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) return false;
    const allowedHosts = ['localhost', '127.0.0.1', '::1'];
    return (
      allowedHosts.includes(parsed.hostname) ||
      /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(parsed.hostname)
    );
  } catch {
    return false;
  }
}

export interface TranslationOptions {
  endpoint: string;
  model: string;
  sourceLang: string;
  targetLang: string;
  batchSize?: number;
  onProgress?: (translated: number, total: number) => void;
}

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000;

async function translateBatchWithRetry(
  texts: string[],
  endpoint: string,
  model: string,
  sourceLang: string,
  targetLang: string,
): Promise<string[]> {
  const batchText = texts.join('\n---\n');
  const prompt = `다음 ${sourceLang} 텍스트를 ${targetLang}로 번역하세요. 각 문단은 ---로 구분됩니다. 번역 결과만 같은 형식으로 반환하세요.\n\n${batchText}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt, stream: true }),
        signal: AbortSignal.timeout(180_000),
      });

      if (!response.ok) {
        throw new Error(`Ollama 응답 오류: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('응답 스트림을 읽을 수 없습니다');

      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line) as {
              response?: string;
              done?: boolean;
            };
            if (parsed.response) {
              fullResponse += parsed.response;
            }
          } catch {
            // 불완전한 JSON 무시
          }
        }
      }

      const translated = fullResponse.split(/\n---\n/);
      return texts.map((original, i) => translated[i]?.trim() || original);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, INITIAL_RETRY_DELAY * Math.pow(2, attempt)),
        );
      }
    }
  }

  // 모든 재시도 실패 → 원문 반환
  console.warn(
    `번역 배치 실패 (${MAX_RETRIES}회 재시도): ${lastError?.message}`,
  );
  return texts;
}

export async function translateBlocks(
  blocks: TextBlock[],
  options: TranslationOptions,
): Promise<TranslatedBlock[]> {
  const {
    endpoint,
    model,
    sourceLang,
    targetLang,
    batchSize = 5,
    onProgress,
  } = options;

  if (!validateEndpoint(endpoint)) {
    throw new Error(
      '허용되지 않는 번역 엔드포인트입니다. 로컬 주소만 허용됩니다.',
    );
  }
  if (!MODEL_NAME_PATTERN.test(model)) {
    throw new Error('유효하지 않은 모델명입니다.');
  }

  const nonEmptyBlocks = blocks.filter((b) => b.text.trim().length > 0);
  const results: TranslatedBlock[] = [];
  let translatedCount = 0;

  for (let i = 0; i < nonEmptyBlocks.length; i += batchSize) {
    const batch = nonEmptyBlocks.slice(i, i + batchSize);
    const texts = batch.map((b) => b.text);

    const translatedTexts = await translateBatchWithRetry(
      texts,
      endpoint,
      model,
      sourceLang,
      targetLang,
    );

    for (let j = 0; j < batch.length; j++) {
      const block = batch[j]!;
      results.push({
        ...block,
        originalText: block.text,
        translatedText: translatedTexts[j] ?? block.text,
        translatedHeight: 0,
      });
    }

    translatedCount += batch.length;
    onProgress?.(translatedCount, nonEmptyBlocks.length);
  }

  return results;
}

export async function translateText(
  text: string,
  options: Pick<
    TranslationOptions,
    'endpoint' | 'model' | 'sourceLang' | 'targetLang'
  >,
): Promise<string> {
  const fakeBlock: TextBlock = {
    text,
    x: 0,
    y: 0,
    width: 500,
    height: 20,
    fontSize: 14,
    fontFamily: 'sans-serif',
  };
  const results = await translateBlocks([fakeBlock], {
    ...options,
    batchSize: 1,
  });
  return results[0]?.translatedText ?? text;
}
