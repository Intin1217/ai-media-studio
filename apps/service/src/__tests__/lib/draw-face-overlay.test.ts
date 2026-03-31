import { describe, it, expect, vi, beforeEach } from 'vitest';
import { drawFaceOverlay } from '@/lib/draw-face-overlay';
import type { TrackedFace } from '@/lib/draw-face-overlay';

describe('drawFaceOverlay', () => {
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    ctx = {
      strokeRect: vi.fn(),
      fillRect: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn(() => ({ width: 50 })),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      strokeStyle: '',
      fillStyle: '',
      lineWidth: 0,
      font: '',
      textBaseline: '' as CanvasTextBaseline,
    } as unknown as CanvasRenderingContext2D;
  });

  const makeFace = (overrides?: Partial<TrackedFace>): TrackedFace => ({
    trackingId: 'face-0',
    bbox: { x: 100, y: 100, width: 80, height: 80 },
    age: 25,
    smoothedAge: 25,
    gender: 'female',
    smoothedGender: 'female',
    genderProbability: 0.9,
    isLooking: true,
    presenceTime: 45000,
    gazeTime: 32000,
    ...overrides,
  });

  it('바운딩 박스를 그린다', () => {
    drawFaceOverlay(ctx, [makeFace()]);
    expect(ctx.strokeRect).toHaveBeenCalledWith(100, 100, 80, 80);
  });

  it('성별, 나이, 체류시간, 응시시간 라벨을 그린다', () => {
    drawFaceOverlay(ctx, [makeFace()]);
    const texts = (ctx.fillText as ReturnType<typeof vi.fn>).mock.calls.map(
      (c: unknown[]) => c[0] as string,
    );
    expect(texts.some((t) => t.includes('여성'))).toBe(true);
    expect(texts.some((t) => t.includes('25세'))).toBe(true);
    expect(texts.some((t) => t.includes('체류'))).toBe(true);
    expect(texts.some((t) => t.includes('응시'))).toBe(true);
  });

  it('응시 중일 때 인디케이터를 그린다', () => {
    drawFaceOverlay(ctx, [makeFace({ isLooking: true })]);
    expect(ctx.arc).toHaveBeenCalled();
  });

  it('빈 배열이면 아무것도 그리지 않는다', () => {
    drawFaceOverlay(ctx, []);
    expect(ctx.strokeRect).not.toHaveBeenCalled();
  });

  it('시간을 MM:SS로 포맷한다', () => {
    drawFaceOverlay(ctx, [makeFace({ presenceTime: 65000, gazeTime: 3000 })]);
    const texts = (ctx.fillText as ReturnType<typeof vi.fn>).mock.calls.map(
      (c: unknown[]) => c[0] as string,
    );
    expect(texts.some((t) => t.includes('01:05'))).toBe(true);
    expect(texts.some((t) => t.includes('00:03'))).toBe(true);
  });
});
