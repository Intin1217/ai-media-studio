interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

export function validateOllamaUrl(url: string): boolean {
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

const MODEL_NAME_PATTERN = /^[a-zA-Z0-9._:/-]{1,100}$/;

export async function analyzeImageWithOllama(
  imageBase64: string,
  endpoint: string,
  model: string,
  prompt: string = '이 이미지에서 보이는 모든 객체와 장면을 한국어로 자세히 설명해주세요.',
): Promise<string> {
  if (!validateOllamaUrl(endpoint)) {
    throw new Error('허용되지 않는 Ollama 엔드포인트 URL입니다');
  }

  if (!MODEL_NAME_PATTERN.test(model)) {
    throw new Error('유효하지 않은 모델명입니다');
  }

  const response = await fetch(`${endpoint}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      images: [imageBase64],
      stream: false,
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!response.ok) throw new Error(`Ollama 응답 오류: ${response.status}`);
  const data: OllamaResponse = await response.json();
  return data.response;
}

export async function checkOllamaConnection(
  endpoint: string,
): Promise<boolean> {
  if (!validateOllamaUrl(endpoint)) return false;

  try {
    const res = await fetch(`${endpoint}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getOllamaModels(endpoint: string): Promise<string[]> {
  if (!validateOllamaUrl(endpoint)) return [];

  try {
    const res = await fetch(`${endpoint}/api/tags`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.models?.map((m: { name: string }) => m.name) ?? [];
  } catch {
    return [];
  }
}
