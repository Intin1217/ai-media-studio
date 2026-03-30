import type { OcrResult } from './types';

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

function validateEndpointUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function recognizeWithOllama(
  imageBase64: string,
  endpoint: string,
  model: string,
): Promise<OcrResult> {
  if (!validateEndpointUrl(endpoint)) {
    throw new Error('유효하지 않은 엔드포인트 URL입니다');
  }

  const startTime = performance.now();

  const response = await fetch(`${endpoint}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt:
        '이 이미지에서 모든 텍스트를 정확히 추출해주세요. 텍스트만 반환하세요.',
      images: [imageBase64],
      stream: false,
    }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    throw new Error(`Ollama 응답 오류: ${response.status}`);
  }

  const data: OllamaResponse = await response.json();
  const processingTime = Math.round(performance.now() - startTime);

  return {
    text: data.response,
    confidence: -1,
    blocks: [],
    language: 'ollama',
    processingTime,
  };
}
