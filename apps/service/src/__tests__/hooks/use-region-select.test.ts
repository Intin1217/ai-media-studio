import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRegionSelect, toCanvasCoords } from '@/hooks/use-region-select';

// canvas mock 헬퍼
function makeCanvas(
  naturalWidth: number,
  naturalHeight: number,
  displayWidth: number,
  displayHeight: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = naturalWidth;
  canvas.height = naturalHeight;
  vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
    left: 0,
    top: 0,
    width: displayWidth,
    height: displayHeight,
    right: displayWidth,
    bottom: displayHeight,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);
  return canvas;
}

describe('toCanvasCoords', () => {
  it('display 좌표를 canvas 좌표로 변환한다 (letterbox 없는 경우)', () => {
    // canvas 200x100, display 100x50 → scale=2, offset 없음
    const canvas = makeCanvas(200, 100, 100, 50);
    const result = toCanvasCoords(50, 25, canvas);
    expect(result.x).toBeCloseTo(100);
    expect(result.y).toBeCloseTo(50);
  });

  it('letterbox(위아래) 경우 offsetY를 계산한다', () => {
    // canvas 200x100 (aspect 2:1), display 100x100 (aspect 1:1)
    // canvasAspect(2) > displayAspect(1) → letterbox
    // scale = 200/100 = 2
    // offsetY = (100 - 100/2) / 2 = 25
    const canvas = makeCanvas(200, 100, 100, 100);
    const result = toCanvasCoords(50, 50, canvas);
    // canvasX = (50 - 0) * 2 = 100
    // canvasY = (50 - 25) * 2 = 50
    expect(result.x).toBeCloseTo(100);
    expect(result.y).toBeCloseTo(50);
  });

  it('pillarbox(좌우) 경우 offsetX를 계산한다', () => {
    // canvas 100x200 (aspect 0.5:1), display 100x100 (aspect 1:1)
    // canvasAspect(0.5) < displayAspect(1) → pillarbox
    // scale = 200/100 = 2
    // offsetX = (100 - 100*0.5) / 2 = 25
    const canvas = makeCanvas(100, 200, 100, 100);
    const result = toCanvasCoords(50, 50, canvas);
    // canvasX = (50 - 25) * 2 = 50
    // canvasY = (50 - 0) * 2 = 100
    expect(result.x).toBeCloseTo(50);
    expect(result.y).toBeCloseTo(100);
  });
});

describe('useRegionSelect', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = makeCanvas(400, 300, 400, 300);
    vi.clearAllMocks();
  });

  it('초기 상태: region과 displayRegion이 null이고 isSelecting이 false이다', () => {
    const canvasRef = { current: canvas };
    const { result } = renderHook(() =>
      useRegionSelect({ canvasRef, enabled: true }),
    );
    expect(result.current.region).toBeNull();
    expect(result.current.displayRegion).toBeNull();
    expect(result.current.isSelecting).toBe(false);
  });

  it('enabled=false이면 이벤트가 등록되지 않아 상태가 변하지 않는다', () => {
    const canvasRef = { current: canvas };
    const { result } = renderHook(() =>
      useRegionSelect({ canvasRef, enabled: false }),
    );

    act(() => {
      canvas.dispatchEvent(
        new MouseEvent('mousedown', {
          clientX: 10,
          clientY: 10,
          bubbles: true,
        }),
      );
    });

    expect(result.current.region).toBeNull();
    expect(result.current.isSelecting).toBe(false);
  });

  it('mousedown → mousemove → mouseup 시 displayRegion과 region이 설정된다', () => {
    const canvasRef = { current: canvas };
    const { result } = renderHook(() =>
      useRegionSelect({ canvasRef, enabled: true }),
    );

    act(() => {
      canvas.dispatchEvent(
        new MouseEvent('mousedown', {
          clientX: 10,
          clientY: 10,
          bubbles: true,
        }),
      );
    });

    expect(result.current.isSelecting).toBe(true);

    act(() => {
      canvas.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 110,
          clientY: 110,
          bubbles: true,
        }),
      );
    });

    expect(result.current.displayRegion).not.toBeNull();

    act(() => {
      window.dispatchEvent(
        new MouseEvent('mouseup', {
          clientX: 110,
          clientY: 110,
          bubbles: true,
        }),
      );
    });

    expect(result.current.isSelecting).toBe(false);
    expect(result.current.region).not.toBeNull();
    expect(result.current.region?.width).toBeGreaterThan(0);
    expect(result.current.region?.height).toBeGreaterThan(0);
  });

  it('5px 이하 드래그는 region을 설정하지 않는다', () => {
    const canvasRef = { current: canvas };
    const { result } = renderHook(() =>
      useRegionSelect({ canvasRef, enabled: true }),
    );

    act(() => {
      canvas.dispatchEvent(
        new MouseEvent('mousedown', {
          clientX: 10,
          clientY: 10,
          bubbles: true,
        }),
      );
      window.dispatchEvent(
        new MouseEvent('mouseup', { clientX: 12, clientY: 12, bubbles: true }),
      );
    });

    expect(result.current.region).toBeNull();
    expect(result.current.displayRegion).toBeNull();
  });

  it('resetRegion 호출 시 모든 상태가 초기화된다', () => {
    const canvasRef = { current: canvas };
    const { result } = renderHook(() =>
      useRegionSelect({ canvasRef, enabled: true }),
    );

    // region 생성
    act(() => {
      canvas.dispatchEvent(
        new MouseEvent('mousedown', {
          clientX: 10,
          clientY: 10,
          bubbles: true,
        }),
      );
      window.dispatchEvent(
        new MouseEvent('mouseup', {
          clientX: 110,
          clientY: 110,
          bubbles: true,
        }),
      );
    });

    expect(result.current.region).not.toBeNull();

    act(() => {
      result.current.resetRegion();
    });

    expect(result.current.region).toBeNull();
    expect(result.current.displayRegion).toBeNull();
    expect(result.current.isSelecting).toBe(false);
  });

  it('enabled false → true 전환 시 region이 초기화된다', () => {
    const canvasRef = { current: canvas };
    const { result, rerender } = renderHook(
      ({ enabled }) => useRegionSelect({ canvasRef, enabled }),
      { initialProps: { enabled: true } },
    );

    // region 생성
    act(() => {
      canvas.dispatchEvent(
        new MouseEvent('mousedown', {
          clientX: 10,
          clientY: 10,
          bubbles: true,
        }),
      );
      window.dispatchEvent(
        new MouseEvent('mouseup', {
          clientX: 110,
          clientY: 110,
          bubbles: true,
        }),
      );
    });

    expect(result.current.region).not.toBeNull();

    // disabled로 전환 → resetRegion 호출
    rerender({ enabled: false });

    expect(result.current.region).toBeNull();
    expect(result.current.displayRegion).toBeNull();
  });
});
