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

export async function translateBlocks(
  blocks: TextBlock[],
  options: TranslationOptions,
): Promise<TranslatedBlock[]> {
  const {
    endpoint,
    model,
    sourceLang,
    targetLang,
    batchSize = 10,
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
    const batchText = batch.map((b) => b.text).join('\n---\n');
    const prompt = `${sourceLang}를 ${targetLang}로 번역하세요. 원문의 의미를 정확히 보존하세요.\n\n${batchText}`;

    const response = await fetch(`${endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt, stream: false }),
      signal: AbortSignal.timeout(120_000),
    });

    if (!response.ok) {
      throw new Error(`Ollama 응답 오류: ${response.status}`);
    }

    const data = (await response.json()) as { response: string };
    const responseText = data.response;
    const parts = responseText.split('\n---\n');

    for (let j = 0; j < batch.length; j++) {
      const block = batch[j]!;
      const part = parts[j];
      const translatedText =
        part !== undefined
          ? part.trim()
          : j === 0
            ? responseText.trim()
            : block.text;

      results.push({
        ...block,
        originalText: block.text,
        translatedText,
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
