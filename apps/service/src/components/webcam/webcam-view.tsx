'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useWebcam } from '@/hooks/use-webcam';
import { useDetector } from '@/hooks/use-detector';
import { useFaceAnalysis } from '@/hooks/use-face-analysis';
import { useDetectionStore } from '@/stores/detection-store';
import { drawFaceOverlay } from '@/lib/draw-face-overlay';
import { VideoControls } from '@/components/detection/video-controls';
import { WebcamStatus } from './webcam-status';

export function WebcamView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // 얼굴 오버레이 전용 캔버스 — useDetector의 renderLoop과 레이어를 분리하여
  // ghost overlay 없이 독립적으로 clearRect + drawFaceOverlay를 수행
  const faceCanvasRef = useRef<HTMLCanvasElement>(null);
  // 바운딩 박스 표시 여부 — renderLoop이 rAF 내에서 직접 읽는 transient ref
  // useState 대신 useRef를 쓰는 이유: 리렌더링 없이 즉시 반영 (rerender-use-ref-transient-values)
  const showDetectionsRef = useRef<boolean>(true);
  const webcamStatus = useDetectionStore((s) => s.webcamStatus);
  const faceAnalysisResults = useDetectionStore((s) => s.faceAnalysisResults);
  const { start, stop } = useWebcam(videoRef);

  useDetector(
    videoRef,
    canvasRef,
    webcamStatus === 'active',
    showDetectionsRef,
  );

  useFaceAnalysis({ videoRef });

  // faceAnalysisResults 변경 시 전용 face canvas에 오버레이 그리기
  // useDetector의 renderLoop(메인 canvas)과 완전히 레이어가 분리되므로
  // ghost overlay가 발생하지 않음. 결과가 없으면 clearRect로 이전 프레임 소거.
  useEffect(() => {
    const faceCanvas = faceCanvasRef.current;
    if (!faceCanvas) return;

    const ctx = faceCanvas.getContext('2d');
    if (!ctx) return;

    // mainCanvas가 아직 크기 0이면 video 실제 해상도로 fallback — 버그 2 수정
    // mainCanvas는 useDetector의 rAF 루프에서 크기가 설정되므로
    // faceAnalysisResults 변경 시점에 아직 0일 수 있음
    const mainCanvas = canvasRef.current;
    const width =
      (mainCanvas && mainCanvas.width > 0 ? mainCanvas.width : null) ??
      videoRef.current?.videoWidth ??
      640;
    const height =
      (mainCanvas && mainCanvas.height > 0 ? mainCanvas.height : null) ??
      videoRef.current?.videoHeight ??
      480;

    if (faceCanvas.width !== width) faceCanvas.width = width;
    if (faceCanvas.height !== height) faceCanvas.height = height;

    ctx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
    if (faceAnalysisResults.length > 0) {
      drawFaceOverlay(ctx, faceAnalysisResults);
    }
  }, [faceAnalysisResults, videoRef]);

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
          <>
            <canvas
              ref={canvasRef}
              className="h-full w-full object-contain"
              aria-label="실시간 객체 감지 화면"
              role="img"
            />
            {/* 얼굴 분석 오버레이 전용 canvas — pointer-events:none으로 클릭 투과 */}
            <canvas
              ref={faceCanvasRef}
              className="pointer-events-none absolute inset-0 h-full w-full object-contain"
              aria-hidden="true"
            />
          </>
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
