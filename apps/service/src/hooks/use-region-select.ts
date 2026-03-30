'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface Region {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DisplayRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseRegionSelectOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  enabled: boolean;
}

interface UseRegionSelectReturn {
  region: Region | null;
  isSelecting: boolean;
  resetRegion: () => void;
  displayRegion: DisplayRegion | null;
}

/**
 * canvas의 object-contain 렌더링을 고려한 display 좌표 → canvas 좌표 변환.
 * letterbox(상하) 또는 pillarbox(좌우) offset도 계산합니다.
 */
export function toCanvasCoords(
  displayX: number,
  displayY: number,
  canvas: HTMLCanvasElement,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const displayWidth = rect.width;
  const displayHeight = rect.height;
  const canvasAspect = canvas.width / canvas.height;
  const displayAspect = displayWidth / displayHeight;

  let scale: number;
  let offsetX: number;
  let offsetY: number;

  if (canvasAspect > displayAspect) {
    // 이미지가 더 넓음 → 위아래 letterbox
    scale = canvas.width / displayWidth;
    offsetX = 0;
    offsetY = (displayHeight - displayWidth / canvasAspect) / 2;
  } else {
    // 이미지가 더 높음 → 좌우 pillarbox
    scale = canvas.height / displayHeight;
    offsetX = (displayWidth - displayHeight * canvasAspect) / 2;
    offsetY = 0;
  }

  return {
    x: (displayX - offsetX) * scale,
    y: (displayY - offsetY) * scale,
  };
}

function getEventPosition(
  e: MouseEvent | TouchEvent,
  rect: DOMRect,
): { x: number; y: number } {
  if ('touches' in e) {
    const touch = e.touches[0] ?? e.changedTouches[0];
    if (!touch) return { x: 0, y: 0 };
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

function normalizeRect(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): DisplayRegion {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

export function useRegionSelect({
  canvasRef,
  enabled,
}: UseRegionSelectOptions): UseRegionSelectReturn {
  const [region, setRegion] = useState<Region | null>(null);
  const [displayRegion, setDisplayRegion] = useState<DisplayRegion | null>(
    null,
  );
  const [isSelecting, setIsSelecting] = useState(false);

  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  const resetRegion = useCallback(() => {
    setRegion(null);
    setDisplayRegion(null);
    setIsSelecting(false);
    startPosRef.current = null;
    isDraggingRef.current = false;
  }, []);

  useEffect(() => {
    if (!enabled) {
      resetRegion();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    function handleStart(e: MouseEvent | TouchEvent) {
      const cvs = canvasRef.current;
      if (!cvs) return;
      const rect = cvs.getBoundingClientRect();
      const pos = getEventPosition(e, rect);
      startPosRef.current = pos;
      isDraggingRef.current = true;
      setIsSelecting(true);
      setRegion(null);
      setDisplayRegion(null);
    }

    function handleMove(e: MouseEvent | TouchEvent) {
      if (!isDraggingRef.current || !startPosRef.current) return;
      const cvs = canvasRef.current;
      if (!cvs) return;
      if ('touches' in e) e.preventDefault();
      const rect = cvs.getBoundingClientRect();
      const pos = getEventPosition(e, rect);
      const dr = normalizeRect(
        startPosRef.current.x,
        startPosRef.current.y,
        pos.x,
        pos.y,
      );
      setDisplayRegion(dr);
    }

    function handleEnd(e: MouseEvent | TouchEvent) {
      if (!isDraggingRef.current || !startPosRef.current) return;
      isDraggingRef.current = false;
      setIsSelecting(false);

      const cvs = canvasRef.current;
      if (!cvs) return;
      const rect = cvs.getBoundingClientRect();
      const pos = getEventPosition(e, rect);
      const dr = normalizeRect(
        startPosRef.current.x,
        startPosRef.current.y,
        pos.x,
        pos.y,
      );

      // 너무 작은 드래그는 무시 (5px 이하)
      if (dr.width < 5 || dr.height < 5) {
        setDisplayRegion(null);
        startPosRef.current = null;
        return;
      }

      setDisplayRegion(dr);

      // display 좌표 → canvas 좌표 변환
      const topLeft = toCanvasCoords(dr.x, dr.y, cvs);
      const bottomRight = toCanvasCoords(
        dr.x + dr.width,
        dr.y + dr.height,
        cvs,
      );

      const canvasRegion: Region = {
        x: Math.max(0, Math.round(topLeft.x)),
        y: Math.max(0, Math.round(topLeft.y)),
        width:
          Math.min(cvs.width, Math.round(bottomRight.x)) -
          Math.max(0, Math.round(topLeft.x)),
        height:
          Math.min(cvs.height, Math.round(bottomRight.y)) -
          Math.max(0, Math.round(topLeft.y)),
      };

      setRegion(canvasRegion);
      startPosRef.current = null;
    }

    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('touchstart', handleStart, { passive: false });
    canvas.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleStart);
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('touchstart', handleStart);
      canvas.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [enabled, canvasRef, resetRegion]);

  return { region, isSelecting, resetRegion, displayRegion };
}
