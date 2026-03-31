'use client';

import { useCallback, useRef } from 'react';
import {
  startWebcam,
  stopWebcam,
  isWebcamSupported,
} from '@ai-media-studio/media-utils';
import type { WebcamConfig } from '@ai-media-studio/media-utils';
import { useDetectionStore } from '@/stores/detection-store';

export function useWebcam(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const streamRef = useRef<MediaStream | null>(null);
  const setWebcamStatus = useDetectionStore((s) => s.setWebcamStatus);

  const start = useCallback(
    async (config?: WebcamConfig) => {
      if (!videoRef.current) return;
      if (!isWebcamSupported()) {
        setWebcamStatus('error');
        return;
      }

      try {
        setWebcamStatus('requesting');
        const stream = await startWebcam(videoRef.current, config);
        streamRef.current = stream;
        setWebcamStatus('active');
      } catch (err) {
        if (err instanceof DOMException && err.name === 'NotAllowedError') {
          setWebcamStatus('denied');
        } else {
          setWebcamStatus('error');
        }
      }
    },
    [videoRef, setWebcamStatus],
  );

  const stop = useCallback(() => {
    if (streamRef.current) {
      stopWebcam(streamRef.current);
      streamRef.current = null;
    }
    stopWebcam(null, videoRef.current);
    setWebcamStatus('idle');
  }, [videoRef, setWebcamStatus]);

  return { start, stop, streamRef };
}
