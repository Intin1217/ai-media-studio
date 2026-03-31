'use client';

import { useCallback, useRef } from 'react';
import { useWebcam } from '@/hooks/use-webcam';
import { useDetector } from '@/hooks/use-detector';
import { useFaceAnalysis } from '@/hooks/use-face-analysis';
import { useDetectionStore } from '@/stores/detection-store';
import { VideoControls } from '@/components/detection/video-controls';
import { WebcamStatus } from './webcam-status';

export function WebcamView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // 바운딩 박스 표시 여부 — renderLoop이 rAF 내에서 직접 읽는 transient ref
  // useState 대신 useRef를 쓰는 이유: 리렌더링 없이 즉시 반영 (rerender-use-ref-transient-values)
  const showDetectionsRef = useRef<boolean>(true);
  const webcamStatus = useDetectionStore((s) => s.webcamStatus);
  const { start, stop } = useWebcam(videoRef);

  useDetector(
    videoRef,
    canvasRef,
    webcamStatus === 'active',
    showDetectionsRef,
  );

  useFaceAnalysis({ videoRef, canvasRef });

  // VideoControls가 토글할 때 ref를 직접 업데이트
  const handleToggleDetections = useCallback((show: boolean) => {
    showDetectionsRef.current = show;
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* 비디오/캔버스 영역 — VideoControls가 오버레이됩니다 */}
      <div className="border-border relative aspect-video overflow-hidden rounded-lg border bg-black">
        <video ref={videoRef} autoPlay playsInline muted className="hidden" />
        {webcamStatus === 'active' ? (
          <canvas
            ref={canvasRef}
            className="h-full w-full object-contain"
            aria-label="실시간 객체 감지 화면"
            role="img"
          />
        ) : (
          <WebcamStatus />
        )}

        {/* 오버레이 컨트롤 — 항상 렌더링하여 키보드 단축키 활성화 */}
        <VideoControls
          onStart={() => start()}
          onStop={stop}
          canvasRef={canvasRef}
          onToggleDetections={handleToggleDetections}
        />
      </div>
    </div>
  );
}
