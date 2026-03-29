'use client';

import { useRef } from 'react';
import { useWebcam } from '@/hooks/use-webcam';
import { useDetector } from '@/hooks/use-detector';
import { useDetectionStore } from '@/stores/detection-store';
import { WebcamControls } from './webcam-controls';
import { WebcamStatus } from './webcam-status';

export function WebcamView() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const webcamStatus = useDetectionStore((s) => s.webcamStatus);
  const { start, stop } = useWebcam(videoRef);

  useDetector(videoRef, canvasRef, webcamStatus === 'active');

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-lg border border-border bg-black aspect-video">
        <video ref={videoRef} autoPlay playsInline muted className="hidden" />
        {webcamStatus === 'active' ? (
          <canvas ref={canvasRef} className="w-full h-full object-contain" />
        ) : (
          <WebcamStatus />
        )}
      </div>
      <WebcamControls onStart={() => start()} onStop={stop} />
    </div>
  );
}
