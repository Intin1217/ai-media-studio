/**
 * 이미지의 특정 영역을 잘라내어 base64 문자열로 변환합니다.
 * canvas 좌표계 기준의 region을 받아 offscreen canvas에 그립니다.
 */
export async function cropImageToBase64(
  imageUrl: string,
  region: { x: number; y: number; width: number; height: number },
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const offscreen = document.createElement('canvas');
      offscreen.width = region.width;
      offscreen.height = region.height;
      const ctx = offscreen.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context 생성 실패'));
        return;
      }
      ctx.drawImage(
        img,
        region.x,
        region.y,
        region.width,
        region.height,
        0,
        0,
        region.width,
        region.height,
      );
      const dataUrl = offscreen.toDataURL('image/png');
      resolve(dataUrl.split(',')[1] ?? '');
    };
    img.onerror = () => reject(new Error('이미지 로드 실패'));
    img.src = imageUrl;
  });
}

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
  const CHUNK_SIZE = 8192;
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK_SIZE));
  }
  return btoa(binary);
}
