'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useDetectionStore } from '@/stores/detection-store';

interface VideoControlsProps {
  onStart: () => void;
  onStop: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /**
   * 바운딩 박스 표시 상태 변경 시 호출되는 콜백.
   * 부모(webcam-view)가 showDetectionsRef를 관리하여 React Compiler의
   * "props mutation 금지" 규칙을 준수합니다.
   */
  onToggleDetections: (show: boolean) => void;
}

// SVG 아이콘 — 외부 라이브러리 없이 직접 정의
function PlayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M6 6h12v12H6z" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3M3 16v3a2 2 0 002 2h3M16 21h3a2 2 0 002-2v-3" />
    </svg>
  );
}

function ExitFullscreenIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M8 3v3a2 2 0 01-2 2H3M21 8h-3a2 2 0 01-2-2V3M3 16h3a2 2 0 012 2v3M16 21v-3a2 2 0 012-2h3" />
    </svg>
  );
}

function DetectionOnIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </svg>
  );
}

function DetectionOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeDasharray="4 2"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 9l6 6M15 9l-6 6" strokeDasharray="none" opacity="0.4" />
    </svg>
  );
}

/**
 * 비디오 플레이어 컨트롤 바
 *
 * 웹캠 캔버스 위에 오버레이되는 컨트롤 UI.
 * hover 시 표시되고 3초 후 자동 숨김됩니다.
 *
 * 키보드 단축키:
 * - Space: 감지 시작/정지
 * - F: 전체화면 토글
 * - D: 바운딩 박스 표시 ON/OFF
 */
export function VideoControls({
  onStart,
  onStop,
  canvasRef,
  onToggleDetections,
}: VideoControlsProps) {
  const webcamStatus = useDetectionStore((s) => s.webcamStatus);
  const modelStatus = useDetectionStore((s) => s.modelStatus);
  const isDetecting = useDetectionStore((s) => s.isDetecting);
  const detections = useDetectionStore((s) => s.detections);
  const performance = useDetectionStore((s) => s.performance);

  const isActive = webcamStatus === 'active';
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDetections, setShowDetections] = useState(true);
  const [visible, setVisible] = useState(false);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 컨트롤 바 표시 + 3초 후 숨김 타이머 재시작
  const showControls = useCallback(() => {
    setVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setVisible(false), 3000);
  }, []);

  // 전체화면 토글
  const toggleFullscreen = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!document.fullscreenElement) {
      await canvas.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, [canvasRef]);

  // 바운딩 박스 표시 토글 — 부모 콜백을 통해 외부 ref 업데이트
  const toggleDetectionOverlay = useCallback(() => {
    setShowDetections((prev) => {
      const next = !prev;
      onToggleDetections(next);
      return next;
    });
  }, [onToggleDetections]);

  // 전체화면 변경 감지
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // 키보드 단축키
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // 입력 필드에서 단축키 비활성화
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      )
        return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (isActive) {
            onStop();
          } else if (modelStatus !== 'loading') {
            onStart();
          }
          showControls();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          showControls();
          break;
        case 'd':
        case 'D':
          e.preventDefault();
          toggleDetectionOverlay();
          showControls();
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    isActive,
    modelStatus,
    onStart,
    onStop,
    toggleFullscreen,
    toggleDetectionOverlay,
    showControls,
  ]);

  // 타이머 정리
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const detectionCount = detections.length;

  return (
    <>
      {/* 마우스 이동 감지 영역 */}
      <div
        className="absolute inset-0 z-10"
        onMouseMove={showControls}
        onMouseEnter={showControls}
        aria-hidden="true"
      />

      {/* aria-live: 현재 감지 객체 수 스크린 리더 안내 */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {isDetecting
          ? `현재 ${detectionCount}개의 객체가 감지되고 있습니다`
          : '감지가 중지되었습니다'}
      </div>

      {/* 컨트롤 바 */}
      <div
        className={[
          'absolute bottom-0 left-0 right-0 z-20',
          'bg-gradient-to-t from-black/70 to-transparent',
          'px-4 py-3',
          'transition-opacity duration-300',
          visible || !isActive ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
        onMouseEnter={showControls}
      >
        {/* 성능 지표 — 소형 표시 */}
        {isDetecting && (
          <div className="mb-2 flex items-center gap-3">
            <span className="font-mono text-xs text-white/70">
              {performance.fps} FPS
            </span>
            <span className="font-mono text-xs text-white/70">
              {performance.inferenceTime}ms
            </span>
            {!isActive && null}
          </div>
        )}

        {/* 버튼 그룹 */}
        <div className="flex items-center gap-2">
          {/* 감지 시작/정지 */}
          <button
            type="button"
            onClick={isActive ? onStop : onStart}
            disabled={
              webcamStatus === 'requesting' || modelStatus === 'loading'
            }
            aria-label={isActive ? '감지 정지 (Space)' : '감지 시작 (Space)'}
            className={[
              'flex h-9 w-9 items-center justify-center rounded-full',
              'text-white transition-colors',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-white',
              isActive
                ? 'bg-red-500/80 hover:bg-red-500'
                : 'bg-white/20 hover:bg-white/30',
              'disabled:cursor-not-allowed disabled:opacity-40',
            ].join(' ')}
          >
            {isActive ? <StopIcon /> : <PlayIcon />}
          </button>

          {/* 바운딩 박스 ON/OFF */}
          {isActive && (
            <button
              type="button"
              onClick={toggleDetectionOverlay}
              aria-label={
                showDetections
                  ? '바운딩 박스 숨기기 (D)'
                  : '바운딩 박스 표시 (D)'
              }
              aria-pressed={showDetections}
              className={[
                'flex h-9 w-9 items-center justify-center rounded-full',
                'text-white transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-white',
                showDetections
                  ? 'bg-blue-500/80 hover:bg-blue-500'
                  : 'bg-white/20 hover:bg-white/30',
              ].join(' ')}
            >
              {showDetections ? <DetectionOnIcon /> : <DetectionOffIcon />}
            </button>
          )}

          {/* 전체화면 */}
          {isActive && (
            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? '전체화면 종료 (F)' : '전체화면 (F)'}
              className={[
                'flex h-9 w-9 items-center justify-center rounded-full',
                'bg-white/20 text-white hover:bg-white/30',
                'transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-white',
              ].join(' ')}
            >
              {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
            </button>
          )}

          {/* 현재 감지 수 배지 */}
          {isActive && isDetecting && (
            <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 font-mono text-xs text-white">
              {detectionCount}개 감지
            </span>
          )}

          {/* 키보드 단축키 힌트 */}
          {!isActive && (
            <span className="ml-auto text-xs text-white/50">
              Space: 시작 · F: 전체화면 · D: 감지 토글
            </span>
          )}
        </div>
      </div>
    </>
  );
}
