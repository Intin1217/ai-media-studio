'use client';

import type { DisplayRegion } from '@/hooks/use-region-select';

interface RegionSelectOverlayProps {
  displayRegion: DisplayRegion | null;
  isSelecting: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * canvas 위에 absolute 포지션으로 렌더링되는 영역 선택 오버레이.
 * - 드래그 중: 점선 테두리 + sky 반투명 배경
 * - 선택 완료: 선택 영역 외부 dim + sky 실선 테두리
 */
export function RegionSelectOverlay({
  displayRegion,
  isSelecting,
  containerRef,
}: RegionSelectOverlayProps) {
  if (!displayRegion || !containerRef.current) return null;

  const container = containerRef.current;
  const containerWidth = container?.offsetWidth ?? 0;
  const containerHeight = container?.offsetHeight ?? 0;

  const { x, y, width, height } = displayRegion;

  if (isSelecting) {
    return (
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute border-2 border-dashed border-sky-400 bg-sky-400/20"
          style={{ left: x, top: y, width, height }}
        />
      </div>
    );
  }

  // 선택 완료: 4방향 dim 영역 + 선택 영역 테두리
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* 위쪽 dim */}
      {y > 0 && (
        <div
          className="absolute left-0 right-0 top-0 bg-black/40"
          style={{ height: y }}
        />
      )}
      {/* 아래쪽 dim */}
      {y + height < containerHeight && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-black/40"
          style={{ top: y + height }}
        />
      )}
      {/* 왼쪽 dim */}
      {x > 0 && (
        <div
          className="absolute bg-black/40"
          style={{ left: 0, top: y, width: x, height }}
        />
      )}
      {/* 오른쪽 dim */}
      {x + width < containerWidth && (
        <div
          className="absolute bg-black/40"
          style={{ left: x + width, top: y, right: 0, height }}
        />
      )}
      {/* 선택 영역 테두리 */}
      <div
        className="absolute border-2 border-sky-400"
        style={{ left: x, top: y, width, height }}
      />
    </div>
  );
}
