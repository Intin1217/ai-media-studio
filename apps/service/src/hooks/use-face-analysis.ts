import { useCallback, useEffect, useRef } from 'react';
import { useSettingsStore } from '@/stores/settings-store';
import { useDetectionStore } from '@/stores/detection-store';
import { FaceTracker } from '@/lib/face-tracker';
import type { RawFaceDetection } from '@/lib/face-tracker';
import { drawFaceOverlay } from '@/lib/draw-face-overlay';

import type * as faceApiType from 'face-api.js';
type FaceApiModule = typeof faceApiType;

let faceApiModule: FaceApiModule | null = null;
let loadingPromise: Promise<FaceApiModule> | null = null;
let modelsLoaded = false;

async function loadFaceApi(): Promise<FaceApiModule> {
  if (faceApiModule && modelsLoaded) return faceApiModule;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const faceapi = await import('face-api.js');
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri('/models/face-api'),
      faceapi.nets.ageGenderNet.loadFromUri('/models/face-api'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models/face-api'),
    ]);
    faceApiModule = faceapi;
    modelsLoaded = true;
    return faceapi;
  })();

  return loadingPromise;
}

interface UseFaceAnalysisOptions {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function useFaceAnalysis({
  videoRef,
  canvasRef,
}: UseFaceAnalysisOptions): void {
  const enabled = useSettingsStore((s) => s.faceAnalysisEnabled);
  const setFaceResults = useDetectionStore((s) => s.setFaceAnalysisResults);

  const trackerRef = useRef(new FaceTracker());
  const rafRef = useRef<number>(0);
  const isRunningRef = useRef(false);
  const faceApiRef = useRef<FaceApiModule | null>(null);

  const detect = useCallback(async () => {
    if (!isRunningRef.current || !videoRef.current || !faceApiRef.current)
      return;

    const video = videoRef.current;
    if (video.paused || video.ended || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detect);
      return;
    }

    try {
      const faceapi = faceApiRef.current;
      const detections = await faceapi
        .detectAllFaces(
          video,
          new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }),
        )
        .withFaceLandmarks()
        .withAgeAndGender();

      const rawFaces: RawFaceDetection[] = detections.map((d) => ({
        bbox: {
          x: d.detection.box.x,
          y: d.detection.box.y,
          width: d.detection.box.width,
          height: d.detection.box.height,
        },
        age: d.age,
        gender: d.gender as 'male' | 'female',
        genderProbability: d.genderProbability,
        landmarks: d.landmarks.positions.map((p) => ({ x: p.x, y: p.y })),
      }));

      const tracked = trackerRef.current.update(rawFaces, performance.now());
      setFaceResults(tracked);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawFaceOverlay(ctx, tracked);
        }
      }
    } catch {
      // 추론 실패 시 무시하고 다음 프레임
    }

    if (isRunningRef.current) {
      rafRef.current = requestAnimationFrame(detect);
    }
  }, [videoRef, canvasRef, setFaceResults]);

  useEffect(() => {
    if (!enabled) {
      isRunningRef.current = false;
      cancelAnimationFrame(rafRef.current);
      trackerRef.current.reset();
      setFaceResults([]);
      return;
    }

    let cancelled = false;

    loadFaceApi().then((faceapi) => {
      if (cancelled) return;
      faceApiRef.current = faceapi;
      isRunningRef.current = true;
      detect();
    });

    return () => {
      cancelled = true;
      isRunningRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, detect, setFaceResults]);
}
