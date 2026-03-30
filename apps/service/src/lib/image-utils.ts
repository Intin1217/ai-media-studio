/**
 * blob: 또는 data: URL을 base64 문자열로 변환합니다.
 * Ollama API는 순수 base64 이미지 데이터를 요구합니다.
 */
export async function imageUrlToBase64(url: string): Promise<string> {
  // data URL인 경우 콤마 이후 base64 부분 추출
  if (url.startsWith('data:')) {
    if (!url.startsWith('data:image/')) {
      throw new Error('이미지 데이터 URL이 아닙니다');
    }
    return url.split(',')[1] ?? '';
  }

  // blob URL인 경우 fetch → arrayBuffer → base64 변환
  const res = await fetch(url);
  if (!res.ok) throw new Error(`이미지 로드 실패: ${res.status}`);
  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}
