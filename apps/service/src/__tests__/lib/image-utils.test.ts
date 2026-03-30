import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('imageUrlToBase64', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('data URL에서 base64 부분을 추출한다', async () => {
    const { imageUrlToBase64 } = await import('@/lib/image-utils');
    const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
    const result = await imageUrlToBase64(dataUrl);
    expect(result).toBe('iVBORw0KGgo=');
  });

  it('data: URL이지만 image가 아닌 경우 에러를 던진다', async () => {
    const { imageUrlToBase64 } = await import('@/lib/image-utils');
    await expect(
      imageUrlToBase64('data:text/plain;base64,aGVsbG8='),
    ).rejects.toThrow('이미지 데이터 URL이 아닙니다');
  });

  it('blob URL을 fetch로 변환한다', async () => {
    const mockBuffer = new Uint8Array([72, 101, 108, 108, 111]).buffer;
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: vi.fn().mockResolvedValue(mockBuffer),
    } as unknown as Response);

    const { imageUrlToBase64 } = await import('@/lib/image-utils');
    const result = await imageUrlToBase64('blob:http://localhost/test-id');
    // 'Hello' in base64
    expect(result).toBe(btoa('Hello'));
  });

  it('fetch 실패 시 에러를 던진다', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    } as unknown as Response);

    const { imageUrlToBase64 } = await import('@/lib/image-utils');
    await expect(
      imageUrlToBase64('blob:http://localhost/not-found'),
    ).rejects.toThrow('이미지 로드 실패: 404');
  });
});

describe('cropImageToBase64', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('canvas context 생성 성공 시 base64 문자열을 반환한다', async () => {
    const mockBase64 = 'cropped-base64-data';
    const mockCtx = {
      drawImage: vi.fn(),
    };
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(mockCtx),
      toDataURL: vi.fn().mockReturnValue(`data:image/png;base64,${mockBase64}`),
    };

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
      return document.createElement(tag);
    });

    // Image mock: onload를 즉시 실행
    const OriginalImage = globalThis.Image;
    globalThis.Image = class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_: string) {
        setTimeout(() => this.onload?.(), 0);
      }
    } as unknown as typeof Image;

    const { cropImageToBase64 } = await import('@/lib/image-utils');
    const result = await cropImageToBase64('data:image/png;base64,abc', {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });

    expect(result).toBe(mockBase64);
    expect(mockCtx.drawImage).toHaveBeenCalledOnce();

    globalThis.Image = OriginalImage;
    vi.restoreAllMocks();
  });

  it('이미지 로드 실패 시 에러를 던진다', async () => {
    const OriginalImage = globalThis.Image;
    globalThis.Image = class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_: string) {
        setTimeout(() => this.onerror?.(), 0);
      }
    } as unknown as typeof Image;

    const { cropImageToBase64 } = await import('@/lib/image-utils');
    await expect(
      cropImageToBase64('data:image/png;base64,abc', {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      }),
    ).rejects.toThrow('이미지 로드 실패');

    globalThis.Image = OriginalImage;
  });

  it('canvas context 생성 실패 시 에러를 던진다', async () => {
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn().mockReturnValue(null),
      toDataURL: vi.fn(),
    };

    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') return mockCanvas as unknown as HTMLCanvasElement;
      return document.createElement(tag);
    });

    const OriginalImage = globalThis.Image;
    globalThis.Image = class {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_: string) {
        setTimeout(() => this.onload?.(), 0);
      }
    } as unknown as typeof Image;

    const { cropImageToBase64 } = await import('@/lib/image-utils');
    await expect(
      cropImageToBase64('data:image/png;base64,abc', {
        x: 0,
        y: 0,
        width: 50,
        height: 50,
      }),
    ).rejects.toThrow('Canvas context 생성 실패');

    globalThis.Image = OriginalImage;
    vi.restoreAllMocks();
  });
});
