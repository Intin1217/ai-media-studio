import { describe, it, expect, vi } from 'vitest';
import {
  clearCanvas,
  getColorForClass,
  drawBoundingBox,
  drawLabel,
  drawDetections,
} from '../canvas';
import type { Detection } from '../types';

function createMockCtx(): CanvasRenderingContext2D {
  return {
    canvas: { width: 640, height: 480 },
    clearRect: vi.fn(),
    strokeRect: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 50 })),
    set strokeStyle(_: string) {},
    set fillStyle(_: string) {},
    set lineWidth(_: number) {},
    set font(_: string) {},
  } as unknown as CanvasRenderingContext2D;
}

describe('clearCanvas', () => {
  it('전체 영역을 clearRect로 지움', () => {
    const ctx = createMockCtx();
    clearCanvas(ctx);
    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 640, 480);
  });
});

describe('getColorForClass', () => {
  it('내장 팔레트에서 색상 반환', () => {
    const color = getColorForClass('person');
    expect(color).toBe('#00FF88');
  });

  it('없는 클래스는 기본 색상 반환', () => {
    const color = getColorForClass('unknown-thing');
    expect(typeof color).toBe('string');
  });

  it('커스텀 colorMap 우선 적용', () => {
    const color = getColorForClass('person', { person: '#FF0000' });
    expect(color).toBe('#FF0000');
  });
});

describe('drawBoundingBox', () => {
  it('strokeRect를 올바른 좌표로 호출', () => {
    const ctx = createMockCtx();
    drawBoundingBox(ctx, { x: 10, y: 20, width: 100, height: 200 }, '#00FF00');
    expect(ctx.strokeRect).toHaveBeenCalledWith(10, 20, 100, 200);
  });
});

describe('drawLabel', () => {
  it('fillRect와 fillText를 호출', () => {
    const ctx = createMockCtx();
    drawLabel(ctx, 'person 95%', 10, 20, '#00FF00');
    expect(ctx.fillRect).toHaveBeenCalled();
    expect(ctx.fillText).toHaveBeenCalled();
  });
});

describe('drawDetections', () => {
  it('빈 배열이면 clearCanvas만 호출', () => {
    const ctx = createMockCtx();
    drawDetections(ctx, []);
    expect(ctx.clearRect).toHaveBeenCalled();
    expect(ctx.strokeRect).not.toHaveBeenCalled();
  });

  it('detection 수만큼 바운딩 박스와 레이블 그리기', () => {
    const ctx = createMockCtx();
    const detections: Detection[] = [
      {
        class: 'person',
        score: 0.95,
        bbox: { x: 0, y: 0, width: 100, height: 200 },
      },
      {
        class: 'car',
        score: 0.8,
        bbox: { x: 50, y: 50, width: 150, height: 100 },
      },
    ];
    drawDetections(ctx, detections);
    expect(ctx.strokeRect).toHaveBeenCalledTimes(2);
    expect(ctx.fillText).toHaveBeenCalledTimes(2);
  });
});
