interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

export async function analyzeImageWithOllama(
  imageBase64: string,
  endpoint: string,
  model: string,
  prompt: string = '이 이미지에서 보이는 모든 객체와 장면을 한국어로 자세히 설명해주세요.',
): Promise<string> {
  const response = await fetch(`${endpoint}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      images: [imageBase64],
      stream: false,
    }),
  });

  if (!response.ok) throw new Error(`Ollama 응답 오류: ${response.status}`);
  const data: OllamaResponse = await response.json();
  return data.response;
}

export async function checkOllamaConnection(
  endpoint: string,
): Promise<boolean> {
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
  try {
    const res = await fetch(`${endpoint}/api/tags`);
    const data = await res.json();
    return data.models?.map((m: { name: string }) => m.name) ?? [];
  } catch {
    return [];
  }
}
