import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { createRef } from 'react';
import { RegionSelectOverlay } from '@/components/image-analysis/region-select-overlay';

function makeContainerRef(width = 400, height = 300) {
  const ref =
    createRef<HTMLDivElement>() as React.RefObject<HTMLDivElement | null>;
  // jsdom에서 offsetWidth/Height는 0이므로 직접 할당
  const div = document.createElement('div');
  Object.defineProperty(div, 'offsetWidth', { value: width });
  Object.defineProperty(div, 'offsetHeight', { value: height });
  // ref.current를 강제로 설정 (읽기전용 우회)
  Object.defineProperty(ref, 'current', { value: div, writable: true });
  return ref;
}

describe('RegionSelectOverlay', () => {
  it('displayRegion이 null이면 아무것도 렌더링하지 않는다', () => {
    const containerRef = makeContainerRef();
    const { container } = render(
      <RegionSelectOverlay
        displayRegion={null}
        isSelecting={false}
        containerRef={containerRef}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('드래그 중(isSelecting=true)일 때 점선 테두리 영역이 렌더링된다', () => {
    const containerRef = makeContainerRef();
    const { container } = render(
      <RegionSelectOverlay
        displayRegion={{ x: 10, y: 20, width: 100, height: 80 }}
        isSelecting={true}
        containerRef={containerRef}
      />,
    );

    const overlay = container.querySelector('.border-dashed');
    expect(overlay).not.toBeNull();
    expect(overlay).toHaveStyle({
      left: '10px',
      top: '20px',
      width: '100px',
      height: '80px',
    });
  });

  it('선택 완료(isSelecting=false) 시 dim 오버레이와 sky 테두리가 렌더링된다', () => {
    const containerRef = makeContainerRef(400, 300);
    const { container } = render(
      <RegionSelectOverlay
        displayRegion={{ x: 50, y: 50, width: 100, height: 100 }}
        isSelecting={false}
        containerRef={containerRef}
      />,
    );

    // dim 영역 (bg-black/40)
    const dimElements = container.querySelectorAll('.bg-black\\/40');
    expect(dimElements.length).toBeGreaterThan(0);

    // sky 테두리 (실선)
    const border = container.querySelector(
      '.border-sky-400:not(.border-dashed)',
    );
    expect(border).not.toBeNull();
    expect(border).toHaveStyle({
      left: '50px',
      top: '50px',
      width: '100px',
      height: '100px',
    });
  });

  it('선택 영역이 상단 끝에 붙어있으면 위쪽 dim이 렌더링되지 않는다', () => {
    const containerRef = makeContainerRef(400, 300);
    const { container } = render(
      <RegionSelectOverlay
        displayRegion={{ x: 0, y: 0, width: 200, height: 100 }}
        isSelecting={false}
        containerRef={containerRef}
      />,
    );

    // y=0이면 위쪽 dim 없음: height:0 짜리 div가 없어야 함
    // dim 요소가 있더라도 top=0 조건(y > 0 false)이므로 렌더링 안 됨
    const allDivs = container.querySelectorAll('div');
    const topDim = Array.from(allDivs).find((el) => el.style.height === '0px');
    expect(topDim).toBeUndefined();
  });

  it('pointer-events-none가 적용되어 캔버스 상호작용을 방해하지 않는다', () => {
    const containerRef = makeContainerRef();
    const { container } = render(
      <RegionSelectOverlay
        displayRegion={{ x: 10, y: 10, width: 50, height: 50 }}
        isSelecting={true}
        containerRef={containerRef}
      />,
    );

    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('pointer-events-none');
  });
});
